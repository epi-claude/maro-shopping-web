"use client"

import { Popover, Transition } from "@headlessui/react"
import { ChevronDown } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

type CategoriesDropdownProps = {
  categories: HttpTypes.StoreProductCategory[]
}

const CategoriesDropdown = ({ categories }: CategoriesDropdownProps) => {
  const topLevelCategories = categories.filter((c) => !c.parent_category)

  if (!topLevelCategories.length) {
    return null
  }

  return (
    <Popover className="relative h-full flex items-center">
      {({ open }) => (
        <>
          <Popover.Button
            className="flex items-center gap-x-1 hover:text-maro-purple-dark font-medium focus:outline-none"
            data-testid="nav-categories-button"
          >
            Categories
            <ChevronDown
              className={clx("transition-transform duration-150", {
                "rotate-180": open,
              })}
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className="absolute top-[calc(100%+1px)] left-0 z-30 bg-white border border-gray-200 rounded-rounded shadow-md min-w-[280px] max-w-[520px] p-6"
              data-testid="nav-categories-panel"
            >
              {({ close }) => (
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {topLevelCategories.map((category) => (
                    <div key={category.id} className="flex flex-col gap-y-2">
                      <LocalizedClientLink
                        href={`/categories/${category.handle}`}
                        className="txt-small-plus hover:text-maro-purple-dark"
                        onClick={close}
                        data-testid="nav-category-link"
                      >
                        {category.name}
                      </LocalizedClientLink>
                      {!!category.category_children?.length && (
                        <ul className="flex flex-col gap-y-1.5">
                          {category.category_children.map((child) => (
                            <li key={child.id}>
                              <LocalizedClientLink
                                href={`/categories/${child.handle}`}
                                className="txt-small text-ui-fg-subtle hover:text-maro-purple-dark"
                                onClick={close}
                                data-testid="nav-category-child-link"
                              >
                                {child.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default CategoriesDropdown
