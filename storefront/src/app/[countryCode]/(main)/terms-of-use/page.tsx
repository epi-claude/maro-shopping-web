import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms and conditions for using the Maro Shopping storefront.",
}

export default function TermsOfUsePage() {
  return (
    <div className="content-container py-12 max-w-3xl">
      <h1 className="text-2xl-semi mb-8">Terms of Use</h1>

      <div className="flex flex-col gap-y-10 text-base-regular text-ui-fg-subtle">
        <p className="text-small-regular text-ui-fg-muted">
          This is placeholder policy content pending final legal review. It
          does not yet represent Maro Shopping&apos;s finalized terms.
        </p>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Acceptance of terms
          </h2>
          <p>
            By accessing or using Maro Shopping, you agree to be bound by
            these Terms of Use and our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Account responsibilities
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your
            account.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Orders & pricing
          </h2>
          <p>
            All orders are subject to product availability. We reserve the
            right to correct pricing errors and to cancel orders placed at
            an incorrect price.
          </p>
        </section>

        <section>
          <h2 className="text-xl-semi text-ui-fg-base mb-2">
            Limitation of liability
          </h2>
          <p>
            Maro Shopping is provided on an &quot;as is&quot; basis. We are
            not liable for indirect or consequential damages arising from
            your use of the site.
          </p>
        </section>
      </div>
    </div>
  )
}
