'use client'
import { useEffect, useState } from 'react'
import { useHeirloomStudio } from '@/hooks/useHeirloomStudio'
import { draftStore } from '@/lib/storage/local-draft-store'
import {
  HeirloomCapsuleFileSchema,
  SupportedLanguageSchema,
  type SupportedLanguage,
  type HeirloomCapsuleBundle,
} from '@/lib/product-contracts'
import { openHeirloom } from '@/lib/crypto/heirloom-vault'
import { audioBlob } from '@/lib/browser-api'
import { BespokeSelect } from '@/components/ui/bespoke-controls'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceConsent } from './voice-consent'
export function CapsuleReleasePanel() {
  const [bundle, setBundle] = useState<HeirloomCapsuleBundle | null>(null),
    [opened, setOpened] = useState<HeirloomCapsuleBundle | null>(null),
    [passphrase, setPassphrase] = useState(''),
    [date, setDate] = useState(''),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null),
    [file, setFile] = useState<File | null>(null),
    [urls, setUrls] = useState<string[]>([])
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('en-IN')
  const studio = useHeirloomStudio(
    bundle?.session.memberId || 'my-voice',
    bundle?.session.mode || 'childhood_roots',
  )
  useEffect(() => {
    void draftStore
      .getBundle()
      .then((value) => setBundle(value ?? null))
      .catch(() => setError('Could not load the saved interview.'))
  }, [])
  useEffect(() => {
    if (!opened) {
      setUrls([])
      return
    }
    const audio = [
      ...opened.session.turns.map((t) => t.audioWavBase64),
      ...(opened.clonedAudioWavBase64 ? [opened.clonedAudioWavBase64] : []),
    ].map((value) => URL.createObjectURL(audioBlob(value)))
    setUrls(audio)
    return () => audio.forEach((url) => URL.revokeObjectURL(url))
  }, [opened])
  async function unlock() {
    if (!file || busy) return
    setBusy(true)
    setOpened(null)
    setError(null)
    try {
      if (file.size > 40000000) throw new Error('Capsule file is too large')
      const envelope = HeirloomCapsuleFileSchema.parse(
        JSON.parse(await file.text()),
      )
      setOpened(await openHeirloom(envelope, passphrase))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open capsule')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="rounded-[16px] border border-[var(--border)] bg-white p-6 space-y-4">
      <h2 className="font-louize-card text-3xl">Your recorded heirloom</h2>
      <p>
        Interview recordings are saved locally. Download a sealed file and keep
        its passphrase separately. Unlocking needs access to the public drand
        beacon.
      </p>
      {bundle ? (
        <>
          <h3 className="font-louize-card text-2xl">{bundle.chapter.title}</h3>
          <p className="whitespace-pre-wrap">{bundle.chapter.letter}</p>
          <BespokeSelect
            label="Recipient language"
            value={targetLang}
            options={SupportedLanguageSchema.options.map((value) => ({
              value,
              label:
                new Intl.DisplayNames(['en'], { type: 'language' }).of(
                  value.split('-')[0],
                ) || value,
            }))}
            onChange={(value) =>
              setTargetLang(SupportedLanguageSchema.parse(value))
            }
          />
          <button
            disabled={studio.state.inFlight}
            className="btn-slate-pill"
            onClick={async () => {
              await studio.onTranslateChapter(targetLang)
              const saved = await draftStore.getBundle()
              if (saved) setBundle(saved)
            }}
          >
            Create letter in recipient language
          </button>
          <VoiceConsent
            checked={consent}
            onChange={(v) => {
              setConsent(v)
              studio.setConsent(v)
            }}
          />
          <button
            disabled={
              studio.state.inFlight || !consent || !studio.state.embedding
            }
            className="btn-slate-pill"
            onClick={() =>
              void studio.onSynthesize(
                bundle.chapter.letter,
                bundle.chapter.language,
              )
            }
          >
            Generate cloned narration
          </button>
          {!studio.state.embedding && (
            <p>
              Record three calibration clips in Voice Lab to enable cloned
              narration. Original recordings can be sealed now.
            </p>
          )}
          {studio.playbackUrl && <audio src={studio.playbackUrl} controls />}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void studio.onSealTimeCapsule(passphrase, new Date(date))
            }}
          >
            <label className="block">
              Passphrase (at least 12 characters)
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="ml-2 border p-2"
              />
            </label>
            <label className="block">
              Unlock date and time (your local time)
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ml-2 border p-2"
              />
            </label>
            <button disabled={studio.state.inFlight} className="btn-ember-pill">
              {studio.state.inFlight ? 'Working…' : 'Seal capsule'}
            </button>
          </form>
          {studio.state.capsule && (
            <button
              onClick={studio.onDownloadCapsule}
              className="btn-ember-pill"
            >
              Download .heirloom
            </button>
          )}
        </>
      ) : (
        <p>Complete a five-turn voice interview to prepare a real capsule.</p>
      )}
      <div className="border-t pt-4 space-y-4">
        <h3 className="font-louize-card text-2xl">Open & verify a capsule</h3>
        <label className="block">
          Capsule file
          <input
            type="file"
            accept=".heirloom,application/json"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null)
              setOpened(null)
              setError(null)
            }}
          />
        </label>
        <label className="block">
          Unlock passphrase
          <input
            type="password"
            autoComplete="off"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="ml-2 border p-2"
          />
        </label>
        <button
          disabled={!file || busy}
          onClick={() => void unlock()}
          className="btn-slate-pill"
        >
          {busy ? 'Opening…' : 'Decrypt capsule'}
        </button>
      </div>
      {(error || studio.state.error) && (
        <p role="alert" className="text-red-700">
          {error || studio.state.error}
        </p>
      )}
      {opened && (
        <article>
          <h3 className="font-louize-card text-2xl">{opened.chapter.title}</h3>
          <p>{opened.chapter.letter}</p>
          <p className="text-sm">{opened.aiDisclosure}</p>
          {urls.map((url, i) => (
            <label key={url} className="block">
              {i < 5 ? `Original answer ${i + 1}` : 'AI cloned narration'}
              <audio controls src={url} />
            </label>
          ))}
        </article>
      )}
    </section>
  )
}
