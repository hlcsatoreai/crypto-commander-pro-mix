export const fmtEUR = (n, digits=2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: digits }).format(n)
}
export const fmtNum = (n, digits=2) => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('it-IT', { maximumFractionDigits: digits }).format(n)
}
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
