import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

// One-off script: creates a minimal, real (published, purchasable) product
// priced at a nominal $1 so a real bank-transfer order can be placed
// end-to-end to confirm funds actually arrive in the configured bank
// account. Not for the live catalog — unpublish/delete once verified.

const HANDLE = "bank-transfer-test-product";

export default async function createTestProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const storeModuleService = container.resolve(Modules.STORE);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: HANDLE },
  });
  if (existing.length) {
    logger.info(`[${HANDLE}] already exists (id: ${existing[0].id}), skipping creation`);
    return;
  }

  const [store] = await storeModuleService.listStores();
  const salesChannel = store.default_sales_channel_id
    ? await salesChannelModuleService.retrieveSalesChannel(store.default_sales_channel_id)
    : (await salesChannelModuleService.listSalesChannels({}))[0];

  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" });
  const shippingProfile = shippingProfiles[0];
  if (!shippingProfile) {
    throw new Error("No default shipping profile found — cannot create product");
  }

  const [stockLocation] = await stockLocationModuleService.listStockLocations({});
  if (!stockLocation) {
    throw new Error("No stock location found — cannot create inventory levels");
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["currency_code"],
  });
  const currencyCodes = Array.from(new Set(regions.map((r: any) => r.currency_code)));
  if (!currencyCodes.length) {
    throw new Error("No regions found — cannot determine currency for pricing");
  }

  const { result } = await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Bank Transfer Test Product ($1)",
          handle: HANDLE,
          description:
            "Internal test listing used to verify the Bank Transfer payment flow end-to-end, including confirming funds are received in the configured bank account. Not part of the regular catalog.",
          status: ProductStatus.PUBLISHED,
          weight: 50,
          shipping_profile_id: shippingProfile.id,
          thumbnail: "https://placehold.co/600x600/png?text=Test+Product+%241",
          images: [{ url: "https://placehold.co/600x600/png?text=Test+Product+%241" }],
          options: [{ title: "Type", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "BANK-TRANSFER-TEST-1USD",
              options: { Type: "Standard" },
              prices: currencyCodes.map((currency_code) => ({
                amount: 1,
                currency_code,
              })),
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        },
      ],
    },
  });

  const product = result[0];

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: "BANK-TRANSFER-TEST-1USD" },
  });

  if (inventoryItems.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item: any) => ({
          location_id: stockLocation.id,
          inventory_item_id: item.id,
          stocked_quantity: 1000,
        })),
      },
    });
  }

  logger.info(`CREATED_PRODUCT: ${JSON.stringify({ id: product.id, handle: product.handle })}`);
}
