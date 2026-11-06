# User guide

Living Heirloom helps you record family memories, turn five spoken answers into a letter, optionally narrate it in a calibrated voice, and download an encrypted time capsule.

Live speech quality has not yet been accepted against the configured providers. A missing or unavailable provider shows an error; the real vault does not substitute a fictional transcript or simulated clone.

## Before you begin

Use a private device with a microphone and a current browser. Microphone access needs HTTPS on a deployed site; localhost is suitable during development. Your site operator must configure the speech and reasoning services.

Record your own voice or obtain the speaker's permission. Read and select the consent checkbox before recording. Keep background noise low and speak in the language you choose.

| Address            | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `/`                | Product introduction with labelled illustrative previews   |
| `/vault`           | Your real archive; starts without fictional family members |
| `/vault/interview` | Full-screen, five-answer voice interview                   |
| `/demo`            | Separate fictional profiles and design demonstrations      |

The theme button switches between Sunlit and Candlelit modes. It remembers your choice in this browser. Custom dropdowns support arrow keys, Home, End, Enter, Escape, and typing the first letter of an option. Scrolling remains available even where scrollbar tracks are hidden.

## Add a storyteller

1. Open **Family Archive** in the vault.
2. Enter the storyteller's name and relationship.
3. Select **Add family member**.
4. Select **Open voice studio**, or choose the storyteller in Voice Lab or Biographer.

Profiles are stored in this browser. There is no sign-in, shared family account, or automatic synchronization to another device.

## Calibrate a voice

1. Open **Voice Lab** and select the correct storyteller.
2. Select the recording and processing consent checkbox.
3. Record three passages, about eight seconds each. Describe a family memory, a person you love, and a piece of advice.
4. Use **Stop recording** to end a passage early. Speak clearly for at least two seconds per passage.
5. After the third passage, wait for the voice embedding status to show `[1 × 768]`.

Calibration clips are saved locally before the service call. If the service fails after three clips, use **Retry voice calibration**. The embedding is saved on this device for later narration. It is a speaker representation, not proof of ownership or a guarantee of exact voice reproduction.

To audition narration, choose its language, type words in that language, and select **Generate narration in my voice**. Language selection controls synthesis; it does not translate arbitrary text entered in Voice Lab.

The homepage quick studio performs real calibration under a separate `my-voice` identity. Continue from that studio's interview link to use that voice. A newly added named storyteller has its own calibration.

## Record five answers

1. Open **Biographer**, select the storyteller and theme, then select **Start voice interview**.
2. Confirm consent, enter the recipient's name, choose the interview language, and select **Begin interview**.
3. Listen to the question. If automatic audio playback is blocked, use the audio controls or read the question.
4. Select **Record answer**. Speak naturally, then select **Stop & complete turn**, or allow speech-end detection to finish.
5. Review the transcript and short distilled excerpt. Continue until all five answers are recorded.
6. Select **Compile heirloom letter**. The vault opens the saved letter when compilation succeeds.

An interview answer ends after about four seconds of detected silence or a maximum of 28 seconds. Calibration uses the shorter eight-second cap. The acoustic display measures audio properties such as loudness and pauses; it is not a medical or psychological assessment.

If transcription or question generation fails, select **Retry saved answer**. This reuses the last local recording for that turn. Previously completed answers remain saved. Returning to the same storyteller and theme restores its saved interview. There is currently one interview draft per storyteller and theme, rather than a general session-history browser.

## Translate, narrate, and seal

1. In **Capsule Vault**, review **Your recorded heirloom**.
2. Optionally choose a recipient language and select **Create letter in recipient language**. Ask a fluent speaker to review the result. This replaces the current compiled letter and clears its previous cloned narration.
3. To add narration, confirm consent and select **Generate cloned narration**. This needs a saved calibration for the same voice. You can seal authentic original recordings without cloned narration.
4. Choose a passphrase of at least twelve characters and an unlock date and time. The picker uses your local time; the saved capsule records a UTC timestamp.
5. Select **Seal capsule**, then **Download .heirloom**.
6. Keep at least one backup of the downloaded file. Keep the passphrase separately and share both through channels you trust.

The real capsule panel shows the most recently compiled bundle. Download each capsule before compiling another. Downloading creates a file; it does not schedule email, SMS, or automatic delivery to the recipient.

## Open a capsule

1. Open **Capsule Vault**, then **Open & verify a capsule**.
2. Select a real `.heirloom` file produced by this workflow.
3. Enter its passphrase and select **Decrypt capsule**.
4. After the unlock time and public beacon publication, review the letter and play the original answers and any AI narration.

A capsule cannot be opened before its unlock time just by knowing its passphrase. Opening also requires access to the public drand beacon. There is no built-in passphrase recovery or fully offline first unlock. Wrong passphrases and damaged files show errors. Sample metadata exports from the design demo are not compatible real capsules.

## Languages

| Language | Code    | Language  | Code    |
| -------- | ------- | --------- | ------- |
| English  | `en-IN` | Hindi     | `hi-IN` |
| Tamil    | `ta-IN` | Kannada   | `kn-IN` |
| Telugu   | `te-IN` | Malayalam | `ml-IN` |
| Marathi  | `mr-IN` | Bengali   | `bn-IN` |
| Gujarati | `gu-IN` | Punjabi   | `pa-IN` |

## Common problems

| Problem                                  | What to do                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Microphone unavailable                   | Allow microphone access in your browser yourself, close other recording applications, and use HTTPS or localhost. |
| Recording buttons disabled               | Confirm consent and wait for the current recording, playback, or request to finish.                               |
| Voice service not configured             | Ask the site operator to set the private provider keys and redeploy.                                              |
| No speech recognized                     | Speak closer to the microphone in a quieter place and record again.                                               |
| Saved answer failed to process           | Use **Retry saved answer** before recording a replacement.                                                        |
| Cloned narration unavailable             | Calibrate the same storyteller and check consent. Original recordings can still be sealed.                        |
| Storage failure                          | Keep downloaded backups. Avoid clearing site data until you have exported what you need.                          |
| Data missing on another domain or device | Browser storage is tied to its browser and origin. Transfer downloaded capsule files manually.                    |
| Capsule still locked                     | Check the selected date, local clock, network connection, and public beacon availability.                         |
| Wrong passphrase or damaged file         | Check the passphrase and try an intact backup. The application cannot recover a lost passphrase.                  |

Read [Privacy and data handling](PRIVACY.md) before storing sensitive family material.
