# Architecture

## Package shape

Plain TypeScript library, `react-native`/`react` as peer dependencies (not bundled). No native code — every component is pure JS/TS against public RN APIs, which keeps the security surface (and the SAST story) simple: no native build to scan, no linked modules with their own permissions.

```
src/
  components/
    TextInput/
      TextInput.tsx
      TextInput.test.tsx
      index.ts
    Button/
    Checkbox/
    RadioGroup/
    Modal/
    Toast/
  theme/
    tokens.ts        # colors, spacing, typography — dark-first
    ThemeProvider.tsx # context provider, matches Undercover's approach
    index.ts
  a11y/
    constants.ts      # MIN_TOUCH_TARGET = 44, shared roles/labels helpers
  index.ts             # public barrel export
.github/
  workflows/
    ci.yml
    sast.yml
  dependabot.yml
SECURITY.md
ACCESSIBILITY.md
README.md
```

## Component contract

Every component in `src/components/*` must satisfy the same contract before it's considered done — this is what "done properly" means concretely, and what the a11y lint rules + tests enforce mechanically rather than by convention:

- **Typed props**, no `any`, exported alongside the component
- **Accessibility**: explicit `accessibilityRole`, `accessibilityLabel` (or label association), `accessibilityState` where applicable (e.g. `checked`, `disabled`), touch target ≥44×44 enforced via a shared `hitSlop`/`minHeight` helper in `a11y/constants.ts`
- **No dynamic code execution** — no `eval`, `Function()`, dynamic `require`, or unvalidated deep-linking — this is the core claim in `SECURITY.md` and is what keeps Semgrep/CodeQL clean by construction
- **Theming** via `ThemeProvider` context, no hardcoded colors in component files
- **Tests**: one `*.test.tsx` per component, asserting a11y props and behavior via `@testing-library/react-native` queries (`getByRole`, not `getByTestId`, wherever possible — forces the component to actually expose the right role)
- **Docs**: one row/section in `ACCESSIBILITY.md` mapping the component to the WCAG success criteria it satisfies (e.g. 1.3.1, 2.5.5, 4.1.2)

## CI pipeline

Two independent workflows, both required status checks on `main`:

**`ci.yml`** — correctness/quality gate
```
install → lint (eslint + a11y plugin) → typecheck (tsc --noEmit) → test (jest)
```
Fails the build on any missing accessibility prop the lint plugin can detect statically; the jest layer catches what static lint can't (state-dependent roles/labels).

**`sast.yml`** — security gate, decoupled from CI so a security regression is never masked by a flaky unit test
```
Semgrep OSS (default + owasp rule packs) → CodeQL (javascript-typescript)
```
Both free for public repos, both produce standard SARIF uploaded to GitHub's code scanning tab — recruiters can click through to real findings (or the lack thereof), not just a green badge.

Dependabot runs separately (weekly, npm ecosystem) — dependency currency is a security control but not a per-PR gate, since dependency bumps shouldn't block feature work.

## Theming

Single `ThemeProvider` + `tokens.ts`, dark-first (per existing Undercover pattern) with a light override. Tokens cover color, spacing, and typography scale only — no per-component style overrides API in v0.1, to keep the surface area small per the roadmap's non-goals.

## Why this shape

- **Library over app**: smaller finished surface, directly citable (`npm install`, live Actions badges) — see prior discussion for the full rationale.
- **Two decoupled workflows** (`ci` vs `sast`) rather than one: a security tool going down/rate-limiting shouldn't block a docs-only PR's tests from being visibly green, and it lets the README show two distinct badges (quality vs. security) which is the actual differentiator being aimed for.
- **Test via `getByRole` not `getByTestId`**: makes the test suite itself double as an accessibility check — if a component doesn't expose the right role, the test can't even find it, so broken a11y fails tests before it fails lint.
