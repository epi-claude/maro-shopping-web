import { ExecArgs } from '@medusajs/framework/types'

// The storefront ships 12 product categories, but 4 of them (Shirts,
// Sweatshirts, Pants, Merch) are leftover Medusa seed/demo categories whose
// only linked product was a soft-deleted demo item — so their category pages
// rendered an empty grid, and the footer (which lists categories by `rank`,
// lowest first) surfaced exactly those 4 dead categories ahead of the real,
// populated boutique categories (Dresses, Tops & Vests, Pants & Trousers, ...).
//
// This does two things:
//  1. Best-fit links a handful of existing (real, published) boutique
//     products into Shirts/Sweatshirts/Pants so those category pages show
//     real inventory. "Merch" has no fitting product in a fashion-only
//     catalog (no mugs/totes/stickers) and is deliberately left unlinked
//     rather than mislabeling a dress as merch.
//  2. Reorders `rank` so populated categories surface first in the footer;
//     the still-empty "Merch" is pushed to the very end so it's never one
//     of the footer's first 6.
//
// Usage (medusa exec's arg parser rejects "--"-prefixed flags, so plain words):
//   npx medusa exec ./src/scripts/fix-empty-demo-categories.ts          (dry run, default)
//   npx medusa exec ./src/scripts/fix-empty-demo-categories.ts commit   (writes for real)

const CATEGORY_PRODUCT_LINKS: Array<[categoryHandle: string, productTitle: string]> = [
  ['shirts', 'Gemma Poplin Cotton Shirt Dress'],
  ['shirts', 'Elysian Silk Wrap Blouse'],
  ['shirts', 'Aurelia Halter Button-Up Vest in Burgundy'],
  ['sweatshirts', 'Cove Crochet Knit Summer Top'],
  ['pants', 'Paloma Abstract Watercolor Wide-Leg Pants'],
  ['pants', 'Talia Wide-Leg Crepe Trousers'],
  ['pants', 'Valeria Illustrated Slim-Fit Trousers'],
]

// Lowest rank shows first in the footer/nav. Real, populated categories
// first; the thin-but-now-populated demo ones next; empty "Merch" last.
const CATEGORY_RANK_ORDER: string[] = [
  'dresses',
  'tops-vests',
  'pants-trousers',
  'skirts',
  'jumpsuits-rompers',
  'jackets-outerwear',
  'matching-sets',
  'shorts',
  'shirts',
  'sweatshirts',
  'pants',
  'merch',
]

export default async function fixEmptyDemoCategories({ container, args }: ExecArgs) {
  const knex = container.resolve('__pg_connection__')
  const commit = args.includes('commit')

  console.log(commit ? '=== COMMIT MODE (writing) ===' : '=== DRY RUN (no writes) ===')

  const runInTx = async (fn: (trx: any) => Promise<void>) => {
    if (commit) {
      await knex.transaction(fn)
    } else {
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
    let linksAdded = 0
    for (const [categoryHandle, productTitle] of CATEGORY_PRODUCT_LINKS) {
      const category = await trx('product_category')
        .where({ handle: categoryHandle })
        .whereNull('deleted_at')
        .first('id')
      const product = await trx('product')
        .where({ title: productTitle })
        .whereNull('deleted_at')
        .first('id')

      if (!category || !product) {
        console.log(`SKIP (not found): ${categoryHandle} <- "${productTitle}"`)
        continue
      }

      const inserted = await trx('product_category_product')
        .insert({ product_id: product.id, product_category_id: category.id })
        .onConflict(['product_id', 'product_category_id'])
        .ignore()

      if (inserted.rowCount > 0) {
        linksAdded++
        console.log(`Linked "${productTitle}" -> ${categoryHandle}`)
      } else {
        console.log(`Already linked: "${productTitle}" -> ${categoryHandle}`)
      }
    }

    let ranksChanged = 0
    for (let i = 0; i < CATEGORY_RANK_ORDER.length; i++) {
      const handle = CATEGORY_RANK_ORDER[i]
      const result = await trx('product_category')
        .where({ handle })
        .whereNull('deleted_at')
        .update({ rank: i })
      ranksChanged += result
    }

    console.log(`Links added: ${linksAdded}/${CATEGORY_PRODUCT_LINKS.length}`)
    console.log(`Category ranks updated: ${ranksChanged}/${CATEGORY_RANK_ORDER.length}`)
  })

  console.log(commit ? 'Committed.' : 'Dry run complete — re-run with "commit" to write for real.')
}
