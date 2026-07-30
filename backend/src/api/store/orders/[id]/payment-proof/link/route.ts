import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ICartModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

// Carries payment-proof metadata over from the cart it was uploaded against
// (during checkout, before the order existed) onto the resulting order, so
// the order confirmation page's existing payment-proof display keeps working.
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const { id } = req.params
  const { cart_id } = req.body as { cart_id?: string }

  if (!cart_id) {
    res.status(400).json({ message: 'cart_id is required' })
    return
  }

  const cartModuleService: ICartModuleService = req.scope.resolve(Modules.CART)
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)

  const cart = await cartModuleService.retrieveCart(cart_id).catch(() => null)
  const order = await orderModuleService.retrieveOrder(id).catch(() => null)

  if (!order) {
    res.status(404).json({ message: 'Order not found' })
    return
  }

  if (!cart?.metadata?.payment_proof_url) {
    res.status(200).json({ linked: false })
    return
  }

  await orderModuleService.updateOrders(id, {
    metadata: {
      ...order.metadata,
      payment_proof_url: cart.metadata.payment_proof_url,
      payment_proof_status: cart.metadata.payment_proof_status,
      payment_proof_uploaded_at: cart.metadata.payment_proof_uploaded_at,
    },
  })

  res.status(200).json({ linked: true })
}
