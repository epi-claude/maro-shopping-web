import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Maro Shopping collects, uses, and protects your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-2xl-semi mb-8">Privacy Policy</h1>

      <div className="flex flex-col gap-y-10 text-base-regular text-ui-fg-subtle">
        <p className="text-small-regular text-ui-fg-muted">
          This is placeholder policy content pending final legal review. It
          does not yet represent Maro Shopping&apos;s finalized privacy
          practices.
        </p>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Information we collect
          </h2>
          <p>
            We collect information you provide directly, such as your name,
            email, shipping address, and phone number, when you create an
            account or place an order.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            How we use your information
          </h2>
          <p>
            We use your information to process orders, communicate about
            order status, and improve our storefront experience. We do not
            sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Data retention
          </h2>
          <p>
            We retain account and order information for as long as your
            account is active or as needed to comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your
            personal information at any time by contacting us through the
            Customer Service page.
          </p>
        </section>
      </div>
    </div>
  )
}
