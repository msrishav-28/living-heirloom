# ARCHITECTURE.md — Living Heirloom
> **Last updated:** 2026-11-06 · **Target release:** 10 November 2026 (Gnani.ai Hackathon)

---

## 1. What this product does

**Living Heirloom** lets a family elder speak short voice recordings that are preserved, translated, and sealed into time-locked audio capsules. The capsule unlocks only on a specified future date — a wedding morning, an 18th birthday, a graduation day — and plays the ancestor's exact voice, reconstructed in the recipient's preferred Indic language.

The underlying magic is three real technologies working together:

| Layer | What it does |
|---|---|
| **Gnani AI** | Speech-to-text in nine Indic languages and English; voice embedding (speaker fingerprint); text-to-speech that reconstructs the original speaker's timbre |
| **Configured Gemini Flash model** | Conducts the recorded interview — asks follow-up questions, detects hesitation, distils spoken answers into heirloom letters |
| **drand / tlock-js** | Mathematically seals the capsule so it cannot be decrypted until a specific UTC timestamp — not by password policy, but by cryptographic proof |

No database. All family data lives in the user's browser (localStorage + IndexedDB). The server exists only to proxy paid API calls without exposing keys.

---

## 2. Technology stack

| Concern | Choice | Why |
|---|---|---|
| Frontend framework | Next.js 16.4.3 (App Router) | File-system routing, React Server Components, Edge-ready |
| Language | TypeScript 5.7 strict | Type safety at compile time; no `any` escapes |
| Styling | Tailwind CSS v4 | Utility-first; zero runtime CSS-in-JS |
| Package manager | pnpm 12 | Workspace support; fast installs |
| Runtime / Deploy | Vercel serverless functions | Zero-ops; cold start acceptable for voice ops |
| Analytics | @vercel/analytics | Privacy-safe; already integrated |
| Schema validation | Zod | Runtime type safety on all API boundaries |
| Local storage | idb-keyval (IndexedDB) | Bigger than localStorage; async; works offline |
| Voice activity detection | @ricky0123/vad-web (Silero VAD) | WASM; runs in-browser; no audio sent to server until speech ends |
| Crypto (browser) | Web Crypto API (AES-256-GCM + PBKDF2) | Native; no library needed; zero-dependency |
| Crypto (timelock) | tlock-js + drand chain | Drand random beacon; timelock encryption; truly time-gated |
| Speech (server) | Gnani AI Vachana API v3 | Indic-language STT, TTS, voice clone |
| LLM (server) | Configured Gemini Flash model via OpenAI-compatible endpoint | Free tier at Google AI Studio; multimodal; low latency |

---

## 3. Repository layout

```
core-innovation-development/
├── app/
│   ├── layout.tsx                 # Root layout — metadata, fonts, analytics
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Tailwind base + custom font vars
│   └── vault/
│       ├── page.tsx               # Vault shell — 4 workspace tabs
│       └── interview/
│           └── page.tsx           # (Phase 6) Full-screen voice interview
│
├── components/
│   ├── hero-section.tsx           # Landing hero
│   ├── problem-narrative-section.tsx
│   ├── voice-preservation-section.tsx
│   ├── timelock-capsule-section.tsx
│   ├── adaptive-interview-section.tsx
│   ├── dark-manifesto-section.tsx
│   ├── footer-section.tsx
│   ├── navbar.tsx
│   ├── recording-studio-modal.tsx # (Phase 7) Wire to real VAD
│   ├── calm-motion.tsx            # Reveal animation primitives
│   ├── living-hue-atmosphere.tsx
│   ├── theme-toggle.tsx
│   └── vault/
│       ├── family-archive-workspace.tsx   # Tab 01
│       ├── voice-cloning-lab-workspace.tsx # Tab 02 — wire real embedding
│       ├── biographer-interview-workspace.tsx # Tab 03 — link to /vault/interview
│       └── capsule-vault-workspace.tsx    # Tab 04 — wire real export
│
├── lib/
│   ├── heirloom-vault-store.ts    # ✅ React state + seed data (Indian family)
│   ├── local-crypto.ts            # ✅ AES-256-GCM browser encryption
│   ├── voice-synth.ts             # Offline demo TTS (kept as labelled fallback)
│   ├── utils.ts                   # cn() helper
│   ├── product-contracts.ts       # (Phase 1) Zod schemas — all API contracts
│   ├── gnani/
│   │   ├── client.ts              # (Phase 1) callGnaniWithRetry + GnaniUpstreamError
│   │   └── text-normalizer.ts     # (Phase 1) Digit/currency/date normalisation for TTS
│   ├── audio/
│   │   ├── wav-encoder.ts         # (Phase 3) PCM → WAV blob; 28s hard cap
│   │   ├── acoustic-prosody.ts    # (Phase 3) RMS, pause, F0 jitter analysis
│   │   └── vad-recorder.ts        # (Phase 3) Silero VAD wrapper → Float32Array
│   ├── crypto/
│   │   └── heirloom-vault.ts      # (Phase 4) sealHeirloom / openHeirloom with tlock
│   └── storage/
│       └── local-draft-store.ts   # (Phase 4) IndexedDB via idb-keyval
│
├── hooks/
│   └── useHeirloomStudio.ts       # (Phase 5) Master state machine
│
├── app/api/
│   ├── health/route.ts            # (Phase 2) GET — config check; no paid calls
│   ├── gnani/
│   │   ├── stt/route.ts           # (Phase 2) POST multipart → Gnani Prisma STT
│   │   ├── tts/route.ts           # (Phase 2) POST JSON → Gnani Timbre TTS → WAV
│   │   └── voice-clone/
│   │       ├── embedding/route.ts # (Phase 2) POST multipart → [1,768] embedding
│   │       └── synthesize/route.ts# (Phase 2) POST JSON → vachana-vc-v1 → WAV
│   └── interview/
│       ├── turn/route.ts          # (Phase 2) POST → Gemini → next question
│       └── compile-chapter/route.ts # (Phase 2) POST → Gemini → heirloom letter
│
├── ARCHITECTURE.md                # ← this file
├── AGENTS.md                      # Agent instructions
├── .env.example                   # Non-secret template
├── plan.md                        # Original product spec
├── next.config.mjs
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## 4. Data flow

### 4a. Voice calibration (speaker fingerprint)

```
Browser mic
  → Silero VAD (vad-recorder.ts) — speech end detection, 28s cap
  → Float32Array PCM 16kHz mono
  → wav-encoder.ts → WAV Blob
  → POST /api/gnani/voice-clone/embedding (multipart)
    → Gnani vachana-vc-v1 → [1, 768] embedding tensor
  → stored in IndexedDB (local-draft-store.ts) for session
