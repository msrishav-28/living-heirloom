'use client'
import { useState } from 'react'
import { useHeirloomStudio } from '@/hooks/useHeirloomStudio'
import { VoiceConsent } from './voice-consent'
import { BespokeSelect } from '@/components/ui/bespoke-controls'
import {
  SupportedLanguageSchema,
  type SupportedLanguage,
} from '@/lib/product-contracts'
export function RealVoiceLab({ memberId }: { memberId: string }) {
  const studio = useHeirloomStudio(memberId, 'childhood_roots')
  const [consent, setConsent] = useState(false),
    [text, setText] = useState(''),
    [lang, setLang] = useState<SupportedLanguage>('en-IN')
  return (
    <section className="pastel-card-parchment studio-panel">
      <h2 className="font-louize-card text-3xl">
        Preserve the warmth in your voice.
      </h2>
      <p>
        Record three passages, about eight seconds each. Speak naturally about a
        family memory, a person you love, and advice you would like to leave.
      </p>
      <VoiceConsent
        checked={consent}
        onChange={(value) => {
          setConsent(value)
          studio.setConsent(value)
        }}
      />
      <p role="status">
        {studio.clipCount} of 3 clips captured{' '}
        {studio.state.embedding ? '· Voice embedding [1 × 768] saved' : ''}
      </p>
      <button
        className="btn-ember-pill"
        disabled={!consent || (studio.state.inFlight && !studio.recording)}
        onClick={() =>
          studio.recording
            ? studio.stopRecording()
            : void studio.onCalibrateVoice()
        }
      >
        {studio.recording
          ? 'Stop recording'
          : studio.state.inFlight
            ? 'Processing voice…'
            : studio.clipCount === 3 && !studio.state.embedding
              ? 'Retry voice calibration'
              : 'Record calibration passage'}
      </button>
      <BespokeSelect
        label="Narration language"
        value={lang}
        options={SupportedLanguageSchema.options.map((value) => ({
          value,
          label:
            new Intl.DisplayNames(['en'], { type: 'language' }).of(
              value.split('-')[0],
            ) || value,
        }))}
        onChange={(value) => setLang(SupportedLanguageSchema.parse(value))}
      />
      <label className="block">
        Words to speak
        <textarea
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a short message in the selected language"
        />
      </label>
      <button
        className="btn-slate-pill"
        disabled={
          !consent ||
          !text.trim() ||
          !studio.state.embedding ||
          studio.state.inFlight
        }
        onClick={() => void studio.onSynthesize(text, lang)}
      >
        Generate narration in my voice
      </button>
      {studio.playbackUrl && <audio controls src={studio.playbackUrl} />}{' '}
      {studio.state.error && <p role="alert">{studio.state.error}</p>}
    </section>
  )
}
