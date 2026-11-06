# Documentation

Current documentation, checked against the repository on 6 November 2026. Live provider testing and cloud deployment remain pending; implementation and automated checks do not establish live acceptance.

| Audience               | Guide                                        | Contents                                                                  |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| New visitors           | [Project overview](../README.md)             | Capabilities, stack, quick start, and project status                      |
| Families and speakers  | [User guide](USER_GUIDE.md)                  | Record, interview, translate, seal, download, and open a capsule          |
| Contributors           | [Developer guide](DEVELOPMENT.md)            | Setup, module boundaries, storage, tests, and contribution workflow       |
| Integration developers | [API reference](API.md)                      | Inputs, outputs, limits, consent fields, and errors                       |
| Operators              | [Vercel deployment](DEPLOYMENT.md)           | Import settings, environment variables, smoke checks, and rollback        |
| Everyone               | [Privacy and data handling](PRIVACY.md)      | What stays local, external processing, keys, backups, and limitations     |
| Maintainers            | [Architecture](../ARCHITECTURE.md)           | Current system, data flow, crypto protocol, and implementation boundaries |
| Release owners         | [Release checklist](../RELEASE_CHECKLIST.md) | Automated evidence and outstanding live acceptance                        |
| Project owners         | [Current plan](../plan.md)                   | Completed scope, pending release work, and deferred features              |
| Coding agents          | [Agent instructions](../AGENTS.md)           | Mandatory workflow, protected areas, and engineering rules                |
| Historical reference   | [Original plan](history/ORIGINAL_PLAN.md)    | Archived planning transcript; explicitly non-authoritative                |

## Documentation conventions

- Describe implemented behavior in the present tense. Mark planned or unverified behavior explicitly.
- Use plain text status labels and no emojis. Technology badges belong in the project overview; they do not imply security certification or production acceptance.
- Preserve Windows CRLF line endings and UTF-8 encoding.
- Keep provider credentials, private recordings, personal transcripts, and real passphrases out of examples.
- Update the relevant guides whenever routes, contracts, environment variables, storage keys, or user workflows change.
- Prefer source code and current schemas over the historical planning transcript when reconciling implementation details.
