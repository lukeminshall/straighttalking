# Data Protection Impact Assessment — Straight Talking

**Status:** Draft for review · **Version:** 0.1 · **Date:** 29 October 2026
**Owner:** Straight Talking (A Minshall Group product)
**Review cadence:** Before go-live, then at each material change and at least annually.

> This DPIA is a working governance document, not legal advice. Have it reviewed
> by a qualified data-protection practitioner (and each provider's DPO/Caldicott
> Guardian) before processing real patient data.

---

## 1. Overview of the processing

Straight Talking is a **patient feedback and peer-to-peer support** platform for UK
healthcare providers. It is explicitly **not** a clinical system: it captures
service feedback and runs a moderated peer-support space. It does not hold clinical
records, diagnoses, or treatment data.

Two broad activities:

1. **Feedback capture** — a patient scans a QR code / follows a link, rates a visit,
   optionally writes a comment, and the feedback is routed to the provider. Feedback
   is **anonymous**: no name or identifier is stored against it. A patient may
   optionally request a reply by leaving a contact detail, which is stored
   **separately** from the feedback.
2. **Peer support** — a pseudonymous space where patients post and reply under a
   self-chosen alias, with operator moderation.

Operators (provider staff) sign in to view aggregate dashboards and moderate content.
Providers pay an annual subscription; patients never pay and never create an account.

## 2. Is a DPIA required?

Yes — undertaken proactively. The processing involves potentially vulnerable data
subjects (patients), free-text that could contain special-category data if a patient
chooses to disclose it, and a public-facing user-generated-content space. Even though
feedback is designed to be anonymous, a DPIA is the responsible baseline.

## 3. Data flows and data inventory

| Data | Subject | Identifiable? | Stored where | Lawful basis |
|---|---|---|---|---|
| Rating, visit type, free-text comment | Patient | No identifiers attached | `feedback` (Supabase, UK/EU) | Public task / consent (controller: provider) |
| Reply contact (email), optional | Patient | Yes, but decoupled | Separate table, not joined to feedback | Consent |
| Peer post / reply + alias | Patient | Pseudonymous | `posts` / `replies` | Consent / legitimate interests |
| Share-compliment flag | Patient | No | `feedback.share_consent` | Consent |
| Reports / moderation state | Patient (reporter) | Pseudonymous | `reports` | Legitimate interests (safety) |
| Operator identity + session | Staff | Yes | Clerk | Contract / legitimate interests |
| Subscription / payment | Provider | Business data | Stripe (card data never touches us) | Contract |
| Essential + optional analytics storage | Visitor | No / opt-in | Browser | Legitimate interests / consent |

**Controllership:** the provider is controller for feedback given to them; Straight
Talking is their processor for that, and controller for the peer-support space,
operator accounts and platform operation.

## 4. Necessity and proportionality

- **Data minimisation by design.** Feedback carries no patient identifiers. Reply
  contact is only collected on explicit opt-in and is physically separated from the
  feedback it relates to, so neither can be used to re-identify the other.
- **Pseudonymity** in peer support; users are guided not to post identifying detail,
  and moderation can remove content that does.
- **Purpose limitation.** Data is used to improve care and run the support space —
  not sold, not used for advertising, and **not used to train AI models**.
- **Lawful basis** recorded per data type (section 3); consent is granular (reply,
  share, analytics) and withdrawable.

## 5. Risks and mitigations

| # | Risk | Likelihood | Impact | Mitigation | Residual |
|---|---|---|---|---|---|
| R1 | Patient types identifying / special-category detail into free-text | Medium | Medium | In-flow guidance ("no personal details"); moderation; retention limits; no identifiers joined | Low–Med |
| R2 | Re-identification by correlating feedback with reply-contact | Low | High | Separate tables, no foreign key linking them; access controls; no export that joins them | Low |
| R3 | Abusive / harmful peer-support content | Medium | Medium | Report flow + operator moderation queue; remove/keep actions; RLS limits writes to SECURITY DEFINER RPCs | Low–Med |
| R4 | Operator account compromise exposes dashboards/moderation | Low | High | Clerk auth; RLS scoped to `authenticated` role via signed JWT; least-privilege; service-role key server-side only | Low |
| R5 | Service-role key leakage (full DB access) | Low | High | Key only in Vercel server env + webhook; never in client bundle or git; `.env` git-ignored | Low |
| R6 | Client bundle leaks backend creds / widens attack surface | Low | Medium | Single-file viewer invariant: 0 supabase/clerk/router refs enforced on build output | Low |
| R7 | Cross-border transfer of personal data | Low | Medium | Supabase London/EU region; sub-processors documented; DPA with each | Low |
| R8 | Non-essential tracking without consent (PECR) | Low | Medium | Analytics off by default; explicit opt-in banner; reject as easy as accept | Low |
| R9 | Over-retention of feedback / reply contacts | Medium | Low | Defined retention; reply contacts deleted on closure; periodic review | Low |
| R10 | Child data | Low | Medium | Intended for adults / supported young people; minimisation applies to all | Low |

## 6. Security measures

- Row-Level Security on all patient tables; anonymous writes only via SECURITY
  DEFINER RPCs (no direct table writes from the public client).
- Operator reads/writes gated by Clerk-issued JWT (`role=authenticated`).
- Service-role key confined to server-side Vercel functions (Stripe webhook); never
  shipped to the browser or committed to git.
- Transport over HTTPS; secrets in platform env, not source.
- Build-time invariant preventing the public viewer bundle from embedding the
  backend client.

## 7. Data subject rights

Access, rectification, erasure, restriction, objection, and consent withdrawal are
supported via the provider or `privacy@straighttalking.health`. Because feedback is
anonymous, locating a single entry may require extra detail from the subject — an
accepted consequence of the minimisation design. Rights handling process to be agreed
with each provider as controller.

## 8. Consultation

- [ ] Review with a data-protection practitioner / solicitor.
- [ ] Review with each onboarding provider's DPO / Caldicott Guardian.
- [ ] Data Processing Agreement executed with each provider (processor terms).
- [ ] DPAs confirmed with sub-processors (Supabase, Vercel, Clerk, Stripe).
- [ ] Consider ICO engagement if high residual risk remains after mitigation.

## 9. Sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Product owner |  |  |  |
| DPO / adviser |  |  |  |

## 10. Outstanding actions before go-live

1. Legal review of this DPIA and the public [privacy notice](../src/routes/Privacy.tsx).
2. Provider-facing DPA / processor terms.
3. Confirm sub-processor DPAs and regions.
4. Decide and document concrete retention periods (currently stated as principles).
5. Define the rights-request operational runbook with providers.
6. If/when analytics is actually switched on, record the specific tooling, its
   storage, and its retention here and in the privacy notice.
