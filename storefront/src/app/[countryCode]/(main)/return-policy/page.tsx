import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Return and exchange policy for Maro Shopping.",
}

export default function ReturnPolicyPage() {
  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-2xl-semi mb-8">Return Policy</h1>

      <div className="flex flex-col gap-y-10 text-base-regular text-ui-fg-subtle">
        <p className="text-small-regular text-ui-fg-muted">
          This is placeholder policy content pending final legal review. It
          does not yet represent Maro Shopping&apos;s finalized return terms.
        </p>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Return window
          </h2>
          <p>
            Items may be returned within 14 days of delivery, provided they
            are unused, unworn, and in their original packaging with tags
            attached.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            How to start a return
          </h2>
          <p>
            Contact us with your order number via the{" "}
            <LocalizedClientLink
              href="/customer-service"
              className="underline hover:text-ui-fg-base"
            >
              Customer Service
            </LocalizedClientLink>{" "}
            page and we&apos;ll walk you through the process.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Refunds</h2>
          <p>
            Once a return is received and inspected, refunds are issued to
            the original payment method. Please allow a few business days
            for the refund to appear.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Exceptions</h2>
          <p>
            Final sale items, gift cards, and made-to-order products are not
            eligible for return unless defective.
          </p>
        </section>
      </div>
    </div>
  )
}
