# Current implementation and release plan

Updated 6 November 2026. This is the current plan for the repository. The [original planning transcript](docs/history/ORIGINAL_PLAN.md) is retained as historical context; it contains obsolete examples and conflicting drafts and is not a current specification.

## Completed implementation

| Area                   | Delivered behavior                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation             | Shared Zod contracts, ten supported languages, seven interview modes, bounded provider requests and safe errors                                                  |
| Server routes          | Health, STT, voice embedding, interviewer TTS, cloned synthesis, adaptive turn generation, and chapter compilation                                               |
| Browser audio          | Local VAD assets, real microphone capture, WAV encoding, acoustic measurements, manual stop, silence ending, and duration cap                                    |
| Persistence            | Real local family profiles; saved calibration, embeddings, interview turns and pending recordings; latest compiled/sealed bundle                                 |
| Interview              | Five recorded answers, spoken questions, transcript/excerpt preview, retry saved answer, and restored drafts                                                     |
| Capsule                | Recipient-language letter creation, optional cloned narration, original answer preservation, real authenticated encryption and timelock download/opening         |
| Design refinement      | Existing editorial design retained; shared light/dark colors, custom accessible picker, waveform branding, mobile overflow fix, reduced motion                   |
| Demo separation        | Empty real vault at `/vault`; fictional profiles and simulated controls at `/demo`; labelled landing samples                                                     |
| Cleanup                | Verified unused generator dependencies, unreachable helpers/configuration, placeholder assets, and stale ignore entries removed; used legacy demo files retained |
| Deployment preparation | Pinned Node/pnpm, VAD prebuild assets, Vercel framework/build settings, provider function budgets, bounded WAV streaming                                         |
| Documentation          | README with stack badges; user, developer, API, privacy and deployment guides; reconciled architecture, agent instructions and release checklist                 |

Automated verification reports 86 passing tests across 14 files, a successful type check and production build. This establishes local implementation checks, not live provider acceptance.

## Remaining release work

1. Import the published GitHub `main` into Vercel using the [deployment guide](docs/DEPLOYMENT.md).
2. Set private provider credentials, confirm model access, and protect the deployment during acceptance. Never paste keys into chat or commit them.
3. When the owner resumes live testing, run the real-speaker/provider checks in the [release checklist](RELEASE_CHECKLIST.md), including a complete narrated letter and downloaded capsule round trip on HTTPS.
4. Resolve any issues demonstrated by those checks. Confirm hosting access and spending controls for the intended audience before declaring public acceptance.

Live provider testing is intentionally pending at the owner's request. No actual cloud deployment has been performed as part of preparation. Documentation and GitHub publication do not change those gates.

## Deferred scope

These are not implemented and must not be described as complete:

- A searchable multi-capsule library and general interview-history browser.
- Printed QR recovery cards or passphrase recovery.
- Scheduled email/SMS delivery or push notifications.
- User accounts, shared family permissions, cloud backup or cross-device synchronization.
- Distributed request scheduling, account quotas or a shared server-side rate limiter.
- Fully offline first timelock opening or guaranteed decades-long service availability.

The real capsule panel currently shows the latest compiled bundle. Preserve each downloaded file before replacing it with another draft. Existing local drafts are not encrypted at rest; exported capsules are encrypted.

## Ongoing maintenance

Use [AGENTS.md](AGENTS.md) for engineering safeguards, [ARCHITECTURE.md](ARCHITECTURE.md) for current system decisions, and the [documentation index](docs/README.md) for audience-specific guides. Preserve the approved design, keep examples separate from real processing, and update documentation with behavior changes. Keep commits focused and avoid destructive cleanup or history rewrites.
