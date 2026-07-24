import { Metadata } from "next"

import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export async function generateStaticParams() {
  return [{ countryCode: "tt" }]
}

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  params: {
    countryCode: string
  }
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export default async function StorePage({ params, searchParams }: Params) {
  const { sortBy, page } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
