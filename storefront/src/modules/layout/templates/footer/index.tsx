import { Text } from "@medusajs/ui"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  return (
    <footer className="border-t border-maro-purple bg-maro-purple-light w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-16">
          <div>
            <LocalizedClientLink href="/" aria-label="Maro Shopping">
              <Image
                src="/images/logo.png"
                alt="Maro Shopping"
                height={60}
                width={160}
                className="object-contain"
              />
            </LocalizedClientLink>
          </div>
          <div className="text-small-regular gap-10 grid grid-cols-2 sm:grid-cols-3">
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Support</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href="/customer-service"
                    className="hover:text-ui-fg-base"
                  >
                    Customer Service
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/return-policy"
                    className="hover:text-ui-fg-base"
                  >
                    Return Policy
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Legal</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href="/privacy-policy"
                    className="hover:text-ui-fg-base"
                  >
                    Privacy Policy
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/terms-of-use"
                    className="hover:text-ui-fg-base"
                  >
                    Terms of Use
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Account</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink
                    href="/account"
                    className="hover:text-ui-fg-base"
                  >
                    Sign Up
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} Maro Shopping Online. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
