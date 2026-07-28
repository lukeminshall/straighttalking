export const gb = (n: number) => n.toLocaleString('en-GB')

export const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export function reference(prefix = 'ST'): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  const digits = Math.floor(1000 + Math.random() * 8999)
  return `${prefix}-${block}-${digits}`
}
