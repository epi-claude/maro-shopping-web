import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductOptionsWorkflow,
  createProductVariantsWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

// Second batch — the 13 products left over after add-color-size-variants.ts
// (2026-07-16) covered the first 12. Same situation: each of these still has
// only Medusa's auto-generated "Default option" / single variant.
//
// Unlike the first batch, colors here were inferred from each product's
// text description (no photo review this time) — verify against the actual
// listing photos in Admin before treating these as final, same caveat the
// first batch called out for its two placeholder products.
//
// Stock: same tradeoff as the first batch. These 13 currently carry real,
// low stocked_quantity (5-17 units total per product) instead of the first
// batch's placeholder numbers. This script does NOT preserve those — every
// new variant gets the same flat STOCK_PER_VARIANT as batch 1, i.e. real
// stock counts are being replaced with a placeholder, not multiplied up
// from something accurate. Adjust in Admin before this goes live for real.

const SIZES = ["XS", "S", "M", "L", "XL"];
const STOCK_PER_VARIANT = 100;

const COLOR_CODES: Record<string, string> = {
  Burgundy: "BUR",
  Black: "BLK",
  White: "WHT",
  Pink: "PNK",
  Blue: "BLU",
  Camel: "CML",
  Cream: "CRM",
  Ivory: "IVR",
  Terracotta: "TRC",
  Khaki: "KHK",
  "Sky Blue": "SKB",
  Gold: "GLD",
  Navy: "NVY",
  Brown: "BRN",
  Multicolor: "MLT",
};

const PRODUCTS: { handle: string; colors: string[] }[] = [
  // sheer lace duster, no strong color in copy — default neutrals
  { handle: "aria-crochet-trim-kimono-duster", colors: ["White", "Black", "Cream"] },
  { handle: "bianca-tailored-blazer-in-ivory", colors: ["Ivory", "Black", "White"] },
  // linen jumpsuit, tortoiseshell buttons — no explicit color, default neutrals
  { handle: "cleo-linen-tailored-jumpsuit", colors: ["White", "Black", "Camel"] },
  { handle: "cove-crochet-knit-summer-top", colors: ["Terracotta", "Black", "White"] },
  // utility shorts — no explicit color, default to Khaki
  { handle: "freya-linen-utility-shorts", colors: ["Khaki", "Black", "White"] },
  { handle: "gemma-poplin-cotton-shirt-dress", colors: ["Sky Blue", "White", "Black"] },
  { handle: "lyra-one-shoulder-metallic-top", colors: ["Gold", "Black", "White"] },
  // bohemian cotton maxi skirt with lace inserts — no explicit color, default neutrals
  { handle: "maya-tiered-ruffle-maxi-skirt", colors: ["White", "Black", "Cream"] },
  { handle: "ophelia-off-shoulder-linen-dress", colors: ["White", "Black", "Cream"] },
  { handle: "selene-velvet-halter-cocktail-dress", colors: ["Black", "Burgundy", "White"] },
  // "ombre sunburst" print — no single literal color, treated as Multicolor
  { handle: "solene-pleated-chiffon-maxi-dress", colors: ["Multicolor", "Black", "White"] },
  { handle: "talia-wide-leg-crepe-trousers", colors: ["Navy", "Black", "White"] },
  { handle: "zaria-cut-out-ribbed-bodysuit", colors: ["Brown", "Black", "White"] },
];

export default async function addColorSizeVariantsBatch2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  const [stockLocation] = await stockLocationModuleService.listStockLocations({});
  if (!stockLocation) {
    throw new Error("No stock location found — cannot create inventory levels");
  }

  for (const { handle, colors } of PRODUCTS) {
    try {
      const { data: products } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "handle",
          "options.id",
          "options.title",
          "variants.id",
          "variants.sku",
          "variants.prices.amount",
          "variants.prices.currency_code",
        ],
        filters: { handle },
      });

      const product = products[0];
      if (!product) {
        logger.warn(`[${handle}] product not found, skipping`);
        continue;
      }

      const alreadyHasColor = (product.options ?? []).some(
        (o: any) => o.title?.toLowerCase() === "color"
      );
      if (alreadyHasColor) {
        logger.info(`[${handle}] already has a Color option, skipping`);
        continue;
      }

      const oldVariantIds = (product.variants ?? []).map((v: any) => v.id);
      const oldOptionIds = (product.options ?? []).map((o: any) => o.id);

      // carry the existing price(s) forward onto every new variant,
      // one entry per currency
      const seenCurrencies = new Set<string>();
      const prices = (product.variants?.[0]?.prices ?? [])
        .filter((p: any) => {
          if (seenCurrencies.has(p.currency_code)) return false;
          seenCurrencies.add(p.currency_code);
          return true;
        })
        .map((p: any) => ({ amount: p.amount, currency_code: p.currency_code }));

      if (!prices.length) {
        logger.warn(`[${handle}] no existing price found, skipping`);
        continue;
      }

      if (oldVariantIds.length) {
        await deleteProductVariantsWorkflow(container).run({
          input: { ids: oldVariantIds },
        });
      }
      if (oldOptionIds.length) {
        await deleteProductOptionsWorkflow(container).run({
          input: { ids: oldOptionIds },
        });
      }

      await createProductOptionsWorkflow(container).run({
        input: {
          product_options: [
            { product_id: product.id, title: "Color", values: colors },
            { product_id: product.id, title: "Size", values: SIZES },
          ],
        },
      });

      const skuBase = handle.toUpperCase();
      const productVariants = colors.flatMap((color) =>
        SIZES.map((size) => ({
          product_id: product.id,
          title: `${color} / ${size}`,
          sku: `${skuBase}-${COLOR_CODES[color] ?? color.slice(0, 3).toUpperCase()}-${size}`,
          options: { Color: color, Size: size },
          prices,
        }))
      );

      await createProductVariantsWorkflow(container).run({
        input: { product_variants: productVariants },
      });

      // find the inventory items Medusa auto-created for the new
      // variants and stock them at the flat placeholder quantity
      const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
        filters: { sku: productVariants.map((v) => v.sku) },
      });

      if (inventoryItems.length) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: inventoryItems.map((item: any) => ({
              location_id: stockLocation.id,
              inventory_item_id: item.id,
              stocked_quantity: STOCK_PER_VARIANT,
            })),
          },
        });
      }

      logger.info(
        `[${handle}] created ${productVariants.length} variants (${colors.join(", ")} x ${SIZES.join("/")})`
      );
    } catch (err: any) {
      logger.error(`[${handle}] failed: ${err.message}`);
    }
  }
}
