# Implementation

This document explains what every file in the repo does and why it's built the way it is. [ROADMAP.md](ROADMAP.md) says *what's next*; [ARCHITECTURE.md](ARCHITECTURE.md) says *how it's shaped*; this file says *what actually exists right now, in detail*.

---

## Tooling & config

### `package.json`
Declares the package as `doomstack`, a plain TypeScript library — `react`/`react-native` are **peer dependencies**, not bundled, since consumers already have their own copies. Three scripts matter:
- `typecheck` → `tsc --noEmit` (type errors only, no build output)
- `lint` → `eslint "src/**/*.{ts,tsx}"`
- `test` → `jest`

These three are exactly what `.github/workflows/ci.yml` runs, so "does it pass CI" is always reproducible locally with the same three commands.

### `tsconfig.json`
`strict: true`, plus `noUnusedLocals`/`noUnusedParameters`. `jsx: "react-native"` (not `react-jsx`) matches the RN transform. Only `src/` is included — `lib/` (build output) and `example/` (not created yet) are excluded so typechecking never looks at generated code.

### `.eslintrc.js`
The accessibility gate. Built on `@typescript-eslint` + `eslint-plugin-react-native-a11y`. The rules actually enabled (all as **errors**, meaning they fail `npm run lint` and thus CI):

| Rule | What it catches |
|---|---|
| `has-accessibility-props` | Interactive elements missing any accessibility props at all |
| `has-valid-accessibility-descriptors` | Malformed `accessibilityLabel`/`accessibilityHint` |
| `has-valid-accessibility-role` | Missing or invalid `accessibilityRole` |
| `has-valid-accessibility-state` / `-states` | Missing or malformed `accessibilityState` |
| `has-valid-accessibility-value` | Malformed `accessibilityValue` (sliders, progress bars) |
| `no-nested-touchables` | Touchable inside another touchable — breaks screen reader focus order |

`@typescript-eslint/no-explicit-any` is also an error — no `any` escape hatches.

**Known gotcha (hit during Phase 0):** the plugin's actual rule names are `has-valid-accessibility-role` / `has-valid-accessibility-state`, not `has-accessibility-role`/`has-accessibility-state` as the plugin's own naming pattern would suggest. Using the wrong names doesn't error at config time in an obvious way — ESLint just says "rule not found." If you add more rules from this plugin later, check `node_modules/eslint-plugin-react-native-a11y`'s exported `rules` object first.

### `babel.config.js` / `jest.config.js`
Babel uses `@react-native/babel-preset` (needed for Jest to transform JSX/Flow-typed RN internals). Jest uses the `react-native` preset plus `@testing-library/react-native/extend-expect` for matchers like `toBeTruthy()`/`toHaveTextContent()`. `transformIgnorePatterns` explicitly allows transforming `react-native` and `@react-native/*` packages, since RN itself ships untranspiled modern JS in `node_modules`.

Note: we deliberately do **not** depend on `@testing-library/jest-native` — it's deprecated as of `@testing-library/react-native` v12.4+, which ships the same matchers itself.

---

## `src/theme/` — shared design tokens

### `tokens.ts`
Two flat objects, `darkColors` and `lightColors` (dark is the default scheme, per the existing Undercover project convention), plus `spacing` and `typography` scales. `colorsForScheme(scheme)` is the only function — a pure lookup, no logic to test beyond "does it return the right object," which is what `tokens.test.ts` checks.

### `ThemeProvider.tsx`
A React context provider. Reads the OS color scheme via RN's `useColorScheme()`, but accepts an explicit `scheme` prop to override it (components' tests pass `scheme="dark"` explicitly so tests don't depend on the test runner's OS theme). Exposes `useTheme()`, which throws if called outside a `ThemeProvider` — fail loud instead of silently rendering with `undefined` colors.

### `index.ts`
Re-exports everything from `tokens.ts` and `ThemeProvider.tsx`.

---

## `src/a11y/constants.ts` — shared accessibility helpers

`MIN_TOUCH_TARGET = 44` — the WCAG 2.5.5 minimum target size in density-independent pixels. `hitSlopForSize(measuredSize)` computes the `hitSlop` needed to pad a visually-smaller element up to that minimum, splitting the deficit evenly across all four sides. This exists so no component invents its own touch-target math — they all import this one helper, which is also what `constants.test.ts` verifies (zero hitSlop when already at minimum, evenly split hitSlop when undersized).

---

## `src/components/TextInput/` — first real component

### `TextInput.tsx`
Wraps RN's own `TextInput` with label, error, and disabled handling. Key decisions:

