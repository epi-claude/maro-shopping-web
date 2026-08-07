import { Suspense } from "react"
import Image from "next/image"

import { getCategoriesList } from "@lib/data/categories"
import { User, MagnifyingGlass, ShoppingBag } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import CategoriesDropdown from "@modules/layout/components/categories-dropdown"

export default async function Nav() {
  const { product_categories } = await getCategoriesList(0, 100)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-20 mx-auto duration-200 bg-maro-purple-light border-b border-maro-purple">
        <nav className="content-container txt-small-plus flex items-center justify-between w-full h-full text-maro-black">
          <div className="flex items-center h-full gap-x-3">
            <div className="h-full small:hidden">
              <SideMenu categories={product_categories || []} />
            </div>
            <LocalizedClientLink
              href="/"
              data-testid="nav-store-link"
              aria-label="Maro Shopping"
            >
              <Image
                src="/images/logo.png"
                alt="Maro Shopping"
                height={48}
                width={75}
                className="hidden small:block object-contain h-12 w-auto"
                priority
              />
              <Image
                src="/images/logo-icon.png"
                alt="Maro Shopping"
                height={40}
                width={40}
                className="block small:hidden object-contain h-10 w-auto"
                priority
              />
            </LocalizedClientLink>
          </div>

          <div className="hidden small:flex items-center gap-x-8 h-full">
            <LocalizedClientLink
              className="hover:text-maro-purple-dark font-medium"
              href="/"
              data-testid="nav-home-link"
            >
              Home
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-maro-purple-dark font-medium"
              href="/store"
              data-testid="nav-store-link-2"
            >
              Store
            </LocalizedClientLink>
            <LocalizedClientLink
              className="hover:text-maro-purple-dark font-medium"
              href="/collections/new-arrivals"
              data-testid="nav-new-arrivals-link"
            >
              New Arrivals
            </LocalizedClientLink>
            <CategoriesDropdown categories={product_categories || []} />
          </div>

          <div className="flex items-center gap-x-5 h-full">
            <div className="flex items-center gap-x-5 h-full">
              {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                <LocalizedClientLink
                  className="hover:text-maro-purple-dark"
                  href="/search"
                  scroll={false}
                  aria-label="Search"
                  data-testid="nav-search-link"
                >
                  <MagnifyingGlass />
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                className="hover:text-maro-purple-dark"
                href="/account"
                aria-label="Account"
                data-testid="nav-account-link"
              >
                <User />
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-maro-purple-dark flex items-center"
                  href="/cart"
                  aria-label="Cart"
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
