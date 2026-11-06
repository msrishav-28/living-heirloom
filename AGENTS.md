# AGENTS.md — Living Heirloom Agent Instructions

> Current user-approved overrides (6 November 2026): ten supported languages, shared custom dropdowns instead of native selects, semantic light/dark theme colors, waveform branding, real empty-state `/vault`, and a separately labelled `/demo`. User authorized evidence-based removal of unused generator scaffolding. Protected legacy store/crypto files remain for demo compatibility. See RELEASE_CHECKLIST.md for current implementation and acceptance status.

> **For agents (AI or human) working on this codebase.** Read this before touching a single file.
> This project is a $500K-budget hackathon entry due **10 November 2026, 11:59 PM IST**.
> Every incomplete stub, every fake test, every broken demo state is a contractual defect.

---

## 0. Mandatory pre-work before every session

1. **Re-read `ARCHITECTURE.md`** — the full spec. Do not work from memory.
2. **Run the existing build:** `pnpm build` — it must be clean before and after your work.
3. **Survey every file you will touch** before editing. Never assume a file you have not opened is irrelevant.
4. **Search for twins** — if you add a pattern (a hook call, an error type, a constant), grep for where the same pattern exists elsewhere and keep it consistent.
5. **Never invent** API field names, library behaviours, CLI flags, or HTTP semantics. Read the local code or the official docs. If uncertain, stop and say so.

---

## 1. What is complete (do not touch without explicit permission)

| File / Area | Status | Note |
|---|---|---|
| `lib/heirloom-vault-store.ts` | ✅ Done | Indian family seed data, 11 languages, correct EncryptedHeirloomPacket fields |
| `lib/local-crypto.ts` | ✅ Done | AES-256-GCM browser encryption; `timestampIso` and `authTagPreview` are correct field names |
| `app/layout.tsx` | ✅ Done | No v0 generator tag, correct title, honest description |
| `public/manifest.json` | ✅ Done | "10 Indian languages and English" |
| `next.config.mjs` | ✅ Done | `ignoreBuildErrors` removed |
| `app/vault/page.tsx` line 194 | ✅ Done | "11 Languages" |
| All landing page components | ✅ Done | No "50+" false claims except the accurate "50+ years" in timelock section |
| `.originkit/` folder | ✅ Deleted | Platform artifact removed |

---

## 2. Build order (do not skip phases; each phase is a prerequisite for the next)

### Phase 1 — Foundation (no API keys needed)

**Goal:** Every subsequent phase imports from these files. Build them first. Build them completely.

#### 2.1 Install packages

```bash
pnpm add zod idb-keyval tlock-js @ricky0123/vad-web
pnpm add -D vitest @vitest/coverage-v8 @vitejs/plugin-react jsdom
```

Run with `BypassSandbox: true` on Windows.

#### 2.2 `.env.example` (project root)

```ini
GNANI_API_KEY=""
GNANI_API_BASE_URL="https://api.vachana.ai"
REASONING_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
REASONING_API_KEY=""
REASONING_MODEL="gemini-2.0-flash"
NEXT_PUBLIC_DRAND_CHAIN_HASH="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
NEXT_PUBLIC_DRAND_GENESIS_TIME="1692803367"
NEXT_PUBLIC_DRAND_PERIOD_SECONDS="3"
```

#### 2.3 `lib/product-contracts.ts` — All Zod schemas

Must export:
- `SupportedLanguageSchema` — union of all 11 `speechLang` BCP-47 codes
- `HeirloomModeSchema` — 7 mode IDs (see ARCHITECTURE §9)
- `AcousticStateSchema` — `'hesitant_vulnerable' | 'calm_reflective' | 'animated_engaged'`
- `AcousticTelemetrySchema` — `{ rmsDb, maxPauseMs, silenceRatio, pitchJitterPct, durationSeconds, acousticState }`
- `GnaniSpeakerEmbeddingSchema` — `{ embedding: string, shape: [1, 768], dtype: 'torch.bfloat16' }`
- `InterviewTurnRecordSchema` — per-turn record (question, transcript, telemetry, distilledExcerpt)
- `NextTurnRequestSchema` / `NextTurnResponseSchema`
- `CompileChapterRequestSchema` / `CompiledHeirloomChapterSchema`
- `ApiErrorEnvelopeSchema` — `{ ok: false, code: ErrorCode, message: string }` where `ErrorCode` is a union of exactly 9 codes:
  - `CONFIG_MISSING`, `INVALID_INPUT`, `GNANI_UPSTREAM_ERROR`, `GNANI_RATE_LIMIT`, `GEMINI_UPSTREAM_ERROR`, `TIMELOCK_FUTURE`, `CRYPTO_FAILURE`, `STT_EMPTY`, `INTERNAL_ERROR`
