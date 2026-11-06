# Developer guide

Read [AGENTS.md](../AGENTS.md) and [ARCHITECTURE.md](../ARCHITECTURE.md) before changing the application. The archived planning transcript is historical, not a current implementation contract.

## Toolchain and setup

| Tool            | Repository setting                                        |
| --------------- | --------------------------------------------------------- |
| Node.js         | `24.x`; `.node-version` selects the same major            |
| Package manager | `pnpm@12.5.1`                                             |
| Framework       | Next.js `16.4.3`, App Router                              |
| UI              | React 19, Tailwind CSS 4, shared semantic theme variables |
| Language        | TypeScript `5.7.3`, strict mode                           |
| Tests           | Vitest, jsdom; Node environments where required           |

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local`, enter private values locally, and run `pnpm dev`. Never print or commit private environment values. Tests and production compilation do not require live provider keys. Real speech processing does.

| Command                | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `pnpm dev`             | Copy VAD assets and start the development server                      |
| `pnpm test`            | Run the automated suite once                                          |
| `pnpm test --coverage` | Generate Vitest coverage output                                       |
| `pnpm typecheck`       | Run TypeScript without emitting application files                     |
| `pnpm build`           | Copy VAD assets, compile, typecheck, and produce the production build |
| `pnpm start`           | Serve a previously built production app                               |

There is no repository lint command. Do not claim lint passed. Prettier is available; format only relevant files, using single quotes, no semicolons, and CRLF.

### Windows build-runner troubleshooting

During the 6 November documentation verification, the baseline `pnpm build` passed, but later runs through the installed Windows pnpm executable caused Turbopack's CSS worker to exit before connecting. The same production build completed successfully when invoked directly with Node.js 24:

```sh
node scripts/copy-vad-assets.mjs
node node_modules/next/dist/bin/next build
```

Use these commands to isolate that local runner failure. Both steps are necessary because direct Next.js invocation does not run the package's prebuild script. This observation does not verify the Vercel build; confirm the normal build command in the deployment log. Do not disable TypeScript checks or change application styling to work around this process error.

## Module boundaries

| Location                                                                   | Owns                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `app/vault/page.tsx`                                                       | Real profiles, workspace shell, storyteller and theme selection                  |
| `components/vault/real-voice-lab.tsx`                                      | Real calibration and narration controls                                          |
| `components/vault/interview-room.tsx`                                      | Interview UI, waveform, acoustic HUD, and question playback                      |
| `components/vault/capsule-release-panel.tsx`                               | Current compiled letter, translation, narration, sealing and file opening        |
| `hooks/useHeirloomStudio.ts`                                               | Recording, request orchestration, persistence and capsule state                  |
| `lib/product-contracts.ts`                                                 | Zod schemas and inferred boundary types                                          |
| `lib/audio/`                                                               | VAD lifecycle, PCM analysis, WAV encoding                                        |
| `lib/gnani/`                                                               | Provider error/retry behavior and spoken-text normalization                      |
| `lib/server/`                                                              | Shared route handling, provider calls, audio input and streamed responses        |
| `lib/crypto/heirloom-vault.ts`                                             | Real authenticated encryption and timelock open/seal                             |
| `lib/storage/local-draft-store.ts`                                         | IndexedDB access and schema validation on restored structured drafts             |
| `components/ui/bespoke-controls.tsx`                                       | Accessible shared custom dropdown                                                |
| `components/brand-waveform.tsx`                                            | Reduced-motion-aware brand mark                                                  |
| `components/demo/demo-vault.tsx`                                           | Demo shell for historical workspaces                                             |
| `lib/heirloom-vault-store.ts`, `lib/local-crypto.ts`, `lib/voice-synth.ts` | Legacy seeded/demo state and preview helpers; not the real capsule security path |

The older `*-workspace.tsx` files remain in `components/vault/` for compatibility but are called by the demo shell. Do not infer production usage from their folder name. The real vault does not call the legacy seeded store. Landing examples remain explicitly illustrative. See [API reference](API.md) for exact route contracts.

## Browser persistence

Real profiles use localStorage key `living-heirloom-real-members-v1`. Theme preference uses `living-heirloom-theme`. Historical demo profiles use a separate legacy key, `living-heirloom-gnani-vault-v1`.

IndexedDB uses database `living-heirloom-drafts`, object store `drafts`:

| Key pattern                             | Stored value                                     |
| --------------------------------------- | ------------------------------------------------ |
| `session:<memberId>:<mode>`             | Current interview session and completed turns    |
| `embedding:<memberId>`                  | Validated speaker embedding                      |
| `audio:<memberId>:calibration:<index>`  | Original calibration WAV                         |
| `audio:<sessionId>:pending:<turnCount>` | Original pending turn before external processing |
| `latest-bundle`                         | Most recently compiled bundle                    |
| `audio:latest-sealed`                   | Latest sealed JSON file stored as a Blob         |

These drafts are not encrypted at rest. A compiled bundle includes the original WAV answers, letter, optional speaker embedding and optional cloned narration. The UI exposes the most recently compiled bundle; it does not provide a complete multi-capsule library. Do not delete or rewrite existing browser data as a cleanup side effect.

## Audio and request lifecycle

1. Explicit consent enables recording.
2. Silero VAD loads locally served assets lazily. Microphone tracks stop on completion, manual stop or initialization failure.
3. Recording produces 16 kHz mono PCM. The encoder emits 16-bit little-endian WAV with a 28-second cap. Calibration captures up to eight seconds per passage and concatenates three validated clips for the provider.
4. Save original WAV before sending speech requests. Analyze actual PCM rather than infer acoustic measurements from transcript text.
5. STT returns a transcript; the reasoning service supplies the next question and distilled excerpt.
6. Reasoning requests empty the `audioWavBase64` fields. They send transcript and telemetry, not original recordings.
7. Five turns permit compilation. Save the bundle before redirecting to the capsule workspace.

The browser flight lock rejects overlapping actions within one JavaScript instance. It is not a cross-tab, distributed or server-side concurrency guarantee. Gnani 429 handling retries once after 1500 ms; all other failures propagate immediately.

Provider requests use server-only credentials, reject credential-forwarding redirects and have bounded timeouts: 25 seconds per Gnani attempt and 30 seconds for reasoning. Six paid routes select Node.js and a 60-second function budget. A WAV response is validated and accumulated with a 15 MB cap before headers are sent, then delivered in chunks of at most 64 KiB without a Content-Length header. This is response streaming, not progressive provider playback.

## UI and accessibility

Keep the existing editorial typography, warm palette, four workspace tabs and card surfaces. Use shared light/dark variables rather than hard-coded white surfaces. The shared dropdown owns keyboard selection, dismissal and focus restoration. Do not reintroduce native selects into these flows.

The owner requested removal of AI-generated decorative images. The hero and capsule previews now use their existing text and themed surfaces without photographic artwork. Do not reintroduce generated photography or illustration; preserve functional icons and waveform branding.

Respect reduced motion. Hidden scrollbar tracks must not disable scrolling or keyboard access; forced-color mode restores native scroll affordances. Test desktop and narrow layouts, light/dark themes, focus, errors and long translated text.

## Verification and contributions

Run the baseline build, inspect each affected file and its dependents, and search for matching patterns before editing. After meaningful code changes, run relevant tests, typecheck and the production build. The release checkpoint has 86 passing tests across 14 files; use the current test run as evidence when changing code.

Tests use synthetic PCM, explicit provider fixtures and a real historical public drand beacon. External network boundaries may be mocked; production behavior must not be replaced to manufacture success. No skipped, TODO or vacuous tests are allowed.

Stage named paths and create focused commits. Push to the existing GitHub `main` through the configured remote using authorized credentials. Do not force-push, rewrite published history, discard work, or commit secrets. Update the relevant documentation with behavioral changes.

For deployment, follow [Vercel deployment](DEPLOYMENT.md). For current privacy and release limitations, see [Privacy](PRIVACY.md) and [the release checklist](../RELEASE_CHECKLIST.md).
