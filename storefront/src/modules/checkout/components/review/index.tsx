"use client"

import { useState } from "react"
import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import BankTransferProof from "../bank-transfer-proof"
import { isBankTransfer } from "@lib/constants"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )
  const requiresPaymentProof = isBankTransfer(activeSession?.provider_id)
  const [proofUploaded, setProofUploaded] = useState(false)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          {requiresPaymentProof && (
            <BankTransferProof cart={cart} onStatusChange={setProofUploaded} />
          )}
          <div className="flex items-start gap-x-1 w-full mb-6 mt-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <PaymentButton
            cart={cart}
            paymentProofReady={!requiresPaymentProof || proofUploaded}
            data-testid="submit-order-button"
          />
        </>
      )}
    </div>
  )
}

export default Review
