import { AbstractPaymentProvider } from '@medusajs/framework/utils'
import {
  AuthorizePaymentInput, AuthorizePaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  InitiatePaymentInput, InitiatePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  RefundPaymentInput, RefundPaymentOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
  ProviderWebhookPayload, WebhookActionResult,
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

  constructor(cradle: Record<string, unknown>, options: PaywiseOptions) {
    super(cradle, options)
    this.client = new PaywiseClient(options.api_key, options.merchant_key, options.environment)
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const customer = (input.context?.customer ?? {}) as Record<string, string>
    const [firstName, ...rest] = (customer.name ?? 'Customer').split(' ')
    const lastName = rest.join(' ') || firstName
    const amountStr = Number(input.amount).toFixed(2)

    const response = await this.client.requestPayment({
      id: (input.context?.idempotency_key as string) ?? `maro-${Date.now()}`,
      amount: amountStr,
      currency: (input.currency_code ?? 'TTD').toUpperCase(),
      description: 'Maro Shopping order',
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
      throw new Error(`PayWise error: ${response.message}`)
    }

    return { id: response.intent_id ?? `pw-${Date.now()}`, data: { intent_id: response.intent_id, paywise_status: 'pending', raw: response.data } }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const intentId = input.data?.intent_id as string
    if (!intentId) return { status: 'pending', data: input.data ?? {} }

    const response = await this.client.getPaymentStatus(intentId)
    if (response.status === 'error') {
      return { status: 'error', data: { ...input.data, error: response.message } }
    }

    const pwStatus = (response.data?.status ?? response.data?.payment_status ?? '') as string
    return { status: this.mapStatus(pwStatus), data: { ...input.data, paywise_status: pwStatus } }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: { ...input.data, status: 'captured' } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    const intentId = input.data?.intent_id as string
    if (intentId) await this.client.cancelPayment(intentId)
    return { data: { ...input.data, paywise_status: 'cancelled' } }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    // TODO: implement when PayWise exposes a refund endpoint
    throw new Error('Refunds must be processed manually via the PayWise dashboard')
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const intentId = input.data?.intent_id as string
    if (!intentId) return { data: input.data ?? {} }
    const response = await this.client.getPaymentStatus(intentId)
    return { data: { ...input.data, raw: response.data } }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: { ...input.data, amount: input.amount } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    const intentId = input.data?.intent_id as string
    if (intentId) await this.client.cancelPayment(intentId)
    return { data: { ...input.data, paywise_status: 'cancelled' } }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    return { status: this.mapStatus(input.data?.paywise_status as string) }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    const body = payload.data as Record<string, unknown>
    const pwStatus = (body?.status ?? '') as string

    if (pwStatus === 'completed' || pwStatus === 'successful') {
      return { action: 'authorized', data: { session_id: body.reference as string, amount: Number(body.amount) } }
    }
    if (pwStatus === 'failed' || pwStatus === 'cancelled') {
      return { action: 'failed', data: { session_id: body.reference as string, amount: 0 } }
    }
    return { action: 'not_supported' }
  }

  private mapStatus(pwStatus: string): GetPaymentStatusOutput['status'] {
    const map: Record<string, GetPaymentStatusOutput['status']> = {
      pending: 'pending',
      processing: 'pending',
      completed: 'authorized',
      successful: 'authorized',
      captured: 'authorized',
      failed: 'error',
      cancelled: 'canceled',
      canceled: 'canceled',
    }
    return map[pwStatus?.toLowerCase()] ?? 'pending'
  }
}
