import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

const ORDER_ID = 'order_01KYASYKSB6PHDD42HFSN045CS'

export default async function revertTestPaymentProof({ container }: ExecArgs) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(ORDER_ID)
  const {
    payment_proof_url,
    payment_proof_status,
    payment_proof_uploaded_at,
    ...rest
  } = order.metadata || {}

  await orderModuleService.updateOrders(ORDER_ID, { metadata: rest })
  console.log('Reverted test payment-proof metadata on', ORDER_ID)
}
