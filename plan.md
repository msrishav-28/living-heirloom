# you asked

message time: 2026-10-31 22:46:16

i want something similar drafted for our current project; tthese four are just reference i wanted to give ou to know what i mean; i know this is not detailed enough and very vauge; i would be using ai coding agents and humans to build it end to end so it should have eveything down to the smallest detail that anyone can understand and follow blindly; frontned is not a concern yet because i have a prototype mock frontend which i will drop and it can be modified and worked up hooked to real stuff to get frontend worrking

---

# gemini response

I have drafted the complete four-document specification suite for your **Gnani.ai Voice Heirloom & Adaptive Interview Studio**, modeled directly on the four CounterPoint reference documents you shared.

### Plain-Language Summary (What These Four Documents Do)

* **Why there are four documents:** Each file has a strict job so neither a human developer nor an AI coding agent has to guess how the system works.
  1. **`GNANI_REFERENCE.md`** locks down the exact rules, addresses, and safety limits for Gnani.ai’s voice cloning, speech recognition, and expressive speech tools (mirroring `BOLNA_REFERENCE.md`).
  2. **`Heirloom_Product_and_Build_Brief.md`** defines the user experience, emotional tone, 5-question interview rules, Indian-language bridge, and 90-second hackathon demo script (mirroring `CounterPoint_Product_and_Build_Brief.md`).
  3. **`Heirloom_Technical_Build_Spec.md`** sets the non-negotiable engineering laws, privacy boundaries, fail-closed security rules, and live testing checklist (mirroring `CounterPoint_Technical_Build_Spec.md`).
  4. **`TECH_SPEC.md`** gives the step-by-step wiring blueprint—exact server routes, data structures, voice emotion math, Gnani request queue, and time-lock encryption file format—so your existing mock frontend can be hooked up without guesswork (mirroring `TECH_SPEC.md`).
* **How your existing mock frontend fits in:** None of these specifications require throwing away your prototype frontend. Your frontend remains the visual skin; these documents specify the exact data shapes and button actions to wire your mock screens to real browser microphone analysis, real Gnani.ai voice processing, and real browser time-lock encryption.
* **Nothing has been modified yet:** Because you have not dropped your mock frontend files yet, no code has been altered. You can save these four files directly into the root of your repository so any AI coding agent or teammate reads them before writing code.

---

# Document 1: `GNANI_REFERENCE.md`

```markdown
> Revision 31 October 2026. This specification carries forward the locked hybrid browser-plus-gatekeeper scope, Gnani.ai Vachana API contracts, browser DSP requirements, and client-side cryptographic time-lock safeguards. Modeled on the verification and evidence standards of the reference specification suite. No live application repository, student account wallet, or deployed server was modified in this session. Documentation findings do not replace live account acceptance testing against your registered Gnani.ai API key.

# Gnani.ai & Hybrid Audio Stack — Current Provider Evidence

Reviewed 31 October 2026 against official Gnani.ai developer documentation (`docs.gnani.ai`), the Vachana platform (`api.vachana.ai`), the official Python SDK (`gnani-vachana`), and browser WebAudio / WebCrypto standards. Documentation evidence is distinct from live account verification: until a real voice-clone embedding, speech-to-text transcription, and expressive synthesis round-trip are executed with your 5,000 challenge credits, live acceptance remains open.

## 1. Authoritative Sources

| Source | URL / Package | What Was Checked |
|---|---|---|
| Gnani API Docs Index | `https://docs.gnani.ai/` | Model catalog, authentication header, base URLs, error envelope, concurrency limits |
| Quick Start Guide | `https://docs.gnani.ai/api/introduction/quick-start` | Prisma v3.0 STT, Timbre v3.0 TTS, and Voice Cloning two-step flow |
| Voice Clone Embeddings | `https://docs.gnani.ai/api/VC/voice-clone-embeddings` | `POST /api/v1/tts/voice-clone/embeddings`, audio constraints, `[1, 768]` tensor output |
| Voice Cloned TTS (REST & SSE) | `https://docs.gnani.ai/api/VC/vc-sse` | `vachana-vc-v1` payload contract, `speaker_embedding` object, audio config |
| Expressive TTS & Audio Tags | `https://docs.gnani.ai/guides/capabilities/audio-tags` | `timbre-v3.0` 13 polyglot voices, inline emotional expressions, speed multiplier |
| Text Normalization Guide | `https://docs.gnani.ai/guides/capabilities/text-normalization` | Mandatory conversion of digits, dates, symbols, and currency into spoken words |
| Error Reference | `https://docs.gnani.ai/api/resources/errors` | HTTP status codes (`401`, `402`, `422`, `429`, `500`, `503`), `RATE_LIMITED` 1-request cap |
| Gnani Evon v3.3 Model Card | `https://huggingface.co/gnani/gnani-evon-v3.3-30B-A3B` | Apache-2.0 30B-A3B MoE architecture, 11 supported languages, prompt format |
| Drand Timelock (`tlock-js`) | `https://github.com/drand/tlock-js` | Client-side Identity-Based Encryption against League of Entropy quicknet beacon |
| Silero Browser VAD | `@ricky0123/vad-web` | Browser `AudioWorklet` 16 kHz speech boundary detection |

## 2. Resolved Architecture Contract: Why "100% Browser" Uses a Stateless Server Gatekeeper

Your landing page promises local privacy, zero permanent cloud storage of personal stories, and offline-capable playback of saved heirlooms. However, Gnani.ai's APIs (`https://api.vachana.ai`) enforce three non-negotiable server constraints:

1. **Secret Key Protection:** Every request requires `X-API-Key-ID: <GNANI_API_KEY>`. Sending this header directly from browser JavaScript exposes your 5,000 hackathon credits in Chrome DevTools Network inspection.
2. **Browser WebSocket Header Limitation:** Gnani's real-time WebSocket endpoints (`wss://api.vachana.ai/stt/v3/stream` and `wss://api.vachana.ai/api/v1/tts`) require custom HTTP headers (`X-API-Key-ID`) during the WebSocket handshake, which the browser `new WebSocket(url)` API cannot send natively.
3. **Single-Request Concurrency Limit (`429 RATE_LIMITED`):** Gnani's error documentation specifies that standard API keys allow **at most 1 active request at a time**. Concurrent browser requests immediately fail with HTTP `429` (`RATE_LIMITED`) and no `Retry-After` header.

**Mandatory Implementation Consequence:**
* The application uses a **Stateless Next.js Server Gatekeeper** (`/api/gnani/*`) that holds `GNANI_API_KEY` in server-only memory, serializes outbound Gnani requests through an in-memory **FIFO Mutex Queue (concurrency = 1)**, and immediately discards audio buffers after returning the response to the browser.
* **Zero Database Storage of Personal Audio or Embeddings:** The server never writes voice recordings, transcripts, or Gnani speaker embeddings to any cloud database. The 768-dimensional speaker embedding (`[1, 768]`, `torch.bfloat16`), original denoised WAV recordings, transcripts, and synthesized audio capsules are returned directly to the browser and encrypted inside the user's downloadable `.heirloom` capsule file.

## 3. Exact Gnani.ai API Contracts (`https://api.vachana.ai`)

All endpoints require HTTPS, bounded timeouts (25,000 ms for synthesis/cloning, 15,000 ms for STT), no credential-forwarding redirects, and header `X-API-Key-ID: process.env.GNANI_API_KEY`.

### 3.1 Speech-to-Text — Gnani Prisma (`prisma-v3.0`)

* **Endpoint:** `POST https://api.vachana.ai/stt/v3`
* **Headers:**
  * `X-API-Key-ID: <server_api_key>`
  * `Content-Type: multipart/form-data`
* **Input Constraints:**
  * Form field `audio_file`: Mono 16-bit PCM WAV (16,000 Hz recommended), duration strictly `<= 28 seconds` (hard provider cap is 30 seconds; browser VAD enforces a 28-second auto-cut).
  * Optional form fields:
    * `model`: `"prisma-v3.0"` (default; supports automatic language detection and code-mixed speech) or `"prisma-v2.5"`.
    * `language_code`: Optional BCP-47 hint (`"en-IN"`, `"hi-IN"`, `"kn-IN"`, `"ta-IN"`, `"te-IN"`, `"ml-IN"`, `"mr-IN"`, `"bn-IN"`, `"gu-IN"`, `"pa-IN"`). Leave unset when automatic language detection is desired.
    * `output_format`: `"codemix"` (preserves natural English + Indic script mixing), `"native"`, or `"transliterate"`.
* **Expected Response (`200 OK`):**
  ```json
  {
    "transcript": "बचपन में हम लोग summer holidays में मैसूर जाते थे।",
    "detected_language_code": "hi-IN",
    "confidence": 0.94,
    "duration_seconds": 6.4
  }
  ```
* **Normalization Rule:** The server gatekeeper validates the response with Zod. If `transcript` is empty or whitespace-only, return explicit domain code `EMPTY_SPEECH_SEGMENT` so the UI asks the user to repeat their thought without crashing or advancing the interview question.

### 3.2 Voice Cloning — Step 1: Extract Speaker Embedding

* **Endpoint:** `POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings`
* **Headers:**
  * `X-API-Key-ID: <server_api_key>`
  * `Content-Type: multipart/form-data`
* **Input Constraints:**
  * Form field `audio_file`: Clean reference WAV recording of the user's voice, 10 to 25 seconds long (provider hard cap is 30 seconds), 16,000 Hz to 44,100 Hz, mono 16-bit PCM.
  * **Pre-Flight Check:** Browser must verify RMS signal-to-noise ratio and at least 8 seconds of active voiced speech via Silero VAD before uploading, preventing wasted credits on silent or clipped recordings.
* **Expected Response (`200 OK`):**
  ```json
  {
    "speaker_embedding": {
      "embedding": "<base64_or_serialized_payload>",
      "shape": [1, 768],
      "dtype": "torch.bfloat16"
    }
  }
  ```
* **Persistence Rule:** The server validates that `speaker_embedding.shape` equals `[1, 768]` and `speaker_embedding.dtype` equals `"torch.bfloat16"`, then returns this exact object to the browser. The browser stores it in `IndexedDB` (encrypted during session) and embeds it inside the exported `.heirloom` capsule so future letters can be synthesized without re-recording.

### 3.3 Voice Cloning — Step 2: Synthesize Heirloom Capsule in Cloned Voice (`vachana-vc-v1`)

* **Endpoint (REST Full Audio):** `POST https://api.vachana.ai/api/v1/tts/inference`
* **Endpoint (Server-Sent Events Streaming):** `POST https://api.vachana.ai/api/v1/tts/sse`
* **Headers:**
  * `X-API-Key-ID: <server_api_key>`
  * `Content-Type: application/json`
* **Request Body (`application/json`):**
  ```json
  {
    "text": "My dear Arjun, whenever you feel lost, remember our old house in Mysuru.",
    "model": "vachana-vc-v1",
    "speaker_embedding": {
      "embedding": "<exact_string_from_step_1>",
      "shape": [1, 768],
      "dtype": "torch.bfloat16"
    },
    "audio_config": {
      "sample_rate": 44100,
      "num_channels": 1,
      "sample_width": 2,
      "encoding": "linear_pcm",
      "container": "wav"
    }
  }
  ```
* **Output Contract:**
  * `/api/v1/tts/inference` returns binary `audio/wav` bytes (`44.1 kHz`, 16-bit mono PCM).
  * `/api/v1/tts/sse` streams `start`, `chunk` (`{ "audio": "<base64_pcm>", "is_final": false }`), and `complete` (`{ "is_final": true }`) events.
