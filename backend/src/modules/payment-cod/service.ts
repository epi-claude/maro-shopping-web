import { AbstractPaymentProvider, PaymentSessionStatus } from '@medusajs/framework/utils'
import {
  CreatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  ProviderWebhookPayload,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from '@medusajs/framework/types'

export class CodPaymentService extends AbstractPaymentProvider {
  static identifier = 'cod'

  async initiatePayment(
    data: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return { data: { status: 'pending', amount: data.amount, currency_code: data.currency_code } }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown> }> {
    // COD is authorised on delivery — mark as pending until admin captures
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
      pending: PaymentSessionStatus.PENDING,
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
