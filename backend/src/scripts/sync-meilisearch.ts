/**
 * One-shot script to push all products into MeiliSearch.
 * Run via: railway run --service maro-shopping-web npx ts-node src/scripts/sync-meilisearch.ts
 *
 * Requires env vars:
 *   BACKEND_URL         e.g. https://maro-shopping-web.up.railway.app
 *   MEDUSA_ADMIN_EMAIL
 *   MEDUSA_ADMIN_PASSWORD
 *   MEILISEARCH_HOST    e.g. https://meilisearch-production-ms.up.railway.app
 *   MEILISEARCH_ADMIN_KEY
 */

const BACKEND_URL = process.env.BACKEND_URL || process.env.BACKEND_PUBLIC_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const MEILI_HOST = process.env.MEILISEARCH_HOST || process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://localhost:7700"
const MEILI_KEY = process.env.MEILISEARCH_ADMIN_KEY || process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL || ""
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD || ""
const INDEX_NAME = "products"

async function getAdminToken(): Promise<string> {
  const res = await fetch(`${BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  if (!res.ok) throw new Error(`Auth failed: ${res.status} ${await res.text()}`)
  const data = await res.json() as any
  return data.token
}

async function fetchAllProducts(token: string): Promise<any[]> {
  const all: any[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const res = await fetch(
      `${BACKEND_URL}/admin/products?limit=${limit}&offset=${offset}&fields=id,title,description,handle,thumbnail,variants.sku`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error(`Products fetch failed: ${res.status} ${await res.text()}`)
    const data = await res.json() as any
    all.push(...data.products)
    if (all.length >= data.count || data.products.length < limit) break
    offset += limit
  }

  return all
}

async function meili(method: string, path: string, body?: any): Promise<any> {
  const res = await fetch(`${MEILI_HOST}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MEILI_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

async function main() {
  console.log("Authenticating with Medusa admin...")
  const token = await getAdminToken()
  console.log("Auth OK")

  console.log("Fetching products...")
  const products = await fetchAllProducts(token)
  console.log(`Fetched ${products.length} products`)

  console.log("Configuring MeiliSearch index...")
  await meili("POST", `/indexes`, { uid: INDEX_NAME, primaryKey: "id" })

  await meili("PATCH", `/indexes/${INDEX_NAME}/settings`, {
    searchableAttributes: ["title", "description", "variant_sku"],
    displayedAttributes: ["id", "handle", "title", "description", "variant_sku", "thumbnail"],
    filterableAttributes: ["id", "handle"],
  })

  const docs = products.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? "",
    handle: p.handle,
    thumbnail: p.thumbnail ?? "",
    variant_sku: p.variants?.map((v: any) => v.sku).filter(Boolean).join(" ") ?? "",
  }))

  console.log("Pushing documents to MeiliSearch...")
  const result = await meili("POST", `/indexes/${INDEX_NAME}/documents`, docs)
  console.log("MeiliSearch response:", JSON.stringify(result, null, 2))
  console.log("Done.")
}

main().catch((e) => { console.error(e); process.exit(1) })
