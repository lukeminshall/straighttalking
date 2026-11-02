import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { hasSupabase } from '@/lib/supabase'
import {
  listSupportPosts,
  listReplies,
  submitSupportPost,
  submitSupportReply,
  heartPost,
  heartReply,
  reportContent,
  timeAgo,
  type SupportPost,
  type SupportReply,
} from '@/lib/api'
import styles from './Support.module.css'

// Sample threads so the space feels alive in demo mode (no backend configured).
const iso = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString()
const DEMO_POSTS: SupportPost[] = [
  { id: 'd1', alias: 'Jan', topic: 'Before your scan', body: "First MRI next week and I'm really nervous about the noise. Any tips from people who've been through it?", hearts: 6, created_at: iso(130), reply_count: 2 },
  { id: 'd2', alias: 'Mark', topic: 'Waiting on results', body: 'The wait for results is the hardest part. How did everyone cope with the in-between?', hearts: 4, created_at: iso(1500), reply_count: 0 },
]
const DEMO_REPLIES: Record<string, SupportReply[]> = {
  d1: [
    { id: 'r1', post_id: 'd1', alias: 'Rowan', body: "Ask for headphones with music — mine let me pick a station. The first couple of minutes are the loudest, then you settle. You've got this.", hearts: 3, created_at: iso(100) },
    { id: 'r2', post_id: 'd1', alias: 'Pat', body: 'I closed my eyes before going in and kept them closed the whole time. Honestly over before I knew it.', hearts: 2, created_at: iso(80) },
  ],
}

// Keep the space anonymous: reject phone numbers / long digit runs. Mirrors the
// server-side check in submit_support_post so the rule holds even if the client
// is bypassed. Strips common separators, then flags any run of 7+ digits —
// catches phone numbers while allowing "ward 3", "2pm", "20 minutes".
const hasPhoneNumber = (s: string) => /\d{7,}/.test((s ?? '').replace(/[\s().+-]/g, ''))

