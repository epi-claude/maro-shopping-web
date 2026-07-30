import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

// One-off cleanup for a test order created while verifying the pre-order
// payment-proof checkout flow. Run with: npx medusa exec ./src/scripts/delete-test-order.ts <order_id>
export default async function deleteTestOrder({ container, args }: ExecArgs) {
  const orderId = args[0]
  if (!orderId) {
    throw new Error('Usage: delete-test-order.ts <order_id>')
  }

  const orderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  console.log(`Deleting order ${order.id} (display_id ${order.display_id}, email ${order.email})`)

  await orderModuleService.deleteOrders([orderId])
  console.log('Deleted.')
}