* **Critical Constraint:** Do NOT pass `voice` or `language_code` parameters meant for `timbre-v3.0` when `model` is `"vachana-vc-v1"`, unless verified against live account behavior. Always run text through the mandatory **Text Normalization Pre-Processor** before calling `vachana-vc-v1`.

### 3.4 Expressive AI Interviewer Voice — Gnani Timbre (`timbre-v3.0`)

* **Endpoint:** `POST https://api.vachana.ai/api/v1/tts/inference` (or `/api/v1/tts/sse`)
* **Supported Models:**
  * `"timbre-v3.0"` (Primary): 13 polyglot voices (`Avinash`, `Chetana`, `Devansh`, `Harshad`, `Kalpana`, `Lakshmi`, `Prakash`, `Riyaa`, `Shivani`, `Shubham`, `Tarika`, `Vasudha`, `Yashraj`). Every voice speaks all 10 supported Indian languages plus English (`en-IN`, `hi-IN`, `kn-IN`, `ta-IN`, `te-IN`, `ml-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`) and supports **Expressive Audio Tags** and speed control (`0.85` to `1.15`).
  * `"timbre-v2.5"` (Approved Fallback): 42 language-specific voices (e.g., `Nalini`, `Kaveri`, `Pranav`, `Asmita`, `Deepak`). Never use retired `"timbre-v2.0"`.
* **Request Body (`application/json`):**
  ```json
  {
    "text": "Take all the time you need. That memory sounds very special to you. What do you remember most about the sound of that house?",
    "model": "timbre-v3.0",
    "voice": "Vasudha",
    "language_code": "en-IN",
    "speed": 0.92,
    "audio_config": {
      "sample_rate": 24000,
      "num_channels": 1,
      "sample_width": 2,
      "encoding": "linear_pcm",
      "container": "wav"
    }
  }
  ```
* **Prosody-Driven Speed & Expression Mapping:**
  * When the browser DSP detector flags `acoustic_state = "vulnerable"` or `"hesitant"`, the server sets `speed: 0.90` (gentle pace) and selects a warm voice (`Vasudha` or `Avinash`).
  * When `acoustic_state = "animated"`, the server sets `speed: 1.0`.

## 4. Partner Documentation Findings & Mandatory Implementation Consequences

| Documentation Finding | Required Implementation Consequence |
|---|---|
| Standard Gnani API keys allow **1 concurrent synthesis request** (`429 RATE_LIMITED` with no `Retry-After` header) | Implement a server-side singleton `GnaniRequestQueue` with `maxConcurrency = 1`, FIFO ordering, 1,200 ms exponential backoff on `429`, and maximum queue depth of 5. |
| Gnani TTS models mispronounce raw digits, dates (`1985`), currency (`₹500`), and abbreviations (`Dr.`, `St.`) | Run deterministic server-side `normalizeTextForGnaniTTS(text, lang)` AND instruct the LLM interviewer to output all numbers/years in full spoken words (`"nineteen eighty-five"`). |
| Gnani REST STT (`/stt/v3`) and Voice Clone Embedding (`/voice-clone/embeddings`) reject audio > 30 seconds | Browser Silero VAD + visual ring timer enforces a soft warning at 22 seconds and an automatic clean segment cutoff at 28 seconds. |
| Sending long leading/trailing silence to `prisma-v3.0` degrades automatic language detection | Browser VAD strips leading and trailing non-speech frames before encoding the 16 kHz mono WAV buffer. |
| Gnani `vachana-vc-v1` returns a `[1, 768]` `torch.bfloat16` speaker embedding object | Validate exact shape `[1, 768]` with Zod. Store the JSON embedding inside the encrypted `.heirloom` capsule so the user owns their voice model offline. |
| Gnani Evon v3.3 (`gnani-evon-v3.3-30B-A3B`) is open-weight on Hugging Face (`Apache-2.0`) and not hosted on `api.vachana.ai` | Configure the reasoning adapter (`src/lib/server/reasoning.ts`) to use an OpenAI-compatible endpoint (Groq `llama-3.3-70b-versatile` or self-hosted vLLM `gnani/gnani-evon-v3.3-30B-A3B`) with Evon's chat template and explicit provider disclosure. |
| Challenge rules require AI agent disclosure and forbid recording non-consenting third parties (DPDP Act) | Require an explicit pre-session consent checkbox, display a persistent `"AI Interviewer & Voice Synthesis powered by Gnani.ai"` badge, and embed an auditory/metadata watermark in cloned capsules. |

## 5. Recovery Without False Guarantees

No external API guarantees 100% uptime during a live hackathon evaluation. The application must preserve recorded human voice audio first, prevent credit drain, and never fabricate transcripts or fake voice clones:

1. **Raw Human Voice Is Sacred:** The user's original microphone recording (cleaned via WebAudio high-pass + compressor) is saved immediately in browser memory (`IndexedDB`) **before** any network call to Gnani `prisma-v3.0` or `vachana-vc-v1`. If all network calls fail, the user can still export their authentic recorded voice inside an encrypted `.heirloom` capsule.
2. **Primary vs. Alternate TTS Fallback:** If `timbre-v3.0` returns HTTP `500`/`503`, the gatekeeper may fall back once to a validated `timbre-v2.5` voice for that language, or display the interviewer's question on screen with an explicit notice (`"Voice playback unavailable; text prompt shown"`).
3. **Credit Exhaustion (`402 PAYMENT_REQUIRED`):** Fail closed immediately, halt background retries, and show a clear operator banner while keeping existing recorded memories and `.heirloom` decryption 100% functional.

## 6. Live Acceptance Checklist (Before Final Submission on 10 Nov 2026)

- [ ] Confirm `GNANI_API_KEY` is loaded only in server `.env.local` and never appears in `next build` client bundles.
- [ ] Execute a live 15-second reference voice recording and verify `/api/v1/tts/voice-clone/embeddings` returns a valid `[1, 768]` embedding.
- [ ] Synthesize an English and an Indian-language (Hindi/Kannada/Tamil) heirloom message using `vachana-vc-v1` and verify natural audio playback.
- [ ] Speak a code-mixed sentence (Hinglish or Kanglish) into `/stt/v3` (`prisma-v3.0`) and confirm accurate transcription and `detected_language_code`.
- [ ] Pause for 4 seconds and speak softly during an interview turn; verify the browser DSP HUD flags `vulnerable/hesitant` and the interviewer responds with `timbre-v3.0` at `speed: 0.90`.
- [ ] Fire two rapid synthesis clicks in the UI; confirm the server mutex queue serializes them and zero `429 RATE_LIMITED` errors reach the user.
- [ ] Export a `.heirloom` capsule locked 2 minutes into the future with `tlock-js` + `SubtleCrypto` AES-256-GCM; verify decryption fails before the unlock timestamp and succeeds after the timestamp.
```

---

# Document 2: `Heirloom_Product_and_Build_Brief.md`

```markdown
> Revision 31 October 2026. Built for the Gnani.ai Great Indian AI Internship Challenge (`gnani.ai/internship`, deadline 10 November 2026, 11:59 PM IST). Modeled on the product and build governance of the reference specification suite.

# Dharohar (Voice Heirloom Studio)
## Acoustic-Aware Family Memory & Cross-Lingual Voice Preservation Studio

**Status — 31 October 2026:** Core MVP scope locked for Gnani.ai challenge submission.
**Core promise:** Preserve the voice, the wisdom, and the emotion—across generations and languages.
**One line:** Dharohar conducts empathetic, prosody-aware AI voice interviews in Indian and global languages, preserves authentic and cloned voice capsules via Gnani.ai, and locks them in client-side cryptographic time capsules for future delivery.

---

## 1. Product Thesis

75% of people wish they had more recordings of loved ones who passed away. When elders pass, two things vanish: their irreplaceable life stories, and the warmth of their actual voice. Even worse, in millions of Indian families, a generational language barrier separates grandparents (who think and feel most deeply in Hindi, Kannada, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, or Punjabi) from grandchildren raised primarily in English.

Writing heartfelt letters is emotionally paralyzing, and standard voice recorders feel like cold police interrogations.

Dharohar is a warm, acoustic-aware voice studio where anyone can sit down for a 5-question guided conversation. The interviewer listens not just to *what* you say, but *how* your voice sounds—slowing down when your voice drops or hesitates—and packages your real voice, cross-lingual voice capsules, and life lessons into a mathematically time-locked `.heirloom` file that requires zero cloud servers to survive for 30 years.

> Words on paper fade. A voice speaking across time—in a language your grandchild can understand—stays alive forever.

---

## 2. Product Sentiment

Dharohar must feel like sitting at a quiet kitchen table with a deeply attentive biographer, never like a clinical SaaS dashboard.

| We want users to feel | We do not want users to feel |
|---|---|
| Heard, respected, and unhurried | Rushed by an aggressive timer |
| Safe to pause, sigh, or get emotional | Judged or analyzed by a cold machine |
| Proud of their native tongue or Hinglish/Kanglish | Forced to speak stiff, formal English |
| Confident their private memories are mathematically locked | Worried their family audio lives on a startup's database |
| Authentic—real voice first, clearly disclosed AI translation second | Tricked by creepy, undisclosed deepfakes |

The emotional arc is:
**Hesitant → Warmed up → Deeply reflective → Understood → At peace knowing the memory is safe**

---

## 3. Locked MVP Scope (Hackathon Buildathon)

Build only this complete, rock-solid vertical loop:

1. **Consent & Voice Fingerprint Enrollment (20 seconds):** User checks the DPDP voice consent box and reads a short warm-up passage (or speaks freely for 15 seconds). Browser denoises the audio and extracts their `[1, 768]` Gnani speaker embedding (`vachana-vc-v1`).
2. **Adaptive 5-Question Voice Interview:** User chooses one of 4 curated memory themes and speaks in any of the 10 supported Indian languages, English, or code-mixed speech.
3. **Real-Time Browser Acoustic Empathy HUD:** While the user speaks, the browser `WebAudio` DSP engine measures **Vocal Energy (RMS dB)**, **Mid-Thought Hesitation Pauses (>2.0s)**, and **Pitch Stability/Jitter**, feeding live acoustic cues into the interviewer prompt.
4. **Gnani Prisma v3.0 + Timbre v3.0 Turn Loop:** Gnani `prisma-v3.0` transcribes each answer and detects the language; the interviewer generates a warm, prosody-adapted follow-up question spoken aloud by Gnani `timbre-v3.0`.
5. **Heirloom Capsule & Cross-Lingual Bridge:** After 5 questions (or early completion), the studio generates a structured **Memory Chapter** (Title, Core Wisdom Quote, Key Life Lesson, Verbatim Transcript) and lets the user synthesize a **Spoken Letter or Cross-Lingual Translation** in their own cloned voice using Gnani `vachana-vc-v1`.
6. **Client-Side AES-256-GCM + `tlock-js` Time Capsule Export & Live Decryptor:** The browser bundles the original denoised WAVs, cloned audio capsule, `[1, 768]` voice embedding, and transcript into a single encrypted `.heirloom` file locked until a chosen future date, plus a live **"Open & Verify Capsule"** dropzone on the same page so judges can test encryption and decryption immediately.

