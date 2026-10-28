import logo from '@/assets/minshall-group.png'

/**
 * "A Minshall Group product" attribution with the Minshall mark.
 * The mark is a self-contained navy tile, so it reads on light and dark footers.
 * Not a link: we don't hardcode an external URL. Add an href here if wanted.
 */
export function ProductBy({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', whiteSpace: 'nowrap' }}
    >
      <img src={logo} alt="" aria-hidden="true" width={20} height={20} style={{ borderRadius: 5, display: 'block' }} />
      <span>A Minshall Group product</span>
    </span>
  )
}
