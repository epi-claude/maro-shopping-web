import { NextRequest, NextResponse } from "next/server"

const COUNTRY_CODE = "tt"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.search

  // Already localized — pass through immediately, no backend call needed
  if (pathname.startsWith(`/${COUNTRY_CODE}`)) {
    const cartId = request.nextUrl.searchParams.get("cart_id")
    const checkoutStep = request.nextUrl.searchParams.get("step")

    if (cartId && !checkoutStep) {
      const url = new URL(request.nextUrl.href)
      url.searchParams.set("step", "address")
      const response = NextResponse.redirect(url, 307)
      response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
      return response
    }

    return NextResponse.next()
  }

  // Not localized — redirect to /tt{path}
  const redirectPath = pathname === "/" ? "" : pathname
  const redirectUrl = `${request.nextUrl.origin}/${COUNTRY_CODE}${redirectPath}${searchParams}`
  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)"], // prevents redirecting on static files and Next.js internals
}
