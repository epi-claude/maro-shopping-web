import { Metadata } from "next"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "How to reach Maro Shopping, based in Trinidad and Tobago.",
}

export default function ContactPage() {
  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-2xl-semi mb-8">Contact Us</h1>

      <div className="flex flex-col gap-y-10 text-base-regular text-ui-fg-subtle">
        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Where we are</h2>
          <p>
            Maro Shopping is based in Trinidad and Tobago, and we currently
            ship to and serve customers across Trinidad and Tobago.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Business hours
          </h2>
          <p>
            Monday – Friday, 9:00 AM – 5:00 PM (Atlantic Standard Time).
            Messages and orders received outside these hours are handled the
            next business day.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Get in touch</h2>
          <p>
            We&apos;re a small, growing store and are still building out a
            dedicated support line. The fastest way to reach us right now is
            with your order number in hand — you can find it on your order
            confirmation email or in your account.
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
            Shipping, payments & returns
          </h2>
          <p>
            For questions about order status, payment methods, or returns,
            see our Customer Service page — it covers the most common
            questions.
          </p>
          <p className="mt-2">
            <LocalizedClientLink
              href="/customer-service"
              className="underline hover:text-ui-fg-base"
            >
              Visit Customer Service
            </LocalizedClientLink>
          </p>
        </section>
      </div>
    </div>
  )
}
