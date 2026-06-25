import { NextResponse } from "next/server"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"

// Reads the httpOnly cart cookie server-side and returns the cart.
// Kept out of page render so storefront pages stay statically cacheable;
// the nav cart button fetches this from the client after hydration.
export async function GET() {
  const cart = await retrieveCart()

  if (!cart) {
    return NextResponse.json({ cart: null })
  }

  if (cart?.items?.length) {
    cart.items = await enrichLineItems(cart.items, cart.region_id!)
  }

  return NextResponse.json({ cart })
}
