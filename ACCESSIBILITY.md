# Accessibility

Every interactive component in this library targets **WCAG 2.1 AA**. This document maps each component to the success criteria it satisfies and how that's verified — automatically where possible, manually where it isn't.

## How compliance is enforced

1. **Static lint** — `eslint-plugin-react-native-a11y` runs in CI (`ci.yml`) and fails the build on missing `accessibilityRole`, `accessibilityLabel`, or `accessibilityState`.
2. **Unit tests** — each component's test suite queries via `getByRole`/`getByLabelText` (not `getByTestId`), so a component that doesn't expose the right role or label fails its own tests, not just lint.
3. **Manual screen reader pass** — before a component is marked done, it's exercised once with VoiceOver (iOS) and once with TalkBack (Android). Results are logged in the table below.

## Component status

| Component  | WCAG criteria covered | Automated (lint + test) | Manual VoiceOver | Manual TalkBack |
|------------|------------------------|--------------------------|-------------------|-------------------|
| TextInput  | 1.3.1, 3.3.2, 4.1.2, 4.1.3 | ✅ (`TextInput.test.tsx`) | 🟡 inspector-verified | ⬜ pending          |
| Button     | 2.5.5, 4.1.2           | ✅ (`Button.test.tsx`)    | 🟡 inspector-verified | ⬜ pending          |
| Checkbox   | 1.3.1, 2.5.5, 4.1.2   | ✅ (`Checkbox.test.tsx`)  | 🟡 inspector-verified | ⬜ pending          |
| RadioGroup | 1.3.1, 2.5.5, 4.1.2   | ✅ (`RadioGroup.test.tsx`)| 🟡 inspector-verified | ⬜ pending          |
| Modal      | 2.4.3, 4.1.2           | ✅ (`Modal.test.tsx`)     | 🟡 inspector-verified | ⬜ pending          |
| Toast      | 4.1.3 (status messages)| ✅ (`Toast.test.tsx`)     | 🟡 inspector-verified | ⬜ pending          |

Each row moves to ✅ only once all four columns are done for that component — see [ROADMAP.md](ROADMAP.md) for build order.

> **🟡 inspector-verified, 2026-07-24**: VoiceOver itself is unavailable on this machine's iOS Simulator runtime (iOS 26.5) — no VoiceOver toggle exists under Settings → Accessibility, and forcing the underlying preference didn't activate it. As a substitute, the full `example/App.tsx` demo flow (Email → Plan → terms checkbox → Continue → confirmation Modal → Confirm → Toast) was walked in Xcode's **Accessibility Inspector** against the running Simulator, which reads the real accessibility tree (role/label/state) without needing VoiceOver's speech engine. Confirmed correct for all six components: TextInput (label + value), Button (`button` role, correct name, disabled state), Checkbox (`checkbox` role, checked state), RadioGroup (header + individually-focusable `radio` options — not merged into one node), Modal (title as `header`, close button labeled "Close" not a bare "×", Confirm button), Toast (`alert` role, correct message). This is **not** a substitute for hearing actual spoken output — `Toast`'s `AccessibilityInfo.announceForAccessibility` call was confirmed to fire in code but could not be confirmed audibly since no screen reader was running to speak it. A real VoiceOver pass (on a physical device or a simulator runtime that supports it) and the TalkBack pass are both still outstanding before any row can move to full ✅.

## Shared conventions

- **Touch targets**: every interactive element meets the WCAG 2.5.5 minimum of 44×44dp, via the shared helper in `src/a11y/constants.ts` rather than a per-component magic number.
- **Color is never the only signal** — error/success states pair color with an icon or text change, satisfying 1.4.1 (Use of Color).
- **Theming**: both the dark and light token sets in `src/theme/tokens.ts` are checked against WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI components) before being committed.
