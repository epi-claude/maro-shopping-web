import { AbstractPaymentProvider, PaymentSessionStatus } from '@medusajs/framework/utils'
import {
  CreatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  ProviderWebhookPayload,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from '@medusajs/framework/types'

interface BankTransferOptions {
  bank_name: string
  account_name: string
  account_number: string
  routing_number: string
  instructions: string
}

export class BankTransferPaymentService extends AbstractPaymentProvider<BankTransferOptions> {
  static identifier = 'bank-transfer'

  private options: BankTransferOptions

  constructor(container: Record<string, unknown>, options: BankTransferOptions) {
    super(container, options)
    this.options = options
  }

  async initiatePayment(
    data: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return {
      data: {
        status: 'awaiting_transfer',
        amount: data.amount,
        currency_code: data.currency_code,
        // Bank details passed to storefront so checkout can display them
        bank_details: {
          bank_name: this.options.bank_name,
          account_name: this.options.account_name,
          account_number: this.options.account_number,
          routing_number: this.options.routing_number,
          instructions: this.options.instructions,
        },
      },
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown> }> {
    // Stays pending until admin manually captures after confirming the deposit
    return { status: PaymentSessionStatus.PENDING, data: paymentSessionData }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return { ...paymentSessionData, status: 'captured' }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return { ...paymentSessionData, status: 'cancelled' }
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return { ...paymentSessionData, status: 'refunded', refund_amount: refundAmount }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async updatePayment(
    context: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return { data: { ...context.data, amount: context.amount } }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    const status = paymentSessionData.status as string
    const map: Record<string, PaymentSessionStatus> = {
      awaiting_transfer: PaymentSessionStatus.PENDING,
      captured: PaymentSessionStatus.AUTHORIZED,
      cancelled: PaymentSessionStatus.CANCELED,
      refunded: PaymentSessionStatus.CANCELED,
    }
    return map[status] ?? PaymentSessionStatus.PENDING
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    return { action: 'not_supported' }
  }
}
