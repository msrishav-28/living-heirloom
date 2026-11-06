# Living Heirloom agent instructions

Updated 6 November 2026. Apply these instructions alongside the user's current request and personal engineering defaults. The target submission is 10 November 2026, 11:59 PM IST. Do not present unverified behavior as complete.

## Mandatory session workflow

1. Read the full [architecture](ARCHITECTURE.md) before editing. Read the [current plan](plan.md) and [release checklist](RELEASE_CHECKLIST.md) for scope and remaining gates.
2. Run `pnpm build` before work and after significant changes. Report existing failures separately from new failures.
3. Open every file you intend to edit. Search with `rg` for related implementations and keep shared patterns consistent.
4. Read local code or official documentation before relying on API fields, library behavior, or CLI flags. Never invent provider contracts.
5. Make small, safe changes, preserving behavior outside the requested scope. Follow established architecture and formatting.
6. Run relevant tests, `pnpm typecheck`, and `pnpm build` after significant code changes. There is no configured lint command; do not claim one passed.

The [developer guide](docs/DEVELOPMENT.md) describes setup and module ownership. The [API reference](docs/API.md) is the current contract guide. The archived original plan is historical context and must not override current schemas or these instructions.

## Product boundaries

- `/vault` is the real application and starts with empty profiles. `/demo` contains fictional profiles and simulated controls. Landing previews must remain explicitly illustrative.
- Keep demo state and exports out of the real vault. Production capsule encryption lives in `lib/crypto/heirloom-vault.ts`; the older `lib/local-crypto.ts` belongs to legacy demonstrations.
- The approved language correction is **ten total languages: nine Indian languages plus English**. Preserve the existing `GNANI_LANGUAGES` entries and matching contracts. Do not add unsupported languages or inflate claims.
- Interviews have seven modes and exactly five answers before compilation. Validate against `lib/product-contracts.ts` rather than duplicating schemas.
- Preserve original recordings before provider requests. Reasoning calls receive transcripts and telemetry, with original audio fields emptied. Restore saved drafts and pending answers on retry.
- Keep the latest-bundle limitation explicit. A multi-capsule library, printable recovery cards, scheduled delivery, accounts, and cloud synchronization are not implemented.

## Protected areas and approved changes

- Do not delete or rewrite `lib/local-crypto.ts` without explicit permission. Do not casually relocate the legacy store or demo helpers; trace all references first.
- Preserve the approved landing composition, typography, spacing, and visual direction. Make surgical fixes for an authorized request; a broad redesign needs explicit permission.
- The owner approved correcting language claims and replacing unverified zero-retention statements with actual processing boundaries. Do not reintroduce those claims.
- Theme, custom-control, waveform, documentation, and verified dependency-cleanup refinements were requested by the owner. This is not permission for unrelated restructuring or destructive history changes.
- Never delete user browser data, reset Git history, or make large destructive changes without explicit authorization and a recovery plan.

## Provider and API rules

- Keep `GNANI_API_KEY` and `REASONING_API_KEY` server-only. Never use a `NEXT_PUBLIC_` secret or commit `.env.local`, keys, recordings, or personal transcripts.
- Validate inputs before checking configuration or making paid calls. Use shared consent, same-origin, no-store, response, and error helpers.
- Return safe schema-based errors. Never return upstream bodies, raw exceptions, or secrets to the client.
- Gnani calls retry HTTP 429 once after 1500 ms. Do not add an in-process server singleton queue as a cross-instance concurrency guarantee.
- Keep the browser flight lock active across recording and network operations. It covers one JavaScript instance, not independent tabs or devices.
- Provider routes use Node.js with a 60-second budget. Preserve bounded input audio and validated streamed WAV output. See [deployment constraints](docs/DEPLOYMENT.md).
- A health response confirms configuration presence only. Live credentials and model access require actual acceptance tests, which the owner has deferred.

## Audio, privacy, and crypto

- Require explicit consent before microphone access and external voice processing. Release microphone tracks and audio resources on stop, failure, or unmount.
- Preserve 16 kHz mono PCM recording, the 28-second cap, and documented acoustic thresholds. Acoustic labels are signal heuristics, not medical or emotional diagnoses.
- Use browser Web Crypto and the real timelock implementation. Preserve authenticated metadata, random salts and IVs, 210,000 PBKDF2 iterations, and round selection that cannot precede the requested time.
- Never weaken crypto or substitute demo exports for real `.heirloom` files. Future locks and wrong passphrases must fail safely.
- Working browser drafts and embeddings are unencrypted at rest. Exported capsules are encrypted. Opening requires the passphrase and drand beacon; do not promise fully offline first opening or passphrase recovery.
- No provider zero-retention, isolated-enclave, legal-compliance certification, or training-exclusion claim is supported by this codebase. Use [privacy documentation](docs/PRIVACY.md).

## Frontend quality

- Preserve the existing design system. Use shared theme variables for surfaces, text, borders, disabled states, and translucent colors in both themes.
- Do not reintroduce AI-generated decorative images. The owner requested their removal; use the existing typography, surfaces, icons, and waveform branding.
- Use the shared keyboard-accessible custom picker. Keep scrolling functional when hiding visual scrollbars and retain forced-color accessibility affordances.
- Keep semantic HTML, visible focus states, sufficient contrast, keyboard navigation, and appropriate ARIA. Respect reduced motion for waveform and transition effects.
- Verify affected flows at desktop and mobile sizes in both themes. Do not report browser checks that were not performed.

## Test integrity

- No skipped, todo, vacuous, or fabricated tests. Fix implementation defects rather than changing assertions merely to obtain a pass.
- Use meaningful inputs and test actual error paths. Mock external provider, network, or microphone boundaries where necessary; do not replace the behavior under test.
- Crypto tests must exercise real encryption and authentication. Historical public drand fixtures are appropriate for deterministic tests.
- Keep tests next to code in `__tests__` directories. Do not add implementation-mirroring tests for trivial documentation or cosmetic changes.
- Keep build errors visible; never add `ignoreBuildErrors: true`.

## Documentation and delivery

- Update relevant guides when behavior changes. Use plain text status labels and **no emojis in Markdown**. Technology badges may identify tools without implying acceptance or certification.
- Keep UTF-8 encoding and Windows CRLF line endings. Do not use shell edits that corrupt encoding or binary files.
- Verify references before removing dependencies, assets, platform artifacts, or helpers. Do not remove libraries merely because they look unfamiliar.
- Stage explicit paths, review diffs for secrets and unrelated changes, and use focused commits. The owner requested GitHub publication to `msrishav-28/living-heirloom` using that account's existing credentials.
- Do not rewrite published history or force-push based on the historical plan. Follow the user's current publication request and existing remote state.
- Vercel deployment and public acceptance are distinct from GitHub publication. Follow the [release checklist](RELEASE_CHECKLIST.md); do not mark live checks complete without evidence.
