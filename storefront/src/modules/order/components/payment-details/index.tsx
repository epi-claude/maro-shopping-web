import { Container, Heading, Text } from "@medusajs/ui"

import { isBankTransfer, isStripe, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import CopyField from "./copy-field"
import PaymentProofUpload from "../payment-proof-upload"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]
  const bankDetails =
    payment && isBankTransfer(payment.provider_id)
      ? (payment.data?.bank_details as Record<string, string> | undefined)
      : undefined

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Payment
      </Heading>
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1 font-bold">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method"
              >
                {paymentInfoMap[payment.provider_id].title}
              </Text>
            </div>
            <div className="flex flex-col w-2/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1 font-bold">
                Payment details
              </Text>
              <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
                <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                  {paymentInfoMap[payment.provider_id].icon}
                </Container>
                <Text data-testid="payment-amount">
                  {isStripe(payment.provider_id) && payment.data?.card_last4
                    ? `**** **** **** ${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paid at ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString()}`}
                </Text>
              </div>
            </div>
          </div>
        )}
        {bankDetails && (
          <div className="flex flex-col w-full mt-4 gap-y-3">
            <Text className="txt-medium-plus text-ui-fg-base">
              Bank transfer instructions
            </Text>
            <Text className="txt-small text-ui-fg-subtle">
              Click the copy button next to any field, then paste it into
              your banking app to pay.
            </Text>
            <div className="flex flex-col gap-y-2">
              <CopyField label="Bank" value={bankDetails.bank_name} />
              {bankDetails.bank_address && (
                <CopyField
                  label="Bank address"
                  value={bankDetails.bank_address}
                />
              )}
              <CopyField
                label="Account name"
                value={bankDetails.account_name}
              />
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
                <CopyField
                  label="Account type"
                  value={bankDetails.account_type}
                />
              )}
              <CopyField
                label="Payment reference"
                value={String(order.display_id ?? order.id)}
                monospace
              />
            </div>
            {bankDetails.instructions && (
              <Text className="txt-medium text-ui-fg-subtle mt-1">
                {bankDetails.instructions}
              </Text>
            )}
            <PaymentProofUpload
              orderId={order.id}
              initialStatus={order.metadata?.payment_proof_status as string}
            />
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
