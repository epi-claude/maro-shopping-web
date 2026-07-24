import { ExecArgs } from '@medusajs/framework/types'

const ORDER_ID = 'order_01KYASYKSB6PHDD42HFSN045CS'

export default async function inspectOrder8Totals({ container }: ExecArgs) {
  const query = container.resolve('query')
  const { data } = await query.graph({
    entity: 'order',
    fields: [
      'id',
      'display_id',
      'currency_code',
      'total',
      'subtotal',
      'item_total',
      'item_subtotal',
      'shipping_total',
      'tax_total',
      'discount_total',
      'raw_total',
      'items.unit_price',
      'items.quantity',
      'items.total',
      'items.raw_unit_price',
      'shipping_methods.amount',
      'shipping_methods.raw_amount',
    ],
    filters: { id: ORDER_ID },
  })
  console.log(JSON.stringify(data, null, 2))
}
