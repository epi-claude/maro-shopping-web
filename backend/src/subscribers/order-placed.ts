import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ['items', 'summary', 'shipping_address'],
  })
  const shippingAddress = await (orderModuleService as any).orderAddressService_.retrieve(order.shipping_address.id)

  // payment_collections isn't a direct MikroORM relation on the order entity
  // (it's a module link), so it has to go through the query graph rather
  // than orderModuleService.retrieveOrder's `relations` option.
  const {
    data: [orderWithPayment],
  } = await query.graph({
    entity: 'order',
    fields: ['payment_collections.payments.provider_id', 'payment_collections.payments.data'],
    filters: { id: order.id },
  })
  const payment = orderWithPayment?.payment_collections?.[0]?.payments?.[0]
  const bankDetails = payment?.provider_id?.startsWith('pp_bank-transfer_')
    ? (payment.data?.bank_details as Record<string, string>)
    : undefined

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: 'email',
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: 'info@example.com',
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress,
        bankDetails,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
