import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer Service",
  description:
    "Shipping, payment, order status, and returns information for Maro Shopping.",
}

export default function CustomerServicePage() {
  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-2xl-semi mb-8">Customer Service</h1>

      <div className="flex flex-col gap-y-10 text-base-regular text-ui-fg-subtle">
        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Order status & tracking
          </h2>
          <p>
            You can check the status of any order at any time from your
            account. Every order also gets a confirmation email as soon as
            it&apos;s placed.
          </p>
          <p className="mt-2">
            <LocalizedClientLink
              href="/account/orders"
              className="underline hover:text-ui-fg-base"
            >
              View your orders
            </LocalizedClientLink>
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Payment methods
          </h2>
          <p>
            We currently accept payment by direct Bank Transfer and Cash on
            Delivery (COD). At checkout, choose the option that works best
            for you — Bank Transfer orders include the account details you
            need right on the page, and COD orders are paid when your order
            arrives.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Shipping</h2>
          <p>
            Orders are processed and shipped after payment is confirmed.
            Processing time can vary by product — if anything about your
            order's timing needs attention, it will be reflected in your
            order status.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Returns & exchanges
          </h2>
          <p>
            If an item isn&apos;t right, keep hold of your order confirmation
            and reach out with your order number so we can help. We&apos;re a
            small, growing store and are still building out a dedicated
            support channel — thanks for your patience in the meantime.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-y-4">
            <div>
              <h3 className="txt-medium-plus text-ui-fg-base">
                Do I need an account to order?
              </h3>
              <p>
                No — you can check out as a guest. Creating an account just
                makes it easier to track past and current orders.
              </p>
            </div>
            <div>
              <h3 className="txt-medium-plus text-ui-fg-base">
                Can I change or cancel my order after placing it?
              </h3>
              <p>
                If your order hasn&apos;t shipped yet, there may still be time
                — the sooner you reach out with your order number, the
                better the odds we can adjust it.
              </p>
            </div>
            <div>
              <h3 className="txt-medium-plus text-ui-fg-base">
                Is my payment information secure?
              </h3>
              <p>
                Yes. We don&apos;t store card details ourselves — Bank
                Transfer and COD orders never require you to share card
                information with us at all.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
