# AI Chief of Staff

Next.js daily brief demo. The public page uses fictional events and messages. The protected `POST /api/cron/brief` route can fetch the next 24 hours of Google Calendar events and up to 20 unread Gmail metadata records, build an action list, and optionally send an email through SendGrid. It never sends email when SendGrid settings are absent.

Run `pnpm install`, `pnpm --filter ai-chief-of-staff dev`, and open `http://127.0.0.1:3005`. Copy `.env.example` to `.env` for the protected route. `CRON_SECRET` must be at least 32 characters. Never expose it in a browser URL.

The included GitHub Actions workflow has a daily schedule but runs only after repository variable `ENABLE_DAILY_BRIEF=true` and `BRIEF_URL` and `CRON_SECRET` secrets are set. GitHub cron uses UTC; adjust for daylight saving time if you need a fixed local delivery hour.

This app does not implement the complete Google OAuth consent/refresh-token flow yet, and no Gmail/Calendar credentials are configured. `GOOGLE_ACCESS_TOKEN` is an expiring access token for integration testing. The public preview must not be described as an active personal inbox assistant. A production rollout needs OAuth with durable encrypted token storage, consent, token rotation, and access controls.
