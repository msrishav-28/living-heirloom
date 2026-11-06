# API reference

This reference describes the application routes implemented in `app/api/`, not a standalone public integration service. Schemas in [`lib/product-contracts.ts`](../lib/product-contracts.ts) are authoritative. There is no user authentication; protect paid endpoints through the hosting platform during private acceptance.

## Common behavior

- Every application API response sets `Cache-Control: private, no-store`.
- Validate input before checking provider configuration or making paid requests.
- Credentials stay on the server. Error envelopes do not return provider response bodies, keys or stack traces.
- A supplied Origin must match the request URL's origin. This browser-origin check does not stop direct scripted requests without an Origin header.
- Six provider routes use Node.js with `maxDuration = 60`.
- Gnani calls retry once after 1500 ms only for HTTP 429. Each attempt has a 25-second timeout; reasoning requests have a 30-second timeout.
- JSON input is rejected above 1,500,000 JavaScript string characters. Hosted request limits apply separately.

## Routes

| Method | Path                                | Request                                      | Successful response                            |
| ------ | ----------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| GET    | `/api/health`                       | None                                         | JSON configuration presence flags              |
| POST   | `/api/gnani/stt`                    | Multipart WAV, language, consent             | JSON transcript, nullable confidence, duration |
| POST   | `/api/gnani/voice-clone/embedding`  | Multipart three WAVs and consent             | Speaker embedding                              |
| POST   | `/api/gnani/tts`                    | JSON text, language, optional acoustic tone  | Streamed WAV                                   |
| POST   | `/api/gnani/voice-clone/synthesize` | JSON text, language, embedding, consent      | Streamed WAV                                   |
| POST   | `/api/interview/turn`               | Session plus latest transcript and telemetry | Next question and distilled excerpt            |
| POST   | `/api/interview/compile-chapter`    | Session with exactly five turns              | Title, letter and language                     |

## Health

The response contains `ok: true`, `gnaniConfigured`, `geminiConfigured`, and an ISO timestamp. The two flags check environment-variable presence only. This endpoint makes no paid call and does not verify credential validity, provider credits, or model availability.

## Transcription

Multipart fields:

| Field     | Requirement                                                          |
| --------- | -------------------------------------------------------------------- |
| `audio`   | One File, standard 44-byte RIFF WAV header, mono, 16 kHz, 16-bit PCM |
| `lang`    | A supported language code                                            |
| `consent` | The string `true`                                                    |

Accepted files are 46 through 896,044 bytes, up to 28 seconds. Chunk sizes, format, channel count, sample rate, bit depth and data length are checked. Other WAV layouts, compressed browser recordings, and arbitrary binary uploads are rejected.

The server forwards `audio_file`, `model=prisma-v3.0`, `language_code`, and `format=transcribe` to Gnani. Success returns:

```json
{
  "transcript": "A recognized answer",
  "confidence": null,
  "durationMs": 8000
}
```

Confidence is a number between zero and one only when the provider supplies it; otherwise it is null. Duration is calculated from validated PCM bytes. A blank transcript returns `STT_EMPTY` with HTTP 422.

## Voice embedding

Send exactly three repeated `audio` File fields plus `consent=true`. Each file follows the transcription WAV format. The combined PCM must last 5 through 28 seconds. The server joins the PCM under a corrected WAV header and submits one provider embedding request.

Success is the direct embedding object:

```json
{
  "embedding": "provider-supplied-string",
  "shape": [1, 768],
  "dtype": "torch.bfloat16"
}
```

The application validates the shape and dtype. It accepts the provider's documented direct object or nested `data.voice_clone_embedding` response and returns the same normalized direct shape to the browser.

## Speech synthesis

Interviewer TTS accepts:

```json
{
  "text": "A spoken question",
  "lang": "en-IN",
  "tone": "calm_reflective"
}
```

Text is trimmed and limited to 1 through 6,000 characters. `tone` is optional and accepts the acoustic states below. The route uses `timbre-v3.0`, voice `Avinash`, the provider's `language` field, and speed 0.9 for `hesitant_vulnerable`, otherwise 1.

Cloned synthesis accepts the same text/language fields plus `embedding` in the validated speaker shape and JSON `consent: true`. It uses `vachana-vc-v1` and `speaker_embedding`; it does not send the interviewer voice or language parameters to that model.

