'use client'

import React, { useState, useEffect } from 'react'
import {
  encryptHeirloomInBrowser,
  type EncryptedHeirloomPacket,
} from '@/lib/local-crypto'
import { CalmReveal, RevealLines } from '@/components/calm-motion'

const PRIVACY_PILLARS = [
  {
    eyebrow: 'SOVEREIGN GNANI AI PIPELINE',
    title: 'Clear processing boundaries.',
    body: 'Speech and voice cloning are processed by Gnani AI; interview text is processed by the configured reasoning provider. Their retention and training terms apply. Our application does not store your family content on a server.',
  },
  {
    eyebrow: 'CLIENT-SIDE ENCRYPTION',
    title: 'AES-256-GCM for every syllable.',
    body: 'Exported voice capsules use AES-256-GCM with a passphrase-derived key and 210,000 PBKDF2 iterations. Working drafts remain unencrypted in this browser; protect your device and browser profile.',
  },
  {
    eyebrow: 'NO AD TELEMETRY',
    title: 'Zero ad pixels, brokers, or profiling.',
    body: 'We do not monetize grief, family trees, or personal milestones. Your spoken letters exist solely for the loved ones you name on the seal.',
  },
  {
    eyebrow: 'PORTABLE FOR DECADES',
    title: 'Portable .heirloom capsules.',
    body: 'Export an encrypted capsule containing your recordings and letter. Keep its passphrase separately. Unlocking requires a compatible browser and the public drand beacon after the chosen date.',
  },
]

