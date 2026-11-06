# Privacy and data handling

This document describes the implemented data boundaries. It is not a claim of legal certification or a guarantee about external provider retention.

## What happens where

| Activity                                                              | Location                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------ |
| Microphone capture, speech-end detection and acoustic analysis        | Browser                                                |
| Family profiles, current interviews, calibration clips and embeddings | Browser localStorage or IndexedDB                      |
| Speech transcription and voice embedding generation                   | Gnani AI through the application's server proxy        |
| Interview question generation, letter compilation and translation     | Configured reasoning provider through the server proxy |
| Interviewer speech and cloned narration                               | Gnani AI through the server proxy                      |
| Capsule AES encryption, timelock sealing and decryption               | Browser, with access to public drand data              |
| Exported capsule                                                      | A downloaded file held by the user                     |

The application's server routes process requests in memory and do not intentionally save family audio, transcripts, embeddings or capsules to an application database or object store. This does not establish retention behavior for hosting infrastructure or external AI providers. Review their current terms before use.

The production layout includes Vercel Analytics. Do not describe the application as collecting no technical usage data. No application code intentionally sends the contents of a family archive to analytics.

## Consent and AI disclosure

Real microphone controls require a consent checkbox. Transcription, embedding and cloned synthesis requests also carry explicit consent fields. Users must record their own voice or have the speaker's permission. A checkbox does not itself prove that permission exists.

The exported bundle distinguishes original human recordings from AI-assisted interview prompts, compiled text and optional AI-cloned narration. Transcripts, translations and synthesized audio can be inaccurate and should be reviewed by the speaker or a fluent listener.

Acoustic labels describe deterministic audio measurements. They are not verified emotional diagnoses, medical assessments or psychological conclusions.

## Storage and access

Working profiles, recordings, transcripts and embeddings are not encrypted at rest in browser storage. Anyone with access to the browser profile or an unlocked device may be able to access them. Use a private device and protect its user account.

Storage is tied to the browser and site origin. Localhost, a Vercel preview hostname, the production hostname and a custom domain have separate browser stores. There is no sign-in, cross-device synchronization or automatic backup.

Clearing site data removes local drafts. The app currently has no dedicated data-deletion screen; export and check needed capsules before using the browser's site-data controls. Clearing local storage does not delete separately downloaded files or reverse external processing that already occurred.

## Exported capsule protection

Real `.heirloom` files use PBKDF2-SHA256 with 210,000 iterations, a random 16-byte salt, AES-256-GCM with a random 12-byte IV, and a drand timelock. The date, round, chain and encryption settings are authenticated. The unlock timestamp and other envelope fields remain readable metadata; the bundle contents are encrypted.

Choose a strong passphrase and keep it separately from the file. The minimum length is twelve characters, which is an input rule rather than proof of passphrase strength. A lost passphrase cannot be recovered by the app.

Knowing the passphrase alone does not bypass a future timelock. Decryption also needs the public drand beacon once its round is published. There is no built-in fully offline first unlock, provider-independent delivery guarantee, or guaranteed decades-long service availability. Keep file backups and preserve the application source if long-term portability matters.

The sealed bundle may contain a reusable speaker embedding. Treat the capsule and its passphrase as sensitive, because an authorized recipient who decrypts it gains access to that representation as well as the recordings.

## Credentials and deployment

Provider API keys belong in private server environment variables. They must never appear in `NEXT_PUBLIC_*`, screenshots, issue reports, browser bundles, logs or committed environment files. `.env.example` contains empty key placeholders only.

The UI flight lock and Origin check do not prevent direct scripted calls to public paid routes. Keep deployment access restricted during acceptance, apply hosting and provider spending controls, and resolve the release gates before opening the service to the public.

## Demonstrations

`/demo` and labelled landing samples illustrate the design with fictional profiles and preview helpers. Legacy helpers are retained for compatibility and must not be presented as the real capsule security path. Use `/vault` for real recordings and `lib/crypto/heirloom-vault.ts` for real capsule encryption.
