import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const endpoint = process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || ""
  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""
  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}

  try {
    const health = await fetch(`${endpoint}/health`, { headers, cache: "no-store" })
    const healthData = await health.json()

    const stats = await fetch(`${endpoint}/indexes/products/stats`, { headers, cache: "no-store" })
    const statsData = stats.ok ? await stats.json() : { error: stats.status }

    return NextResponse.json({
      endpoint,
      health: healthData,
      productsIndex: statsData,
    })
  } catch (e: any) {
    return NextResponse.json({ endpoint, error: e.message }, { status: 500 })
  }
}
