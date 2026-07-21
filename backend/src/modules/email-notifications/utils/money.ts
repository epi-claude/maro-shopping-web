// Order amounts are stored in the currency's minor unit (e.g. cents), matching
// how the storefront's convertToLocale() formats prices.
export const formatAmount = (amount: number, currencyCode: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100)
