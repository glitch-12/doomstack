# Security

## Threat model

This is a UI component library, not a service — it has no server, no network calls, and no persistence. Its threat model is narrower than most software, but not empty:

- **No dynamic code execution.** No component uses `eval`, `Function()`, dynamic `require`, or unvalidated deep-link handling. This is a hard rule, checked in review and by the SAST rulesets below (Semgrep's OWASP pack flags `eval`/`Function` usage).
- **No native code.** Every component is pure JS/TS against public React Native APIs. No linked native modules, so there's no native permissions surface or native build to audit.
- **Dependency supply chain.** Dependencies are kept current via Dependabot (weekly, npm + GitHub Actions ecosystems). `npm audit` runs as part of CI installs; a high/critical advisory on a direct dependency blocks merge until addressed or explicitly accepted.
- **No secrets in the codebase.** This library never needs API keys, tokens, or credentials — if one shows up in a diff, treat it as an incident, not a config value.

## Automated scanning

Every push and pull request to `main` runs:

- **[Semgrep OSS](https://semgrep.dev/)** — `p/owasp-top-ten`, `p/typescript`, `p/react` rulesets
- **[CodeQL](https://codeql.github.com/)** — `javascript-typescript` query suite

Both upload SARIF to GitHub's [code scanning](../../security/code-scanning) tab, so findings (or their absence) are inspectable by anyone, not just claimed in this file. See `.github/workflows/sast.yml`.

## Reporting a vulnerability

If you find a security issue in this library, please open a [GitHub Security Advisory](../../security/advisories/new) rather than a public issue, so a fix can ship before the report is public. Expect an initial response within 5 business days.
