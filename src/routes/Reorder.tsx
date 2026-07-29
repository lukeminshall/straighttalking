import { useMemo, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { RESOURCES, CATEGORIES, resourcesByCategory, gbp, priceLabel } from '@/data/resources'
import { Icon } from '@/components/ui/Icon'
import { startMaterialsCheckout } from '@/lib/checkout'
import { reference } from '@/lib/format'
import styles from './Reorder.module.css'

// Sample logged-in account context (would come from the admin's session).
const ACCOUNT = { org: 'Sussex Imaging', sites: ['Haywards Heath', 'Weybridge', 'Harley Street'] }

export function Reorder() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [site, setSite] = useState(ACCOUNT.sites[0])
  const [placed, setPlaced] = useState(false)
  const ref = useMemo(() => reference('ORD'), [])

  const [paying, setPaying] = useState(false)
  const total = useMemo(() => RESOURCES.reduce((s, r) => s + r.price * (cart[r.id] || 0), 0), [cart])
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const setQty = (id: string, q: number) => setCart((c) => ({ ...c, [id]: Math.max(0, q) }))

  // One-off card checkout for the printed materials; falls back to the demo
  // confirmation when there is no payment backend configured.
  const placeOrder = async () => {
    const items = RESOURCES.filter((r) => (cart[r.id] || 0) > 0 && r.price > 0).map((r) => ({
      name: r.name,
      unitAmountPence: r.price * 100,
      quantity: cart[r.id],
    }))
    setPaying(true)
    const result = await startMaterialsCheckout({ name: ACCOUNT.org, email: '', sites: ACCOUNT.sites.length }, items)
    if (result === 'unavailable') {
      setPaying(false)
      setPlaced(true)
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.barInner}>
          <div className={styles.brand}>
            <Logo variant="colour" height={30} />
          </div>
          <span className={styles.acct}>
            {ACCOUNT.org} · <b>£200 annual plan active</b>
          </span>
        </div>
      </div>

      <div className={styles.app}>
        {!placed ? (
          <>
            <header className={styles.head}>
              <h1>Reorder resources</h1>
              <p className={styles.lead}>Top up your printed codes and stands anytime. Your plan and settings stay as they are, this is just materials.</p>
            </header>

            <div className={styles.layout}>
              <div className={styles.catalogue}>
                {CATEGORIES.map((cat) => (
                  <div key={cat.key} className={styles.catGroup}>
                    <div className={styles.catHead}>
                      <h3>{cat.label}</h3>
                      <p>{cat.note}</p>
                    </div>
                    {resourcesByCategory(cat.key).map((r) => (
                      <div key={r.id} className={styles.res}>
                        <div className={styles.resIcon} aria-hidden="true"><Icon name={r.icon} size={22} /></div>
                        <div className={styles.resBody}>
                          <b>{r.name}{r.unit ? <span className={styles.resUnit}> · {r.unit}</span> : null}</b>
                          <em>{r.desc}</em>
                          <span className={styles.resEg}>{r.example}</span>
                        </div>
                        <div className={styles.resRight}>
                          <span className={styles.price} data-free={r.price === 0}>{priceLabel(r)}</span>
                          {r.category === 'digital' ? (
                            <button
                              className={styles.toggle}
                              data-on={(cart[r.id] || 0) > 0}
                              onClick={() => setQty(r.id, (cart[r.id] || 0) > 0 ? 0 : 1)}
                            >
                              {(cart[r.id] || 0) > 0 ? 'Added' : 'Add'}
                            </button>
                          ) : (
                            <div className={styles.qty}>
                              <button aria-label={`Fewer ${r.name}`} onClick={() => setQty(r.id, (cart[r.id] || 0) - 1)}>−</button>
                              <span>{cart[r.id] || 0}</span>
                              <button aria-label={`More ${r.name}`} onClick={() => setQty(r.id, (cart[r.id] || 0) + 1)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <aside className={styles.summary}>
                <h3>Your order</h3>
                <label className={styles.lbl}>Deliver to</label>
                <select className={styles.field} value={site} onChange={(e) => setSite(e.target.value)}>
                  {ACCOUNT.sites.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <div className={styles.lines}>
                  {RESOURCES.filter((r) => (cart[r.id] || 0) > 0).map((r) => (
                    <div key={r.id} className={styles.line}>
                      <span>
                        {r.name}{r.category === 'digital' ? '' : ` × ${cart[r.id]}`}
                      </span>
                      <b>{r.price === 0 ? 'Included' : gbp(r.price * cart[r.id])}</b>
                    </div>
                  ))}
                  {itemCount === 0 && <div className={styles.empty}>Add items to your order.</div>}
                </div>
                <div className={styles.total}>
                  <span>Total</span>
                  <b>{gbp(total)}</b>
                </div>
                <button className={styles.place} disabled={itemCount === 0 || paying} onClick={placeOrder}>
                  {paying ? 'Opening checkout…' : 'Place order'}
                </button>
                <p className={styles.small}>Secure card payment via Stripe. Ships in 2 working days.</p>
              </aside>
            </div>
          </>
        ) : (
          <div className={styles.done}>
            <div className={styles.doneMark}>✓</div>
            <h1>Order placed</h1>
            <p className={styles.lead}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} on the way to {site}. It’ll arrive in about two working days, no need to reconfigure anything.
            </p>
            <div className={styles.ref}>
              <span>Order reference</span>
              <b>{ref}</b>
            </div>
            <div className={styles.doneLines}>
              {RESOURCES.filter((r) => (cart[r.id] || 0) > 0).map((r) => (
                <div key={r.id} className={styles.line}>
                  <span>
                    {r.name} × {cart[r.id]}
                  </span>
                  <b>{gbp(r.price * cart[r.id])}</b>
                </div>
              ))}
              <div className={styles.total}>
                <span>Charged</span>
                <b>{gbp(total)}</b>
              </div>
            </div>
            <div className={styles.doneActions}>
              <Button variant="teal" onClick={() => { setPlaced(false); setCart({}) }}>
                Order more
              </Button>
              <Button variant="ghost" as="a" href="/app">
                Back to dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
