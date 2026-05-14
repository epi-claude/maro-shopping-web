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

interface BankTransferOptions {
  bank_name: string
  account_name: string
  account_number: string
  routing_number: string
  instructions: string
}

export class BankTransferPaymentService extends AbstractPaymentProvider<BankTransferOptions> {
  static identifier = 'bank-transfer'

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return {
      id: `bt-${Date.now()}`,
      data: {
        status: 'awaiting_transfer',
        amount: input.amount,
        currency_code: input.currency_code,
        // Bank details surfaced to storefront so checkout can display them
        bank_details: {
          bank_name: this.config.bank_name,
          account_name: this.config.account_name,
          account_number: this.config.account_number,
          routing_number: this.config.routing_number,
          instructions: this.config.instructions,
        },
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    // Stays pending until admin manually captures after confirming the deposit
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
      awaiting_transfer: 'pending',
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
