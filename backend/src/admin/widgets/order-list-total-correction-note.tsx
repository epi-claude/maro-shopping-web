import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { Container, Text } from '@medusajs/ui'

// Same known Medusa admin formatting mismatch as order-total-correction-banner.tsx
// applies to every total in this list — divide any total shown below by 100.
const OrderListTotalCorrectionNote = () => {
  return (
    <Container className="flex items-center gap-x-3 bg-ui-bg-subtle-hover px-6 py-3">
      <Text size="small" className="text-ui-fg-subtle">
        Order totals in this list are shown 100x too high (known Medusa admin
        formatting mismatch) — divide by 100 for the real amount.
      </Text>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'order.list.before',
})

export default OrderListTotalCorrectionNote
