'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BrandWaveform } from '@/components/brand-waveform'
import { ThemeToggle } from '@/components/theme-toggle'
import { BespokeSelect } from '@/components/ui/bespoke-controls'
import { RealVoiceLab } from '@/components/vault/real-voice-lab'
import { CapsuleReleasePanel } from '@/components/vault/capsule-release-panel'
import { HeirloomModeSchema } from '@/lib/product-contracts'
type Member = { id: string; name: string; relation: string }
function Vault() {
  const WORKSPACE_TABS = [
    {
      id: 'family',
      number: '01',
      label: 'Family Archive',
      shortLabel: 'Family',
    },
    {
      id: 'voicelab',
      number: '02',
      label: 'Gnani Voice Lab',
      shortLabel: 'Voice Lab',
    },
    {
      id: 'biographer',
      number: '03',
      label: 'AI Biographer',
      shortLabel: 'Biographer',
    },
    {
      id: 'capsules',
      number: '04',
      label: 'Capsule Vault',
      shortLabel: 'Capsules',
    },
  ]
  const params = useSearchParams(),
    [activeWorkspace, setTab] = useState('family'),
    [members, setMembers] = useState<Member[]>([]),
    [memberId, setMemberId] = useState(''),
    [name, setName] = useState(''),
    [relation, setRelation] = useState(''),
    [mode, setMode] = useState('childhood_roots'),
    [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const value = params.get('tab')
    if (
      value &&
      ['family', 'voicelab', 'biographer', 'capsules'].includes(value)
    )
      setTab(value)
  }, [params])
  useEffect(() => {
    try {
      const data: unknown = JSON.parse(
        localStorage.getItem('living-heirloom-real-members-v1') || '[]',
      )
      if (
        !Array.isArray(data) ||
        !data.every(
          (item) =>
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.relation === 'string',
        )
      )
        throw Error()
      setMembers(data)
      setMemberId(data[0]?.id || '')
    } catch {
      setError(
        'Your saved family profiles could not be read. Existing browser data has been preserved.',
      )
    }
  }, [])
  function addMember(event: React.FormEvent) {
    event.preventDefault()
    const member = {
      id: crypto.randomUUID(),
      name: name.trim(),
      relation: relation.trim(),
    }
    if (!member.name) return
    try {
      const next = [...members, member]
      localStorage.setItem(
        'living-heirloom-real-members-v1',
        JSON.stringify(next),
      )
      setMembers(next)
      setMemberId(member.id)
      setName('')
      setRelation('')
      setError(null)
    } catch {
      setError(
        'Unable to save this profile. Free some browser storage and try again.',
      )
    }
  }
  return (
    <div className="hero-bloom-bg min-h-screen w-full pb-24">
      {/* Top Floating Pill Header */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-[1400px] px-4 pt-2 sm:top-6 sm:px-8">
        <nav
          aria-label="Heirloom Vault Workspace Navigation"
          className="pill-nav flex items-center justify-between gap-3 px-4 py-2.5 sm:px-7 sm:py-3.5"
        >
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2.5 whitespace-nowrap focus:outline-none"
            >
              <BrandWaveform />
              <span className="font-louize-card text-[21px] tracking-[-0.045em] text-[var(--ink-black)] sm:text-[25px]">
                Living Heirloom
              </span>
            </Link>
            <span className="hidden rounded-[36px] border border-[#ff5924]/35 bg-[var(--canvas-blush)] px-3 py-0.5 font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--accent-ember)] uppercase md:inline-block">
              Gnani AI Studio Vault
            </span>
          </div>

          {/* Workspace Switcher Pills (Desktop) */}
          <div className="hidden items-center gap-2 xl:flex">
            {WORKSPACE_TABS.map((tab) => {
              const active = activeWorkspace === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTab(tab.id)}
                  className={
                    active
                      ? 'btn-ember-pill bg-[var(--card)] px-4 py-2 text-[11px]'
                      : 'btn-slate-pill px-4 py-2 text-[11px]'
                  }
                >
                  <span>
                    {tab.number} · {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Link Back to Editorial Story */}
          <div className="flex shrink-0 items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/"
              className="btn-slate-pill hidden sm:inline-flex px-4 py-2 text-[11px] sm:px-5"
            >
              <span>Editorial Home</span>
            </Link>
          </div>
        </nav>

        {/* Responsive 2x2 / 4-Col Workspace Switcher for Mobile & Tablet */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
          {WORKSPACE_TABS.map((tab) => {
            const active = activeWorkspace === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTab(tab.id)}
                className={
                  active
                    ? 'btn-ember-pill w-full bg-[var(--card)] px-3 py-2 text-[11px]'
                    : 'btn-slate-pill w-full bg-[var(--card)]/85 px-3 py-2 text-[11px]'
                }
              >
                <span>
                  {tab.number} · {tab.shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="mx-auto mt-8 max-w-[1400px] px-4 sm:mt-10 sm:px-8">
        {/* Archive Telemetry Strip */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <button
            type="button"
            onClick={() => setTab('family')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Family Profiles
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              {members.length} Members
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-ember)]">
              Voice calibration
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('voicelab')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Gnani AI Languages
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              10 Languages
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--ink-slate-navy)]">
              Indic & Global Neural TTS
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('biographer')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Biographer Chapters
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              Guided voice interview
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-cobalt)]">
              Audio cues stay on-device
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('capsules')}
            className="rounded-[16px] border border-[var(--border)] bg-[var(--card)]/90 p-4 text-left transition-all hover:border-[#ff5924]"
          >
            <p className="font-nunito text-[11px] font-semibold tracking-[0.09em] text-[var(--muted-foreground)] uppercase">
              Time-Locked Vault
            </p>
            <p className="font-louize-card mt-1 text-[26px] text-[var(--ink-black)] sm:text-[28px]">
              Recorded Capsules
            </p>
            <p className="font-inter-ui text-[12px] text-[var(--accent-ember)]">
              AES-256-GCM Encrypted
            </p>
          </button>
        </div>

        {error && <p role="alert">{error}</p>}
        {activeWorkspace === 'family' && (
          <section className="pastel-card-parchment studio-panel">
            <h1 className="font-louize-card text-4xl">
              Your family, in their own words.
            </h1>
            <p>
              {members.length
                ? 'Choose a storyteller to record a voice or begin an interview.'
                : 'Your archive begins here. Add your first storyteller to preserve a real voice.'}
            </p>
            <form onSubmit={addMember} className="grid gap-4 sm:grid-cols-2">
              <label>
                Name
                <input
                  required
                  maxLength={120}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label>
                Relationship
                <input
                  maxLength={120}
                  value={relation}
                  onChange={(event) => setRelation(event.target.value)}
                />
              </label>
              <button className="btn-ember-pill justify-self-start">
                Add family member
              </button>
            </form>
            {members.map((member) => (
              <article
                key={member.id}
                className="flex flex-wrap justify-between items-center gap-4 border-t py-5"
              >
                <div>
                  <h2 className="font-louize-card text-2xl">{member.name}</h2>
                  <p>{member.relation}</p>
                </div>
                <button
                  className="btn-slate-pill"
                  onClick={() => {
                    setMemberId(member.id)
                    setTab('voicelab')
                  }}
                >
                  Open voice studio
                </button>
              </article>
            ))}
          </section>
        )}
        {['voicelab', 'biographer'].includes(activeWorkspace) &&
          (members.length ? (
            <>
              <div className="mb-6 max-w-lg">
                <BespokeSelect
                  label="Storyteller"
                  value={memberId}
                  options={members.map((member) => ({
                    value: member.id,
                    label: member.name,
                    sublabel: member.relation,
                  }))}
                  onChange={setMemberId}
                />
              </div>
              {activeWorkspace === 'voicelab' ? (
                <RealVoiceLab key={memberId} memberId={memberId} />
              ) : (
                <section className="pastel-card-blue studio-panel">
                  <h1 className="font-louize-card text-4xl">
                    Make room for a memory.
                  </h1>
                  <p>
                    Five gentle questions. Speak in the language that feels like
                    home.
                  </p>
                  <BespokeSelect
                    label="Interview theme"
                    value={mode}
                    options={HeirloomModeSchema.options.map((value) => ({
                      value,
                      label: value.replaceAll('_', ' '),
                    }))}
                    onChange={setMode}
                  />
                  <Link
                    className="btn-ember-pill"
                    href={`/vault/interview?mode=${mode}&member=${encodeURIComponent(memberId)}`}
                  >
                    Start voice interview →
                  </Link>
                </section>
              )}
            </>
          ) : (
            <section className="studio-panel">
              <p>Add a storyteller in Family archive to begin.</p>
              <button
                className="btn-ember-pill"
                onClick={() => setTab('family')}
              >
                Add your first storyteller
              </button>
            </section>
          ))}
        {activeWorkspace === 'capsules' && <CapsuleReleasePanel />}
        <p className="mt-10 text-sm">
          <Link href="/demo" className="underline">
            Explore the separate design demonstration
          </Link>
        </p>
      </main>
    </div>
  )
}
export default function VaultPage() {
  return (
    <Suspense fallback={<p className="p-8">Opening your archive…</p>}>
      <Vault />
    </Suspense>
  )
}