- **Accessible name strategy**: rather than trying to associate a separate label `<Text>` with the input (which is unreliable across iOS/Android), the component builds a single `accessibilityLabel` string directly: `"Email"` normally, `"Email, Enter a valid email"` when there's an error. This guarantees the screen reader always announces something complete and correct, regardless of platform label-association quirks.
- **Error announcement**: RN's `accessibilityLiveRegion` prop only works on Android — iOS ignores it. So the component also calls `AccessibilityInfo.announceForAccessibility(error)` in a `useEffect` that fires only when the error text actually changes (tracked via a `useRef`, to avoid re-announcing on every re-render). This is what makes the error reach VoiceOver users, not just TalkBack users.
- **Disabled state**: reflected in two places that serve different consumers — `editable={!disabled}` (functional: blocks typing) and `accessibilityState={{ disabled }}` (informational: screen readers announce "dimmed"/"disabled").
- **Touch target**: `minHeight: MIN_TOUCH_TARGET` applied directly in the input's style array, sourced from the shared `a11y/constants.ts` helper rather than a hardcoded `44`.
- **Theming**: every color (text, background, border, placeholder, error) comes from `useTheme()` — nothing hardcoded, so dark/light and any future theme override propagate automatically.

**Known gotcha (hit while building this component):** an early version tried to set `accessibilityState={{ disabled, invalid: Boolean(error) }}`. TypeScript rejected it — React Native's `AccessibilityState` type has no `invalid` field on either platform (there's no `aria-invalid` equivalent in this RN version's types either). There is no built-in cross-platform "mark this field as invalid" signal in RN's accessibility API. The error is instead communicated through the accessible-name folding and the active announcement described above, which is the actually-supported mechanism.

### `TextInput.test.tsx`
Five tests, all querying by **accessible label**, not `testID` — this is deliberate: if the component ever stops exposing a proper accessible name, the test can't even find the element and fails, which makes the test suite itself an accessibility check rather than just a rendering check.

1. Renders with a findable accessible name ("Email")
2. `onChangeText` fires with typed text
3. Error text folds into the accessible name and also renders visibly
4. `disabled` shows up in both `accessibilityState` and `editable`
5. Rendered `minHeight` is `>= MIN_TOUCH_TARGET`

All tests wrap the component in `<ThemeProvider scheme="dark">` since `useTheme()` throws without a provider in the tree.

### `index.ts`
Re-exports `TextInput.tsx`. Re-exported again from `src/index.ts`, so consumers eventually do `import { TextInput } from 'doomstack'`.

---

## `src/components/Button/` — Phase 2, first primitive

### `Button.tsx`
Wraps RN's `Pressable` (not `TouchableOpacity` — `Pressable` is the modern API and exposes the `pressed` render-prop state used for the visual press feedback below). Key decisions:

- **Accessible name**: same pattern as `TextInput` — `label` is both the visible text and the `accessibilityLabel`, so there's exactly one string to keep in sync, not two.
- **Role**: explicit `accessibilityRole="button"` plus `accessible` set directly, rather than relying on `Pressable`'s defaults, so the lint rule (`has-valid-accessibility-role`) and the behavior can't silently drift apart.
- **Disabled state**: like `TextInput`, reflected in two places — `disabled` (functional: `Pressable` itself blocks `onPress`) and `accessibilityState={{ disabled }}` (informational: screen readers announce it). Disabled also wins over the transient `pressed` opacity change, so a disabled button never looks "pressable" even mid-touch.
- **Touch target**: `minHeight`/`minWidth` both set to `MIN_TOUCH_TARGET` — unlike `TextInput` (which only needs height), a button can be small in both dimensions if not constrained.
- **Variants**: `primary`/`secondary`, each pulling `background`/`text`/`border` from `useTheme()` — no hardcoded colors, same as `TextInput`.

