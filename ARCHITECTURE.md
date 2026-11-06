# Living Heirloom architecture

Updated 6 November 2026. This document describes the current implementation. See the [API reference](docs/API.md) for field-level contracts and the [release checklist](RELEASE_CHECKLIST.md) for verification status.

## System and scope

Living Heirloom records a consenting storyteller, conducts a five-answer interview, compiles a letter, optionally creates cloned narration, and exports a passphrase-protected timelock capsule. A recipient can open the downloaded file after its selected unlock time using the passphrase and public drand beacon.

The application uses Next.js App Router and React, TypeScript, Tailwind CSS, Zod, browser Web Crypto, idb-keyval, Silero VAD, and tlock-js. Server routes proxy Gnani speech APIs and a configurable OpenAI-compatible reasoning endpoint. Production hosting is prepared for Vercel Node.js functions, not static-only hosting. Node.js 24.x and pnpm 12.5.1 are pinned.

There is no application database, account system, cloud synchronization, scheduled message delivery, or global request queue. Local persistence is tied to the browser and origin. The latest compiled bundle is shown in the real capsule panel; this is not a multi-capsule library.

## Page boundaries

| Route                                   | Responsibility                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------- |
| `/`                                     | Approved editorial landing design, with explicitly illustrative previews               |
| `/vault`                                | Real family profiles, calibration, interview entry, and capsule workflow; starts empty |
| `/vault/interview?mode=childhood_roots` | Real recording and adaptive interview screen                                           |
| `/demo`                                 | Fictional family profiles, historical examples, and simulated interactions             |

The real vault does not depend on the legacy mock store. Demo files remain in their existing locations where needed for the preserved design; the directory name alone does not establish production ownership. `lib/local-crypto.ts` and `lib/voice-synth.ts` are legacy demonstration helpers. They must not be substituted for production capsule encryption or Gnani narration.

## Module ownership

| Module                                       | Responsibility                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `lib/product-contracts.ts`                   | Zod schemas, supported languages, interview modes, API and capsule envelopes                         |
| `hooks/useHeirloomStudio.ts`                 | Browser state machine, recording, provider sequence, draft recovery, compilation, synthesis, sealing |
| `lib/browser-api.ts`                         | Single-flight guard within one browser JavaScript instance                                           |
| `lib/audio/`                                 | VAD lifecycle, WAV encoding, acoustic analysis                                                       |
| `lib/gnani/`                                 | Retry helper, provider calls, multilingual TTS normalization                                         |
| `lib/server/`                                | Shared validation, configuration, safe errors, provider requests, WAV response handling              |
| `lib/crypto/heirloom-vault.ts`               | Actual AES-GCM plus drand timelock seal/open protocol                                                |
| `lib/storage/local-draft-store.ts`           | IndexedDB persistence for sessions, audio, embeddings, and latest bundle                             |
| `app/vault/page.tsx`                         | Real profile and workspace orchestration                                                             |
| `components/vault/interview-room.tsx`        | Live waveform, acoustic HUD, recording and answer controls                                           |
| `components/vault/capsule-release-panel.tsx` | Real letter, narration, sealing, download, and opening                                               |
| `components/ui/`                             | Shared themed controls, including the custom picker                                                  |
| `scripts/copy-vad-assets.mjs`                | Copies installed VAD/ONNX assets before dev and build                                                |

See the [developer guide](docs/DEVELOPMENT.md) for the complete storage map and contributor workflow.

## Recording and interview flow

1. A user selects a storyteller and grants explicit consent before microphone access or external processing.
2. Voice calibration records three passages of approximately eight seconds. The embedding endpoint returns a validated `[1, 768]` tensor representation, stored by member ID. Failed embedding creation can reuse saved clips.
3. The interview records 16 kHz mono PCM. VAD ends an answer after four seconds of silence; manual stop and a 28-second hard cap also apply. Tracks and audio resources are released on completion, cancellation, or error.
4. The WAV and telemetry are saved locally before provider calls. STT creates a transcript; the reasoning route receives text, telemetry, mode, and history. Original audio fields are emptied before reasoning requests.
5. The reasoning response contains a follow-up question and distilled excerpt. Gnani TTS speaks the question; blocked autoplay has a manual playback path. The completed turn is persisted. A failed request can retry the saved answer.
6. After exactly five answers, compilation produces a 150–250-word letter. Creating a recipient-language version uses compilation in that language and clears previously generated cloned narration.
7. Optional cloned narration uses the selected speaker's real embedding. A capsule can also preserve original recordings without a voice embedding or cloned track.

A restored session is scoped by member and mode. The quick studio uses its own `my-voice` member ID. Successful calibration persists independently from the current interview session.

### Acoustic telemetry

Analysis uses 480-sample frames, equivalent to 30 ms at 16 kHz. RMS is expressed in dBFS with a -60 dB floor. Frames below -40 dB are silent. Consecutive silent frames determine `maxPauseMs`; the silent-frame fraction determines `silenceRatio`. Autocorrelation estimates pitch, and its coefficient of variation produces `pitchJitterPct`.

| State                 | Rule                                                                |
| --------------------- | ------------------------------------------------------------------- |
| `hesitant_vulnerable` | Pause exceeds 2000 ms or silence ratio exceeds 0.45                 |
| `animated_engaged`    | Otherwise, pitch jitter exceeds 15% and silence ratio is below 0.25 |
| `calm_reflective`     | All remaining inputs                                                |

