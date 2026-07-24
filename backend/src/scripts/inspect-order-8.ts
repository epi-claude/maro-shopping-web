import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

const ORDER_ID = 'order_01KYASYKSB6PHDD42HFSN045CS'

export default async function inspectOrder8({ container }: ExecArgs) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(ORDER_ID, {
    relations: ['items', 'shipping_methods'],
  })

  console.log(JSON.stringify({
    display_id: order.display_id,
    currency_code: order.currency_code,
    total: order.total,
    subtotal: order.subtotal,
    shipping_total: order.shipping_total,
    tax_total: order.tax_total,
    item_total: order.item_total,
    items: order.items?.map((i: any) => ({
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.total,
    })),
    shipping_methods: order.shipping_methods?.map((s: any) => ({
      name: s.name,
      amount: s.amount,
    })),
  }, null, 2))
}