- `HeirloomCapsuleFileSchema` — the `.heirloom` download JSON envelope

#### 2.4 `lib/gnani/text-normalizer.ts`

```typescript
export function normalizeTextForGnaniTTS(text: string, langCode: string): string
```

Converts before sending to Gnani TTS:
- Digits to words (locale-aware): `2024` → `two thousand and twenty-four`
- Currency: `₹1,500` → `rupees fifteen hundred`
- Ampersand: ` & ` → ` and `
- Honorifics: `Dr.` → `Doctor`, `Prof.` → `Professor`, `Smt.` → `Shreemati`, `Shri.` → `Shri`
- Slash dates: `14/10/2026` → `fourteenth October twenty twenty-six`

**Tests:** `lib/gnani/__tests__/text-normalizer.test.ts`
- Known input → known output for each rule
- Edge: empty string returns empty string
- Edge: string with no special chars returns unchanged

#### 2.5 `lib/gnani/client.ts`

```typescript
export class GnaniUpstreamError extends Error {
  constructor(public readonly statusCode: number, message: string) { super(message) }
}

export async function callGnaniWithRetry<T>(fn: () => Promise<T>): Promise<T>
// Calls fn(). On HTTP 429, waits 1500ms, calls fn() once more. On any other error, throws immediately.
// No in-process singleton queue (Vercel stateless — it won't work).
```

**Tests:** `lib/gnani/__tests__/client.test.ts`
- Success path: fn called once, result returned
- 429 path: fn called twice (second after delay), result from second call returned
- Non-429 error: fn called once, error re-thrown immediately
- Double 429: second attempt also 429 → `GnaniUpstreamError` thrown

#### 2.6 `vitest.config.ts` (project root)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
```

---

### Phase 2 — Server routes (needs API keys in `.env.local`)

**Before starting:** confirm `pnpm run dev` works and `/api/health` returns 200.

All 7 routes share these invariants (enforce mechanically, not by convention):

```typescript
// At the top of every route handler:
response.headers.set('Cache-Control', 'private, no-store')

// Input validation — before anything else:
const parsed = SomeSchema.safeParse(await req.json())
if (!parsed.success) return errorEnvelope('INVALID_INPUT', parsed.error.message, 400)

// Config check — before the first paid call:
if (!process.env.GNANI_API_KEY) return errorEnvelope('CONFIG_MISSING', 'GNANI_API_KEY not set', 503)

