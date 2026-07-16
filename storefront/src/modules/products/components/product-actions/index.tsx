"use client"

import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"

import MobileActions from "./mobile-actions"
import QuantitySelector from "./quantity-selector"
import ProductPrice from "../product-price"
import { addToCart } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (variantOptions: any) => {
  return variantOptions?.reduce((acc: Record<string, string | undefined>, varopt: any) => {
    if (varopt.option && varopt.value !== null && varopt.value !== undefined) {
      acc[varopt.option.title] = varopt.value
    }
    return acc
  }, {})
}

export default function ProductActions({
  product,
  region,
  disabled,
}: ProductActionsProps) {
  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const countryCode = useParams().countryCode as string
  const router = useRouter()

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // reset quantity whenever the selected variant changes so a stale
  // quantity from a different variant's inventory can't carry over
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariant?.id])

  // the options the shopper still needs to pick (e.g. Color, Size) before
  // a purchasable variant is resolved — drives both the disabled state and
  // the button copy below
  const missingOptions = useMemo(() => {
    return (product.options || [])
      .filter((o) => !options[o.title ?? ""])
      .map((o) => o.title)
      .filter((title): title is string => !!title)
  }, [product.options, options])

  // update the options when a variant is selected
  const setOptionValue = (title: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [title]: value,
    }))
  }

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  // cap the quantity stepper at real stock when inventory is managed and
  // backorders aren't allowed; otherwise fall back to a sane default ceiling
  const maxQuantity = useMemo(() => {
    if (
      selectedVariant?.manage_inventory &&
      !selectedVariant?.allow_backorder
    ) {
      return Math.max(1, Math.min(selectedVariant.inventory_quantity ?? 0, 99))
    }
    return 99
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      // Tell the client-rendered nav cart button to re-fetch its count
      window.dispatchEvent(new Event("cart:updated"))
    } finally {
      setIsAdding(false)
    }
  }

  // add the selected variant to the cart, then jump straight to checkout
  const handleBuyNow = async () => {
    if (!selectedVariant?.id) return null

    setIsBuyingNow(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity,
        countryCode,
      })

      window.dispatchEvent(new Event("cart:updated"))
      router.push(`/${countryCode}/checkout`)
    } finally {
      setIsBuyingNow(false)
    }
  }

  const addToCartLabel = !selectedVariant
    ? missingOptions.length
      ? `Select ${missingOptions.join(" & ")}`
      : "Select variant"
    : !inStock
    ? "Out of stock"
    : "Add to cart"

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.title ?? ""]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding || isBuyingNow}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <QuantitySelector
          quantity={quantity}
          setQuantity={setQuantity}
          max={maxQuantity}
          disabled={!!disabled || isAdding || isBuyingNow}
          data-testid="product-quantity"
        />

        <ProductPrice product={product} variant={selectedVariant} />

        <div className="flex flex-col gap-y-2">
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || !selectedVariant || !!disabled || isAdding}
            variant="primary"
            className="w-full h-10"
            isLoading={isAdding}
            data-testid="add-product-button"
          >
            {addToCartLabel}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={!inStock || !selectedVariant || !!disabled || isBuyingNow}
            variant="secondary"
            className="w-full h-10"
            isLoading={isBuyingNow}
            data-testid="buy-now-button"
          >
            Buy it now
          </Button>
        </div>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          quantity={quantity}
          setQuantity={setQuantity}
          maxQuantity={maxQuantity}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          isAdding={isAdding}
          isBuyingNow={isBuyingNow}
          addToCartLabel={addToCartLabel}
          show={!inView}
          optionsDisabled={!!disabled || isAdding || isBuyingNow}
        />
      </div>
    </>
  )
}
