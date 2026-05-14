// PayWise API client
// Sandbox: https://sandbox-api.paywise.co
// Production: https://api.paywise.co
// Version pin: ?version=2024-10-01
// Auth: PW-subscription-key header + api_key (merchant key, ≤30 chars) in body

export interface PaywisePaymentRequest {
  id: string           // your idempotency key (e.g. order ID)
  amount: string       // string, e.g. "100.00"
  currency: string     // e.g. "TTD"
  description: string
  fees: Record<string, string>  // merchant-configured fee keys — TODO: confirm with PayWise
  payers: PaywisePayer[]
}

export interface PaywisePayer {
  mobile_number: string
  first_name: string
  last_name: string
  email: string
  payment_method: 'wallet' | 'card' | 'linx'
  amount: string       // payer's share (usually equals transaction amount)
}

export interface PaywiseResponse {
  status: 'success' | 'error'
  code: number
  message: string
  request_id: string
  intent_id?: string
  data?: Record<string, unknown>
}

export class PaywiseClient {
  private subscriptionKey: string
  private merchantKey: string
  private baseUrl: string

  constructor(subscriptionKey: string, merchantKey: string, environment: string) {
    this.subscriptionKey = subscriptionKey
    this.merchantKey = merchantKey
    this.baseUrl = environment === 'production'
      ? 'https://api.paywise.co'
      : 'https://sandbox-api.paywise.co'
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'PW-subscription-key': this.subscriptionKey,
      'PW-Origin-Country': 'TT',
      'PW-Request-Date': new Date().toISOString(),
      'PW-IP-Address': '127.0.0.1',
      'User-Agent': 'maro-shopping/1.0',
    }
  }

  async requestPayment(tx: PaywisePaymentRequest): Promise<PaywiseResponse> {
    const res = await fetch(`${this.baseUrl}/payments/request?version=2024-10-01`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ api_key: this.merchantKey, transaction_request: tx }),
    })
    return res.json() as Promise<PaywiseResponse>
  }

  async getPaymentStatus(intentId: string): Promise<PaywiseResponse> {
    const res = await fetch(
      `${this.baseUrl}/payments/status?version=2024-10-01&intent_id=${intentId}`,
      { method: 'GET', headers: this.headers() }
    )
    return res.json() as Promise<PaywiseResponse>
  }

  async cancelPayment(intentId: string): Promise<PaywiseResponse> {
    const res = await fetch(`${this.baseUrl}/payments/cancel?version=2024-10-01`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ api_key: this.merchantKey, intent_id: intentId }),
    })
    return res.json() as Promise<PaywiseResponse>
  }
}
