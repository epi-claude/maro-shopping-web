"use client"

import { HttpTypes } from "@medusajs/types"
import { useToggleState } from "@medusajs/ui"

import CountrySelect from "@modules/layout/components/country-select"

type ShippingUtilityBarProps = {
  regions: HttpTypes.StoreRegion[]
}

const ShippingUtilityBar = ({ regions }: ShippingUtilityBarProps) => {
  const toggleState = useToggleState()

  if (!regions?.length) {
    return null
  }

  return (
    <div className="hidden small:block border-b border-maro-purple bg-maro-purple-light">
      <div className="content-container flex justify-end">
        <div
          className="py-1.5 text-ui-fg-subtle"
          onMouseEnter={toggleState.open}
          onMouseLeave={toggleState.close}
        >
          <CountrySelect toggleState={toggleState} regions={regions} />
        </div>
      </div>
    </div>
  )
}

export default ShippingUtilityBar