export function DarkManifestoSection() {
  const [livePlaintext, setLivePlaintext] = useState(
    'For Maya on her 25th birthday: Never doubt the quiet strength in your voice.'
  )
  const [livePassphrase, setLivePassphrase] = useState(
    'october-porch-sunlight-1998'
  )
  const [packet, setPacket] = useState<EncryptedHeirloomPacket | null>(null)

  useEffect(() => {
    let active = true
    encryptHeirloomInBrowser(livePlaintext, livePassphrase).then((res) => {
      if (active) setPacket(res)
    })
    return () => {
      active = false
    }
  }, [livePlaintext, livePassphrase])

  const handleReEncrypt = async () => {
    const fresh = await encryptHeirloomInBrowser(livePlaintext, livePassphrase)
    setPacket(fresh)
  }

  return (
    <section
      id="privacy-manifesto"
      className="dark-candlelight-bg w-full py-28 text-[#ffffff] sm:py-[130px]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        {/* Manifesto Narrative Header */}
        <div className="max-w-[1040px]">
          <CalmReveal distance={14}>
            <p className="font-nunito-eyebrow mb-5">
              PRIVACY & SOVEREIGNTY MANIFESTO
            </p>
          </CalmReveal>

          <h2 className="font-louize-heading text-[clamp(2.45rem,5.4vw,4.85rem)] tracking-[-0.04em] text-[#ffffff]">
            <RevealLines
              lines={[
                <React.Fragment key="m1">
                  Grief does not belong in public datasets.
                </React.Fragment>,
                <React.Fragment key="m2">
                  <em className="font-normal italic">
                    Understand where your recordings are processed.
                  </em>
                </React.Fragment>,
                <React.Fragment key="m3">
                  Every capsule is sealed with your family key.
                </React.Fragment>,
              ]}
            />
          </h2>

          <CalmReveal delay={220} distance={18}>
            <p className="font-avenir-body mt-8 max-w-[760px] text-[19px] text-[var(--muted-foreground)] sm:text-[22px]">
              Audio analysis, working drafts, and capsule encryption run in your browser. Speech and interview requests use external AI services under their terms. Your downloaded capsule requires its passphrase and the public time beacon to open.
            </p>
          </CalmReveal>
        </div>

        {/* 4 Privacy Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY_PILLARS.map((pillar, idx) => (
            <CalmReveal
              key={pillar.eyebrow}
              delay={100 + idx * 90}
              distance={22}
              className="dark-card-glow rounded-[16px] border border-[#ffffff]/15 bg-[var(--card)]/[0.04] p-7 transition-colors duration-500 hover:border-[#ffffff]/30 hover:bg-[var(--card)]/[0.07]"
            >
              <p className="font-nunito-eyebrow">{pillar.eyebrow}</p>
              <h3 className="font-louize-card mt-3 text-[28px] text-[#ffffff]">
                {pillar.title}
              </h3>
              <p className="font-avenir-body mt-3 text-[16px] text-[var(--muted-foreground)]">
                {pillar.body}
              </p>
            </CalmReveal>
          ))}
        </div>

        {/* Live WebCrypto AES-256-GCM Proof Box */}
        <CalmReveal delay={240} distance={26}>
          <div className="dark-card-glow mt-14 rounded-[16px] border border-[#ffffff]/20 bg-[#000000]/45 p-7 sm:p-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <span className="font-nunito-eyebrow">
                  BROWSER ENCRYPTION DEMONSTRATION
                </span>
                <h3 className="font-louize-card mt-3 text-[32px] text-[#ffffff] sm:text-[38px]">
                  Explore a browser encryption preview.
                </h3>
                <p className="font-avenir-body mt-3 text-[17px] text-[var(--muted-foreground)]">
                  Type any heirloom memory below. Before storage or export,
                  native{' '}
                  <code className="text-[#ffffff]">window.crypto.subtle</code>{' '}
                  derives a 256-bit key from your family passphrase and seals
                  the payload into authenticated ciphertext.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="manifesto-plaintext"
                      className="font-nunito block text-[12px] font-semibold tracking-[0.1em] text-[var(--muted-foreground)] uppercase"
                    >
                      Plaintext Heirloom Memory
                    </label>
                    <input
                      id="manifesto-plaintext"
                      type="text"
                      value={livePlaintext}
                      onChange={(e) => setLivePlaintext(e.target.value)}
                      className="font-inter-ui mt-2 w-full rounded-[12px] border border-[#ffffff]/25 bg-[var(--card)]/5 px-4 py-3 text-[16px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="manifesto-passphrase"
                      className="font-nunito block text-[12px] font-semibold tracking-[0.1em] text-[var(--muted-foreground)] uppercase"
                    >
                      Family Unlock Passphrase (PBKDF2-SHA256 Key Derivation)
                    </label>
                    <input
                      id="manifesto-passphrase"
                      type="text"
                      value={livePassphrase}
                      onChange={(e) => setLivePassphrase(e.target.value)}
                      className="font-inter-ui mt-2 w-full rounded-[12px] border border-[#ffffff]/25 bg-[var(--card)]/5 px-4 py-3 text-[16px] text-[#ffffff] focus:border-[#ffffff] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleReEncrypt}
                    className="btn-white-pill"
                  >
                    <span>Rotate 96-Bit IV & Re-Seal</span>
                  </button>
                  <a href="/vault?tab=capsules" className="btn-white-pill">
                    <span>Seal a Time-Locked Capsule</span>
                  </a>
                </div>
              </div>

              {/* Right 6 Cols: Live Cryptographic Output */}
              <div className="flex flex-col justify-between rounded-[12px] border border-[#ffffff]/15 bg-[#000000]/65 p-6 lg:col-span-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-nunito text-[12px] font-semibold tracking-[0.1em] text-[var(--accent-ember)] uppercase">
                      {packet?.algorithm || 'AES-256-GCM'} ·{' '}
                      {packet?.kdf || 'PBKDF2-SHA256'}
                    </span>
                    <span className="font-inter-ui text-[13px] text-[var(--muted-foreground)]">
                      Zero-Knowledge Family Key · 100k Iterations
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 font-mono text-[13px]">
                    <div>
                      <p className="text-[var(--muted-foreground)]">
                        96-Bit Initialization Vector (IV):
                      </p>
                      <p className="mt-1 break-all text-[#ffffff]">
                        {packet?.ivHex}
                      </p>
                    </div>

                    <div>
                      <p className="text-[var(--muted-foreground)]">128-Bit PBKDF2 Salt:</p>
                      <p className="mt-1 break-all text-[#ffffff]">
                        {packet?.saltHex}
                      </p>
                    </div>

                    <div>
                      <p className="text-[var(--muted-foreground)]">
                        AES-256-GCM Ciphertext + 128-Bit Auth Tag (
                        {packet?.byteLength || 0} bytes):
                      </p>
                      <p className="mt-1 line-clamp-4 break-all leading-relaxed text-[var(--accent-ember)]">
                        {packet?.ciphertextHex}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 text-[13px] text-[var(--muted-foreground)]">
                  <span>Verified by WebCrypto Subtle API</span>
                  <span>External AI processing · Provider terms apply</span>
                </div>
              </div>
            </div>
          </div>
        </CalmReveal>
      </div>
    </section>
  )
}