### `Button.test.tsx`
Five tests, querying by **role + accessible name** (`getByRole('button', { name: ... })`) rather than `getByLabelText` or `testID`, per the convention in `ACCESSIBILITY.md` (role-based queries catch a missing/wrong `accessibilityRole` that label-only queries wouldn't).

1. Renders with a findable `button` role and name ("Submit")
2. `onPress` fires when pressed
3. `disabled` shows up in `accessibilityState` and actually blocks `onPress`
4. Rendered `minHeight`/`minWidth` are both `>= MIN_TOUCH_TARGET`
5. `primary` and `secondary` variants resolve to different `backgroundColor`s

### `index.ts`
Re-exports `Button.tsx`. Re-exported again from `src/index.ts`.

---

## `src/components/Checkbox/` — Phase 2, second primitive

### `Checkbox.tsx`
Also a `Pressable`, but rendering its own label `<Text>` inline (unlike `TextInput`, which folds the label into `accessibilityLabel` alone) — a checkbox's visible label and the box sit side by side as one pressable row, so the whole row needs a single accessible name rather than two separately-focusable elements. Key decisions:

- **Role + state**: `accessibilityRole="checkbox"` with `accessibilityState={{ checked, disabled }}` — `checked` is a first-class a11y state here (unlike `Button`, which has no analogous concept), so screen readers announce "checked"/"not checked" independent of the visual checkmark.
- **Controlled, not internal state**: `checked` is a prop and `onChange(checked)` receives the *new* value — the component holds no state of its own, matching how `TextInput` treats `value`/`onChangeText`.
- **Disabled**: same two-place pattern as `Button` — `disabled` prop blocks the press, `accessibilityState.disabled` informs screen readers.
- **Touch target**: `minHeight: MIN_TOUCH_TARGET` on the whole row (box + label), not just the visual 22×22 box — the box is a visual affordance, but the entire row is the actual touch target, so it doesn't need `hitSlop` padding around a tiny box.

### `Checkbox.test.tsx`
Five tests, same `getByRole` convention as `Button`, using `{ name: ... }` to match the accessible name:

1. Renders with a findable `checkbox` role and name
2. `checked: true` shows up in `accessibilityState`, not just the visual mark
3. Pressing calls `onChange` with the toggled boolean
4. `disabled` shows up in `accessibilityState` and blocks `onChange`
5. Rendered `minHeight` is `>= MIN_TOUCH_TARGET`

### `index.ts`
Re-exports `Checkbox.tsx`. Re-exported again from `src/index.ts`.

---

## `src/components/RadioGroup/` — Phase 2, third primitive

### `RadioGroup.tsx`
Renders a `label` heading followed by one `Pressable` per `RadioOption` (`{ label, value }`), each with `accessibilityRole="radio"` and `accessibilityState={{ checked, disabled }}` — same controlled pattern as `Checkbox` (`value`/`onChange` owned by the caller, no internal state).

**Known gotcha (caught before shipping, not after):** the first version wrapped the whole group in a `View` with `accessible` + `accessibilityRole="radiogroup"` + `accessibilityLabel={label}`, mirroring how `role="radiogroup"`/`aria-label` works on the web. That's wrong on native: RN's `accessible` prop, per its own docs, collapses **all subviews into a single accessibility element** on iOS — it would have merged all three radio options into one unreadable VoiceOver stop instead of three individually-focusable ones, defeating the entire point of giving each option its own role and label. The fix: the container `View` gets no accessibility props at all; `label` instead renders as a plain sibling `<Text accessibilityRole="header">` before the options. Screen readers announce the header once, then move into each `radio` individually — the native equivalent of a web `<fieldset><legend>`, without the aggregation.

### `RadioGroup.test.tsx`
Six tests:

1. The group label renders with `header` role (`getByRole('header', { name: ... })`) — proves it's announced as a heading, not swallowed into a single group node
2. Each option renders with its own `radio` role and label
3. Only the selected option's `accessibilityState.checked` is `true`
4. Pressing an option calls `onChange` with that option's `value`
5. `disabled` shows up in each option's `accessibilityState` and blocks `onChange`
6. Each option's rendered `minHeight` is `>= MIN_TOUCH_TARGET`

### `index.ts`
Re-exports `RadioGroup.tsx`. Re-exported again from `src/index.ts`.

---

## `src/components/Modal/` — Phase 2, fourth primitive

### `Modal.tsx`
Wraps RN's own `Modal` (aliased `RNModal`, same convention `TextInput` used for `RNTextInput`) rather than building a custom overlay from scratch — the native `Modal` already presents in a separate native window/activity on both platforms, which is what actually keeps background content out of VoiceOver/TalkBack's reach; none of that isolation is something JS could reliably replicate. Key decisions:

- **Backdrop vs. close button are two different affordances for two different users.** The dimmed backdrop `Pressable` closes on tap for sighted/touch users, but it's marked `accessibilityRole="none"` + `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` — deliberately **not** an accessibility element. That's because VoiceOver/TalkBack intercept a plain single-finger tap for their own navigation gestures (selection, not activation); a screen reader user tapping the backdrop wouldn't fire `onPress` at all. The explicit "✕" `Pressable` with `accessibilityRole="button"` and `accessibilityLabel="Close"` is the actual accessible dismissal path — the backdrop is convenience on top, not a substitute.
- **No nested touchables.** The backdrop and the card can't both be `Pressable`s with the card nested inside the backdrop — that trips the `no-nested-touchables` lint rule (and would confuse focus order for real). Instead they're siblings inside a plain `View`: an absolutely-positioned backdrop `Pressable` behind, a normal-flow card `View` in front, relying on RN's paint/hit-test order (later sibling on top) rather than DOM-style nesting.
- **`accessibilityViewIsModal`** on the card `View` reinforces iOS modal isolation in case the native `Modal` presentation hasn't fully settled when VoiceOver focus moves (belt-and-suspenders, not load-bearing given the native `Modal` wrapper).
- **Open announcement**: same pattern as `TextInput`'s error announcement — `AccessibilityInfo.announceForAccessibility(title)` fires once, tracked via a `useRef` so it only fires on the false→true transition, not on every re-render while open.
- **`onRequestClose`** is wired to `onClose` unconditionally (required on Android — without it, the hardware/gesture back action is undefined behavior — and harmless on iOS, which ignores it).

**Known gotcha (hit while testing this component):** `screen.UNSAFE_getByProps({ testID })` matches by prop value across **all** component instances, composite or host — including our own `Modal` function component itself, since it also happens to receive a `testID` prop. Querying for RN's actual `<Modal>` needs `screen.UNSAFE_getByType(RNModal)` (importing the real class from `react-native`) instead, to disambiguate from our own same-named wrapper. Separately, `getByTestId`/`getByRole`/etc. exclude anything hidden from accessibility by default (`accessibilityElementsHidden`/`importantForAccessibility="no-hide-descendants"`) — reaching the backdrop in a test requires the `{ includeHiddenElements: true }` query option, which is also the mechanism that proves those props are doing their job.

### `Modal.test.tsx`
Seven tests: renders title as `header` + shows children when `visible`; renders nothing when not `visible`; the close button (role `button`, name `Close`) calls `onClose`; backdrop press calls `onClose` (and doesn't when `dismissOnBackdropPress={false}`); `onRequestClose` (Android back) calls `onClose`; the backdrop is actually hidden from accessibility (`accessibilityElementsHidden`).

### `index.ts`
Re-exports `Modal.tsx`. Re-exported again from `src/index.ts`.

---

## `src/index.ts` — public API surface

Currently exports: everything from `theme/`, the `a11y/constants` helpers, `components/TextInput`, `components/Button`, `components/Checkbox`, `components/RadioGroup`, and `components/Modal`. This is the literal list of what `npm install doomstack` gives a consumer today. Every new component gets added here as it's built (see `ROADMAP.md` for order).

---

## `.github/workflows/ci.yml` — quality gate

Three parallel jobs, each a required status check on `main`: `lint`, `typecheck`, `test` (with `--ci --coverage`). Deliberately split into separate jobs rather than one script so GitHub shows three independent checkmarks — a lint failure and a test failure are visually distinguishable at a glance instead of one opaque "CI failed."

## `.github/workflows/sast.yml` — security gate

Two jobs, decoupled from `ci.yml` on purpose (a security-tool outage shouldn't block a docs-only PR's tests from going green, and it keeps the README's two badges — quality vs. security — independently meaningful):
- **Semgrep** (`p/owasp-top-ten`, `p/typescript`, `p/react` rulesets), SARIF uploaded to GitHub code scanning
- **CodeQL** (`javascript-typescript` query suite)

Also runs on a weekly cron (`0 6 * * 1`) so newly-published rules/advisories get checked even without a code change.

## `.github/dependabot.yml`

Weekly checks on both the `npm` and `github-actions` ecosystems.

---

## Docs

- **`SECURITY.md`** — the threat model (no eval/dynamic code, no native modules, dependency scanning) and how to report a vulnerability.
- **`ACCESSIBILITY.md`** — per-component WCAG mapping table. A component only gets a ✅ once it's both automated-clean (lint + tests) *and* manually verified with VoiceOver and TalkBack — the manual columns can't be filled from this environment and are explicitly flagged as pending until done on a real device/simulator.
- **`README.md`** — the public face: CI/SAST badges, install instructions (not live yet — package isn't published), links to the other docs.

---

## What's deliberately not here yet

Per `ROADMAP.md`'s non-goals: no native modules, no `/example` app, no theming override API beyond the fixed token set, and 1 of the 6 planned components (`Toast`) doesn't exist yet — `TextInput`, `Button`, `Checkbox`, `RadioGroup`, and `Modal` are the five built so far.
