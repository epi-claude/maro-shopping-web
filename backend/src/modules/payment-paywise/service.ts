import { AbstractPaymentProvider, PaymentSessionStatus } from '@medusajs/framework/utils'
import {
  CreatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  ProviderWebhookPayload,
  UpdatePaymentProviderSession,
  WebhookActionResult,
} from '@medusajs/framework/types'
import { PaywiseClient } from './client'

interface PaywiseOptions {
  api_key: string
  merchant_key: string
  environment: string
}

export class PaywisePaymentService extends AbstractPaymentProvider<PaywiseOptions> {
  static identifier = 'paywise'

  private client: PaywiseClient

  constructor(container: Record<string, unknown>, options: PaywiseOptions) {
    super(container, options)
    this.client = new PaywiseClient(options.api_key, options.merchant_key, options.environment)
  }

  async initiatePayment(
    data: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    // context.extra should contain payer details passed from the storefront
    const context = data.context as Record<string, unknown> | undefined
    const customer = (context?.customer ?? {}) as Record<string, string>

    const [firstName, ...rest] = (customer.name ?? 'Customer').split(' ')
    const lastName = rest.join(' ') || firstName

    const amountStr = (Number(data.amount) / 100).toFixed(2)

    const response = await this.client.requestPayment({
      id: data.context?.idempotency_key as string ?? `maro-${Date.now()}`,
      amount: amountStr,
      currency: (data.currency_code ?? 'TTD').toUpperCase(),
      description: `Maro Shopping order`,
      // TODO: populate fees once PayWise confirms fee key structure for this merchant account
      fees: {},
      payers: [{
        mobile_number: customer.phone ?? '',
        first_name: firstName,
        last_name: lastName,
        email: customer.email ?? '',
        payment_method: 'wallet',
        amount: amountStr,
      }],
    })

    if (response.status === 'error') {
      return { error: response.message, code: String(response.code), detail: response }
    }

    return {
      data: {
        intent_id: response.intent_id,
        paywise_status: 'pending',
        raw: response.data,
      },
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown> }> {
    const intentId = paymentSessionData.intent_id as string
    if (!intentId) {
      return { status: PaymentSessionStatus.PENDING, data: paymentSessionData }
    }

    const response = await this.client.getPaymentStatus(intentId)

    if (response.status === 'error') {
      return { status: PaymentSessionStatus.ERROR, data: { ...paymentSessionData, error: response.message } }
    }

    const pwStatus = (response.data?.status ?? response.data?.payment_status ?? '') as string
    return {
      status: this.mapStatus(pwStatus),
      data: { ...paymentSessionData, paywise_status: pwStatus, raw: response.data },
    }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    // PayWise wallet payments are captured on authorisation — no separate capture step
    return { ...paymentSessionData, status: 'captured' }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    const intentId = paymentSessionData.intent_id as string
    if (intentId) {
      await this.client.cancelPayment(intentId)
    }
    return { ...paymentSessionData, paywise_status: 'cancelled' }
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    // TODO: implement when PayWise exposes a refund endpoint
    return { error: 'Refunds must be processed manually via the PayWise dashboard', code: 'unsupported', detail: {} }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    const intentId = paymentSessionData.intent_id as string
    if (!intentId) return paymentSessionData
    const response = await this.client.getPaymentStatus(intentId)
    return { ...paymentSessionData, raw: response.data }
  }

  async updatePayment(
    context: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return { data: { ...context.data, amount: context.amount } }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return this.cancelPayment(paymentSessionData)
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    return this.mapStatus(paymentSessionData.paywise_status as string)
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    const body = payload.data as Record<string, unknown>
    const pwStatus = (body?.status ?? '') as string

    if (pwStatus === 'completed' || pwStatus === 'successful') {
      return {
        action: 'authorized',
        data: { session_id: body.reference as string, amount: Number(body.amount) * 100 },
      }
    }

    if (pwStatus === 'failed' || pwStatus === 'cancelled') {
      return { action: 'failed', data: { session_id: body.reference as string } }
    }

    return { action: 'not_supported' }
  }

  private mapStatus(pwStatus: string): PaymentSessionStatus {
    const map: Record<string, PaymentSessionStatus> = {
      pending: PaymentSessionStatus.PENDING,
      processing: PaymentSessionStatus.PENDING,
      completed: PaymentSessionStatus.AUTHORIZED,
      successful: PaymentSessionStatus.AUTHORIZED,
      captured: PaymentSessionStatus.AUTHORIZED,
      failed: PaymentSessionStatus.ERROR,
      cancelled: PaymentSessionStatus.CANCELED,
      canceled: PaymentSessionStatus.CANCELED,
    }
    return map[pwStatus?.toLowerCase()] ?? PaymentSessionStatus.PENDING
  }
}
