# Living Heirloom — testing and release handoff

Updated 6 November 2026. Local implementation is ready for acceptance testing. Public release is pending the live checks below.

## Run locally

1. Install the versions in the lockfile with `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env.local`. Enter your Gnani and Google AI Studio keys privately in that file. Never put them in chat or source control. Confirm that the configured reasoning model is available to your account.
3. Run `pnpm dev`, then open `http://localhost:3000/vault`.
4. `/api/health` should report both provider configuration flags as true. This checks presence only, not whether the credentials work.

Development and production builds copy the installed VAD model, worklet and ONNX runtime assets into `public/vad`. These generated files are ignored by Git; they are recreated by the predev/prebuild scripts. The optional protobufjs install script is explicitly disabled; it only prints a dependency compatibility warning.

## User acceptance — still needs a real speaker and live credentials

- In Family Archive, add or choose the person whose consenting voice you will record. In Voice Lab, check consent and record three passages for about eight seconds each. Confirm the **real calibration** status shows `[1 × 768]`. Historical profile statistics are labelled samples.
- In Biographer, choose one of the seven themes and start a voice interview. Enter the recipient name and choose Hindi. Confirm the question plays, then record an answer. Confirm its transcript appears in Devanagari.
- Pause for three seconds during a longer answer. Confirm the acoustic HUD reports `hesitant_vulnerable`. The recording ends after four seconds of silence or a maximum of 28 seconds.
- Complete five answers and compile the letter. Confirm Capsule Vault opens with your actual letter. If a provider call fails, use **Retry saved answer**; it should reuse the recording rather than ask you to speak again.
- Choose a recipient language and create its letter. Confirm the wording with a fluent speaker before synthesizing cloned narration. Original recordings remain in the capsule alongside any cloned narration.
- Select an unlock time about two minutes ahead, use a new passphrase of at least twelve characters, seal, and download `.heirloom`. Keep the passphrase separately. Upload the file in **Open & verify a capsule**: it must refuse before the unlock time, then open after the beacon is published. Confirm original answers and cloned narration play.
- Try a wrong passphrase and a damaged file. Both must show an error without exposing the letter.
- Rapidly activate the same recording action twice. Only one recording/request should start. Test microphone denial, revoked consent, a lost connection, refresh after a completed turn, mobile layout, keyboard focus, and blocked audio autoplay.

## Verified automatically

`pnpm test` checks text normalization, retry timing, audio headers and duration limits, acoustic classification, microphone cleanup, browser flight locking, configuration and provider error paths, reasoning contracts, chapter language/length, and actual AES plus timelock round trips. Crypto tests use a public historical drand beacon as a fixture; the encryption algorithms themselves are not mocked.

Run `pnpm typecheck` and `pnpm build` before release. There is no existing lint configuration or lint command.

## Architecture corrections and limits

- The user approved correcting the earlier language claim: Gnani's current TTS reference lists **ten total languages: nine Indian languages plus English**. The existing language array's entries are preserved. Source: https://docs.gnani.ai/api/TTS/tts-inference . Previously stored sample profile counts may still reflect the earlier prototype.
- The environment example uses `gemini-3.8-flash`, currently listed in Google's model documentation: https://firebase.google.com/docs/ai-logic/models?api=dev . Access must be checked with the actual account; a configured key does not prove model access.
- The installed drand client defines round one at genesis. Timelock sealing rounds up and adds that initial round so a capsule cannot open before its selected timestamp. This corrects the earlier floor-only formula. Date, chain, salt, IV and round metadata are authenticated by AES-GCM.
- Timelock opening needs the public drand beacon. Completely offline opening without a previously obtained beacon is not provided. There is no passphrase bypass for future locks and no recovery if the passphrase is lost.
- Working drafts and voice embeddings are stored in this browser's IndexedDB. They are not encrypted at rest. Exported capsules are encrypted. Use a private device and protect its browser profile. Clearing browser data removes working drafts.
- Original WAV data is saved before provider requests and included only in local storage and exported capsules. Reasoning requests send transcript and telemetry, with the audio fields emptied to avoid transmitting recordings or exceeding deployment request limits.
- Numbers, dates, currency, common titles and conjunctions are normalized in all ten supported languages. Native Indian digit scripts are accepted. The dependency-free to-words library supplies locale-specific number forms. Fluent speakers should still review synthesized pronunciation.
- The single-flight guard covers this browser JavaScript instance. Independent tabs, devices and serverless instances can still overlap. A single 1500ms retry handles a provider 429; a global request queue is not implemented, as specified in the current architecture.
- Only the most recently compiled bundle is shown in the real capsule panel. Completed sessions and raw audio are saved locally by member and mode. Download each sealed file before replacing a draft. A multi-capsule production library and printable QR recovery card are not implemented.
- Landing interactions and historical archive entries remain labelled design samples using browser speech. Their sample exports are not real timelocked voice capsules. Real processing is accessed through Voice Lab, **Start Voice Interview**, and **Your recorded heirloom**.

