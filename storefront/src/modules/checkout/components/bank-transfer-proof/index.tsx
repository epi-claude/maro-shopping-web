"use client"

import { useEffect } from "react"
import { Text } from "@medusajs/ui"

import CopyField from "@modules/order/components/payment-details/copy-field"
import PaymentProofUpload from "@modules/order/components/payment-proof-upload"

type BankTransferProofProps = {
  cart: any
  onStatusChange: (uploaded: boolean) => void
}

const BankTransferProof = ({ cart, onStatusChange }: BankTransferProofProps) => {
  const session = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.provider_id?.startsWith("pp_bank-transfer_")
  )
  const bankDetails = session?.data?.bank_details as
    | Record<string, string>
    | undefined
  const initialStatus = cart.metadata?.payment_proof_status as
    | string
    | undefined

  useEffect(() => {
    if (initialStatus === "pending_review") {
      onStatusChange(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStatus])

  if (!bankDetails) {
    return null
  }

  return (
    <div className="flex flex-col w-full mt-6 gap-y-3">
      <Text className="txt-medium-plus text-ui-fg-base font-bold">
        Bank transfer instructions
      </Text>
      <Text className="txt-small text-ui-fg-subtle">
        Click the copy button next to any field, then pay from your banking
        app. Once you've paid, upload a screenshot below to place your order.
      </Text>
      <div className="flex flex-col gap-y-2">
        <CopyField label="Bank" value={bankDetails.bank_name} />
        {bankDetails.bank_address && (
          <CopyField label="Bank address" value={bankDetails.bank_address} />
        )}
        <CopyField label="Account name" value={bankDetails.account_name} />
        <CopyField
          label="Account number"
          value={bankDetails.account_number}
          monospace
        />
        <CopyField
          label="Routing/ABA number"
          value={bankDetails.routing_number}
          monospace
        />
        {bankDetails.account_type && (
          <CopyField label="Account type" value={bankDetails.account_type} />
        )}
      </div>
      {bankDetails.instructions && (
        <Text className="txt-medium text-ui-fg-subtle mt-1">
          {bankDetails.instructions}
        </Text>
      )}
      <PaymentProofUpload
        targetType="cart"
        cartId={cart.id}
        initialStatus={initialStatus}
        promptLabel="Upload your payment screenshot to place your order"
        onUploaded={() => onStatusChange(true)}
      />
    </div>
  )
}

export default BankTransferProof
