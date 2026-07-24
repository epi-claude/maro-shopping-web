import { ExecArgs } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export default async function inspectCurrencyTtd({ container }: ExecArgs) {
  const storeModuleService = container.resolve(Modules.STORE)
  const [stores] = await storeModuleService.listAndCountStores({})
  console.log('store default_currency_code / supported_currencies:', JSON.stringify(
    stores.map((s: any) => ({
      default_currency_code: s.default_currency_code,
      supported_currencies: s.supported_currencies,
    })),
    null,
    2
  ))

  const query = container.resolve('query')
  const { data: currencies } = await query.graph({
    entity: 'currency',
    fields: ['code', 'symbol', 'symbol_native', 'decimal_digits', 'name'],
    filters: { code: 'ttd' },
  })
  console.log('currency row for ttd:', JSON.stringify(currencies, null, 2))

  const { data: regions } = await query.graph({
    entity: 'region',
    fields: ['id', 'name', 'currency_code'],
  })
  console.log('regions:', JSON.stringify(regions, null, 2))
}
