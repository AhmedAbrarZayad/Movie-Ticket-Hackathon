export function formatBDT(amountCents: number) {
  return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amountCents / 100)
}

