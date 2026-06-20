import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  const tag = req.nextUrl.searchParams.get("tag") ?? "products"
  revalidateTag(tag)
  return NextResponse.json({ revalidated: true, tag })
}
