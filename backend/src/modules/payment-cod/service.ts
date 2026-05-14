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

export class CodPaymentService extends AbstractPaymentProvider {
  static identifier = 'cod'

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return { id: `cod-${Date.now()}`, data: { status: 'pending', amount: input.amount, currency_code: input.currency_code } }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return { status: 'pending', data: input.data ?? {} }
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return { data: { ...input.data, status: 'captured' } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: { ...input.data, status: 'cancelled' } }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return { data: { ...input.data, status: 'refunded', refund_amount: input.amount } }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: { ...input.data, amount: input.amount } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const map: Record<string, GetPaymentStatusOutput['status']> = {
      pending: 'pending',
      captured: 'authorized',
      cancelled: 'canceled',
      refunded: 'canceled',
    }
    return { status: map[(input.data?.status as string) ?? ''] ?? 'pending' }
  }

  async getWebhookActionAndData(
    data: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    return { action: 'not_supported' }
  }
}
