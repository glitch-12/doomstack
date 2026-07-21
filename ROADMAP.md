# Roadmap

A React Native component library where accessibility (WCAG AA) and security (SAST-clean) are enforced by CI from the first commit, not retrofitted. Public repo, published to npm.

## Phase 0 — Foundation (no components yet)
- Repo scaffold: `package.json`, TypeScript config, folder layout
- Lint: ESLint + `eslint-plugin-react-native-a11y`, failing the build on missing `accessibilityRole`/`accessibilityLabel`
- Test setup: Jest + `@testing-library/react-native`
- CI (`ci.yml`): lint → typecheck → unit tests, required status checks
- SAST (`sast.yml`): Semgrep OSS + CodeQL on every push/PR
- `SECURITY.md`, `ACCESSIBILITY.md` (empty skeletons, filled in per-component as they land)
- Dependabot config for npm ecosystem

**Exit criteria:** CI and SAST workflows are green on an empty/near-empty repo. Badges in README are live before any component exists.

## Phase 1 — First vertical slice: TextInput
- Implement `TextInput` fully: labeling, error state (`accessibilityLiveRegion`), 44×44 touch target, dark-first theming
- Unit tests asserting a11y props programmatically
- Manual VoiceOver + TalkBack pass, documented in `ACCESSIBILITY.md`
- This phase proves the whole pipeline (component → test → lint → SAST → docs) end to end before scaling to more components

**Exit criteria:** One component, fully done, with every piece of the process (automated + manual) demonstrated and documented.

## Phase 2 — Remaining primitives
Repeat the Phase 1 pattern for each:
1. Button
2. Checkbox
3. RadioGroup
4. Modal
5. Toast

Order chosen so a real form flow (label → input → validation → submit → confirmation toast) is demoable as soon as possible, ideally after Button + Checkbox/RadioGroup land.

**Exit criteria:** All 6 components done to the Phase 1 bar. A small demo screen (or GIF) shows a real form flow narrated by a screen reader.

## Phase 3 — Polish & publish
- `README.md`: badges, install instructions, 10-second screen-reader GIF
- Theme customization docs
- First npm publish (`0.1.0`), public
- Optional: minimal Expo example app under `/example` if manual QA needs a real device harness

**Exit criteria:** `npm install doomstack` works for someone outside this repo; README badges reflect real, passing CI/SAST runs.

## Explicit non-goals (for this pass)
- No design system beyond these 6 components (no theming CLI, no Figma tokens pipeline)
- No native module code — pure JS/TS + RN APIs only, to keep the security threat model small and the SAST story clean
- No CI/CD beyond GitHub Actions (no self-hosted runners, no separate deploy pipeline)
