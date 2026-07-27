import { ExecArgs } from '@medusajs/framework/types'

// One-time migration: converts every stored monetary amount from the
// currency's minor unit (cents) to Medusa's native decimal/major-unit
// convention, so `amount: 590` means $590.00 everywhere, matching the stock
// Admin dashboard's own assumption (see CLAUDE.md).
//
// Usage (medusa exec's arg parser rejects "--"-prefixed flags, so plain words):
//   npx medusa exec ./src/scripts/migrate-prices-to-decimal.ts          (dry run, default)
//   npx medusa exec ./src/scripts/migrate-prices-to-decimal.ts commit   (writes for real)
//   npx medusa exec ./src/scripts/migrate-prices-to-decimal.ts commit force  (re-run after already committed)
//
// Every Medusa v2 money column has a companion `raw_<col>` jsonb shadow
// column shaped like {"value": "<string>", "precision": 20} - both the plain
// numeric column and the raw shadow are updated together, in a single
// transaction, so the two never disagree.

const NUMERIC_RAW_PAIRS: Array<[table: string, col: string, rawCol: string]> = [
  ['price', 'amount', 'raw_amount'],
  ['order_line_item', 'unit_price', 'raw_unit_price'],
  ['order_line_item', 'compare_at_unit_price', 'raw_compare_at_unit_price'],
  ['order_line_item_adjustment', 'amount', 'raw_amount'],
  ['order_shipping_method', 'amount', 'raw_amount'],
  ['order_shipping_method_adjustment', 'amount', 'raw_amount'],
  ['order_credit_line', 'amount', 'raw_amount'],
  ['order_transaction', 'amount', 'raw_amount'],
  ['order_change_action', 'amount', 'raw_amount'],
  ['cart_line_item', 'unit_price', 'raw_unit_price'],
  ['cart_line_item', 'compare_at_unit_price', 'raw_compare_at_unit_price'],
  ['cart_line_item_adjustment', 'amount', 'raw_amount'],
  ['cart_shipping_method', 'amount', 'raw_amount'],
  ['cart_shipping_method_adjustment', 'amount', 'raw_amount'],
  ['payment', 'amount', 'raw_amount'],
  ['payment_collection', 'amount', 'raw_amount'],
  ['payment_collection', 'authorized_amount', 'raw_authorized_amount'],
  ['payment_collection', 'captured_amount', 'raw_captured_amount'],
  ['payment_collection', 'refunded_amount', 'raw_refunded_amount'],
  ['payment_session', 'amount', 'raw_amount'],
  ['capture', 'amount', 'raw_amount'],
  ['refund', 'amount', 'raw_amount'],
  ['credit_line', 'amount', 'raw_amount'],
  ['return', 'refund_amount', 'raw_refund_amount'],
]

// Exact integer-cents -> decimal string conversion, no floating point.
// "52300" -> "523.00", "1" -> "0.01", "0" -> "0.00", "-150" -> "-1.50"
function centsToDecimalString(raw: string): string {
  let neg = false
  let s = raw.trim()
  if (s.includes('.')) {
    throw new Error(`Expected an integer cents value but got "${raw}" — refusing to guess at precision.`)
  }
  if (s.startsWith('-')) {
    neg = true
    s = s.slice(1)
  }
  s = s.padStart(3, '0')
  const intPart = s.slice(0, -2).replace(/^0+(?=\d)/, '') || '0'
  const fracPart = s.slice(-2)
  return (neg ? '-' : '') + intPart + '.' + fracPart
}

export default async function migratePricesToDecimal({ container, args }: ExecArgs) {
  const knex = container.resolve('__pg_connection__')
  const commit = args.includes('commit')
  const force = args.includes('force')

  await knex.schema.createTableIfNotExists('pricing_decimal_migration_log', (t: any) => {
    t.increments('id').primary()
    t.timestamp('ran_at').defaultTo(knex.fn.now())
    t.string('mode')
  })

  if (commit) {
    const existing = await knex('pricing_decimal_migration_log').where({ mode: 'commit' }).first()
    if (existing && !force) {
      console.log(`Refusing to run: migration already committed at ${existing.ran_at}. Pass "force" to re-run anyway.`)
      return
    }
  }

  console.log(commit ? '=== COMMIT MODE (writing) ===' : '=== DRY RUN (no writes) ===')

  const summary: Record<string, number> = {}

  const runInTx = async (fn: (trx: any) => Promise<void>) => {
    if (commit) {
      await knex.transaction(fn)
    } else {
      // Run the same logic inside a transaction that we always roll back,
      // so dry-run exercises the exact same code path with zero side effects.
      try {
        await knex.transaction(async (trx: any) => {
          await fn(trx)
          throw new Error('__DRY_RUN_ROLLBACK__')
        })
      } catch (e: any) {
        if (e.message !== '__DRY_RUN_ROLLBACK__') throw e
      }
    }
  }

  await runInTx(async (trx) => {
    for (const [table, col, rawCol] of NUMERIC_RAW_PAIRS) {
      const rows = await trx(table).select('id', col, rawCol).whereNotNull(col)
      let changed = 0
      for (const row of rows) {
        const rawShadow = row[rawCol] as { value: string; precision: number } | null
        const sourceValue = rawShadow?.value ?? String(row[col])
        const newDecimalStr = centsToDecimalString(sourceValue)
        const newRaw = rawShadow ? { ...rawShadow, value: newDecimalStr } : { value: newDecimalStr, precision: 20 }
        await trx(table).where({ id: row.id }).update({
          [col]: newDecimalStr,
          ...(rawShadow ? { [rawCol]: JSON.stringify(newRaw) } : {}),
        })
        changed++
      }
      summary[`${table}.${col}`] = changed
      if (changed > 0) {
        const sample = await trx(table).select('id', col, rawCol).limit(2)
        console.log(`${table}.${col}: ${changed} rows updated. Sample after:`, JSON.stringify(sample))
      }
    }

    // order_summary.totals is a cached JSON blob of derived totals (not
    // live-recomputed), with the same numeric + raw_<key> pairing convention
    // nested inside the JSON instead of as separate columns.
    const summaries = await trx('order_summary').select('id', 'totals')
    let summariesChanged = 0
    for (const row of summaries) {
      const totals = row.totals as Record<string, unknown>
      let touched = false
      for (const key of Object.keys(totals)) {
        if (!key.startsWith('raw_')) continue
        const rawVal = totals[key] as { value: string; precision: number } | undefined
        if (!rawVal || typeof rawVal.value !== 'string') continue
        const plainKey = key.slice(4)
        const newDecimalStr = centsToDecimalString(rawVal.value)
        totals[key] = { ...rawVal, value: newDecimalStr }
        if (plainKey in totals) {
          totals[plainKey] = Number(newDecimalStr)
        }
        touched = true
      }
      if (touched) {
        await trx('order_summary').where({ id: row.id }).update({ totals: JSON.stringify(totals) })
        summariesChanged++
      }
    }
    summary['order_summary.totals'] = summariesChanged
    if (summariesChanged > 0) {
      const sample = await trx('order_summary').select('id', 'totals').limit(1)
      console.log('order_summary.totals sample after:', JSON.stringify(sample, null, 2))
    }

    if (commit) {
      await trx('pricing_decimal_migration_log').insert({ mode: 'commit' })
    }
  })

  console.log('=== Summary (rows touched per column) ===')
  console.log(JSON.stringify(summary, null, 2))
  console.log(commit ? 'Committed.' : 'Dry run complete — re-run with --commit to write for real.')
}
