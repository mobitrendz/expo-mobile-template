# Security Policy

## Supported versions

Security fixes are applied to the active development branch of this repository. There are no separate long-term release branches at this time.

| Version | Supported |
|---------|-----------|
| `main` / latest | Yes |
| Older tags or forks | Best effort only |

This template tracks **Expo SDK 54**. Security also depends on upstream dependencies (Expo, React Native, npm packages) — keep them updated with `npx expo install` and regular `npm audit` reviews.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report issues privately so they can be addressed before public disclosure:

1. **GitHub (preferred):** Use [Private vulnerability reporting](https://github.com/mobitrendz/expo-mobile-template/security/advisories/new) on this repository, if enabled.
2. **Alternative:** Open a minimal issue asking for a private contact channel — do not include exploit details in the public issue.

Include as much of the following as possible:

- Description of the vulnerability and impact
- Steps to reproduce (proof of concept if available)
- Affected component (mobile app, docs site, codegen, etc.)
- Platform (iOS, Android, web) and app/API versions
- Whether the issue requires a malicious backend, physical device access, or network position

We aim to acknowledge reports within **5 business days** and will work with you on remediation and coordinated disclosure when appropriate.

## Scope

### In scope (this repository)

- Authentication and session handling in the mobile app (JWT storage, token lifecycle, role checks)
- Client-side API usage, error handling, and data exposed in the UI
- Insecure defaults in `app.json` or `src/constants/config.ts` that affect deployed apps
- Dependency vulnerabilities introduced or documented by this template
- The Docusaurus documentation site under `website/` (XSS, broken links to malicious targets, etc.)

### Out of scope

- Vulnerabilities in the **FastAPI backend** — report to [fastapi-backend-template](https://github.com/mobitrendz/fastapi-backend-template) instead
- Vulnerabilities in the **React web frontend** — report to [react-frontend-template](https://github.com/mobitrendz/react-frontend-template)
- Issues in third-party services (Expo, npm, hosting providers)
- Social engineering, denial of service against public demo APIs
- Missing certificate pinning or jailbreak/root detection (not goals of this starter template)
- Findings that require a user to build with a **malicious `apiUrl`** they configured themselves

## Security considerations for deployers

This template is a **starting point**. Review these items before production use:

| Topic | Default behavior | Recommendation |
|-------|------------------|----------------|
| **Transport** | Android allows cleartext HTTP for local dev | Use **HTTPS** in production; set `apiUrl` to `https://` endpoints |
| **JWT storage** | Access token in AsyncStorage | Acceptable for many apps; evaluate **expo-secure-store** or platform keychains for higher assurance |
| **API URL** | Configurable via `app.json` / env | Do not ship dev LAN URLs in release builds; validate backend trust |
| **Role enforcement** | Client rejects non-`user` roles | **Server must enforce authorization** — never rely on the app alone |
| **Secrets** | No API keys in repo | Do not commit `.env`, tokens, or production credentials |
| **Dependencies** | npm + Expo ecosystem | Run `npm audit`, keep SDK-aligned versions, monitor advisories |

## Safe harbor

We appreciate responsible disclosure. Researchers who follow this policy and give us reasonable time to fix issues before public disclosure will not be pursued for good-faith security research on in-scope components.

## License

Security reports are handled confidentially. Public fixes follow the project [MIT License](LICENSE) once released.
