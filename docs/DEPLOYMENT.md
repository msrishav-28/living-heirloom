# Vercel deployment guide

The source repository is [msrishav-28/living-heirloom](https://github.com/msrishav-28/living-heirloom). The current release history is on `main`. Deployment itself and live provider acceptance are pending; the user explicitly deferred live provider testing.

## Import settings

In Vercel, choose **Add New**, then **Project**, connect the GitHub account with access to the repository, and import the repository.

| Setting           | Value                                                             |
| ----------------- | ----------------------------------------------------------------- |
| Production branch | `main`                                                            |
| Root directory    | Repository root, `./`                                             |
| Framework preset  | Next.js                                                           |
| Node.js           | `24.x`, also declared in `package.json`                           |
| Package manager   | `pnpm@12.5.1`, declared in `package.json`                         |
| Build command     | `pnpm build`, declared in `vercel.json`                           |
| Install command   | Detected default; enable Corepack as described below              |
| Output directory  | Detected Next.js default; do not select `public` or static export |

The app includes server routes. Deploying only its static files will not provide transcription, interview generation or voice synthesis.

## Environment variables

Add `ENABLE_EXPERIMENTAL_COREPACK=1` to each deployment environment you will use. Vercel documents this flag for honoring the package manager version in `package.json`.

Add the eight application values from [`.env.example`](../.env.example):

| Variable                           | Scope                   | Value                                                                    |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `GNANI_API_KEY`                    | Private server secret   | Your Gnani API key                                                       |
| `GNANI_API_BASE_URL`               | Server configuration    | `https://api.vachana.ai`                                                 |
| `REASONING_API_KEY`                | Private server secret   | Your reasoning-provider API key                                          |
| `REASONING_BASE_URL`               | Server configuration    | `https://generativelanguage.googleapis.com/v1beta/openai/`               |
| `REASONING_MODEL`                  | Server configuration    | `gemini-3.8-flash`, or a supported model available to the actual account |
| `NEXT_PUBLIC_DRAND_CHAIN_HASH`     | Public protocol setting | `52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971`       |
| `NEXT_PUBLIC_DRAND_GENESIS_TIME`   | Public protocol setting | `1692803367`                                                             |
| `NEXT_PUBLIC_DRAND_PERIOD_SECONDS` | Public protocol setting | `3`                                                                      |

Enter credentials privately in the project settings. Never paste them into chat or commit them to the repository. Do not add `NEXT_PUBLIC_` to a secret key. Confirm the model is available to the actual account rather than assume the example proves access.

The capsule implementation currently pins its drand network in code and in its schema. Changing only the public environment values does not reconfigure that protocol. Keep the defaults unless changing the implementation and compatibility contract deliberately.

Redeploy after changing environment values. Public values are incorporated at build time. Preview and production environments have separate settings; avoid sharing live keys with untrusted preview deployments.

## Build behavior and limits

The build runs `scripts/copy-vad-assets.mjs` before Next.js compilation. It copies the installed VAD model, worklet and ONNX runtime `.wasm`/`.mjs` assets into `public/vad`. The generated directory is excluded from Git and CLI uploads because it is rebuilt from locked packages.

All six provider routes explicitly use Node.js with a 60-second budget. Gnani calls have a single 1500 ms rate-limit retry and a 25-second timeout per attempt. Reasoning calls have a 30-second timeout.

Audio uploads are limited to 16 kHz mono WAV recordings of at most 28 seconds. The browser omits original audio from reasoning requests. Narrated letters can exceed a buffered function response limit, so the server validates a WAV under its 15 MB cap and returns a streaming response without a Content-Length header.

The `.vercelignore` file excludes private environment files, build output, dependencies, coverage, Git data and generated audio assets from CLI uploads. `.env.example` remains available as the non-secret template.

## Access and spending

Keep Deployment Protection enabled while acceptance is pending, using protection supported by the account and plan. Verify the protection actually applies to the deployment URLs being shared; do not assume a preview-only setting protects a production domain.

The application has no user accounts or shared server-side quota limiter. Origin validation and the browser flight lock are not sufficient abuse protection for a public paid API proxy. Confirm hosting controls and provider budgets before exposing live credentials publicly.

## Post-deployment checks

1. Open `/`, `/vault`, `/vault/interview?mode=childhood_roots`, and `/demo`. Check that navigation, both themes, the custom selectors and empty states render.
2. Open `/api/health`. It should return HTTP 200. The provider flags report key presence only; they do not prove working credentials or available credits.
3. Verify `/vad/silero_vad_v5.onnx` and `/vad/vad.worklet.bundle.min.js` load successfully. During microphone testing, check the referenced ONNX `.wasm` and `.mjs` requests as well.
4. On the deployed HTTPS origin, run the live-speaker checks in [RELEASE_CHECKLIST.md](../RELEASE_CHECKLIST.md) once the user authorizes them. Include a complete narrated letter, a near-future timelock, wrong passphrase rejection, microphone denial and retry after a failed provider request.
5. Confirm access protection and provider spending controls before public release.

Localhost data does not automatically appear on a deployment. Each origin has its own browser data. Transfer downloaded capsule files manually; no deployment step migrates family recordings from a private browser.

## Diagnose a failed deployment

| Symptom                                  | Check                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong package manager or install failure | Corepack environment flag, the pinned pnpm version, and the committed lockfile                                                                            |
| Runtime compatibility failure            | Node.js project setting and `engines.node` in `package.json`                                                                                              |
| Static site works but API routes do not  | Next.js framework preset and detected output directory                                                                                                    |
| VAD assets return 404                    | The prebuild asset-copy step and installed package resolution in the build log                                                                            |
| `/api/health` flags are false            | Environment scope, variable names and whether a redeploy occurred                                                                                         |
| Provider calls fail despite true flags   | Actual credential validity, account credits, model access, provider status and route errors                                                               |
| Timeout during a voice call              | The generated 60-second route budget, provider latency and plan limits                                                                                    |
| Long narration fails                     | Confirm the deployed code includes the WAV streaming helper; inspect the failed response and platform logs without exposing credentials or family content |

If a new deployment breaks an existing site, use Vercel's deployment controls to restore a previously working deployment. Do not rewrite Git history or erase local browser data to recover a deployment. A rollback does not automatically reverse environment changes, provider settings or changes in a user's browser.

## Official references

- [Package manager selection](https://vercel.com/docs/package-managers)
- [Corepack configuration](https://vercel.com/docs/builds/configure-a-build#corepack)
- [Supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Function duration](https://vercel.com/docs/functions/configuring-functions/duration)
- [Response sizes and streaming](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)