// Error handling — never leak the API key:
catch (err) {
  if (err instanceof GnaniUpstreamError) {
    if (err.statusCode === 429) return errorEnvelope('GNANI_RATE_LIMIT', 'Upstream rate limited', 429)
    return errorEnvelope('GNANI_UPSTREAM_ERROR', 'Gnani call failed', 502)
  }
  return errorEnvelope('INTERNAL_ERROR', 'Unexpected error', 500)
}
```

#### Routes to create:

1. **`app/api/health/route.ts`** — GET — returns `{ ok: true, gnaniConfigured: boolean, geminiConfigured: boolean, timestamp: string }`. Makes no paid API calls.

2. **`app/api/gnani/stt/route.ts`** — POST multipart (`audio`: WAV file, `lang`: BCP-47 code) → `{ transcript: string, confidence: number, durationMs: number }`. Calls Gnani Prisma v3.0 STT. If transcript empty after trimming, return `STT_EMPTY` error.

3. **`app/api/gnani/voice-clone/embedding/route.ts`** — POST multipart (3 × WAV clips) → `GnaniSpeakerEmbeddingSchema`. Calls Gnani vachana-vc-v1 embedding endpoint.

4. **`app/api/gnani/tts/route.ts`** — POST JSON (`{ text: string, lang: string, tone?: string }`) → binary WAV (`Content-Type: audio/wav`). Normalise text via `normalizeTextForGnaniTTS` before calling Gnani Timbre v3.0.

5. **`app/api/gnani/voice-clone/synthesize/route.ts`** — POST JSON (`{ text: string, lang: string, embedding: GnaniSpeakerEmbedding }`) → binary WAV. Calls vachana-vc-v1 synthesis endpoint.

6. **`app/api/interview/turn/route.ts`** — POST JSON (`NextTurnRequestSchema`) → `NextTurnResponseSchema`. System prompt includes the interview mode and acoustic state from telemetry. Instructs Gemini to: (a) ask the follow-up question, (b) provide a `distilledExcerpt` (1–2 sentence distillation of the speaker's answer).

7. **`app/api/interview/compile-chapter/route.ts`** — POST JSON (`CompileChapterRequestSchema`) → `CompiledHeirloomChapterSchema`. Sends all 5 turns to Gemini with instruction to produce a heirloom letter of 150–250 words in the voice of the speaker, addressed to the recipient.

---

### Phase 3 — Browser Audio

#### 3.1 `lib/audio/wav-encoder.ts`

```typescript
export function encodeFloat32ToWav16kHzMono(
  samples: Float32Array,
  sampleRate = 16000
): Blob
```

- Output: standard RIFF WAV, 16-bit PCM, mono, 16kHz
- Hard cap: 28 seconds (448,000 samples at 16kHz). Truncate silently if exceeded.
- Must produce correct RIFF header (`RIFF`, `WAVE`, `fmt `, `data` chunks).

**Tests:** `lib/audio/__tests__/wav-encoder.test.ts`
- Verify first 4 bytes are `52 49 46 46` ("RIFF")
- Verify bytes 8–11 are `57 41 56 45` ("WAVE")
- Verify chunk size fields are arithmetically correct
- Verify 1-second silence (all zeros) produces correct byteLength (16000 × 2 + 44 = 32044)
- Verify samples beyond 28s are truncated

#### 3.2 `lib/audio/acoustic-prosody.ts`

```typescript
export function analyzePcm16kHzTurn(samples: Float32Array): AcousticTelemetry
```

Algorithm (non-negotiable — this drives Gemini's interview adaption):
- **Frame size:** 480 samples (30ms at 16kHz)
- **RMS per frame:** `sqrt(mean(frame² ))`; `rmsDb = 20 * log10(rms)` (clamp to -60 dBFS min)
- **Silence detection:** frame is silent if `rmsDb < -40`
- **maxPauseMs:** longest consecutive silent stretch (ms)
- **silenceRatio:** total silent frames / total frames (0.0 – 1.0)
- **F0 jitter (pitchJitterPct):** autocorrelation pitch detection per frame; jitter = std(f0_values) / mean(f0_values) × 100
- **acousticState:**
  - `hesitant_vulnerable` if `maxPauseMs > 2000` OR `silenceRatio > 0.45`
  - `animated_engaged` if `pitchJitterPct > 15` AND `silenceRatio < 0.25`
  - `calm_reflective` otherwise

**Tests:** `lib/audio/__tests__/acoustic-prosody.test.ts`
- Pure silence (all zeros): `acousticState === 'hesitant_vulnerable'`, `rmsDb ≈ -60`, `silenceRatio === 1.0`
- 1-second pure tone (440Hz): `acousticState === 'calm_reflective'`, `rmsDb > -20`
- Interleaved silence/speech: verify `maxPauseMs` is correct to within ±30ms

#### 3.3 `lib/audio/vad-recorder.ts`

Wrapper around `@ricky0123/vad-web`. Exposes:

```typescript
export interface VADRecorderOptions {
  onSpeechEnd: (samples: Float32Array) => void
  onError: (err: Error) => void
  hardCapSeconds?: number  // default 28
}
export async function startVADRecorder(opts: VADRecorderOptions): Promise<() => void>
// returns a stop() function
```

- Loads Silero VAD WASM lazily (import only when called)
- Hard cap: stop recording after `hardCapSeconds` even if no speech-end event fires
- Must release microphone on stop (call `mediaStream.getTracks().forEach(t => t.stop())`)
- Never send audio to server — that is the caller's responsibility

---

### Phase 4 — Crypto + Storage

#### 4.1 `lib/crypto/heirloom-vault.ts`

```typescript
export async function sealHeirloom(
  bundle: HeirloomCapsuleBundle,
  passphrase: string,
  unlockAtUtc: Date
): Promise<HeirloomCapsuleFile>

