import {
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  PAYWISE_API_KEY,
  PAYWISE_MERCHANT_KEY,
  PAYWISE_ENV,
} from 'lib/constants'

// Add a new payment provider by appending to this array.
// Never edit medusa-config.js or custom-modules.ts for payment changes.

export const paymentProviders: object[] = [
  // ── Cash on Delivery ──────────────────────────────────────────
  {
    resolve: './src/modules/payment-cod',
    id: 'cod',
    options: {},
  },

  // ── Bank Transfer / Direct Deposit ────────────────────────────
  {
    resolve: './src/modules/payment-bank-transfer',
    id: 'bank-transfer',
    options: {
      bank_name: process.env.BANK_TRANSFER_BANK_NAME || 'Republic Bank',
      account_name: process.env.BANK_TRANSFER_ACCOUNT_NAME || 'Maro Shopping Ltd',
      account_number: process.env.BANK_TRANSFER_ACCOUNT_NUMBER || '',
      routing_number: process.env.BANK_TRANSFER_ROUTING_NUMBER || '',
      instructions: process.env.BANK_TRANSFER_INSTRUCTIONS || 'Use your order number as the payment reference.',
    },
  },

  // ── PayWise ───────────────────────────────────────────────────
  ...(PAYWISE_API_KEY && PAYWISE_MERCHANT_KEY
    ? [{
        resolve: './src/modules/payment-paywise',
        id: 'paywise',
        options: {
          api_key: PAYWISE_API_KEY,
          merchant_key: PAYWISE_MERCHANT_KEY,
          environment: PAYWISE_ENV || 'sandbox',
        },
      }]
    : []),

  // ── Stripe (Phase 2) ──────────────────────────────────────────
  ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET
    ? [{
        resolve: '@medusajs/payment-stripe',
        id: 'stripe',
        options: { apiKey: STRIPE_API_KEY, webhookSecret: STRIPE_WEBHOOK_SECRET },
      }]
    : []),
]
