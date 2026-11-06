# Testing and release checklist

Updated 6 November 2026. The local implementation and documentation are prepared for acceptance testing and Vercel import. Public acceptance and actual deployment remain pending. The owner explicitly deferred live provider testing.

## Automated verification

| Check                           | Current result                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| Frozen-lockfile installation    | Passed with Node.js 24.17.0 and pnpm 12.5.1 during deployment preparation                   |
| `pnpm test`                     | 86 tests passed across 14 files                                                             |
| `pnpm typecheck`                | Passed                                                                                      |
| `pnpm build`                    | Passed; seven API routes and all application pages generated                                |
| Provider function configuration | Six provider routes specify Node.js and a 60-second budget                                  |
| Documentation                   | Current guides cover users, contributors, API, privacy, architecture, and Vercel deployment |

The suite checks normalization, retry timing, WAV headers and duration caps, acoustic classification, microphone cleanup, browser flight locking, provider/configuration errors, reasoning contracts, letter language/length, streamed WAV handling, and actual AES plus timelock round trips. Crypto tests use a historical public drand beacon fixture, with real encryption and authentication.

There is no configured lint command. Test doubles at external boundaries do not establish live speech quality, working account credentials, or provider model access.

Documentation verification reran all 86 tests and type checking successfully. The baseline `pnpm build` passed; subsequent runs through the installed Windows pnpm runner hit a Turbopack child-process failure, including outside the sandbox. The final production build passed with the same asset-copy and Next.js build steps invoked directly through Node.js 24. See the [documented workaround](docs/DEVELOPMENT.md#windows-build-runner-troubleshooting). The actual Vercel runner still needs deployment verification.

## Frontend verification already performed

Desktop and 390 px mobile views were inspected in light and dark themes during implementation. The custom language picker was exercised in the running browser, and mobile header overflow was corrected. The approved editorial composition, typography, palette, workspace navigation, and card layout were retained. Colors now use shared theme variables; the logo is an animated, reduced-motion-aware waveform. Scrollbar tracks are hidden without disabling scrolling, and forced-color mode restores native affordances.

The real `/vault` starts empty and contains real provider-backed recording and capsule actions. Fictional seeded state and simulated interactions are available separately at `/demo`; landing previews are labelled illustrative. The real vault does not silently replace provider failures with sample data.

## Live acceptance: pending

Use a private localhost or protected HTTPS deployment. Configure credentials privately from `.env.example`; `/api/health` only confirms their presence. A real speaker and working provider account are required for these checks.

- [ ] Add a storyteller, give consent, and record three calibration passages of about eight seconds. Confirm a real `[1 × 768]` embedding is returned and restored after refresh.
- [ ] Choose Hindi and record an interview answer. Confirm the question plays and its transcript appears in Devanagari. Have a fluent speaker assess the text and audio.
- [ ] Pause for three seconds during a longer answer. Confirm `hesitant_vulnerable` appears in the acoustic HUD. Confirm the four-second silence ending and 28-second recording cap.
- [ ] Complete five answers and compile the actual letter. Confirm an interruption can use **Retry saved answer** and a refreshed session restores completed turns.
- [ ] Create a recipient-language letter, review it with a fluent speaker, and generate cloned narration using the same storyteller's calibration. Verify playback of a full-length letter on deployed HTTPS.
- [ ] Choose an unlock time a few minutes ahead, use a new passphrase of at least twelve characters, seal, and download a real `.heirloom` file. Re-upload it: refuse opening before the time, then open after the beacon publishes. Play the original recordings and optional cloned narration.
- [ ] Reject a wrong passphrase and damaged file without exposing the letter.
- [ ] Rapidly activate the same recording action twice; only one action should start. Test microphone denial, revoked consent, lost connection, blocked autoplay, keyboard navigation, and mobile light/dark layouts.

The browser lock covers one JavaScript instance. Do not interpret the last check as a distributed concurrency or abuse-prevention guarantee.

## Deployment: pending

Follow the [Vercel deployment guide](docs/DEPLOYMENT.md).

- [ ] Import `msrishav-28/living-heirloom`, branch `main`, repository root, using the Next.js preset and Node.js 24.x.
- [ ] Set the eight application environment values privately and add `ENABLE_EXPERIMENTAL_COREPACK=1` for the environments in use.
- [ ] Confirm the configured reasoning model is actually available to the account. Build and deploy; redeploy after environment changes.
- [ ] Check all page routes, `/api/health`, VAD model/worklet/runtime assets, and server-route behavior on the deployed origin.
- [ ] Confirm Deployment Protection applies to every URL shared for private acceptance and configure provider spending controls.
- [ ] Complete live acceptance above and resolve access/quota controls appropriate to the intended public audience before declaring public release.

There is no user authentication or shared server-side request limiter. Same-origin checks and a browser lock do not block direct scripted use of public paid endpoints. GitHub publication is not evidence of an actual Vercel deployment.

## Boundaries to carry into release

- Ten supported languages: nine Indian languages plus English. Historical eleven-language claims are superseded by the approved correction.
- Working drafts and embeddings are local but unencrypted at rest. Download backups; browser clearing, another device, and a different origin do not preserve or migrate them automatically.
- Capsule opening needs its passphrase and the public drand beacon. No recovery bypass or fully offline first opening is provided.
- Original answer audio remains local and in exported capsules; reasoning requests contain transcript and telemetry with original audio fields emptied.
- External processing follows provider terms. No isolated zero-retention enclave or retention guarantee has been verified.
- Only the latest compiled bundle is shown. Multi-capsule library, printable recovery cards, scheduled delivery, cloud synchronization, and accounts are deferred.
- Protected legacy demo helpers remain for design compatibility. The real capsule path is `lib/crypto/heirloom-vault.ts`.

See [the current plan](plan.md), [architecture](ARCHITECTURE.md), and [privacy guide](docs/PRIVACY.md) for supporting details. Do not mark live acceptance or deployment complete without evidence.
