import dynamic from "next/dynamic"

const SearchModal = dynamic(
  () => import("@modules/search/templates/search-modal"),
  { ssr: false }
)

export default function SearchModalRoute() {
  return <SearchModal />
}
