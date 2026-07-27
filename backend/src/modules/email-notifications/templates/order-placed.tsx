import { Text, Section, Hr } from '@react-email/components'
import * as React from 'react'
import { Base } from './base'
import { OrderDTO, OrderAddressDTO } from '@medusajs/framework/types'
import { formatAmount } from '../utils/money'

export const ORDER_PLACED = 'order-placed'

interface BankDetails {
  bank_name: string
  bank_address: string
  account_name: string
  account_number: string
  routing_number: string
  account_type: string
  instructions: string
}

interface OrderTotals {
  itemsSubtotal: number
  shippingTotal: number
  taxTotal: number
  grandTotal: number
}

interface OrderPlacedPreviewProps extends OrderTotals {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  bankDetails?: BankDetails
}

export interface OrderPlacedTemplateProps extends OrderTotals {
  order: OrderDTO & { display_id: string; summary: { raw_current_order_total: { value: number } } }
  shippingAddress: OrderAddressDTO
  bankDetails?: BankDetails
  preview?: string
}

export const isOrderPlacedTemplateData = (data: any): data is OrderPlacedTemplateProps =>
  typeof data.order === 'object' && typeof data.shippingAddress === 'object'

const cellStyle: React.CSSProperties = {
  padding: '8px 6px',
  borderBottom: '1px solid #eaeaea',
  fontSize: '13px',
}

const numericCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
  whiteSpace: 'nowrap',
}

export const OrderPlacedTemplate: React.FC<OrderPlacedTemplateProps> & {
  PreviewProps: OrderPlacedPreviewProps
} = ({
  order,
  shippingAddress,
  bankDetails,
  itemsSubtotal,
  shippingTotal,
  taxTotal,
  grandTotal,
  preview = 'Your order has been placed!',
}) => {
  const currencyCode = order.currency_code
  return (
    <Base preview={preview}>
      <Section>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', margin: '0 0 30px' }}>
          Order Confirmation
        </Text>

        <Text style={{ margin: '0 0 15px' }}>
          Dear {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>

        <Text style={{ margin: '0 0 30px' }}>
          Thank you for your recent order! Here are your order details:
        </Text>

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Order Summary
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order ID: {order.display_id}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          Order Date: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          Total: {formatAmount(grandTotal, currencyCode)}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
          Shipping Address
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.address_1}
        </Text>
        <Text style={{ margin: '0 0 5px' }}>
          {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postal_code}
        </Text>
        <Text style={{ margin: '0 0 20px' }}>
          {shippingAddress.country_code}
        </Text>

        <Hr style={{ margin: '20px 0' }} />

        <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px' }}>
          Order Items
        </Text>

        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: 'collapse', border: '1px solid #eaeaea', margin: '10px 0' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ ...cellStyle, textAlign: 'left' }}>Item</th>
              <th style={{ ...numericCellStyle, textAlign: 'center' }}>Qty</th>
              <th style={numericCellStyle}>Unit Price</th>
              <th style={numericCellStyle}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td style={cellStyle}>
                  <Text style={{ margin: 0, fontSize: '13px' }}>{item.product_title ?? item.title}</Text>
                  {item.variant_title && (
                    <Text style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>
                      {item.variant_title}
                    </Text>
                  )}
                </td>
                <td style={{ ...numericCellStyle, textAlign: 'center' }}>{item.quantity}</td>
                <td style={numericCellStyle}>{formatAmount(item.unit_price, currencyCode)}</td>
                <td style={numericCellStyle}>
                  {formatAmount(item.unit_price * item.quantity, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: '10px 0 20px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '3px 6px', fontSize: '13px' }}>Subtotal</td>
              <td style={{ padding: '3px 6px', fontSize: '13px', textAlign: 'right' }}>
                {formatAmount(itemsSubtotal, currencyCode)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', fontSize: '13px' }}>Shipping</td>
              <td style={{ padding: '3px 6px', fontSize: '13px', textAlign: 'right' }}>
                {formatAmount(shippingTotal, currencyCode)}
              </td>
            </tr>
            {taxTotal !== 0 && (
              <tr>
                <td style={{ padding: '3px 6px', fontSize: '13px' }}>Tax</td>
                <td style={{ padding: '3px 6px', fontSize: '13px', textAlign: 'right' }}>
                  {formatAmount(taxTotal, currencyCode)}
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: '6px 6px 0', fontSize: '14px', fontWeight: 'bold', borderTop: '1px solid #eaeaea' }}>
                Total
              </td>
              <td
                style={{
                  padding: '6px 6px 0',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  borderTop: '1px solid #eaeaea',
                }}
              >
                {formatAmount(grandTotal, currencyCode)}
              </td>
            </tr>
          </tbody>
        </table>

        {bankDetails && (
          <>
            <Hr style={{ margin: '20px 0' }} />

            <Text style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px' }}>
              Bank Transfer Details
            </Text>
            <Text style={{ margin: '0 0 15px' }}>
              Please complete your payment using the details below. Use your order ID ({order.display_id}) as the payment reference.
            </Text>
            <Text style={{ margin: '0 0 5px' }}>
              Bank: {bankDetails.bank_name}
            </Text>
            {bankDetails.bank_address && (
              <Text style={{ margin: '0 0 5px' }}>
                Bank Address: {bankDetails.bank_address}
              </Text>
            )}
            <Text style={{ margin: '0 0 5px' }}>
              Account Name: {bankDetails.account_name}
            </Text>
            <Text style={{ margin: '0 0 5px' }}>
              Account Number: {bankDetails.account_number}
            </Text>
            <Text style={{ margin: '0 0 5px' }}>
              Routing/ABA Number: {bankDetails.routing_number}
            </Text>
            {bankDetails.account_type && (
              <Text style={{ margin: '0 0 5px' }}>
                Account Type: {bankDetails.account_type}
              </Text>
            )}
            <Text style={{ margin: '15px 0 0' }}>
              {bankDetails.instructions}
            </Text>
          </>
        )}
      </Section>
    </Base>
  )
}

OrderPlacedTemplate.PreviewProps = {
  order: {
    id: 'test-order-id',
    display_id: 'ORD-123',
    created_at: new Date().toISOString(),
    email: 'test@example.com',
    currency_code: 'USD',
    items: [
      { id: 'item-1', title: 'Item 1', product_title: 'Product 1', variant_title: 'Burgundy / S', quantity: 2, unit_price: 10.00 },
      { id: 'item-2', title: 'Item 2', product_title: 'Product 2', variant_title: 'Black / M', quantity: 1, unit_price: 25.00 }
    ],
    shipping_address: {
      first_name: 'Test',
      last_name: 'User',
      address_1: '123 Main St',
      city: 'Anytown',
      province: 'CA',
      postal_code: '12345',
      country_code: 'US'
    },
    summary: { raw_current_order_total: { value: 40.00 } }
  },
  shippingAddress: {
    first_name: 'Test',
    last_name: 'User',
    address_1: '123 Main St',
    city: 'Anytown',
    province: 'CA',
    postal_code: '12345',
    country_code: 'US'
  },
  itemsSubtotal: 3500,
  shippingTotal: 500,
  taxTotal: 0,
  grandTotal: 4000
} as OrderPlacedPreviewProps

export default OrderPlacedTemplate