These labels are signal heuristics for question pacing. They do not diagnose emotion or health.

## Server boundary

Seven routes are implemented. All responses use `Cache-Control: private, no-store`. Inputs are validated before provider configuration checks and paid calls; errors use a shared safe envelope. Browser Origin headers, when present, must match the request origin. This is not user authentication.

| Method and route                         | Processing                                                |
| ---------------------------------------- | --------------------------------------------------------- |
| `GET /api/health`                        | Configuration presence and timestamp; no provider request |
| `POST /api/gnani/stt`                    | Consented WAV and language to Prisma v3.0 STT             |
| `POST /api/gnani/voice-clone/embedding`  | Three consented clips to vachana-vc-v1 embedding          |
| `POST /api/gnani/tts`                    | Normalized text to Timbre v3.0 narration                  |
| `POST /api/gnani/voice-clone/synthesize` | Consented text and embedding to cloned narration          |
| `POST /api/interview/turn`               | Transcript, mode, telemetry, and history to reasoning     |
| `POST /api/interview/compile-chapter`    | Five turns to a recipient-addressed letter                |

The six provider routes explicitly use Node.js and a 60-second maximum duration. Gnani calls use a 25-second request timeout, reasoning calls 30 seconds. HTTP 429 from Gnani retries once after 1500 ms. Browser locking prevents overlapping actions within one JavaScript instance; independent tabs, devices, and serverless instances can still overlap.

Generated WAV output is accumulated and validated before response headers are returned, capped at 15 MB, then delivered in bounded 64 KiB stream chunks without a Content-Length header. This supports streamed hosting responses; it is not progressive playback directly from the provider. Incoming recordings remain capped at 28 seconds. Exact request formats, limits, and the nine error codes are documented in the [API reference](docs/API.md).

## Contracts and languages

`lib/product-contracts.ts` is the source of truth for persisted and network contracts. Ten language codes are supported: `en-IN`, `hi-IN`, `ta-IN`, `kn-IN`, `te-IN`, `ml-IN`, `mr-IN`, `bn-IN`, `gu-IN`, and `pa-IN`.

Seven interview mode IDs are supported: `childhood_roots`, `life_wisdom`, `turning_point`, `love_and_family`, `cross_lingual_bridge`, `milestone_letter`, and `gratitude_unsaid`. Each requires five completed answers before compilation.

Do not infer additional provider languages from historical copy or automatically translate text in the TTS endpoint. Recipient-language letter creation is a separate reasoning operation. Speakers should review generated wording and pronunciation.

## Storage and privacy

Real profiles use localStorage key `living-heirloom-real-members-v1`. Theme and legacy demo state use separate keys. IndexedDB database `living-heirloom-drafts`, object store `drafts`, holds sessions, pending and calibration WAVs, embeddings, the latest bundle, and latest sealed file.

Drafts, transcripts, and reusable embeddings are not encrypted at rest. Clearing browser site data removes them; downloaded backups are separate. Localhost, preview URLs, the production hostname, and custom domains have separate storage.

Gnani receives submitted voice/text/embedding inputs. Reasoning receives transcript, telemetry, and interview context. The application does not intentionally persist archive contents on its server, but hosting and provider retention are governed by their services. Vercel Analytics is integrated in production. There is no verified zero-retention enclave guarantee. See [privacy and data handling](docs/PRIVACY.md).

## Capsule protocol

`sealHeirloom` validates the bundle and passphrase, then:

1. Derives an AES-256 key using PBKDF2-SHA256, 210,000 iterations, and a fresh random 16-byte salt.
2. Encrypts the serialized bundle with AES-256-GCM and a fresh random 12-byte IV. Capsule metadata is authenticated as additional data.
3. Timelock-encrypts the AES ciphertext using tlock-js and the pinned public drand chain.
4. Produces a schema-validated version-one `.heirloom` JSON envelope for local persistence and download.

The envelope exposes unlock metadata, algorithm identifiers, salt, IV, and authentication tag; the family bundle is encrypted. A passphrase of at least twelve characters is required, but length alone does not guarantee strength.

| Parameter         | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Chain hash        | `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971` |
| Genesis Unix time | `1692803367`                                                       |
| Period            | 3 seconds                                                          |
| Round             | `Math.max(1, Math.ceil((unlockSeconds - 1692803367) / 3) + 1)`     |

Round one is emitted at genesis. Rounding up and accounting for that initial round avoids selecting a beacon before the requested time. `openHeirloom` checks the lock, retrieves the public beacon, reverses timelock encryption, derives the passphrase key, and authenticates/decrypts the bundle. Future locks and wrong passphrases fail. There is no recovery bypass, fully offline first opening, or guarantee of indefinite beacon availability.

## Deployment and verification

The eight application environment settings are listed in `.env.example`; private provider keys remain server-only. The three public drand settings document the pinned chain; changing them alone does not migrate the capsule protocol. The [Vercel guide](docs/DEPLOYMENT.md) covers Corepack, build settings, generated assets, function limits, smoke checks, and rollback.

Vitest exercises provider boundaries, audio, consent/error paths, flight locking, and real encryption with a public historical drand fixture. Local verification reports 86 passing tests across 14 files, successful type checking, and a successful production build. Real-speaker/provider acceptance and actual cloud deployment remain pending. Public paid routes have no account authentication or shared rate limiter; deployment access and provider spending controls require operator attention before public release.
