import repeat from "@lib/util/repeat"
import SkeletonOrderSummary from "@modules/skeletons/components/skeleton-order-summary"

const SkeletonCheckoutPage = () => {
  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <div className="flex flex-col gap-y-6 bg-white">
        {repeat(4).map((index) => (
          <div key={index} className="flex flex-col gap-y-4 border-b py-6">
            <div className="w-32 h-6 bg-gray-200 animate-pulse" />
            <div className="w-full h-12 bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-y-8">
        <SkeletonOrderSummary />
      </div>
    </div>
  )
}

export default SkeletonCheckoutPage
