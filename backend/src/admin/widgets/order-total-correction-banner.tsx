import { defineWidgetConfig } from '@medusajs/admin-sdk'
import { DetailWidgetProps, AdminOrder } from '@medusajs/framework/types'
import { Container, Text } from '@medusajs/ui'

// This store's prices are stored in the currency's minor unit (cents), but
// Medusa's stock admin dashboard formats `amount` fields as already-decimal
// values (see @medusajs/dashboard's getLocaleAmount), so every total in this
// admin UI renders 100x too high. The storefront and emails already divide
// by 100 correctly — this banner surfaces the true amount here too, without
// touching the underlying data. See CLAUDE.md monetary-amount convention.
const OrderTotalCorrectionBanner = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const correctedTotal = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: order.currency_code,
  }).format(order.total / 100)

  return (
    <Container className="flex items-start gap-x-3 bg-ui-bg-subtle-hover px-6 py-4">
      <Text size="small" className="text-ui-fg-subtle">
        Totals shown below on this page are 100x too high due to a known
        formatting mismatch in Medusa's admin panel. The actual order total
        is{' '}
        <span className="text-ui-fg-base font-medium">{correctedTotal}</span>.
      </Text>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: 'order.details.before',
})

export default OrderTotalCorrectionBanner