export async function openHeirloom(
  file: HeirloomCapsuleFile,
  passphrase: string
): Promise<HeirloomCapsuleBundle>
// throws TimelockFutureError if current time < unlockAtUtc
// throws WrongPassphraseError if AES-GCM auth tag fails
```

Steps for `sealHeirloom`:
1. PBKDF2-SHA256, 210,000 iterations, random 16-byte salt → 256-bit AES key
2. AES-256-GCM, random 12-byte IV → `{ ciphertextHex, ivHex, saltHex, authTagHex }`
3. `tlock-js`: compute round = `Math.floor((unlockAtUtc.getTime()/1000 - 1692803367) / 3)`, timelock encrypt ciphertextHex with the drand chain
4. Assemble `HeirloomCapsuleFileSchema` envelope, return as JSON-serialisable object

**Tests:** `lib/crypto/__tests__/heirloom-vault.test.ts`
- Round-trip: `sealHeirloom` → `openHeirloom` with correct passphrase → original bundle recovered
- Wrong passphrase: `openHeirloom` throws `WrongPassphraseError`
- Future timelock: mock current time to past, verify `openHeirloom` throws `TimelockFutureError`

#### 4.2 `lib/storage/local-draft-store.ts`

Thin wrapper around `idb-keyval`. Exports:

```typescript
export const draftStore = {
  saveSession(sessionId: string, session: InterviewSession): Promise<void>
  getSession(sessionId: string): Promise<InterviewSession | undefined>
  saveEmbedding(memberId: string, embedding: GnaniSpeakerEmbedding): Promise<void>
  getEmbedding(memberId: string): Promise<GnaniSpeakerEmbedding | undefined>
  clearSession(sessionId: string): Promise<void>
}
```

No tests needed for this thin wrapper (idb-keyval is tested upstream), but do add a JSDoc comment explaining that the IndexedDB store is named `'living-heirloom-drafts'`.

---

### Phase 5 — Master Hook `hooks/useHeirloomStudio.ts`

This is the top-level state machine the UI calls. It wires Phases 1–4 together.

```typescript
export interface HeirloomStudioState {
  phase: 'idle' | 'calibrating' | 'interviewing' | 'compiling' | 'sealing' | 'done'
  inFlight: boolean         // true during any API call → disable buttons
  error: string | null
  embedding: GnaniSpeakerEmbedding | null
  session: InterviewSession | null
  compiledChapter: CompiledHeirloomChapter | null
  capsule: HeirloomCapsuleFile | null
}

