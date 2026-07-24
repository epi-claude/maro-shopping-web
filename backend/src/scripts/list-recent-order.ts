import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function listRecentOrder({ container }: ExecArgs) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const [orders] = await orderModuleService.listAndCountOrders(
    {},
    { take: 1, order: { created_at: 'DESC' } }
  )
  console.log(JSON.stringify(orders.map((o) => ({ id: o.id, display_id: o.display_id }))))
}
