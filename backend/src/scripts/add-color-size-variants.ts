import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductOptionsWorkflow,
  createProductVariantsWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows";

// Every product below currently has only Medusa's auto-generated
// "Default option" / single variant because it was created without
// explicit options. This one-off script replaces that with real
// Color x Size variants so the storefront's variant selector has
// something to select.
//
// Colors were read off each product's actual listing photo (the first
// color in each list) plus two standard companion colors, per catalog
// review on 2026-07-16. elysian-silk-wrap-blouse and
// kira-high-waisted-satin-skirt have mismatched/wrong product photos
// (confirmed separately), so their colors below are placeholders only
// — replace them once the correct photos are sorted.
//
// Stock: this script does NOT try to read/preserve each product's
// existing stocked_quantity (the remote-query path for nested
// inventory levels wasn't worth guessing at for a one-off script).
// Every new variant gets a flat STOCK_PER_VARIANT placeholder instead
// — adjust in Admin afterwards if real stock numbers matter before
// this goes live.

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
};

const PRODUCTS: { handle: string; colors: string[] }[] = [
  { handle: "aurelia-halter-button-up-vest-in-burgundy", colors: ["Burgundy", "Black", "White"] },
  { handle: "amara-eyelet-lace-tiered-midi-dress", colors: ["Black", "Burgundy", "White"] },
  { handle: "calypso-ruched-floral-mesh-dress", colors: ["Pink", "Black", "White"] },
  { handle: "elysian-silk-wrap-blouse", colors: ["Black", "White", "Burgundy"] }, // placeholder, see note above
  { handle: "isla-botanical-print-wide-leg-jumpsuit", colors: ["White", "Black", "Burgundy"] },
  { handle: "kira-high-waisted-satin-skirt", colors: ["Black", "White", "Burgundy"] }, // placeholder, see note above
  { handle: "luciana-shimmer-gown-with-thigh-high-slit", colors: ["Blue", "Black", "Burgundy"] },
  { handle: "nadia-cross-neck-ribbed-knit-midi-dress", colors: ["Camel", "Black", "White"] },
  { handle: "paloma-abstract-watercolor-wide-leg-pants", colors: ["White", "Black", "Burgundy"] },
  { handle: "seraphina-abstract-monochrome-midi-dress", colors: ["Black", "Burgundy", "White"] },
  { handle: "sienna-tailored-linen-waistcoat-trouser-set", colors: ["Cream", "Black", "White"] },
  { handle: "valeria-illustrated-slim-fit-trousers", colors: ["White", "Black", "Burgundy"] },
];

export default async function addColorSizeVariants({ container }: ExecArgs) {
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
