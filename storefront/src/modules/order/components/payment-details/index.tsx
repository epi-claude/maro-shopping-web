import { Container, Heading, Text } from "@medusajs/ui"

import { isBankTransfer, isStripe, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

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
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
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
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
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
          <div className="flex flex-col w-full mt-4 gap-y-1">
            <Text className="txt-medium-plus text-ui-fg-base mb-1">
              Bank transfer instructions
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              Bank: {bankDetails.bank_name}
            </Text>
            {bankDetails.bank_address && (
              <Text className="txt-medium text-ui-fg-subtle">
                Bank Address: {bankDetails.bank_address}
              </Text>
            )}
            <Text className="txt-medium text-ui-fg-subtle">
              Account Name: {bankDetails.account_name}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              Account Number: {bankDetails.account_number}
            </Text>
            <Text className="txt-medium text-ui-fg-subtle">
              Routing/ABA Number: {bankDetails.routing_number}
            </Text>
            {bankDetails.account_type && (
              <Text className="txt-medium text-ui-fg-subtle">
                Account Type: {bankDetails.account_type}
              </Text>
            )}
            <Text className="txt-medium text-ui-fg-subtle mt-2">
              {bankDetails.instructions}
            </Text>
          </div>
        )}
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
