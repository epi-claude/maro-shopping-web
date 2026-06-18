import FastDelivery from "@modules/common/icons/fast-delivery"
import Package from "@modules/common/icons/package"
import Refresh from "@modules/common/icons/refresh"

const TRUST_ITEMS = [
  {
    Icon: FastDelivery,
    title: "Island-wide Delivery",
    subtitle: "Free on orders over TTD 500",
  },
  {
    Icon: Package,
    title: "Quality Products",
    subtitle: "Curated & carefully sourced",
  },
  {
    Icon: Refresh,
    title: "Easy Returns",
    subtitle: "30-day return policy",
  },
]

export default function TrustBar() {
  return (
    <div className="border-y border-maro-purple bg-maro-purple-light">
      <div className="content-container py-5">
        <ul className="grid grid-cols-1 xsmall:grid-cols-3 gap-5">
          {TRUST_ITEMS.map(({ Icon, title, subtitle }) => (
            <li key={title} className="flex items-center gap-3 justify-center">
              <Icon size="22" color="#9B7BC7" />
              <div>
                <p className="text-sm font-semibold text-maro-black">{title}</p>
                <p className="text-xs text-maro-purple-dark">{subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
