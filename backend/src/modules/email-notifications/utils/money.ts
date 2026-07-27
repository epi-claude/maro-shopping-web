// Order amounts are decimal/major-unit values (Medusa's native convention),
// matching how the storefront's convertToLocale() formats prices.
export const formatAmount = (amount: number, currencyCode: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