export function Support() {
  const [posts, setPosts] = useState<SupportPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [replies, setReplies] = useState<Record<string, SupportReply[]>>({})
  const [hearted, setHearted] = useState<Set<string>>(new Set())
  const [reported, setReported] = useState<Set<string>>(new Set())

  // New-post composer
  const [alias, setAlias] = useState('')
  const [topic, setTopic] = useState('')
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Per-post reply drafts
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [replyAlias, setReplyAlias] = useState<Record<string, string>>({})
  const [replyNotice, setReplyNotice] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = hasSupabase ? await listSupportPosts() : DEMO_POSTS
        if (active) setPosts(data)
      } catch {
        if (active) setError('We couldn’t load the space just now. Please refresh.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const loadReplies = async (postId: string) => {
    if (replies[postId]) return
    try {
      const data = hasSupabase ? await listReplies(postId) : DEMO_REPLIES[postId] ?? []
      setReplies((r) => ({ ...r, [postId]: data }))
    } catch {
      setReplies((r) => ({ ...r, [postId]: [] }))
    }
  }

  const toggle = (postId: string) => {
    setOpen((o) => {
      const n = new Set(o)
      if (n.has(postId)) n.delete(postId)
      else {
        n.add(postId)
        void loadReplies(postId)
      }
      return n
    })
  }

  const onHeartPost = (p: SupportPost) => {
    if (hearted.has(p.id)) return
    setHearted((h) => new Set(h).add(p.id))
    setPosts((list) => list.map((x) => (x.id === p.id ? { ...x, hearts: x.hearts + 1 } : x)))
    if (hasSupabase) void heartPost(p.id)
  }

  const onHeartReply = (r: SupportReply) => {
    if (hearted.has(r.id)) return
    setHearted((h) => new Set(h).add(r.id))
    setReplies((map) => ({
      ...map,
      [r.post_id]: (map[r.post_id] ?? []).map((x) => (x.id === r.id ? { ...x, hearts: x.hearts + 1 } : x)),
    }))
    if (hasSupabase) void heartReply(r.id)
  }

  const onReport = (type: 'post' | 'reply', id: string) => {
    if (reported.has(id)) return
    setReported((s) => new Set(s).add(id))
    if (hasSupabase) void reportContent(type, id)
  }

  const onPost = async () => {
    if (!body.trim() || posting) return
    if (hasPhoneNumber(body) || hasPhoneNumber(alias) || hasPhoneNumber(topic)) {
      setError('Please remove any phone numbers or long numbers — keep the space anonymous. If you need to reach someone, use the urgent-help contacts above.')
      return
    }
    setError('')
    setPosting(true)
    try {
      if (hasSupabase) {
        await submitSupportPost({ alias: alias.trim(), topic: topic.trim(), body: body.trim() })
        // Posts are held for review, so the new post is not shown until an
        // operator approves it. Confirm receipt instead of listing it back.
      } else {
        setPosts((list) => [
          {
            id: `local-${Date.now()}`,
            alias: alias.trim() || 'Anonymous',
            topic: topic.trim() || null,
            body: body.trim(),
            hearts: 0,
            created_at: new Date().toISOString(),
            reply_count: 0,
          },
          ...list,
        ])
      }
      setAlias('')
      setTopic('')
      setBody('')
      setSubmitted(true)
    } catch {
      setError('Sorry, that didn’t post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const onReply = async (postId: string) => {
    const draft = (replyDraft[postId] ?? '').trim()
    if (!draft) return
    const who = (replyAlias[postId] ?? '').trim() || 'Anonymous'
    if (hasPhoneNumber(draft) || hasPhoneNumber(who)) {
      setError('Please remove any phone numbers or long numbers — keep the space anonymous.')
      return
    }
    setError('')
    try {
      if (hasSupabase) {
        await submitSupportReply({ postId, alias: who, body: draft })
        // Replies are held for review too; confirm rather than show it live.
        setReplyNotice((n) => ({ ...n, [postId]: true }))
      } else {
        setReplies((r) => ({
          ...r,
          [postId]: [
            ...(r[postId] ?? []),
            { id: `local-${Date.now()}`, post_id: postId, alias: who, body: draft, hearts: 0, created_at: new Date().toISOString() },
          ],
        }))
        setPosts((list) => list.map((x) => (x.id === postId ? { ...x, reply_count: (x.reply_count ?? 0) + 1 } : x)))
      }
      setReplyDraft((d) => ({ ...d, [postId]: '' }))
    } catch {
      setError('Sorry, that reply didn’t send. Please try again.')
    }
  }

  return (
    <div className={styles.root}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Logo height={30} />
          <a className={styles.navLink} href="/feedback">
            Leave feedback →
          </a>
        </div>
      </nav>

      <div className={styles.wrap}>
        <div className={styles.eyebrow}>PEER SUPPORT</div>
        <h1 className={styles.h1}>
          Talk to people who <em>get it.</em>
        </h1>
        <p className={styles.lead}>
          A calm, anonymous space where patients share their own journey — how they’ve coped, what helped, and what
          they’d tell someone just starting out. It’s about people supporting each other by sharing their story, not
          giving advice. No names, no sign-in.
        </p>

        <div className={styles.safety}>
          <span aria-hidden="true">♡</span>
          <div>
            <b>This is a space to share your own story — not for medical, clinical or any other advice.</b>
            It’s for patients supporting each other by sharing how they’ve managed, not a place to give or get
            treatment advice. If you need urgent help this isn’t the place: contact your GP or call{' '}
            <a href="tel:111">NHS 111</a>, or <a href="tel:999">999</a> in an emergency. For mental-health support any
            time, Samaritans are on <a href="tel:116123">116 123</a>. Please don’t include phone numbers or anything
            that identifies you or someone else.
          </div>
        </div>

        <div className={`${styles.card} ${styles.composer}`}>
          <h3>Share your story</h3>
          {submitted ? (
            <div className={styles.posted}>
              <b>Thanks for sharing.</b>
              Your post will appear once our team has checked it — this keeps the space safe and anonymous for
              everyone. It usually appears within a day.
              <div>
                <button className={styles.primary} onClick={() => setSubmitted(false)}>
                  Share something else
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={styles.scopeNote}>
                Tell others about <b>your own journey</b> — how you managed, what helped, what you’d tell someone just
                starting out. This isn’t for medical or clinical advice, and please don’t include phone numbers or
                anything that identifies you.
              </p>
              <div className={styles.row2}>
                <input
                  className={styles.field}
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="A name to go by (optional)"
                  maxLength={40}
                />
                <input
                  className={styles.field}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic, e.g. Before your scan (optional)"
                  maxLength={60}
                />
              </div>
              <textarea
                className={styles.field}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share your experience — how you coped, what helped, what you’d tell someone just starting out."
                maxLength={4000}
              />
              <div className={styles.composerActions}>
                <span className={styles.muted}>
                  Checked by our team before it appears. Anonymous, and read by others going through the same thing.
                </span>
                <button className={styles.primary} onClick={onPost} disabled={!body.trim() || posting}>
                  {posting ? 'Posting…' : 'Share'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.feedHead}>
          <h2>Recent conversations</h2>
          {error && <span className={styles.err}>{error}</span>}
        </div>

        {loading ? (
          <div className={styles.state}>Loading the space…</div>
        ) : posts.length === 0 ? (
          <div className={styles.state}>No conversations yet. Be the first to say something.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className={`${styles.card} ${styles.post}`}>
              <div className={styles.postTop}>
                <span className={styles.alias}>{p.alias}</span>
                <span>· {timeAgo(p.created_at)}</span>
                {p.topic && <span className={styles.topic}>{p.topic}</span>}
              </div>
              <div className={styles.body}>{p.body}</div>
              <div className={styles.actions}>
                <button className={styles.act} data-on={hearted.has(p.id)} onClick={() => onHeartPost(p)}>
                  ♥ {p.hearts}
                </button>
                <button className={styles.act} onClick={() => toggle(p.id)}>
                  💬 {open.has(p.id) ? 'Hide' : 'Reply'}
                  {p.reply_count ? ` · ${p.reply_count}` : ''}
                </button>
                <button className={styles.act} style={{ marginLeft: 'auto' }} onClick={() => onReport('post', p.id)} disabled={reported.has(p.id)}>
                  {reported.has(p.id) ? 'Reported' : 'Report'}
                </button>
              </div>

              {open.has(p.id) && (
                <div className={styles.replies}>
                  {(replies[p.id] ?? []).map((r) => (
                    <div key={r.id} className={styles.reply}>
                      <div className={styles.postTop}>
                        <span className={styles.alias}>{r.alias}</span>
                        <span>· {timeAgo(r.created_at)}</span>
                      </div>
                      <div className={styles.body}>{r.body}</div>
                      <div className={styles.actions}>
                        <button className={styles.act} data-on={hearted.has(r.id)} onClick={() => onHeartReply(r)}>
                          ♥ {r.hearts}
                        </button>
                        <button className={styles.act} style={{ marginLeft: 'auto' }} onClick={() => onReport('reply', r.id)} disabled={reported.has(r.id)}>
                          {reported.has(r.id) ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {replyNotice[p.id] ? (
                    <div className={styles.replyNotice}>
                      Thanks — your reply will appear once our team has checked it.
                    </div>
                  ) : (
                    <div className={styles.replyComposer}>
                      <input
                        className={styles.field}
                        value={replyAlias[p.id] ?? ''}
                        onChange={(e) => setReplyAlias((a) => ({ ...a, [p.id]: e.target.value }))}
                        placeholder="You"
                        maxLength={40}
                        style={{ maxWidth: 110 }}
                      />
                      <input
                        className={styles.field}
                        value={replyDraft[p.id] ?? ''}
                        onChange={(e) => setReplyDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && onReply(p.id)}
                        placeholder="Share something supportive from your own experience…"
                        maxLength={4000}
                      />
                      <button className={styles.primary} onClick={() => onReply(p.id)} disabled={!(replyDraft[p.id] ?? '').trim()}>
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
