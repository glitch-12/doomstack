# Accessibility

Every interactive component in this library targets **WCAG 2.1 AA**. This document maps each component to the success criteria it satisfies and how that's verified — automatically where possible, manually where it isn't.

## How compliance is enforced

1. **Static lint** — `eslint-plugin-react-native-a11y` runs in CI (`ci.yml`) and fails the build on missing `accessibilityRole`, `accessibilityLabel`, or `accessibilityState`.
2. **Unit tests** — each component's test suite queries via `getByRole`/`getByLabelText` (not `getByTestId`), so a component that doesn't expose the right role or label fails its own tests, not just lint.
3. **Manual screen reader pass** — before a component is marked done, it's exercised once with VoiceOver (iOS) and once with TalkBack (Android). Results are logged in the table below.

## Component status

| Component  | WCAG criteria covered | Automated (lint + test) | Manual VoiceOver | Manual TalkBack |
|------------|------------------------|--------------------------|-------------------|-------------------|
| TextInput  | 1.3.1, 3.3.2, 4.1.2, 4.1.3 | ✅ (`TextInput.test.tsx`) | ⬜ pending          | ⬜ pending          |
| Button     | 2.5.5, 4.1.2           | ✅ (`Button.test.tsx`)    | ⬜ pending          | ⬜ pending          |
| Checkbox   | 1.3.1, 2.5.5, 4.1.2   | ✅ (`Checkbox.test.tsx`)  | ⬜ pending          | ⬜ pending          |
| RadioGroup | 1.3.1, 2.5.5, 4.1.2   | ✅ (`RadioGroup.test.tsx`)| ⬜ pending          | ⬜ pending          |
| Modal      | 2.4.3, 4.1.2           | ✅ (`Modal.test.tsx`)     | ⬜ pending          | ⬜ pending          |
| Toast      | 4.1.3 (status messages)| ✅ (`Toast.test.tsx`)     | ⬜ pending          | ⬜ pending          |

Each row moves to ✅ only once all four columns are done for that component — see [ROADMAP.md](ROADMAP.md) for build order.

> **Manual VoiceOver/TalkBack passes require a real device or simulator and haven't been run yet for TextInput** — that step needs to happen on your machine (iOS Simulator + VoiceOver, Android emulator + TalkBack), not from this environment. Once you've done it, update the two "Manual" columns above with ✅/❌ and a one-line note.

## Shared conventions

- **Touch targets**: every interactive element meets the WCAG 2.5.5 minimum of 44×44dp, via the shared helper in `src/a11y/constants.ts` rather than a per-component magic number.
- **Color is never the only signal** — error/success states pair color with an icon or text change, satisfying 1.4.1 (Use of Color).
- **Theming**: both the dark and light token sets in `src/theme/tokens.ts` are checked against WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI components) before being committed.