```

### 4b. Interview turn

```
Speaker presses "Begin Turn"
  → Silero VAD records speech
  → WAV blob → POST /api/gnani/stt → transcript text
  → acoustic-prosody.ts analyses PCM → AcousticTelemetry
  → POST /api/interview/turn (transcript + telemetry + history)
    → Configured Gemini Flash model → next question text + distilled excerpt
  → POST /api/gnani/tts (next question text)
    → Gnani Timbre v3 → WAV audio → plays in browser
  → Turn record appended to session history
After turn 5 → POST /api/interview/compile-chapter → heirloom letter
```

### 4c. Capsule sealing

```
heirloom-vault.ts sealHeirloom(bundle, passphrase, unlockAtUtc):
  1. PBKDF2-SHA256 (210,000 iter) → 256-bit AES key from passphrase
  2. AES-256-GCM encrypt bundle → ciphertext + IV + salt + auth tag
  3. tlock-js: compute drand round for unlockAtUtc
  4. tlock encrypt ciphertext → timelock envelope
  5. JSON envelope saved to IndexedDB; user downloads as .heirloom file

openHeirloom(file, passphrase):
  1. Parse JSON envelope
  2. tlock decrypt (fails if current time < unlockAtUtc)
  3. AES-256-GCM decrypt with PBKDF2-derived key from passphrase
  4. Return plaintext bundle
