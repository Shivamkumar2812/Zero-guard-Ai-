# ZeroGuard AI

A dark, responsive application security dashboard for source scanning, finding triage, fix verification, runtime monitoring, scan history, reporting, and workspace configuration.

## Run

```bash
pnpm install
pnpm dev
```

The current workspace is a Next.js preview scaffold using React and JSX. Demo mode is self-contained and clearly labeled; no demo result is presented as a live backend result.

## Backend contract

Configure `VITE_API_BASE_URL` (or `NEXT_PUBLIC_API_BASE_URL` in this preview) and implement:

- `GET /api/health`
- `POST /api/scan` (multipart `file`, returns `{ scan_id }`)
- `GET /api/scan/{scan_id}`
- `GET /api/scan/{scan_id}/findings`
- `GET /api/scan/{scan_id}/report`
- `POST /api/scan/{scan_id}/verify`
- `GET /api/events`
- `GET /api/protection/status`
- `POST /api/protection/actions`

All production requests should return structured JSON and explicit verification statuses: `verified`, `finding_remains`, `tests_failed`, `needs_review`, or `not_retested`.
