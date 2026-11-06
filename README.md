# Living Heirloom

Preserve family voices through consent-based recording, adaptive interviews, multilingual narration, and encrypted time capsules.

The application uses Next.js App Router, Gnani AI speech services, a configurable Gemini reasoning endpoint, and browser-side AES-GCM plus drand timelock encryption. Family archives persist in the browser; API routes proxy external processing using server-only credentials.

## Run locally

Use Node.js 24 and pnpm 12.5.1, matching `package.json`.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local` and enter credentials privately. Then run:

```sh
pnpm dev
```

Open [the real vault](http://localhost:3000/vault). It starts empty and uses real recordings. [The separate demonstration](http://localhost:3000/demo) contains fictional profiles and simulated examples; landing previews are also labelled illustrative.

## Verify

```sh
pnpm test
pnpm typecheck
pnpm build
```

The build copies the installed VAD model, audio worklet and ONNX runtime files into `public/vad`. These generated assets are recreated during every development and production build. The optional protobufjs install script is explicitly disabled in the workspace policy.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project**, connect GitHub, and import **msrishav-28/living-heirloom**.
2. Select branch **main**, root directory **./**, framework **Next.js**, and Node.js **24.x**. Leave the output directory and install command on their detected defaults. The repository sets the build command to `pnpm build`.
3. Add **ENABLE_EXPERIMENTAL_COREPACK=1** in the project environment for each deployment environment you will use. This lets Vercel honor the pinned pnpm version rather than select a different major version.
4. Add the eight values from `.env.example` in Vercel's Environment Variables panel. The two API keys are private server secrets; never add a `NEXT_PUBLIC_` prefix. Use an available reasoning model for your account. Non-secret defaults are listed below.
5. Keep Deployment Protection enabled while acceptance testing is pending. Confirm the account's provider spending limits before adding live keys.
6. Deploy. After any environment change, redeploy: public environment values are embedded at build time.

| Variable | Value |
| --- | --- |
| `GNANI_API_KEY` | Your private Gnani key |
| `GNANI_API_BASE_URL` | `https://api.vachana.ai` |
| `REASONING_API_KEY` | Your private reasoning-provider key |
| `REASONING_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `REASONING_MODEL` | `gemini-3.8-flash`, or a supported model available to your account |
| `NEXT_PUBLIC_DRAND_CHAIN_HASH` | `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971` |
| `NEXT_PUBLIC_DRAND_GENESIS_TIME` | `1692803367` |
| `NEXT_PUBLIC_DRAND_PERIOD_SECONDS` | `3` |

`vercel.json` selects Next.js. The six provider routes explicitly use Node.js and allow 60 seconds so a voice request can include its single rate-limit retry. Validated WAV responses are delivered as streams, with a 15 MB application cap, to avoid Vercel's buffered response limit for full narrated letters. Incoming recordings remain capped at 28 seconds; reasoning requests omit original audio.

The application currently pins the drand network in its encryption code and capsule format. Changing the three public drand settings alone does not change that protocol; use the listed defaults.

## Check the deployment

- Open `/`, `/vault`, `/vault/interview?mode=childhood_roots`, and `/demo`. Confirm navigation and both themes.
- Open `/api/health`. It should return HTTP 200. Provider configuration flags report key presence only, not valid credentials or model access.
- Confirm `/vad/silero_vad_v5.onnx`, `/vad/vad.worklet.bundle.min.js`, and the `.wasm` files referenced by the browser load successfully.
- Run the real-speaker checks in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md), including a complete narrated letter and capsule download/opening on the deployed HTTPS origin. Live provider testing is intentionally pending at the user's request.

Drafts and family profiles are tied to their browser and origin. Localhost data does not automatically appear on a Vercel hostname or custom domain. Transfer memories using downloaded `.heirloom` files. Browser drafts are not encrypted at rest; exported capsules are encrypted and require the passphrase plus the public drand beacon after the chosen unlock time.

There are no user accounts or shared server-side request limiter. Deployment Protection is required for private acceptance testing; same-origin checks and the UI lock do not protect public paid endpoints from direct scripted requests. Public production acceptance remains subject to the release checklist.

## Deployment references

- [Vercel package-manager selection](https://vercel.com/docs/package-managers)
- [Vercel Corepack configuration](https://vercel.com/docs/builds/configure-a-build#corepack)
- [Node.js version selection](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Function duration configuration](https://vercel.com/docs/functions/configuring-functions/duration)
- [Response size and streaming guidance](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