```

---

## 5. API routes specification

All routes share these invariants:
- `Cache-Control: private, no-store`
- Zod-validate all inputs before touching env vars
- Return `ApiErrorEnvelopeSchema` on all errors (never raw exceptions)
- Never include `GNANI_API_KEY` in any response body or error message
- Respond `CONFIG_MISSING` if required env var is absent (not 500)

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | none | Checks env vars present; never calls paid APIs |
| `/api/gnani/stt` | POST multipart | server-side key | Audio → transcript via Gnani Prisma v3 |
| `/api/gnani/tts` | POST JSON | server-side key | Text → WAV via Gnani Timbre v3 |
| `/api/gnani/voice-clone/embedding` | POST multipart | server-side key | 3 clips → [1,768] embedding |
| `/api/gnani/voice-clone/synthesize` | POST JSON | server-side key | Text + embedding → voice-cloned WAV |
| `/api/interview/turn` | POST JSON | server-side key | Turn history → Gemini → next question |
| `/api/interview/compile-chapter` | POST JSON | server-side key | Full session → Gemini → heirloom letter |

---

## 6. Concurrency & rate limits

Gnani allows **1 concurrent request per API key**. Because Vercel serverless functions are stateless, an in-process queue/singleton does not work.

**Chosen strategy (no Redis):**
1. Auto-retry once after 1500ms on HTTP 429 (`callGnaniWithRetry`)
2. UI flight-lock: disable voice action buttons while a request is in-flight (prevents duplicate submissions from the browser)

This is intentionally simple for the hackathon scope. A production system would add a Redis-backed queue or Vercel KV.

---

## 7. Supported languages

Exactly **10 languages** — what Gnani AI actually supports. No more, no fewer.

| Code | Language | BCP-47 |
|---|---|---|
| EN | English | `en-IN` |
| HI | Hindi | `hi-IN` |
| TA | Tamil | `ta-IN` |
| KN | Kannada | `kn-IN` |
| TE | Telugu | `te-IN` |
| ML | Malayalam | `ml-IN` |
| MR | Marathi | `mr-IN` |
| BN | Bengali | `bn-IN` |
| GU | Gujarati | `gu-IN` |
| PA | Punjabi | `pa-IN` |

Spanish, French, Mandarin, and Japanese are **not supported** and must not appear anywhere in the product.

---

## 8. Environment variables

| Variable | Required | Scope | Description |
|---|---|---|---|
| `GNANI_API_KEY` | Yes | Server only | Gnani Vachana API key — never in `NEXT_PUBLIC_*` |
| `GNANI_API_BASE_URL` | Yes | Server only | Base URL for Gnani (default: `https://api.vachana.ai`) |
| `REASONING_API_KEY` | Yes | Server only | Google AI Studio key for Gemini |
| `REASONING_BASE_URL` | Yes | Server only | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `REASONING_MODEL` | Yes | Server only | `gemini-3.8-flash` |
| `NEXT_PUBLIC_DRAND_CHAIN_HASH` | Yes | Public (client) | `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971` |
| `NEXT_PUBLIC_DRAND_GENESIS_TIME` | Yes | Public (client) | `1692803367` (Unix seconds) |
| `NEXT_PUBLIC_DRAND_PERIOD_SECONDS` | Yes | Public (client) | `3` |

**Security rule:** `GNANI_API_KEY` and `REASONING_API_KEY` must only appear in Vercel server-side environment variables, never in `NEXT_PUBLIC_*` and never committed to source control.

---

## 9. Interview modes (7 total)

| Mode ID | Display Name | Focus |
|---|---|---|
| `childhood_roots` | Childhood Roots | Earliest memories, home, formative places |
| `life_wisdom` | Life Wisdom | Advice, lessons learned, regrets navigated |
| `turning_point` | Turning Point | A defining decision or pivot moment |
| `love_and_family` | Love & Family | Partnership, parenting, family stories |
| `cross_lingual_bridge` | Cross-Lingual Bridge | Multilingual storytelling across generations |
| `milestone_letter` | Milestone Letter | Addressed to a specific recipient for a future date |
| `gratitude_unsaid` | Gratitude Unsaid | Things never said aloud to a person who matters |

Each mode drives a 5-turn interview (configurable). Gemini receives the mode as a system-level context injection that shapes question style and follow-up behaviour.

---

## 10. Crypto parameters (tlock)

Drand unchained chain (testnet-independent, public):
- **Chain hash:** `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`
- **Genesis time:** `1692803367` (Unix seconds, UTC)
- **Period:** 3 seconds per round
- **Round formula:** `Math.max(1, Math.ceil((unlockTimestamp_seconds - 1692803367) / 3) + 1)`

PBKDF2 iterations: **210,000**, as specified for this project. The unlock round is rounded up, with round one emitted at genesis, so a beacon is never selected before the requested timestamp.

---

## 11. What is intentionally out of scope

- **No database** — by design. All data lives in the user's browser. This is a privacy-first product.
- **No user authentication** — family members share a device or manually share capsule files.
- **No backend server** — Vercel serverless functions only. Cold-start latency is acceptable for voice operations.
- **No real-time collaboration** — single-device workflow.
- **No push notifications** — the capsule unlock is a manual check by the recipient.

---

## 12. Known risks & open items

| Risk | Severity | Mitigation |
|---|---|---|
| Gnani 429 rate limit | Medium | Auto-retry once at 1500ms + UI flight-lock |
| Silero VAD WASM load time (~1.5MB) | Low | Lazy-load only when interview starts |
| tlock decryption on old devices | Low | Web Crypto API baseline is 2015+; acceptable |
| Vercel cold start on voice routes | Low | 3–5s acceptable for voice operations |
| localStorage quota (~5MB) | Low | Only metadata stored; audio never in localStorage |
| Local Git history created; remote not connected | Low | Connect the user-owned repository before deployment |

## 13. Implementation and release handoff — 6 November 2026

See `RELEASE_CHECKLIST.md` for verified checks, live acceptance steps, and deployment limits. The user explicitly approved correcting language and privacy claims: there are ten supported entries, and no provider zero-retention/training guarantee is asserted. The existing language list entries and the legacy crypto module remain intact. The real capsule workflow uses `lib/crypto/heirloom-vault.ts`; labelled previews retain the older demo helpers. Working drafts are local but not encrypted at rest. Real timelock opening requires the public drand beacon.