Both routes normalize spoken text before calling the provider. Requested audio is mono 44.1 kHz, 16-bit linear PCM in a WAV container. Provider WAVs must have RIFF/WAVE signatures and a total size between 44 bytes and 15,000,000 bytes. The server validates the complete bounded response before returning a stream of chunks no larger than 65,536 bytes, with `Content-Type: audio/wav` and no Content-Length header. This does not start progressive playback while provider synthesis is still running.

## Interview contracts

A session contains:

| Field            | Type or limit                |
| ---------------- | ---------------------------- |
| `id`, `memberId` | Non-empty strings            |
| `mode`           | One of the seven modes below |
| `lang`           | Supported language code      |
| `recipientName`  | 1 through 120 characters     |
| `question`       | 1 through 2,000 characters   |
| `turns`          | Up to five turn records      |

A turn record contains `question`, `transcript`, `telemetry`, `distilledExcerpt`, and `audioWavBase64`. Transcript limit is 8,000 characters; excerpt limit is 2,000; audio field limit is 1,200,000. The official browser caller sends an empty audio string in reasoning requests to keep original audio local and keep request sizes bounded.

`/api/interview/turn` adds `latestTranscript` and `telemetry` to the session. It returns `{ nextQuestion, distilledExcerpt }`. The system prompt incorporates the selected mode, language and measured acoustic state, and instructs the model to treat interview content as data.

`/api/interview/compile-chapter` requires exactly five turns. It returns `{ title, letter, language }`. The server validates the returned language and a 150 through 250 word count using `Intl.Segmenter`. Provider failures, malformed structured output, wrong language or an out-of-range letter return `GEMINI_UPSTREAM_ERROR`. Translation reuses this route with the requested target language and the saved answers.

### Acoustic telemetry

| Field             | Allowed values                                               |
| ----------------- | ------------------------------------------------------------ |
| `rmsDb`           | -60 through 0                                                |
| `maxPauseMs`      | 0 through 28,000                                             |
| `silenceRatio`    | 0 through 1                                                  |
| `pitchJitterPct`  | Non-negative number                                          |
| `durationSeconds` | 0 through 28                                                 |
| `acousticState`   | `hesitant_vulnerable`, `calm_reflective`, `animated_engaged` |

### Interview modes

`childhood_roots`, `life_wisdom`, `turning_point`, `love_and_family`, `cross_lingual_bridge`, `milestone_letter`, `gratitude_unsaid`.

### Language codes

`en-IN`, `hi-IN`, `ta-IN`, `kn-IN`, `te-IN`, `ml-IN`, `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`.

## Errors

```json
{
  "ok": false,
  "code": "CONFIG_MISSING",
  "message": "GNANI_API_KEY not set"
}
```

| Code                    | HTTP behavior in current routes                                           |
| ----------------------- | ------------------------------------------------------------------------- |
| `CONFIG_MISSING`        | 503 when required configuration is absent or rejected                     |
| `INVALID_INPUT`         | 400 for invalid input; 403 for an Origin mismatch; 413 for oversized JSON |
| `GNANI_UPSTREAM_ERROR`  | 502 for provider failures, malformed speech output or connection failures |
| `GNANI_RATE_LIMIT`      | 429 after the one allowed rate-limit retry fails                          |
| `GEMINI_UPSTREAM_ERROR` | 502 for reasoning failures or invalid model output                        |
| `STT_EMPTY`             | 422 when no non-blank transcript is returned                              |
| `INTERNAL_ERROR`        | 500 for other unexpected handler errors                                   |
| `TIMELOCK_FUTURE`       | Declared in the shared union; not emitted by the current HTTP routes      |
| `CRYPTO_FAILURE`        | Declared in the shared union; not emitted by the current HTTP routes      |

Capsule encryption is a browser operation, not an HTTP route. It throws `TimelockFutureError` before the selected date and `WrongPassphraseError` when AES authentication fails. Other parse, network and timelock failures propagate to the capsule UI as errors.

This API has no account-level authorization or distributed quota enforcement. See [deployment protection requirements](DEPLOYMENT.md) before exposing it publicly.
