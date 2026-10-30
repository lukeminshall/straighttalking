import { reopenConsent } from '@/lib/consent'
import styles from './Privacy.module.css'

/**
 * Public privacy notice. Router- and backend-free (plain anchors + a consent
 * reopener), so it carries no Supabase/Clerk/router imports.
 *
 * This is the plain-English fair-processing notice shown to patients and
 * providers. The internal DPIA that backs it lives in docs/DPIA.md.
 */
const UPDATED = '29 October 2026'

export function Privacy() {
  return (
    <div className={styles.root}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <a className={styles.home} href="/">
            ← Straight Talking
          </a>
          <span className={styles.updated}>Last updated {UPDATED}</span>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.h1}>Privacy notice</h1>
        <p className={styles.lead}>
          Straight Talking is a patient feedback and peer-to-peer support platform. This notice
          explains what information we collect when you use it, why, and the rights you have. We’ve
          written it in plain English and kept it short on purpose.
        </p>

        <section className={styles.section}>
          <h2>The short version</h2>
          <ul className={styles.ticks}>
            <li>Feedback is anonymous. We do not ask for, or store, your name against it.</li>
            <li>
              If you ask for a reply, the contact detail you give is stored{' '}
              <b>separately</b> from your feedback, never alongside it.
            </li>
            <li>Peer support posts are pseudonymous — you choose a display alias, not your real name.</li>
            <li>We don’t sell data or use it for advertising.</li>
            <li>Your data is held in the UK/EU and is not used to train any AI model.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Who is responsible for your data</h2>
          <p>
            Your healthcare provider (the clinic or practice whose QR code or link you used) is the{' '}
            <b>data controller</b> for the feedback you give them. Straight Talking operates the
            platform as their <b>data processor</b>, acting on their instructions. For the peer
            support space and for running the platform itself, Straight Talking is the controller.
          </p>
          <p>
            Questions, or want to exercise a right below? Contact your provider’s practice team, or
            email us at <a href="mailto:privacy@straighttalking.org.uk">privacy@straighttalking.org.uk</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>What we collect, and why</h2>
          <div className={styles.table}>
            <div className={styles.trow}>
              <div className={styles.what}>Your feedback</div>
              <div className={styles.why}>
                A rating, the type of visit, and anything you choose to write. Used so your provider
                can understand and improve care. <b>No identifiers are attached.</b>
              </div>
              <div className={styles.basis}>Public task / consent</div>
            </div>
            <div className={styles.trow}>
              <div className={styles.what}>Reply contact (optional)</div>
              <div className={styles.why}>
                Only if you tick “I’d like a reply” and give an email. Used solely to come back to
                you. Stored in a separate table, linked to nothing that identifies the feedback.
              </div>
              <div className={styles.basis}>Consent</div>
            </div>
            <div className={styles.trow}>
              <div className={styles.what}>Peer support posts &amp; replies</div>
              <div className={styles.why}>
                Your chosen alias and what you write. Used to run the support space and keep it safe
                through moderation. Please don’t post anything that identifies you or others.
              </div>
              <div className={styles.basis}>Consent / legitimate interests</div>
            </div>
            <div className={styles.trow}>
              <div className={styles.what}>Shared compliments (optional)</div>
              <div className={styles.why}>
                If you agree, an anonymised compliment may appear on a waiting-room board or as a
                public review — never with any detail that identifies you.
              </div>
              <div className={styles.basis}>Consent</div>
            </div>
            <div className={styles.trow}>
              <div className={styles.what}>Essential technical data</div>
              <div className={styles.why}>
                Strictly-necessary storage to run the site and keep operators signed in. Minimal
                server logs for security and reliability.
              </div>
              <div className={styles.basis}>Legitimate interests</div>
            </div>
            <div className={styles.trow}>
              <div className={styles.what}>Analytics (optional)</div>
              <div className={styles.why}>
                Anonymous, aggregated measurement of how the site is used — only if you opt in via
                the cookie banner. Nothing optional is set without your consent.
              </div>
              <div className={styles.basis}>Consent</div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Cookies and storage</h2>
          <p>
            We use a small amount of browser storage that is <b>strictly necessary</b> to run the
            site (including your cookie choice itself and, for operators, a secure sign-in session).
            Optional analytics storage is off until you turn it on, and rejecting it is as easy as
            accepting it.
          </p>
          <p>
            <button className={styles.inlineBtn} onClick={() => reopenConsent()}>
              Change your cookie preferences
            </button>
          </p>
        </section>

        <section className={styles.section}>
          <h2>Where your data lives, and who else touches it</h2>
          <p>
            Data is stored in the UK/European Economic Area with our infrastructure sub-processors.
            We keep the list of sub-processors short and deliberately boring:
          </p>
          <ul className={styles.ticks}>
            <li>
              <b>Supabase</b> — database and storage (EU / London region).
            </li>
            <li>
              <b>Vercel</b> — application hosting and delivery.
            </li>
            <li>
              <b>Clerk</b> — operator (staff) sign-in only. Patients never create an account.
            </li>
            <li>
              <b>Stripe</b> — provider subscription payments only. We never see or store card
              details; patients do not pay for anything.
            </li>
          </ul>
          <p>We do not sell your data, and we do not use it to train AI models.</p>
        </section>

        <section className={styles.section}>
          <h2>How long we keep it</h2>
          <p>
            Feedback is retained for as long as it is useful to your provider for improving care,
            then anonymised aggregates only. Reply-contact details are deleted once your request is
            closed. Peer support content is kept while the space is active and removed on moderation
            or on request. We review retention periods regularly and keep data no longer than needed.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Your rights</h2>
          <p>Under UK GDPR you can ask to:</p>
          <ul className={styles.ticks}>
            <li>access a copy of your data;</li>
            <li>correct it if it’s wrong;</li>
            <li>have it deleted;</li>
            <li>restrict or object to how it’s used;</li>
            <li>withdraw consent at any time, without it affecting anything done beforehand.</li>
          </ul>
          <p>
            Because feedback is anonymous, we may be unable to find a specific entry without extra
            detail from you — which is the point of keeping it unidentifiable. To exercise a right,
            contact your provider or <a href="mailto:privacy@straighttalking.org.uk">privacy@straighttalking.org.uk</a>.
          </p>
          <p>
            You can also complain to the Information Commissioner’s Office (ICO) at{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noreferrer noopener">
              ico.org.uk
            </a>
            , though we’d appreciate the chance to put things right first.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Children</h2>
          <p>
            The platform is intended for use by adults, and by young people with the support of their
            care team. We do not knowingly collect more data than is needed, from anyone.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Changes to this notice</h2>
          <p>
            If we make a material change we’ll update the date at the top and, where appropriate,
            ask for your cookie choices again.
          </p>
        </section>

        <footer className={styles.foot}>
          <a className={styles.home} href="/">
            ← Back to Straight Talking
          </a>
          <span className={styles.dim}>No patient identifiable data is held against feedback.</span>
        </footer>
      </main>
    </div>
  )
}
