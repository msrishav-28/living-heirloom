# Living Heirloom

[![Next.js 16.4.3](https://img.shields.io/badge/Next.js-16.4.3-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript 5.7.3](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js 24](https://img.shields.io/badge/Node.js-24-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm 12.5.1](https://img.shields.io/badge/pnpm-12.5.1-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Preserve family voices through consent-based recording, adaptive interviews, multilingual narration, and encrypted time capsules.

Living Heirloom combines a browser-based family vault with Gnani speech services, a configurable reasoning provider, and browser-side AES-GCM plus drand timelock encryption. Profiles, recordings, and working drafts stay in the current browser. Speech and interview generation use external providers through server routes with private credentials.

## What you can do

- Add a storyteller and record three voice-calibration clips with consent.
- Complete a five-answer interview across seven themes, with acoustic telemetry informing follow-up questions.
- Compile a letter, create a recipient-language version, and optionally synthesize cloned narration.
- Preserve original recordings in a passphrase-protected, time-locked `.heirloom` file; download it and reopen it after its unlock time.
- Use English, Hindi, Tamil, Kannada, Telugu, Malayalam, Marathi, Bengali, Gujarati, or Punjabi.

The real vault at `/vault` starts empty. Fictional profiles and simulated interactions are isolated at `/demo`; landing previews are labelled illustrative. The current capsule panel holds the latest compiled bundle. There are no user accounts, cloud synchronization, scheduled delivery, or multi-capsule library.

## Documentation

| I want to…                                      | Read                                         |
| ----------------------------------------------- | -------------------------------------------- |
| Record and preserve a family voice              | [User guide](docs/USER_GUIDE.md)             |
| Set up or contribute to the codebase            | [Developer guide](docs/DEVELOPMENT.md)       |
| Understand request formats and errors           | [API reference](docs/API.md)                 |
| Deploy the application on Vercel                | [Deployment guide](docs/DEPLOYMENT.md)       |
| Understand storage, processing, and privacy     | [Privacy and data handling](docs/PRIVACY.md) |
| Review design decisions and system boundaries   | [Architecture](ARCHITECTURE.md)              |
| Review verification and remaining release gates | [Release checklist](RELEASE_CHECKLIST.md)    |

See the [documentation index](docs/README.md) for the current plan, agent instructions, and archived original planning transcript.

## Run locally

Use Node.js **24.x** and pnpm **12.5.1**, matching `package.json`.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local`, then enter provider credentials privately. Never commit that file or paste keys into chat. See the [environment settings](docs/DEPLOYMENT.md#environment-variables) for the eight application variables and the additional Vercel Corepack flag.

```sh
pnpm dev
```

Open [the application](http://localhost:3000), [the real vault](http://localhost:3000/vault), or [the separate demo](http://localhost:3000/demo). Microphone access requires localhost or HTTPS. `/api/health` reports configuration presence; it does not verify credentials or model access.

## Verify

```sh
pnpm test
pnpm typecheck
pnpm build
```

Development and production builds copy the installed VAD model, worklet, and ONNX runtime assets into `public/vad`. These generated assets are recreated automatically. See the [developer guide](docs/DEVELOPMENT.md) for module boundaries, test coverage, storage keys, and contribution rules.

## Release status

As of **6 November 2026**, automated verification reports **86 passing tests across 14 files**, a successful type check, and a successful production build. The existing editorial design, light/dark themes, custom controls, and waveform branding are retained.

Live provider and real-speaker acceptance remain pending at the owner's request. Actual Vercel deployment is also pending. Follow the [deployment guide](docs/DEPLOYMENT.md) and complete the [release checklist](RELEASE_CHECKLIST.md) before declaring public acceptance.

Working drafts are not encrypted at rest. Exported capsules require the passphrase and the public drand beacon after the chosen unlock time. Back up downloaded files and keep passphrases separately. Provider retention follows the provider's terms; no zero-retention guarantee is made. Paid routes currently have no user authentication or shared request limiter, so keep acceptance deployments protected and configure provider spending controls.
