"use client"

import { Minus, Plus } from "@medusajs/icons"
import { ChangeEvent } from "react"

type QuantitySelectorProps = {
  quantity: number
  setQuantity: (quantity: number) => void
  min?: number
  max?: number
  disabled?: boolean
  "data-testid"?: string
}

const QuantitySelector = ({
  quantity,
  setQuantity,
  min = 1,
  max = 99,
  disabled,
  "data-testid": dataTestId,
}: QuantitySelectorProps) => {
  const clamp = (value: number) =>
    Math.min(Math.max(value, min), Math.max(min, max))

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10)
    if (Number.isNaN(parsed)) {
      return
    }
    setQuantity(clamp(parsed))
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Quantity</span>
      <div
        className="flex items-center border border-ui-border-base bg-ui-bg-subtle rounded-rounded w-fit"
        data-testid={dataTestId}
      >
        <button
          type="button"
          onClick={() => setQuantity(clamp(quantity - 1))}
          disabled={disabled || quantity <= min}
          className="h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
          data-testid="quantity-decrement"
        >
          <Minus />
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={quantity}
          onChange={handleInputChange}
          disabled={disabled}
          min={min}
          max={max}
          className="w-12 h-10 text-center bg-transparent border-x border-ui-border-base outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label="Quantity"
          data-testid="quantity-input"
        />
        <button
          type="button"
          onClick={() => setQuantity(clamp(quantity + 1))}
          disabled={disabled || quantity >= max}
          className="h-10 w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
          data-testid="quantity-increment"
        >
          <Plus />
        </button>
      </div>
    </div>
  )
}

export default QuantitySelector