## Public release gates

Do not claim production acceptance until the real speaker checklist passes. No paid API call has been verified without credentials.

Before exposing paid routes publicly, configure hosting access controls and spending limits, and verify abuse protection. Same-origin browser checks and the UI lock do not prevent direct scripted use of public endpoints. This application intentionally has no user accounts or shared server-side rate limiter.

The user approved replacing unverified provider retention guarantees with the actual local/external processing boundaries. Reconfirm provider terms before release. The protected legacy `lib/local-crypto.ts` remains unchanged and contains a sample fallback; the real capsule workflow uses `lib/crypto/heirloom-vault.ts` instead.

Deployment requires your GitHub repository and Vercel account. Set all eight example environment values privately in the deployment environment, select Node 24.x, keep access restricted during acceptance, and test over HTTPS. This work does not publish a site or spend provider credits on your behalf.

Final local verification: 75 tests passed across 12 test files; production build passed with all seven API routes and the interview page. That checkpoint is retained in local recovery history; GitHub main uses the focused release commits. Live API and speaker acceptance remain pending because no credentials are configured.

## Frontend refinement and publication checkpoint

The real `/vault` now starts with empty profiles and contains only real voice calibration, interview and capsule actions. Historical seeded profiles and simulated controls are accessible at `/demo`; old local storage is preserved there. Landing samples are explicitly illustrative. The quick studio now records real audio. Protected legacy files stay in their existing locations to avoid an unsafe relocation; the real vault has no dependency on their mock state.

Native selects have been replaced with the shared keyboard-accessible picker. Theme colors use shared light/dark variables for every opacity variant, including input and card surfaces. The brand uses a reduced-motion-aware waveform. Scrollbars are hidden without disabling scrolling; forced-color mode restores native scroll affordances. The original vault navigation, summary layout, fonts, palette and card surfaces are retained.

Seven unused generator/UI dependencies and their unreachable helper/button/configuration, five unreferenced placeholder assets, and stale v0 ignore entries were removed after reference checks. Live provider acceptance remains pending at the user’s explicit request.

Final refinement validation: 79 automated tests pass across 13 files. Production build and type checks pass. The desktop vault and mobile 390px views were inspected in light/dark mode, and the custom language menu was exercised in the running browser. The mobile header overflow was corrected. Public provider testing is intentionally pending at the user’s request. Frontend runs at http://localhost:3000 .

## Vercel import handoff

Follow README.md for the exact Vercel settings, Corepack environment flag, private credentials and post-deployment smoke checks. Node 24.x and pnpm 12.5.1 are pinned. Long narration responses use a bounded WAV stream with no Content-Length header, and all provider functions have a 60-second budget. Live provider acceptance stays pending at the user’s request; no cloud deployment is performed by this preparation.

Deployment preparation verified: frozen-lockfile install passed under Node 24.17.0 / pnpm 12.5.1; 86 tests passed across 14 files; the production build passed. The generated functions configuration includes maxDuration 60 for all six provider endpoints. Actual Vercel deployment and live provider acceptance remain pending.
