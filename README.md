# doomstack

[![CI](https://github.com/glitch-12/doomstack/actions/workflows/ci.yml/badge.svg)](https://github.com/glitch-12/doomstack/actions/workflows/ci.yml)
[![SAST](https://github.com/glitch-12/doomstack/actions/workflows/sast.yml/badge.svg)](https://github.com/glitch-12/doomstack/actions/workflows/sast.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Accessible, security-first React Native UI primitives — WCAG AA and SAST-clean from the first commit, not retrofitted.

## Why

Most component libraries treat accessibility and security as a follow-up pass. Here they're the build gate: every push runs static a11y lint, unit tests that query by accessible role, and two independent SAST scanners (Semgrep + CodeQL). See [`ACCESSIBILITY.md`](ACCESSIBILITY.md) and [`SECURITY.md`](SECURITY.md) for what that actually covers, and the badges above for live proof it's passing.

## Status

Phase 2 complete — all six planned primitives (`TextInput`, `Button`, `Checkbox`, `RadioGroup`, `Modal`, `Toast`) are implemented, lint-clean, and unit-tested. See [`ROADMAP.md`](ROADMAP.md) for the build order. What's left before v0.1.0 ships is Phase 3: the manual VoiceOver/TalkBack pass per component (tracked in [`ACCESSIBILITY.md`](ACCESSIBILITY.md)) and the first npm publish.

## Components

| Component    | Description |
|--------------|-------------|
| `TextInput`  | Labeled text input with accessible error announcements |
| `Button`     | Pressable button, `primary`/`secondary` variants |
| `Checkbox`   | Controlled checkbox with `checked`/`disabled` a11y state |
| `RadioGroup` | Controlled radio group with an announced header and individually-focusable options |
| `Modal`      | Native modal wrapper with an accessible close button and hidden backdrop |
| `Toast`      | Self-dismissing status alert, announced once on appearance |

## Install

```bash
npm install doomstack
```

_(not yet published — this will work once v0.1.0 ships)_

## Design

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for package layout, the per-component contract every component must satisfy, and the CI/SAST pipeline design.

## License

MIT — see [`LICENSE`](LICENSE).
