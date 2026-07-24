import { useState } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { DetailWidgetProps, AdminOrder } from '@medusajs/framework/types'
import { Button, Container, Heading, Text } from '@medusajs/ui'

const PaymentProofWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const payment = order.payment_collections?.[0]?.payments?.[0]

  if (!payment?.provider_id?.startsWith('pp_bank-transfer_')) {
    return null
  }

  const metadata = (order.metadata ?? {}) as Record<string, unknown>
  const proofUrl = metadata.payment_proof_url as string | undefined
  const alreadyCaptured = !!payment.captured_at

  const handleMarkAsPaid = async () => {
    setCapturing(true)
    setError(null)

    try {
      const res = await fetch(`/admin/payments/${payment.id}/capture`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        throw new Error('Capture failed')
      }

      window.location.reload()
    } catch {
      setError("Couldn't mark this order as paid — try the Payment section below instead.")
      setCapturing(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Bank transfer proof</Heading>
      </div>
      <div className="flex flex-col gap-y-4 px-6 py-4">
        {proofUrl ? (
          <a href={proofUrl} target="_blank" rel="noreferrer">
            <img
              src={proofUrl}
              alt="Customer-submitted payment screenshot"
              className="max-h-80 w-full rounded-lg border object-contain"
            />
          </a>
        ) : (
          <Text size="small" className="text-ui-fg-subtle">
            The customer hasn't uploaded a payment screenshot yet.
          </Text>
        )}
        {alreadyCaptured ? (
          <Text size="small" className="text-ui-fg-subtle">
            Payment already captured.
          </Text>
        ) : (
          <Button
            variant="primary"
            size="small"
            disabled={capturing}
            onClick={handleMarkAsPaid}
          >
            {capturing ? 'Marking as paid…' : 'Mark as paid'}
          </Button>
        )}
        {error && (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'order.details.side.after',
})

export default PaymentProofWidget