### In Scope for v1
- Explicit voice consent gate & AI disclosure badge (mandatory challenge compliance)
- 15-second voice enrollment via Gnani `/api/v1/tts/voice-clone/embeddings`
- Real-time WebAudio DSP prosody analyzer + Silero VAD hands-free turn detection
- 5-question adaptive interview using Gnani `prisma-v3.0` (STT) and `timbre-v3.0` (TTS)
- Cross-lingual & written-note synthesis using Gnani `vachana-vc-v1`
- Structured Memory Chapter extraction (Wisdom Quote, Story Summary, Timeline Tags)
- Client-side `SubtleCrypto` AES-256-GCM + `tlock-js` time-lock encryption and decryption studio
- Pre-loaded **Demo Fallback / Judge Quick-Test Mode** (allows testing capsule encryption/decryption and viewing sample telemetry if microphone permissions are denied)

### Out of Scope for v1
- Cloud database storage of user audio or transcripts
- Multi-user social feeds or public sharing portals
- Automated email/SMS cron delivery servers (delivery is via the self-contained `.heirloom` file + printable QR Recovery Card)
- Unverified claims of "50+ languages" (strictly scoped to Gnani's 10 verified Indian languages + English)

---

## 4. Curated Interview Themes (4 Modes)

| Theme ID | Display Name | Opening Question | Adaptive Empathy Focus |
|---|---|---|---|
| `childhood_roots` | Childhood & Roots | "Take me back to the house or street where you grew up. What is the first sound or smell that comes to your mind?" | Sensory nostalgia, family figures, quiet reflection |
| `turning_point` | A Defining Turning Point | "Tell me about a moment in your life when you had to make a hard choice without knowing how it would turn out." | Courage under uncertainty, validating vulnerability |
| `love_and_family` | Love & The People Who Shaped Me | "Who is someone that showed you what real kindness or strength looked like, and what is one moment with them you never want to forget?" | Emotional warmth; slows down pace if voice trembles |
| `letter_to_future` | Wisdom for the Next Generation | "Imagine someone you love is listening to this twenty years from today on a hard day. What do you want them to hear in your voice?" | Direct legacy message, clarity, enduring life advice |

---

## 5. Why Dharohar Wins the Gnani.ai Challenge

| What Gnani.ai Judges Look For | How Dharohar Wins |
|---|---|
| Deep, authentic use of Gnani's stack | Uses **all three Vachana pillars**: `prisma-v3.0` (code-mixed STT), `timbre-v3.0` (expressive interviewer TTS), and `vachana-vc-v1` (`[1, 768]` speaker embedding voice cloning) |
| Hardcore voice & signal engineering | Real-time browser `WebAudio` DSP extracts pause ratio, RMS energy drop, and pitch jitter to steer conversation tone—solving the flat-text STT limitation |
| Indian cultural & multilingual relevance | Solves the **Grandparent-to-Grandchild Language Gap** (e.g., story recorded in Kannada or Hindi, accompanied by an English voice-cloned translation track) |
| Architectural honesty | Fixes the "offline privacy vs. cloud AI" paradox honestly using a stateless mutex gatekeeper + real client-side `SubtleCrypto` AES-256-GCM and `tlock-js` timelock encryption |
| Instant judge testability | Zero-login browser studio with live acoustic telemetry HUD, 1-click voice cloning, and an interactive `.heirloom` decryptor dropzone on the page |

---

## 6. Screen Flow & Hook Points for Your Mock Frontend

Your existing mock frontend will connect to these 5 screens/states:

```text
1. Landing & Architecture Honesty View
   ↓ (Click "Create a Voice Heirloom" + Check DPDP Consent)
2. Voice Enrollment Studio (15s sample → Gnani [1, 768] Embedding Badge)
   ↓ (Select Theme + Language Preference)
3. Live Acoustic Interview Studio (5 turns: Waveform + Prosody HUD + Gnani Prisma/Timbre loop)
   ↓ (Complete Interview)
4. Heirloom Crafting Room (Original Denoised Audio + Memory Chapter + Gnani vachana-vc-v1 Cross-Lingual/Letter Synthesizer)
   ↓ (Set Unlock Date & Passphrase)
5. Time-Lock Vault & Verification Dropzone (Download .heirloom file + Printable QR Card + Live Decrypt & Play Test)
```

---

## 7. Security, DPDP Privacy, and Credit Safeguards

- **Server-Only Key Custody:** `GNANI_API_KEY` and `REASONING_API_KEY` live exclusively in server environment variables; browser code never sees them.
- **Single-Flight Concurrency Protection:** All calls to `api.vachana.ai` pass through a server-side 1-at-a-time queue so rapid user clicks never trigger Gnani's `429 RATE_LIMITED` error.
- **Zero Cloud Retention in Our App:** Our Next.js server holds audio buffers in RAM only for the duration of the HTTP request (~1–3 seconds) and writes zero bytes to disk or database.
- **DPDP Act & Challenge Rule Compliance:** Explicit user consent checkbox before mic activation; clear AI disclosure banner; strict prohibition on uploading third-party phone recordings.
```

---

# Document 3: `Heirloom_Technical_Build_Spec.md`

```markdown
> Revision 31 October 2026. Engineering source brief for human developers and AI coding agents. Modeled on the technical specification and verification rigor of the reference suite.

# Dharohar — Technical Build Specification

This document defines the non-negotiable engineering rules, boundaries, mathematical formulas, and verification gates for building Dharohar end-to-end. Any AI coding agent or engineer working on this repository must follow this specification without inventing endpoints, adding unapproved dependencies, or bypassing security checks.

## 1. Implementation Baseline & Stack Contract

| Layer | Locked Contract |
|---|---|
| **Framework** | Next.js (App Router), React 19, Strict TypeScript (`strict: true`, no implicit `any`), Node 20+ |
| **Frontend Styling** | Existing mock frontend components + Tailwind CSS; preserve founder's visual theme while wiring real state hooks |
| **Browser Audio & DSP** | Native `AudioContext`, `AudioWorkletNode` / `AnalyserNode`, 16 kHz / 44.1 kHz mono WAV encoder (`src/lib/audio/wav-encoder.ts`), and `@ricky0123/vad-web` (Silero VAD) |
| **Voice AI Provider** | Gnani.ai Vachana API (`https://api.vachana.ai`): `prisma-v3.0` (STT), `timbre-v3.0` (Interviewer TTS), `vachana-vc-v1` (Voice Cloning embeddings & synthesis) |
| **Reasoning & Translation** | Server-side OpenAI-compatible chat completion adapter (`src/lib/server/reasoning.ts`) supporting Groq (`llama-3.3-70b-versatile`) or Gnani `Evon v3.3` prompt schema |
| **Client Cryptography** | Native Browser `window.crypto.subtle` (`AES-GCM` 256-bit + `PBKDF2` SHA-256 210,000 iterations) + `tlock-js` (Drand quicknet timelock encryption) |
| **Validation** | Shared `zod` schemas in `src/lib/contracts/heirloom-contracts.ts` for every request, response, telemetry payload, and `.heirloom` file parse |
| **Local Persistence** | Browser `IndexedDB` (`idb-keyval` or native wrapper) for active session crash recovery; zero server database required |

## 2. Non-Negotiable Engineering Laws for Coding Agents

1. **Survey Before Writing Code:** Before modifying any file in the mock frontend repository, inspect `package.json`, directory structure, existing components, and `.env.example`. Produce a short Project Map before altering files.
2. **No Mock Fallbacks Masquerading as Live Success:** Never catch an API error and return a fake transcript or dummy audio buffer as if Gnani succeeded. If `GNANI_API_KEY` is missing or an endpoint fails, return a structured error code (`PROVIDER_UNAVAILABLE`, `CONFIG_MISSING`, `RATE_LIMITED`) and let the UI explicitly offer the labeled **"Offline Demo Simulation"** mode.
3. **Strict Audio Format Enforcement:** Browser `MediaRecorder` defaults to compressed `audio/webm;codecs=opus`, which causes audio decoding inconsistencies across speech APIs. You **must** capture raw `Float32Array` PCM samples via `AudioContext` and encode a deterministic **16-bit Little-Endian Mono WAV (`audio/wav`)** in the browser (`16,000 Hz` for STT, `24,000 Hz` or `44,100 Hz` for Voice Cloning reference) before sending to `/api/gnani/*`.
4. **Mandatory Text Normalization Before Every Gnani TTS Call:** Before sending any text to Gnani `timbre-v3.0` or `vachana-vc-v1`, pass it through `normalizeTextForGnaniTTS(text, languageCode)` to convert numerals (`1975` → `nineteen seventy-five`), currency (`₹100` → `one hundred rupees`), and symbols (`&` → `and`) into spoken words, per Gnani's official Text Normalization guide.
5. **Single-Flight Server Mutex for Gnani API:** Every outbound HTTP call to `https://api.vachana.ai` must execute inside `gnaniQueue.enqueue(fn)` (`src/lib/server/gnani-queue.ts`) so that at most **1 request** is in flight per server process at any millisecond, preventing Gnani's `429 RATE_LIMITED` error.

## 3. Mathematical Specification: Browser Acoustic Prosody Analyzer

To prove to Gnani.ai judges that the interview adapts to vocal emotion rather than flat text alone, `src/lib/audio/prosody-analyzer.ts` must compute the following real-time metrics from the `AnalyserNode` time-domain (`Float32Array`) buffer at 20 frames per second during each user turn:

1. **Root Mean Square (RMS) Vocal Energy (dBFS):**
   $$\text{RMS} = \sqrt{\frac{1}{N} \sum_{i=0}^{N-1} x[i]^2}, \quad \text{Energy}_{\text{dB}} = 20 \log_{10}(\max(\text{RMS}, 10^{-7}))$$
   * Voiced frame threshold: $\text{Energy}_{\text{dB}} > -42\text{ dBFS}$.
   * **Trailing Energy Drop (`energyDropDb`):** Difference between the mean dB of the first third of voiced frames and the final third of voiced frames in the turn. If $\text{energyDropDb} \le -6.0\text{ dB}$, flag `isTrailingOff = true`.

2. **Mid-Thought Hesitation & Silence Ratio:**
   * Track contiguous non-voiced intervals ($\text{Energy}_{\text{dB}} \le -42\text{ dBFS}$) *after* the first voiced syllable and *before* the final voiced syllable of a turn.
   * `maxInternalPauseMs`: Longest internal silence gap in milliseconds.
   * `hesitationCount`: Count of internal pauses where $1,200\text{ ms} \le \text{pause} \le 5,000\text{ ms}$.
   * `silenceRatio`: $\frac{\text{Total internal silence duration}}{\text{Total turn duration}}$.

3. **Fundamental Frequency ($F_0$) Pitch Jitter (Autocorrelation Estimator):**
   * On voiced frames, estimate fundamental frequency $F_0 \in [75\text{ Hz}, 400\text{ Hz}]$ via time-domain autocorrelation lag peak.
   * Compute relative pitch jitter across consecutive voiced frames:
     $$\text{Jitter}_{\%} = \frac{100}{K-1} \sum_{k=1}^{K-1} \frac{|F_0[k] - F_0[k-1]|}{\bar{F}_0}$$

4. **Deterministic Acoustic State Classification:**
   * **`"vulnerable"`:** `maxInternalPauseMs >= 2200` OR (`isTrailingOff === true` AND `meanEnergyDb < -26`) OR `jitterPercent >= 3.2`.
   * **`"hesitant"`:** `hesitationCount >= 2` OR `silenceRatio >= 0.38`.
   * **`"animated"`:** `meanEnergyDb >= -18` AND `silenceRatio < 0.18`.
   * **`"steady"`:** Default state when none of the above thresholds trigger.

This `AcousticTelemetry` object is displayed live in the UI's **Acoustic Empathy HUD** and sent alongside the audio turn to `/api/interview/turn` so the LLM prompt and Gnani `timbre-v3.0` speaking speed (`0.90` for `vulnerable`/`hesitant`, `1.0` for `steady`/`animated`) adapt deterministically.

## 4. Cryptographic Specification: `.heirloom` Time-Locked Capsule Format

To make the privacy and time-lock claims 100% authentic without a backend database:

1. **Inner Archive Payload (`HeirloomPlaintextBundle`):**
   A single UTF-8 JSON document containing:
   - `schemaVersion`: `"1.0.0"`
   - `createdAtUtc`: ISO-8601 UTC string
   - `creatorName`: string
   - `recipientName`: string
   - `unlockAtUtc`: ISO-8601 UTC string
   - `aiDisclosure`: `"Includes AI-assisted interview prompts and Gnani.ai vachana-vc-v1 voice synthesis alongside authentic human voice recordings."`
   - `speakerEmbedding`: `{ embedding: string, shape: [1, 768], dtype: "torch.bfloat16" } | null`
   - `memoryChapter`: `{ title, coreWisdomQuote, narrativeSummary, keyLifeLessons: string[], detectedLanguages: string[] }`
   - `turns`: Array of `{ turnIndex, questionText, transcript, languageCode, acousticState, originalAudioWavBase64 }`
   - `synthesizedCapsules`: Array of `{ id, label, languageCode, text, clonedAudioWavBase64 }`

2. **Two-Layer Client-Side Encryption (`src/lib/crypto/heirloom-crypto.ts`):**
   - **Mode 1 — Cryptographic Network Time-Lock (`tlock-js` via League of Entropy / `drand` Quicknet):**
     - Chain hash: `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971` (`https://api.drand.sh`).
     - Compute the target round number for `unlockAtUtc` using `roundAt(Date.parse(unlockAtUtc), chainInfo)`.
     - Generate a random 256-bit `masterContentKey` via `crypto.getRandomValues(new Uint8Array(32))`.
     - Encrypt `HeirloomPlaintextBundle` locally using `window.crypto.subtle.encrypt({ name: "AES-GCM", iv: random12Bytes }, masterContentKey, plaintextBytes)`.
     - Timelock-encrypt the 32-byte `masterContentKey` using `timelockEncrypt(roundNumber, Buffer.from(masterContentKey), mainnetClient())` from `tlock-js`.
     - **Result:** Even with the `.heirloom` file on disk, mathematically nobody in the world can recover `masterContentKey` until the decentralized League of Entropy network publishes the BLS signature for `roundNumber` at `unlockAtUtc`.
   - **Mode 2 — Passphrase / Printable QR Recovery Key (`SubtleCrypto` AES-256-GCM):**
     - Derive a 256-bit wrapping key from the user's recovery passphrase (or auto-generated 24-character recovery code printed on the QR Key Card) via `PBKDF2` (`SHA-256`, `210,000` iterations, 16-byte random salt).
     - Wrap `masterContentKey` with `AES-GCM` so the capsule also works 100% offline if the recipient is air-gapped after the unlock date.

3. **Outer `.heirloom` File Envelope (Public Header + Ciphertext):**
   The downloaded `family-memory.heirloom.json` contains a readable public header (`creatorName`, `recipientName`, `createdAtUtc`, `unlockAtUtc`, `drandRound`, `encryptionMode`, `ivBase64`, `saltBase64`, `tlockCiphertextArmor`) and `payloadCiphertextBase64`. A judge can drag-and-drop this file into the app's **Vault Inspector** to see the public lock metadata and verify decryption live.
```

---

# Document 4: `TECH_SPEC.md`

```markdown
# Dharohar — Implemented Architecture & Agent Execution Blueprint

Updated 31 October 2026. This document is the step-by-step wiring manual for AI coding agents and engineers. Follow these exact file paths, Zod contracts, server routes, and frontend hook points to connect the prototype frontend to the live Gnani.ai + WebAudio + WebCrypto stack.

---

## 1. Repository Directory Structure (Target Layout)

When wiring the existing mock frontend repository, create or organize the logic into these clean boundaries without deleting existing UI styling files:

```text
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts                     # Public liveness check (no paid probes)
│   │   ├── gnani/
│   │   │   ├── voice-clone-embedding/route.ts  # POST 15s WAV -> [1, 768] embedding
│   │   │   ├── synthesize-clone/route.ts       # POST text + [1, 768] -> WAV (vachana-vc-v1)
│   │   │   └── synthesize-interviewer/route.ts # POST text -> WAV (timbre-v3.0)
│   │   └── interview/
│   │       ├── turn/route.ts                   # POST turn WAV + telemetry -> STT + next question + TTS
│   │       └── finalize/route.ts               # POST all transcripts -> Memory Chapter + translations
├── lib/
│   ├── contracts/
│   │   └── heirloom-contracts.ts               # Single source of truth: Zod schemas & TS types
│   ├── server/
│   │   ├── gnani-queue.ts                      # 1-concurrent-request FIFO mutex + 429 retry
│   │   ├── gnani-client.ts                     # Strict HTTPS client for api.vachana.ai
│   │   ├── text-normalizer.ts                  # Numbers/dates/currency -> spoken words for Gnani TTS
│   │   └── reasoning.ts                        # Adaptive interviewer & Memory Chapter LLM adapter
│   ├── audio/
│   │   ├── wav-encoder.ts                      # Float32 PCM -> 16-bit mono WAV Blob
│   │   └── prosody-analyzer.ts                 # Real-time WebAudio RMS, pause, & pitch jitter DSP
│   └── crypto/
│       └── heirloom-crypto.ts                  # SubtleCrypto AES-256-GCM + tlock-js timelock vault
└── hooks/
    └── useHeirloomStudio.ts                    # Master React hook that wires any mock UI to real backend/audio
```

---

## 2. Environment Configuration Contract (`.env.example`)

Create `.env.example` with these exact keys. Never commit real values:

```ini
# Gnani.ai Vachana Platform Credentials ([https://docs.gnani.ai](https://docs.gnani.ai))
GNANI_API_KEY=your_gnani_vachana_api_key_here
GNANI_BASE_URL=[https://api.vachana.ai](https://api.vachana.ai)
GNANI_DEFAULT_INTERVIEWER_VOICE=Vasudha
GNANI_DEFAULT_TTS_MODEL=timbre-v3.0
GNANI_DEFAULT_STT_MODEL=prisma-v3.0
GNANI_DEFAULT_VC_MODEL=vachana-vc-v1

# Reasoning / Adaptive Interviewer Endpoint (Groq or Gnani Evon v3.3 vLLM)
REASONING_BASE_URL=[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)
REASONING_API_KEY=your_groq_or_llm_api_key_here
REASONING_MODEL=llama-3.3-70b-versatile

# Drand Timelock Network Configuration (Public League of Entropy Quicknet)
NEXT_PUBLIC_DRAND_CHAIN_HASH=52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971
NEXT_PUBLIC_DRAND_URLS=[https://api.drand.sh](https://api.drand.sh),[https://drand.cloudflare.com](https://drand.cloudflare.com)

# Demo Simulation Gate (Explicitly labeled fallback when testing without live credits)
NEXT_PUBLIC_ALLOW_DEMO_SIMULATION=true
```

---

## 3. Executable Data & API Contracts (`src/lib/contracts/heirloom-contracts.ts`)

Every server route and frontend hook must import from this file so types never drift:

```typescript
import { z } from "zod";

export const SupportedLanguageSchema = z.enum([
  "en-IN",
  "hi-IN",
  "kn-IN",
  "ta-IN",
  "te-IN",
  "ml-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
  "pa-IN",
]);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const InterviewThemeSchema = z.enum([
  "childhood_roots",
  "turning_point",
  "love_and_family",
  "letter_to_future",
]);
export type InterviewTheme = z.infer<typeof InterviewThemeSchema>;

export const AcousticStateSchema = z.enum([
  "steady",
  "vulnerable",
  "hesitant",
  "animated",
]);
export type AcousticState = z.infer<typeof AcousticStateSchema>;

export const AcousticTelemetrySchema = z.object({
  meanEnergyDb: z.number().min(-100).max(0),
  energyDropDb: z.number(),
  maxInternalPauseMs: z.number().min(0),
  hesitationCount: z.number().int().min(0),
  silenceRatio: z.number().min(0).max(1),
  jitterPercent: z.number().min(0),
  voicedDurationMs: z.number().min(0),
  acousticState: AcousticStateSchema,
});
export type AcousticTelemetry = z.infer<typeof AcousticTelemetrySchema>;

export const GnaniSpeakerEmbeddingSchema = z.object({
  embedding: z.string().min(16),
  shape: z.tuple([z.literal(1), z.literal(768)]),
  dtype: z.literal("torch.bfloat16"),
});
export type GnaniSpeakerEmbedding = z.infer<typeof GnaniSpeakerEmbeddingSchema>;

export const SynthesizeCloneRequestSchema = z.object({
  text: z.string().min(2).max(1200),
  languageCode: SupportedLanguageSchema.default("en-IN"),
  speakerEmbedding: GnaniSpeakerEmbeddingSchema,
});

export const InterviewTurnMetadataSchema = z.object({
  theme: InterviewThemeSchema,
  turnIndex: z.number().int().min(0).max(9),
  totalPlannedTurns: z.number().int().min(3).max(10).default(5),
  preferredLanguage: SupportedLanguageSchema.default("en-IN"),
  interviewerVoice: z.string().default("Vasudha"),
  telemetry: AcousticTelemetrySchema,
  priorTurns: z
    .array(
      z.object({
        questionText: z.string(),
        userTranscript: z.string(),
        detectedLanguage: z.string(),
        acousticState: AcousticStateSchema,
      })
    )
    .max(10),
});

export const InterviewTurnResponseSchema = z.object({
  userTranscript: z.string(),
  detectedLanguageCode: SupportedLanguageSchema,
  telemetry: AcousticTelemetrySchema,
  empathyAdaptationNote: z.string(),
  nextQuestionText: z.string(),
  isFinalTurn: z.boolean(),
  interviewerAudioWavBase64: z.string().nullable(),
  providerMode: z.enum(["gnani_live", "fallback_text_only"]),
});
export type InterviewTurnResponse = z.infer<typeof InterviewTurnResponseSchema>;

export const MemoryChapterSchema = z.object({
  title: z.string(),
  coreWisdomQuote: z.string(),
  narrativeSummary: z.string(),
  keyLifeLessons: z.array(z.string()).min(2).max(4),
  englishTranslationText: z.string(),
  hindiTranslationText: z.string(),
  kannadaTranslationText: z.string(),
});
export type MemoryChapter = z.infer<typeof MemoryChapterSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.enum([
      "VALIDATION_ERROR",
      "EMPTY_SPEECH_SEGMENT",
      "AUDIO_TOO_LONG",
      "RATE_LIMITED",
      "PROVIDER_CREDITS_EXHAUSTED",
      "PROVIDER_UNAVAILABLE",
      "CONFIG_MISSING",
    ]),
    message: z.string(),
    retryable: z.boolean(),
  }),
});
```

---

## 4. Single-Flight Gnani Concurrency Queue (`src/lib/server/gnani-queue.ts`)

Because Gnani's API returns HTTP `429 RATE_LIMITED` if more than 1 request is active simultaneously, all server routes **must** wrap `fetch` calls to `api.vachana.ai` inside this singleton mutex queue:

```typescript
type Task<T> = () => Promise<T>;

class GnaniSingleFlightQueue {
  private queue: Array<{
    run: () => Promise<void>;
  }> = [];
  private active = false;
  private readonly maxQueueDepth = 6;

  public async enqueue<T>(task: Task<T>, retriesOn429 = 2): Promise<T> {
    if (this.queue.length >= this.maxQueueDepth) {
      const err = new Error("Server voice queue is full; please wait a moment.");
      (err as Error & { code?: string }).code = "RATE_LIMITED";
      throw err;
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run: async () => {
          try {
            const result = await this.executeWithBackoff(task, retriesOn429);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
      });
      void this.drain();
    });
  }

  private async executeWithBackoff<T>(
    task: Task<T>,
    retriesLeft: number
  ): Promise<T> {
    try {
      return await task();
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 429 && retriesLeft > 0) {
        await new Promise((r) => setTimeout(r, 1250));
        return this.executeWithBackoff(task, retriesLeft - 1);
      }
      throw err;
    }
  }

  private async drain(): Promise<void> {
    if (this.active) return;
    this.active = true;
    while (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        await next.run();
      }
    }
    this.active = false;
  }
}

export const gnaniQueue = new GnaniSingleFlightQueue();
```

---

## 5. Mandatory Text Normalizer for Gnani TTS (`src/lib/server/text-normalizer.ts`)

Gnani's documentation states that raw digits, years (`1984`), and currency symbols (`₹500`) must bePoint reference files—the provider evidence log, the product and build brief, the technical build specification, and the architecture specification—to match their exact level of operational governance, failure handling, and verification rules. I have not yet seen your mock frontend repository, so no existing files have been altered.
* **How these four new documents work together:**
  1. **`GNANI_REFERENCE.md`** (modeled on your provider evidence document) locks down every rule for Gnani.ai’s voice cloning, speech-to-text, and expressive voice engines, plus the browser voice-emotion meter and mathematical time-lock clock.
  2. **`Heirloom_Product_and_Build_Brief.md`** (modeled on your product brief) defines the user journey, the five guided family interview modes, the respectful tone of voice, the 90-second demo script, and the hackathon compliance rules.
  3. **`Heirloom_Technical_Build_Spec.md`** (modeled on your technical build specification) sets the non-negotiable rules for security, cost limits, one-at-a-time voice queues, and browser encryption so no builder or coding agent takes shortcuts.
  4. **`TECH_SPEC.md`** (modeled on your architecture contract) provides the exact database tables, server routes, data shapes, voice-emotion formulas, and step-by-step wiring plan so your mock frontend can be connected to real functionality without guesswork.
* **How your privacy promise stays 100% honest:** Unlike a standard cloud app that saves private recordings in a company database, our server acts strictly as a **blind pass-through gatekeeper**. It hides your Gnani account password, lines up requests one at a time so Gnani never rejects them, and immediately returns the voice results to the user's browser. All final recordings, voice fingerprints, and transcripts are locked inside the browser into a downloadable `.heirloom` file.
* **What happens next:** Whenever you drop your mock frontend files here, I will survey them first, map which buttons connect to which of the routes below, and ask for your **YES** before wiring them up.

---

### Technical detail (optional) — Complete 4-Document Specification Pack for AI Coding Agents & Engineers

---

# DOCUMENT 1 of 4: `GNANI_REFERENCE.md`

> **Revision:** 31 October 2026. Patterned after the provider-evidence governance in your reference specification. Documentation findings come from official `docs.gnani.ai` endpoints (`api.vachana.ai`). No live Gnani account credits or repository files have been mutated in this session.

## 1. Authoritative Provider & Open-Source Sources

| Component | Official Source / Package | What It Owns in Our System |
| :--- | :--- | :--- |
| **Gnani Prisma v3.0 (STT)** | `https://docs.gnani.ai` (`POST https://api.vachana.ai/stt/v3`) | Transcribes up to 30-second speech turns across 10 Indic languages + English with automatic language detection (`detected_language_code`) and code-mixing. |
| **Gnani Voice Cloning (Embedding)** | `https://docs.gnani.ai/api/VC/voice-clone-embeddings` (`POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings`) | Extracts a `[1, 768]` `torch.bfloat16` speaker fingerprint from a single $\le 30\text{s}$ WAV recording. |
| **Gnani Voice Cloned TTS** | `https://docs.gnani.ai/api/VC/vc-sse` (`POST https://api.vachana.ai/api/v1/tts/inference` & `/api/v1/tts/sse`) | Synthesizes new or translated text in the user's cloned voice using model `vachana-vc-v1` and the `[1, 768]` speaker embedding. |
| **Gnani Timbre v3.0 (Interviewer TTS)** | `https://docs.gnani.ai` (`POST https://api.vachana.ai/api/v1/tts/inference`) | Synthesizes the AI interviewer's spoken questions using polyglot voice IDs (`Avinash`, `Chetana`, `Kalpana`, `Lakshmi`, `Riyaa`, `Yashraj`) with inline expressive tags and speed controls (`0.85`–`1.15`). |
| **Browser Silero VAD** | `@ricky0123/vad-web` (`onnxruntime-web`) | Runs client-side in an `AudioWorklet` at 16 kHz mono PCM to detect speech start/end and strip trailing silence before hitting Gnani STT. |
| **Browser Acoustic DSP** | Native W3C `AudioContext` + `AnalyserNode` | Extracts RMS vocal energy (dB), hesitation pause duration (ms), speaking rate, and pitch $F_0$ jitter locally in the browser. |
| **Client Timelock & Encryption** | `tlock-js` (League of Entropy `drand` Quicknet) + W3C `window.crypto.subtle` | Encrypts the final `.heirloom` capsule locally with `AES-256-GCM` and wraps the key toward a future `drand` round so no server holds keys or user files. |

---

## 2. Resolved Gnani.ai API Contracts & Mandatory Safeguards

### 2.1 Authentication & Header Contract
* All requests to `https://api.vachana.ai` require the HTTP header `X-API-Key-ID: <GNANI_API_KEY>`.
* **Browser Rule:** `GNANI_API_KEY` must never appear in `NEXT_PUBLIC_*` environment variables, client bundles, or browser WebSocket URLs. Every Gnani call goes through our Next.js server routes (`/api/gnani/*`), matching the backend-only credential isolation pattern from your reference architecture.

### 2.2 Single-Concurrency Limit (`429 RATE_LIMITED`)
* **Provider Evidence:** Gnani standard/programme API keys enforce a hard concurrency limit of **1 active synthesis/cloning request at a time**. Concurrent calls return HTTP `429` (`RATE_LIMITED`) with **no `Retry-After` header**.
* **Implementation Consequence:** Our server must serialize all outbound Gnani requests per API key using a PostgreSQL advisory lock (or in-process mutex with a 15-second timeout and 1 automatic backoff retry after 1,500 ms). The UI must disable duplicate clicks while a turn is in flight.

### 2.3 Audio Format & Duration Contract
* **Input Audio (STT & Voice Clone Embedding):**
  * Accepted formats: WAV (`audio/wav`, 16-bit linear PCM, mono, 16,000 Hz preferred; 8,000 Hz–44,100 Hz supported).
  * Maximum duration per REST call: **30.0 seconds** (hard provider limit; audio $>30\text{s}$ returns HTTP `400 VALIDATION_ERROR`).
  * **Implementation Consequence:** The browser Silero VAD recorder must automatically segment or cap any single spoken turn at **28.0 seconds** and encode a clean 16 kHz 16-bit mono WAV blob before uploading to `/api/gnani/stt` or `/api/gnani/voice-clone/embedding`.

### 2.4 Voice Cloning Two-Step Stateless Contract
* **Step 1 (`POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings`):**
  * Request: `multipart/form-data` with field `audio_file` containing the user's 10–25 second consent & calibration recording.
  * Response (`200 OK`):
    ```json
    {
      "speaker_embedding": {
        "embedding": "<base64_or_serialized_tensor_string>",
        "shape": [1, 768],
        "dtype": "torch.bfloat16"
      }
    }
    ```
  * **Stateless Privacy Rule:** Our server validates the `[1, 768]` shape and `torch.bfloat16` dtype using Zod and returns the `speaker_embedding` object directly to the browser. We **never** store the user's audio or speaker embedding in our database. The browser keeps the embedding in memory (`IndexedDB` working draft) and seals it inside the final encrypted `.heirloom` file.
* **Step 2 (`POST https://api.vachana.ai/api/v1/tts/inference`):**
  * Request (`application/json`):
    ```json
    {
      "text": "Spoken heirloom message with numbers spelled out as words.",
      "model": "vachana-vc-v1",
      "speaker_embedding": {
        "embedding": "<from_step_1>",
        "shape": [1, 768],
        "dtype": "torch.bfloat16"
      },
      "audio_config": {
        "sample_rate": 44100,
        "num_channels": 1,
        "sample_width": 2,
        "encoding": "linear_pcm",
        "container": "wav"
      }
    }
    ```
  * Response: Raw binary `audio/wav` stream (`sample_rate: 44100`, 16-bit mono PCM).

### 2.5 Text Normalization Contract (Mandatory Pre-TTS Step)
* **Provider Evidence:** Gnani’s TTS Text Normalization guide specifies that raw digits (`1984`, `500`), currency symbols (`₹`), abbreviations (`Dr.`, `St.`), and slash dates (`12/08/1995`) cause synthesis pronunciation defects.
* **Implementation Consequence:** Before calling `/api/gnani/tts` or `/api/gnani/voice-clone/synthesize`, our server-side normalizer (`normalizeForGnaniTTS(text, langCode)`) and our LLM prompt contract must convert all years, numbers, symbols, and abbreviations into fully spelled-out words in the target language.

### 2.6 Expressive Interviewer TTS (`timbre-v3.0`) Contract
* **Endpoint:** `POST https://api.vachana.ai/api/v1/tts/inference`
* **Model:** `timbre-v3.0`
* **Supported Languages (`language_code`):** `en-IN`, `hi-IN`, `kn-IN`, `ta-IN`, `te-IN`, `ml-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`.
* **Approved Polyglot Voices:** `Chetana` (warm female default), `Avinash` (calm male default), `Kalpana`, `Lakshmi`, `Riyaa`, `Yashraj`.
* **Speed Control:** When the browser's Acoustic Empathy Detector reports a `vulnerable` or `hesitant` state, our server sets speech speed to `0.90` (gentle/slower pace) and injects gentle conversational pacing.

### 2.7 Speech-to-Text (`prisma-v3.0`) Contract
* **Endpoint:** `POST https://api.vachana.ai/stt/v3`
* **Request:** `multipart/form-data` with `audio_file` (16 kHz mono WAV, $\le 28\text{s}$), `model="prisma-v3.0"`, and optional `output_format` (`codemix` or native script).
* **Response:** Extracts `transcript` and `detected_language_code`. Empty or noise-only transcripts return an explicit `EMPTY_SPEECH_TURN` code so the interviewer politely asks the user to repeat without advancing the question counter.

---

## 3. Live Acceptance Checklist (Required Before Hackathon Submission)

Following the live-verification discipline from your reference docs:
1. Verify `GNANI_API_KEY` has active programme credits (out of the 5,000 granted credits) without printing the key in logs.
2. Record a real 15-second voice calibration clip in the browser; verify `POST /api/gnani/voice-clone/embedding` returns a valid `[1, 768]` `torch.bfloat16` embedding.
3. Speak an interview answer in **English (`en-IN`)**, **Hindi (`hi-IN`)**, and **Kannada (`kn-IN`)** (including code-mixed Hinglish/Kanglish); verify `prisma-v3.0` returns accurate text and language code.
4. Pause mid-sentence for $>2.5\text{ seconds}$ and lower vocal volume; verify the browser Acoustic HUD switches state to `Hesitant / Reflective` and the next LLM question acknowledges the emotion and speaks via `timbre-v3.0` at `0.90` speed.
5. Generate a Cross-Lingual Audio Capsule using `vachana-vc-v1` and the captured `[1, 768]` embedding; verify a playable 44.1 kHz WAV returns.
6. Export a `.heirloom` capsule locked 2 minutes in the future via `tlock-js`; verify decryption fails before the 2-minute mark with `TIMELOCK_NOT_YET_EXPIRED` and succeeds after the 2-minute mark, playing back both original and cloned audio offline.

---
---

# DOCUMENT 2 of 4: `Heirloom_Product_and_Build_Brief.md`

> **Revision:** 31 October 2026. Patterned after your CounterPoint Product & Build Brief. Defines product thesis, emotional arc, five guided interview modes, scoring/chapter extraction, copy rules, and hackathon demo strategy.

# SwaraVault (by Dharohar)
## Acoustic-Aware Voice Heirloom & Cross-Lingual Family Memory Studio

**Core promise:** Preserve the voice, the wisdom, and the emotion—across generations and languages.
**One line:** SwaraVault conducts empathetic, acoustic-aware AI interviews in Indian and global languages, preserves authentic and cloned voice capsules via Gnani.ai, and seals them in mathematically time-locked browser heirlooms.

---

## 1. Product Thesis

When a parent or grandparent passes away, texts and photos survive, but their **voice, cadence, laughter, and spoken stories** disappear. Even while they are alive, two barriers stop families from recording these memories:
1. **Sitting in front of a blank microphone is awkward:** People freeze when told *"Record a message for your grandkids."* They need a warm, attentive interviewer who listens to *how* they sound—slowing down when their voice trembles and asking gentle follow-up questions.
2. **The Generational Language Gap in India:** A grandmother may tell her deepest stories in fluent Kannada, Tamil, or Hindi, while her grandchildren growing up in metro cities or abroad speak mostly English.

SwaraVault solves both. It pairs **browser-side acoustic emotion sensing** with **Gnani.ai’s multilingual speech and voice-cloning engine**, packaging the result into a **zero-server, mathematically time-locked `.heirloom` file** that requires no recurring subscription or company database to survive for decades.

---

## 2. Product Sentiment & Emotional Arc

Just as your reference product brief defines a clear emotional progression, SwaraVault enforces a strict emotional design:

| We want users to feel | We do not want users to feel |
| :--- | :--- |
| Deeply listened to, at their own pace | Rushed by an impatient voice bot |
| Safe to pause, sigh, or get emotional | Evaluated, graded, or corrected |
| Authentic in their native language or Hinglish/Kanglish | Forced to speak stiff, formal textbook English |
| Confident their private family memories stay on their device | Worried their voice clone sits on a corporate server |

**Emotional Arc:** *Self-conscious → Comforted by the interviewer → Immersed in memory → Proud of the preserved heirloom.*

### Voice and Tone Rules
* Never use clinical or robotic words (`"Processing audio tensor"`, `"Invalid sentiment"`, `"Session terminated"`).
* Always disclose AI transparently (per Gnani Challenge rules): *"Swara is an AI biographer powered by Gnani.ai."*
* When acoustic hesitation or quiet volume is detected, the interviewer must validate before asking: *"Take all the time you need. That sounds like an important memory—what happened next?"*

---

## 3. Five Locked Guided Interview Modes

Patterned after the structured multi-mode matrix in your reference brief, SwaraVault locks **five guided heirloom modes** (5 questions per session, max 28 seconds per spoken answer turn):

| Mode ID | Display Title | Guided Conversation Behavior | Output Capsule Artifact |
| :--- | :--- | :--- | :--- |
| `childhood_roots` | **Childhood & Family Roots** | Explores hometowns, parents, childhood home, and early struggles; warm nostalgic tone. | Denoised original voice chapters + extracted Family Origins Timeline. |
| `life_wisdom` | **Life Lessons & Core Values** | Explores turning points, hardest decisions, mistakes forgiven, and advice for tough times. | Denoised original voice + distilled "Five Pillars of Wisdom" spoken audio card. |
| `cross_lingual_bridge` | **Grandchild Language Bridge** | User speaks naturally in Hindi/Kannada/Tamil/Telugu/etc.; AI interviews in their language, then translates and synthesizes the story in their cloned voice (`vachana-vc-v1`) in English (or vice versa). | Dual-track player: **Track A (Original Native Voice)** + **Track B (Cloned Cross-Lingual Voice)**. |
| `milestone_letter` | **Future Milestone Time-Capsule** | Guides user through crafting a message for a specific future event (18th birthday, wedding, graduation, hard day) and converts written refinements into spoken cloned audio. | Time-locked `.heirloom` file encrypted via `tlock-js` until the exact milestone date. |
| `gratitude_unsaid` | **Things Left Unsaid** | Gentle, slow-paced reflection on people who shaped their life, apologies, gratitude, and love. | High-empathy pacing (`0.88x` speed), original voice preservation + printable QR Heirloom Card. |

---

## 4. End-to-End User Journey (8 Screens / States)

```text
1. Landing & Mode Selection
   → 2. Explicit Consent & Microphone / Acoustic Check
   → 3. 15-Second Voice Calibration (Gnani 768-D Voice Fingerprint)
   → 4. Live Acoustic-Aware Interview Room (5 Adaptive Turns + Live Empathy HUD)
   → 5. Heirloom Synthesis Studio (Original Denoised Audio + Cloned Letter/Translation Track)
   → 6. Cryptographic Time-Lock & QR Key Card Seal (SubtleCrypto AES-256-GCM + tlock-js)
   → 7. Local Vault & Offline `.heirloom` File Unlock / Verification Dropzone
```

---

## 5. Structured Memory Chapter & Wisdom Extraction Model

Unlike a debate app that scores performance, SwaraVault never grades a human being's life story. Instead, our reasoning engine extracts a **Structured Heirloom Archive** grounded strictly in the verbatim transcript and verified browser acoustic telemetry:

| Field | What It Extracts | Grounding Rule |
| :--- | :--- | :--- |
| `chapter_title` | Evocative title for the memory | Must reflect actual events in the transcript. |
| `core_wisdom_quote` | The single most powerful verbatim sentence spoken by the user | Must be an exact substring quote from the user's transcript. |
| `emotional_signature` | Summary of verified acoustic prosody (`Reflective`, `Joyful`, `Tender/Hesitant`, `Steady`) | Computed strictly from real browser `WebAudio` RMS/pause/pitch metrics—**never** hallucinated from text alone. |
| `translated_narrative` | Faithful translation into the recipient's target language with numbers spelled out | Used to synthesize the `vachana-vc-v1` cross-lingual voice track. |
| `heirloom_letter` | A polished first-person heirloom letter woven from the 5 answers | Editable by the user before generating the final cloned voice capsule. |
| `legacy_tags` | 3–5 concrete themes (e.g., `"1978 Bengaluru"`, `"First Job"`, `"Mother's Kitchen"`) | Extracted strictly from named entities/topics in the transcript. |

---

## 6. 90-Second Hackathon Demo & Video Script (`#GreatIndianAIInternshipChallenge`)

| Timestamp | What Happens on Screen | What Judges See & Hear |
| :--- | :--- | :--- |
| **0:00 – 0:12** | Hook & Problem | *"75% of families wish they had kept their grandparents' voices—and in India, language gaps often separate grandparents from grandchildren."* |
| **0:12 – 0:30** | Consent + 15s Voice Calibration | User checks the DPDP consent box, speaks a 15-second Kannada/Hindi sentence, and Gnani `vachana-vc-v1` generates the `[1, 768]` Voice Fingerprint in real time. |
| **0:30 – 0:55** | Live Acoustic-Aware Interview | User answers a question, pauses for 3 seconds, and lowers their voice. The **Acoustic Empathy HUD** lights up (`Pause: 3.1s | Energy: -16dB | State: Tender/Hesitant`), and Gnani `timbre-v3.0` responds gently in the user's language. |
| **0:55 – 1:15** | Cross-Lingual Cloned Capsule | User clicks **"Bridge to English in My Voice."** Gnani `vachana-vc-v1` speaks the translated story in the user's own cloned voice timbre alongside the denoised original recording. |
| **1:15 – 1:30** | Mathematical Time-Lock & Decrypt Proof | User locks the `.heirloom` capsule using `tlock-js` + `AES-256-GCM`, downloads the encrypted file + Printable QR Card, and drops it into the Offline Verifier to prove zero-server decryption. |

---
---

# DOCUMENT 3 of 4: `Heirloom_Technical_Build_Spec.md`

> **Revision:** 31 October 2026. Patterned after your CounterPoint Technical Build Specification. Governs stack boundaries, data privacy, server gatekeeper rules, acoustic prosody math, and cryptographic time-locking.

## 1. Implementation Baseline & Stack Boundaries

| Layer | Locked Technology Contract |
| :--- | :--- |
| **Framework** | Next.js (App Router), React 19, strict TypeScript (`strict: true`, no implicit `any`), Tailwind CSS. |
| **Browser Audio & DSP** | W3C `AudioContext`, `AudioWorklet` / `AnalyserNode`, `@ricky0123/vad-web` (Silero VAD via ONNX Runtime Web), client-side 16 kHz mono WAV encoder + high-pass / RNNoise denoising filter. |
| **Gnani.ai Voice Layer** | Server-side gatekeeper routes calling `https://api.vachana.ai` (`prisma-v3.0` STT, `timbre-v3.0` TTS, `vachana-vc-v1` Voice Cloning Embeddings & Synthesis). |
| **Reasoning & Translation** | Server-side OpenAI-compatible chat completions endpoint (Groq `llama-3.3-70b-versatile` or configured `REASONING_MODEL`) + Gnani Evon v3.3 compatible prompt formatting. |
| **Client Cryptography & Storage** | Native `window.crypto.subtle` (`AES-256-GCM`, `PBKDF2`) + `tlock-js` (`drand` Quicknet timelock encryption) + browser `IndexedDB` (`idb-keyval`) for local working drafts. |
| **Server Persistence (Optional / Minimal)** | Stateless zero-knowledge operation for user content. Optional PostgreSQL/Supabase or in-memory rate-limit store holds **only** anonymized API quota counters and single-flight concurrency locks—**never** user audio, transcripts, or voice embeddings. |

---

## 2. Privacy, DPDP Act & Zero-Server Content Retention Rules

1. **Mandatory Consent Gate:** The microphone and calibration endpoints cannot be invoked until the user explicitly toggles the informed consent state (`consent_confirmed: true`), confirming they are recording their own voice (or a consenting co-builder's voice) in compliance with the Gnani Challenge DPDP rules.
2. **Zero Raw Audio or Embedding Persistence on Server:** Server routes (`/api/gnani/*`) process audio buffers strictly in volatile RAM during the HTTP request lifecycle and discard them immediately upon returning the response. No database table, disk folder, or S3 bucket may store user audio or `[1, 768]` speaker embeddings.
3. **Truthful Privacy Disclosure:** The UI must state accurately:
   * **In-Browser:** Audio DSP, VAD segmentation, acoustic emotion metrics, `IndexedDB` storage, `AES-256-GCM` encryption, and `tlock-js` time-locking run 100% locally in the browser.
   * **Stateless AI Processing:** Speech transcription (`prisma-v3.0`), voice cloning synthesis (`vachana-vc-v1`), and question generation pass through stateless encrypted HTTPS server gatekeepers to protect API credentials.

---

## 3. Browser Acoustic Empathy Telemetry Contract (No Fake Emotion Claims)

Just as your reference specification forbids fabricating vocal pace or emotion claims from plain text, SwaraVault computes vocal prosody **exclusively from real physical audio samples** in the browser before sending numeric telemetry to the interviewer prompt:

For every spoken user turn (16 kHz mono `Float32Array` buffer $x[n]$ of length $N$):
1. **RMS Vocal Energy (dBFS):**
   $$\text{RMS}_{\text{dB}} = 20 \log_{10}\left(\sqrt{\frac{1}{N}\sum_{n=0}^{N-1} x[n]^2} + 10^{-9}\right)$$
2. **Silence & Hesitation Pause Metrics:**
   Using 30 ms frames (480 samples at 16 kHz), any frame inside an active speech turn with $\text{RMS}_{\text{dB}} < -42\text{ dBFS}$ is marked as intra-turn silence.
   * `maxPauseMs`: Longest contiguous internal silence gap between spoken words (in milliseconds).
   * `silenceRatio`: Fraction of total turn duration spent in internal hesitation pauses ($0.00$ to $1.00$).
3. **Pitch ($F_0$) Stability / Vocal Jitter:**
   Computed on voiced frames using normalized autocorrelation in the human fundamental frequency band ($75\text{ Hz} \le F_0 \le 400\text{ Hz}$).
   * `pitchJitterPct`: Cycle-to-cycle relative variation in fundamental period $T_0$.
4. **Deterministic Acoustic State Classification:**
   * If `maxPauseMs >= 2200` OR (`silenceRatio >= 0.38` AND `rmsDb <= -24`): **`"hesitant_vulnerable"`** (Interviewer slows TTS speed to `0.90`, validates emotion first, asks a gentle deepening question).
   * Else if `rmsDb >= -16` AND `silenceRatio < 0.20`: **`"animated_engaged"`** (Interviewer matches warm energy, speed `1.00`).
   * Else: **`"calm_reflective"`** (Interviewer maintains steady conversational tone, speed `0.95`).

---

## 4. Client-Side Cryptographic `.heirloom` Capsule Specification

Every exported `.heirloom` file is a deterministic, self-contained JSON-header + binary-ciphertext container that can be decrypted completely offline:
1. **Payload Bundled Inside Plaintext Archive (Before Encryption):**
   * `manifest.json`: Schema version `1.0`, mode, timestamps (UTC ISO-8601), recipient name, unlock date, transcript turns, acoustic telemetry log, extracted wisdom chapters, and the user's Gnani `[1, 768]` `speaker_embedding` object (so future authorized tools can still use their voice fingerprint).
   * `audio/original_turn_1..5.wav`: Base64 or binary slices of the user's denoised real voice recordings.
   * `audio/cloned_capsule.wav`: The synthesized `vachana-vc-v1` heirloom narration / cross-lingual audio track.
2. **Two-Layer Encryption Envelope:**
   * **Layer 1 (Symmetric Data Encryption — `window.crypto.subtle`):**
     Generate a cryptographically random 256-bit Content Encryption Key ($\text{CEK}$) and 96-bit IV (`Uint8Array(12)`). Encrypt the archive payload with **`AES-256-GCM`**.
   * **Layer 2A (Immediate Passphrase / QR Recovery Key Wrapping):**
     Derive a 256-bit Key Encryption Key ($\text{KEK}$) using `PBKDF2` (`SHA-256`, 210,000 iterations, 16-byte random salt) from a generated 24-character recovery key (rendered on a printable **QR Heirloom Recovery Card**).
   * **Layer 2B (Decentralized Time-Lock Wrapping via `tlock-js`):**
     When the user selects a future unlock date $T_{\text{unlock}}$, calculate the target round number on the League of Entropy `drand` Quicknet chain (`chainHash: 52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`, genesis `1692803367`, period `3 seconds`):
     $$\text{round} = \max\left(1, \left\lfloor \frac{\lfloor T_{\text{unlock}} / 1000 \rfloor - 1692803367}{3} \right\rfloor\right)$$
     Encrypt the 256-bit $\text{CEK}$ using `timelockEncrypt(round, Buffer.from(cek), mainnetClient())`. Mathematically, `timelockDecrypt` will fail until the `drand` network publishes the BLS signature for `round` at $T_{\text{unlock}}$.

---
---

# DOCUMENT 4 of 4: `TECH_SPEC.md` (Executable Architecture & Wiring Guide)

> **Revision:** 31 October 2026. Patterned after your CounterPoint `TECH_SPEC.md`. Any developer or AI coding agent can follow this specification blindly to build the backend, browser DSP engine, cryptography layer, and hook up your incoming mock frontend.

## 1. Repository File Layout (Target Structure)

When you drop your mock frontend, we will preserve your UI components and wire them to this exact modular structure:

```text
src/
├── app/
│   ├── api/
│   │   ├── health/route.ts                        # GET public liveness check
│   │   ├── gnani/
│   │   │   ├── stt/route.ts                       # POST multipart audio -> Gnani Prisma v3.0
│   │   │   ├── tts/route.ts                       # POST text -> Gnani Timbre v3.0 WAV
│   │   │   └── voice-clone/
│   │   │       ├── embedding/route.ts             # POST WAV -> Gnani [1, 768] bfloat16 embedding
│   │   │       └── synthesize/route.ts            # POST text + [1, 768] embedding -> Gnani vachana-vc-v1 WAV
│   │   └── interview/
│   │       ├── turn/route.ts                      # POST transcript + acoustic telemetry -> next empathetic question
│   │       └── compile-chapter/route.ts           # POST all turns -> wisdom quote, heirloom letter, translated text
│   ├── page.tsx                                   # Your Mock Frontend (connected via hooks)
│   └── layout.tsx
├── lib/
│   ├── product-contracts.ts                       # Single source of truth: Zod schemas & TypeScript types
│   ├── gnani/
│   │   ├── client.ts                              # Server-only Gnani HTTP client + single-flight serial queue
│   │   └── text-normalizer.ts                     # Converts digits/dates/symbols to spoken words before TTS
│   ├── audio/
│   │   ├── wav-encoder.ts                         # Converts Float32Array (16kHz) to 16-bit mono PCM WAV Blob
│   │   ├── acoustic-prosody.ts                    # Real-time WebAudio RMS, pause ratio, and F0 jitter analyzer
│   │   └── vad-recorder.ts                        # Silero VAD (@ricky0123/vad-web) wrapper with 28s safety cap
│   ├── crypto/
│   │   ├── heirloom-vault.ts                      # SubtleCrypto AES-256-GCM + tlock-js timelock pack/unpack
│   │   └── qr-recovery-card.ts                    # Generates printable SVG/Canvas QR Recovery Card
│   └── storage/
│       └── local-draft-store.ts                   # IndexedDB storage for current session & voice embedding
└── hooks/
    └── useHeirloomStudio.ts                       # Master React hook to wire your mock frontend buttons in 1 file
```

---

## 2. Environment Configuration Contract (`.env.example`)

Create `.env.example` at the root. Never commit `.env.local`.

```ini
# Required: Gnani.ai Vachana API credentials (from docs.gnani.ai dashboard)
GNANI_API_KEY=""
GNANI_API_BASE_URL="[https://api.vachana.ai](https://api.vachana.ai)"

# Required: Reasoning & Translation LLM (OpenAI-compatible endpoint, e.g., Groq or OpenAI)
REASONING_BASE_URL="[https://api.groq.com/openai/v1](https://api.groq.com/openai/v1)"
REASONING_API_KEY=""
REASONING_MODEL="llama-3.3-70b-versatile"

# Drand Quicknet Timelock Configuration (Public League of Entropy Mainnet)
NEXT_PUBLIC_DRAND_CHAIN_HASH="52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971"
NEXT_PUBLIC_DRAND_GENESIS_TIME="1692803367"
NEXT_PUBLIC_DRAND_PERIOD_SECONDS="3"

# Safety & Budget Caps
MAX_AUDIO_SECONDS_PER_TURN="28"
GNANI_CONCURRENCY_LIMIT="1"
```

---

## 3. Executable Data & API Contracts (`src/lib/product-contracts.ts`)

Every server endpoint and frontend hook must import and validate against this exact file:

```typescript
import { z } from "zod";

export const SupportedLanguageSchema = z.enum([
  "en-IN",
  "hi-IN",
  "kn-IN",
  "ta-IN",
  "te-IN",
  "ml-IN",
  "mr-IN",
  "bn-IN",
  "gu-IN",
  "pa-IN",
]);
export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const HeirloomModeSchema = z.enum([
  "childhood_roots",
  "life_wisdom",
  "cross_lingual_bridge",
  "milestone_letter",
  "gratitude_unsaid",
]);
export type HeirloomMode = z.infer<typeof HeirloomModeSchema>;

export const AcousticStateSchema = z.enum([
  "hesitant_vulnerable",
  "calm_reflective",
  "animated_engaged",
]);
export type AcousticState = z.infer<typeof AcousticStateSchema>;

export const AcousticTelemetrySchema = z.object({
  rmsDb: z.number().min(-100).max(0),
  maxPauseMs: z.number().min(0).max(30000),
  silenceRatio: z.number().min(0).max(1),
  pitchJitterPct: z.number().min(0).max(100),
  durationSeconds: z.number().min(0.5).max(30),
  acousticState: AcousticStateSchema,
});
export type AcousticTelemetry = z.infer<typeof AcousticTelemetrySchema>;

export const GnaniSpeakerEmbeddingSchema = z.object({
  embedding: z.union([z.string().min(16), z.array(z.any())]),
  shape: z.tuple([z.literal(1), z.literal(768)]),
  dtype: z.literal("torch.bfloat16"),
});
export type GnaniSpeakerEmbedding = z.infer<typeof GnaniSpeakerEmbeddingSchema>;

export const InterviewTurnRecordSchema = z.object({
  turnIndex: z.number().int().min(0).max(9),
  questionText: z.string().min(1),
  answerTranscript: z.string().min(1),
  detectedLanguage: SupportedLanguageSchema,
  telemetry: AcousticTelemetrySchema,
  recordedAtUtc: z.string().datetime(),
});
export type InterviewTurnRecord = z.infer<typeof InterviewTurnRecordSchema>;

export const NextTurnRequestSchema = z.object({
  mode: HeirloomModeSchema,
  preferredLanguage: SupportedLanguageSchema,
  turnIndex: z.number().int().min(0).max(9),
  totalTurns: z.number().int().min(3).max(10).default(5),
  history: z.array(InterviewTurnRecordSchema).max(10),
  latestTranscript: z.string().min(1).max(4000),
  latestTelemetry: AcousticTelemetrySchema,
});

export const NextTurnResponseSchema = z.object({
  empathyAcknowledgement: z.string().min(1),
  nextQuestionText: z.string().min(1),
  spokenPromptNormalized: z.string().min(1),
  recommendedTtsSpeed: z.number().min(0.85).max(1.15),
  recommendedVoiceId: z.enum([
    "Chetana",
    "Avinash",
    "Kalpana",
    "Lakshmi",
    "Riyaa",
    "Yashraj",
  ]),
  isFinalTurn: z.boolean(),
});

export const CompileChapterRequestSchema = z.object({
  mode: HeirloomModeSchema,
  sourceLanguage: SupportedLanguageSchema,
  targetBridgeLanguage: SupportedLanguageSchema,
  recipientName: z.string().min(1).max(120),
  turns: z.array(InterviewTurnRecordSchema).min(1).max(10),
});

export const CompiledHeirloomChapterSchema = z.object({
  chapterTitle: z.string().min(1).max(160),
  coreWisdomQuote: z.string().min(1),
  overallEmotionalSignature: AcousticStateSchema,
  heirloomLetterNative: z.string().min(20),
  translatedNarrativeNormalized: z.string().min(20),
  legacyTags: z.array(z.string().min(1).max(40)).min(2).max(5),
});
export type CompiledHeirloomChapter = z.infer<typeof CompiledHeirloomChapterSchema>;

export const ApiErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.enum([
      "VALIDATION_ERROR",
      "CONSENT_REQUIRED",
      "AUDIO_TOO_LONG",
      "EMPTY_SPEECH_TURN",
      "GNANI_RATE_LIMITED",
      "GNANI_UPSTREAM_ERROR",
      "CONFIG_MISSING",
      "TIMELOCK_NOT_YET_EXPIRED",
      "DECRYPTION_FAILED",
    ]),
    message: z.string(),
    retryable: z.boolean(),
  }),
});
```

---

## 4. Server API Route Inventory & Exact Behavior

All server routes return `Cache-Control: private, no-store` and use structured `ApiErrorEnvelopeSchema` errors—never leaking stack traces, upstream HTML bodies, or `GNANI_API_KEY`.

| Route | Method | Input Contract | Upstream / Action | Output Contract |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | None | Checks presence of `GNANI_API_KEY` and `REASONING_API_KEY` booleans without making paid calls. | `{ status: "ok", time: ISOString, configured: boolean }` |
| `/api/gnani/voice-clone/embedding` | `POST` | `multipart/form-data`: `audio_file` (WAV $\le 28\text{s}$), `consent="true"` | Acquires single-flight lock; forwards WAV to `POST https://api.vachana.ai/api/v1/tts/voice-clone/embeddings` with `X-API-Key-ID`. | Validated `{ speaker_embedding: { embedding, shape: [1,768], dtype: "torch.bfloat16" } }` |
| `/api/gnani/stt` | `POST` | `multipart/form-data`: `audio_file` (WAV $\le 28\text{s}$), `language_hint` | Acquires single-flight lock; forwards WAV to `POST https://api.vachana.ai/stt/v3` (`model: "prisma-v3.0"`). | `{ transcript: string, detectedLanguage: SupportedLanguage }` |
| `/api/interview/turn` | `POST` | `NextTurnRequestSchema` JSON | Injects `[ACOUSTIC_TELEMETRY]` tag into system prompt; generates next empathetic question + normalizes numbers for Gnani TTS. | `NextTurnResponseSchema` JSON |
| `/api/gnani/tts` | `POST` | `{ text, languageCode, voiceId, speed }` | Normalizes digits to words; acquires single-flight lock; calls `POST https://api.vachana.ai/api/v1/tts/inference` (`model: "timbre-v3.0"`). | Binary `audio/wav` (`44100 Hz`, 16-bit mono PCM) |
| `/api/interview/compile-chapter` | `POST` | `CompileChapterRequestSchema` JSON | Verifies `coreWisdomQuote` is an exact substring of the user's transcript; generates native letter + normalized target-language translation. | `CompiledHeirloomChapterSchema` JSON |
| `/api/gnani/voice-clone/synthesize` | `POST` | `{ text, speaker_embedding }` | Normalizes digits to words; acquires single-flight lock; calls `POST https://api.vachana.ai/api/v1/tts/inference` (`model: "vachana-vc-v1"`). | Binary `audio/wav` (`44100 Hz`, 16-bit mono PCM in cloned voice) |

---

## 5. Single-Flight Concurrency Queue & Gnani Gatekeeper (`src/lib/gnani/client.ts`)

Because Gnani’s API allows only **1 concurrent synthesis request per API key**, coding agents must implement this exact serial queue in `src/lib/gnani/client.ts`:

```typescript
let activeQueue: Promise<unknown> = Promise.resolve();

/**
 * Serializes all outbound calls to api.vachana.ai so concurrent clicks
 * never trigger Gnani's HTTP 429 (1 active request limit).
 */
export async function runWithGnaniSerialLock<T>(task: () => Promise<T>): Promise<T> {
  const execute = async (): Promise<T> => {
    try {
      return await task();
    } catch (err: unknown) {
      if (err instanceof GnaniUpstreamError && err.status === 429) {
        await new Promise((r) => setTimeout(r, 1500));
        return await task();
      }
      throw err;
    }
  };
  const next = activeQueue.then(execute, execute);
  activeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

export class GnaniUpstreamError extends Error {
  constructor(
    public readonly status: number,
    public readonly safeCode: "GNANI_RATE_LIMITED" | "GNANI_UPSTREAM_ERROR",
    message: string
  ) {
    super(message);
  }
}
```

---

## 6. Browser Acoustic Prosody & WAV Encoder (`src/lib/audio/acoustic-prosody.ts` & `wav-encoder.ts`)

Coding agents must implement the exact client-side signal analyzer and 16 kHz mono WAV encoder below so zero fake metrics exist:

```typescript
import { AcousticTelemetry } from "../product-contracts";

export function analyzePcm16kHzTurn(samples: Float32Array, sampleRate = 16000): AcousticTelemetry {
  const frameSize = Math.floor(sampleRate * 0.03); // 30ms frame = 480 samples
  const totalFrames = Math.max(1, Math.floor(samples.length / frameSize));

  let sumSquares = 0;
  let silentFrames = 0;
  let currentSilentRun = 0;
  let maxSilentRun = 0;
  const voicedPeriods: number[] = [];

  for (let f = 0; f < totalFrames; f++) {
    const start = f * frameSize;
    let frameSum = 0;
    for (let i = 0; i < frameSize; i++) {
      const s = samples[start + i] ?? 0;
      frameSum += s * s;
      sumSquares += s * s;
    }
    const frameRmsDb = 20 * Math.log10(Math.sqrt(frameSum / frameSize) + 1e-9);

    if (frameRmsDb < -42) {
      silentFrames++;
      currentSilentRun++;
      if (currentSilentRun > maxSilentRun) maxSilentRun = currentSilentRun;
    } else {
      currentSilentRun = 0;
      // Estimate fundamental period T0 via autocorrelation in [75Hz..400Hz]
      const minLag = Math.floor(sampleRate / 400);
      const maxLag = Math.floor(sampleRate / 75);
      let bestLag = 0;
      let maxCorr = 0;
      for (let lag = minLag; lag <= maxLag && start + lag + frameSize < samples.length; lag++) {
        let corr = 0;
        for (let i = 0; i < frameSize; i++) {
          corr += (samples[start + i] ?? 0) * (samples[start + i + lag] ?? 0);
        }
        if (corr > maxCorr) {
          maxCorr = corr;
          bestLag = lag;
        }
      }
      if (bestLag > 0) voicedPeriods.push(bestLag / sampleRate);
    }
  }

  const rmsDb = Number(
    Math.max(-99, Math.min(0, 20 * Math.log10(Math.sqrt(sumSquares / Math.max(1, samples.length)) + 1e-9))).toFixed(2)
  );
  const maxPauseMs = Math.round(maxSilentRun * 30);
  const silenceRatio = Number((silentFrames / totalFrames).toFixed(3));

  let pitchJitterPct = 0;
  if (voicedPeriods.length > 2) {
    let diffSum = 0;
    let periodSum = 0;
    for (let i = 1; i < voicedPeriods.length; i++) {
      diffSum += Math.abs(voicedPeriods[i]! - voicedPeriods[i - 1]!);
      periodSum += voicedPeriods[i]!;
    }
    const meanPeriod = periodSum / (voicedPeriods.length - 1);
    pitchJitterPct = Number(
      Math.min(100, ((diffSum / (voicedPeriods.length - 1)) / Math.max(1e-5, meanPeriod)) * 100).toFixed(2)
    );
  }

  const durationSeconds = Number((samples.length / sampleRate).toFixed(2));
  const acousticState =
    maxPauseMs >= 2200 || (silenceRatio >= 0.38 && rmsDb <= -24)
      ? "hesitant_vulnerable"
      : rmsDb >= -16 && silenceRatio < 0.2
      ? "animated_engaged"
      : "calm_reflective";

  return { rmsDb, maxPauseMs, silenceRatio, pitchJitterPct, durationSeconds, acousticState };
}

export function encodeFloat32ToWav16kHzMono(samples: Float32Array, sampleRate = 16000): Blob {
  const maxSamples = sampleRate * 28; // Hard 28s safety cap for Gnani 30s limit
  const clipped = samples.length > maxSamples ? samples.subarray(0, maxSamples) : samples;
  const buffer = new ArrayBuffer(44 + clipped.length * 2);
  const view = new DataView(buffer);

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + clipped.length * 2, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(36, "data");
  view.setUint32(40, clipped.length * 2, true);

  let offset = 44;
  for (let i = 0; i < clipped.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, clipped[i] ?? 0));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}
```

---

## 7. How Your Mock Frontend Hooks Up (`src/hooks/useHeirloomStudio.ts`)

When you share your mock frontend, we do not need to rewrite its layout. We connect your existing UI screens to a single state machine hook (`useHeirloomStudio`):

1. **Consent & Calibration Button (`onCalibrateVoice`):**
   Records 15 seconds of 16 kHz mono WAV $\rightarrow$ sends to `POST /api/gnani/voice-clone/embedding` $\rightarrow$ saves the `[1, 768]` `speaker_embedding` in browser `IndexedDB`.
2. **Start / Next Interview Turn (`onCompleteSpokenTurn`):**
   Silero VAD detects speech end $\rightarrow$ runs `analyzePcm16kHzTurn(audio)` locally to update the **Live Acoustic Empathy HUD** immediately $\rightarrow$ sends WAV to `POST /api/gnani/stt` $\rightarrow$ sends transcript + telemetry to `POST /api/interview/turn` $\rightarrow$ plays the empathetic interviewer question via `POST /api/gnani/tts`.
3. **Compile & Synthesize Cloned Capsule (`onGenerateHeirloomCapsule`):**
   Calls `POST /api/interview/compile-chapter` to extract the verbatim wisdom quote, native letter, and translated narrative $\rightarrow$ calls `POST /api/gnani/voice-clone/synthesize` with the user's `[1, 768]` `speaker_embedding` to generate the cloned voice WAV.
4. **Seal & Time-Lock Button (`onSealTimeCapsule`):**
   Runs `window.crypto.subtle.encrypt` (`AES-256-GCM`) + `tlock-js` (`timelockEncrypt`) in the browser $\rightarrow$ triggers download of `<recipient>-<date>.heirloom` and renders the printable QR Recovery Card.

---

### Next Step: Drop Your Mock Frontend Whenever You Are Ready

Nothing has been touched or altered yet. Drop your mock frontend files (and `package.json`) here whenever you are ready, and I will complete the mandatory codebase survey and give you a plain-language Change Request before wiring these modules into your UI.

---
Powered by [AI Exporter](https://saveai.net)