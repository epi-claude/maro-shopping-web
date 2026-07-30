import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

// One-off cleanup: releases an inventory reservation left behind by a
// deleted test order (deleteOrders() doesn't release reservations).
// Run with: npx medusa exec ./src/scripts/release-test-reservation.ts <line_item_id>
export default async function releaseTestReservation({ container, args }: ExecArgs) {
  const lineItemId = args[0]
  if (!lineItemId) {
    throw new Error('Usage: release-test-reservation.ts <line_item_id>')
  }

  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  await inventoryModuleService.deleteReservationItemsByLineItem(lineItemId)
  console.log(`Released reservation for line item ${lineItemId}`)
}
