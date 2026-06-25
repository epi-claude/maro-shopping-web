"use client"

import { useCallback, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import CartDropdown from "../cart-dropdown"

// Fetches the cart from /api/cart on the client so the server-rendered layout
// never reads cookies — that keeps storefront pages statically cacheable.
// Re-fetches when a "cart:updated" event fires (dispatched after add-to-cart).
export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setCart(data.cart ?? null)
    } catch {
      // ignore — dropdown renders an empty cart
    }
  }, [])

  useEffect(() => {
    loadCart()

    window.addEventListener("cart:updated", loadCart)
    return () => window.removeEventListener("cart:updated", loadCart)
  }, [loadCart])

  return <CartDropdown cart={cart} />
}
