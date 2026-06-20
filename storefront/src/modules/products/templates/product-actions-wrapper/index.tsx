import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

export default async function ProductActionsWrapper({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  return <ProductActions product={product} region={region} />
}