export function useHeirloomStudio(memberId: string, mode: HeirloomMode): {
  state: HeirloomStudioState
  onCalibrateVoice(): Promise<void>       // records 3 clips → embedding
  onCompleteSpokenTurn(): Promise<void>   // records → STT → Gemini turn
  onGenerateHeirloomCapsule(): Promise<void> // compile-chapter
  onSealTimeCapsule(passphrase: string, unlockAtUtc: Date): Promise<void>
  onDownloadCapsule(): void               // triggers .heirloom download
}
```

Invariants:
- `inFlight` must be `true` for the entire duration of any `fetch()` call
- Never call two Gnani APIs simultaneously (honour the concurrency constraint)
- Persist `embedding` to IndexedDB after successful calibration

---

### Phase 6 — New Interview Screen

#### `app/vault/interview/page.tsx`

- Full-screen page (no vault tab chrome)
- Receives `?mode=<HeirloomMode>` via `useSearchParams()`
- Shows: live waveform visualiser (canvas), acoustic state HUD badge, current question text, record button
- After turn 5: redirect to `/vault?tab=capsules`
- Play the Gnani TTS audio of each question automatically before the user speaks

#### `components/vault/interview-room.tsx`

Interview UI component with:
- Acoustic HUD: shows `acousticState`, `rmsDb`, `maxPauseMs` live
- Waveform: 60fps canvas render of PCM samples from VAD
- Turn counter (1–5)
- Question text
- Record/stop button (disabled when `inFlight`)
- Transcribed answer preview (grey italic text)
- "Complete Turn" CTA

---

### Phase 7 — Wire Existing UI

Surgical wire-ups only. Do **not** rewrite component structure or styling.

1. **`app/vault/page.tsx`** — In Tab 03 (Biographer Interview), add a "Start Voice Interview →" button that navigates to `/vault/interview?mode=childhood_roots` (or whichever mode the user has selected via a dropdown). The 7 modes should be selectable from a `<select>` element.

2. **`components/vault/voice-cloning-lab-workspace.tsx`** — Wire "Record Clip" buttons to call `onCalibrateVoice()` from `useHeirloomStudio`. After all 3 clips, show the real embedding tensor shape badge `[1 × 768]`.

3. **`components/vault/capsule-vault-workspace.tsx`** — Wire download button to call `onDownloadCapsule()`. Produce a real `.heirloom` JSON file from `heirloom-vault.ts`.

4. **`components/recording-studio-modal.tsx`** — Add a DPDP consent checkbox before mic access. Text: "I consent to voice recording and processing under India's Digital Personal Data Protection Act, 2023. My voice data is processed on-device and via Gnani AI for the purpose of creating a family heirloom." The checkbox must be `checked` before the mic button is enabled.

---

### Phase 8 — Tests

Write tests in `__tests__/` subdirectories next to the code they test.

**Production-grade test standards (non-negotiable):**
1. No `.skip` or `.todo` on any test
2. No `expect(true).toBe(true)` or other vacuous assertions
3. No overriding implementation to make tests pass — if the test fails, fix the implementation
4. Test the full error path for every error code the function can return
5. Use real inputs where possible (actual WAV header bytes, actual hex strings)
6. Parametrise with `test.each` where you're testing the same behaviour with multiple inputs

**Test files required:**
- `lib/gnani/__tests__/text-normalizer.test.ts`
- `lib/gnani/__tests__/client.test.ts`
- `lib/audio/__tests__/wav-encoder.test.ts`
- `lib/audio/__tests__/acoustic-prosody.test.ts`
- `lib/crypto/__tests__/heirloom-vault.test.ts`
- `app/api/health/__tests__/route.test.ts`
- `app/api/gnani/stt/__tests__/route.test.ts`
- `app/api/interview/turn/__tests__/route.test.ts`

---

### Phase 9 — Deployment

1. `git init` in project root
2. Create `.gitignore` covering `.env.local`, `node_modules`, `.next`, `coverage`
3. `git add -A && git commit -m "feat: initial Living Heirloom production build"`
4. Create GitHub repo (user action) → `git remote add origin <url>` → `git push -u origin main`
5. Connect to Vercel → import GitHub repo → set all 8 env vars in Vercel dashboard
6. `pnpm build` must pass with zero TypeScript errors
7. Run 6-item acceptance checklist (see §3 below)

---

## 3. Acceptance checklist (do not mark done until all pass)

| # | Test | How to verify |
|---|---|---|
| 1 | Voice embedding captured | Record 3 clips in Voice Lab; badge shows `[1 × 768]` |
| 2 | Multilingual STT | Speak Hindi in interview; transcript appears in Devanagari |
| 3 | Hesitation detection | Pause 3 seconds mid-turn; acoustic HUD shows `hesitant_vulnerable` |
| 4 | Capsule seal | Create capsule; download `.heirloom`; re-upload and decrypt with correct passphrase |
| 5 | Wrong passphrase rejected | Re-upload `.heirloom`; enter wrong passphrase; app shows error |
| 6 | 429 prevention | Two simultaneous record actions; second is UI-blocked; no 429 hits server |

---

## 4. Things agents must never do without explicit user approval

| Action | Why |
|---|---|
| Delete or rewrite `lib/local-crypto.ts` | Crypto primitives are correct and audited |
| Rewrite any landing page component | UI is complete and approved |
| Change the GNANI_LANGUAGES array | 11 languages is an exact product constraint |
| Add Spanish, French, Mandarin, or Japanese anywhere | Not supported by Gnani |
| Use `NEXT_PUBLIC_GNANI_API_KEY` or any browser-visible key | Security violation |
| Commit a `.env.local` file with real values | Security violation |
| Modify tests to make them pass instead of fixing the implementation | Integrity violation |
| Add `ignoreBuildErrors: true` to `next.config.mjs` | Integrity violation |
| Use `supportedLanguages: 54` or any claim above 11 | False advertising |

---

## 5. Useful commands

```bash
pnpm dev              # Start dev server on http://localhost:3000
pnpm build            # TypeScript compile + Next.js production build (must be zero errors)
pnpm test             # Run Vitest test suite
pnpm test --coverage  # With coverage report
```

---

## 6. File encoding note

All project files use Windows CRLF (`\r\n`). When using PowerShell to edit files, use:

```powershell
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$text = $text -replace 'old', 'new'
[System.IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
```

Do not use `Set-Content` with `-NoNewline` on binary or UTF-8 files — it corrupts encoding. Use `write_file` with `Overwrite: true` for complete file rewrites.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
