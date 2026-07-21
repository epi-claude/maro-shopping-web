import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  deleteProductsWorkflow,
  deleteShippingOptionsWorkflow,
} from "@medusajs/medusa/core-flows";

// One-off script: reverses create-test-product.ts and
// add-free-shipping-option.ts now that the bank-transfer flow has been
// verified end-to-end. Order line items / shipping methods store their own
// snapshot data (product_id / shipping_option_id are plain nullable text
// columns, not FKs), so deleting these doesn't affect order #5's history.

const PRODUCT_HANDLE = "bank-transfer-test-product";
const SHIPPING_OPTION_NAME = "Free Shipping";

export default async function removeBankTransferTestListing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const inventoryModule = container.resolve(Modules.INVENTORY);

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "variants.inventory_items.inventory_item_id"],
    filters: { handle: PRODUCT_HANDLE },
  });
  if (products.length) {
    const inventoryItemIds = products[0].variants.flatMap((v: any) =>
      v.inventory_items.map((i: any) => i.inventory_item_id)
    );
    const reservations = await inventoryModule.listReservationItems({
      inventory_item_id: inventoryItemIds,
    });
    if (reservations.length) {
      await inventoryModule.deleteReservationItems(reservations.map((r: any) => r.id));
      logger.info(`DELETED_RESERVATIONS: ${JSON.stringify(reservations.map((r: any) => r.id))}`);
    }

    await deleteProductsWorkflow(container).run({
      input: { ids: products.map((p: any) => p.id) },
    });
    logger.info(`DELETED_PRODUCT: ${JSON.stringify({ id: products[0].id, handle: PRODUCT_HANDLE })}`);
  } else {
    logger.info(`[${PRODUCT_HANDLE}] not found, skipping`);
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: SHIPPING_OPTION_NAME },
  });
  if (shippingOptions.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: shippingOptions.map((o: any) => o.id) },
    });
    logger.info(`DELETED_SHIPPING_OPTION: ${JSON.stringify({ id: shippingOptions[0].id, name: SHIPPING_OPTION_NAME })}`);
  } else {
    logger.info(`[${SHIPPING_OPTION_NAME}] not found, skipping`);
  }
}
