"use server"

interface Hit {
  readonly objectID?: string
  id?: string
  [x: string | number | symbol]: unknown
}

export async function search(query: string): Promise<Hit[]> {
  const endpoint =
    process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://127.0.0.1:7700"
  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""
  const indexName = process.env.NEXT_PUBLIC_INDEX_NAME || "products"

  try {
    const res = await fetch(`${endpoint}/indexes/${indexName}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ q: query }),
      cache: "no-store",
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.hits ?? []
  } catch {
    return []
  }
}
