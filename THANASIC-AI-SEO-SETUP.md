# Thanasic AI SEO Dashboard — setup

## What this branch adds

- `/seo-dashboard.html`: a standalone, no-index owner dashboard for AC Repair SEO in Al Khor.
- `/api/seo-audit`: a Vercel Node serverless endpoint that calls the OpenAI Responses API.
- No existing homepage, assets, Google verification files, booking flow, or language files are changed.

## Deploy safely

1. Review and merge this pull request into `main` when satisfied. Vercel should create a Preview deployment for this branch if Git integration is enabled.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `OPENAI_API_KEY`: an OpenAI API key. Keep it server-side only.
   - `DASHBOARD_ACCESS_TOKEN`: a long random secret (at least 32 characters). The dashboard asks for this token when generating an AI audit.
   - Optional `OPENAI_MODEL`: defaults to `gpt-5.5`.
3. Apply the variables to Preview and Production as appropriate, then redeploy.
4. Open `https://YOUR-DOMAIN/seo-dashboard.html`. Enter the `DASHBOARD_ACCESS_TOKEN` value in the dashboard's access-token field.
5. Enter GBP performance figures copied from Google Business Profile Performance. The dashboard does not claim manually entered figures are live Google data.

## Current limitations

- This first release is a secure AI audit + manual KPI / map-grid workspace.
- Live GBP analytics, reviews, OAuth, and automatic Maps rank tracking are not connected yet.
- Google Business Profile API access and OAuth client credentials are required for live GBP data. A persistent token store (for example a properly secured database/KV) is also required before implementing OAuth refresh-token storage.
- Search Console data integration is a separate follow-up requiring Google OAuth and Search Console API access.
- The dashboard is marked noindex and is not linked from the public homepage. Keep the access token secret; do not paste it into a public issue or source file.

## Security notes

- The OpenAI API key is read only from the Vercel server environment and is never sent to the browser.
- The AI endpoint requires a bearer access token, checks same-origin requests, limits request size, and does not write to GBP.
- AI recommendations must be reviewed by a human before publishing.
- Do not store customer names, phone numbers, addresses, or other personal data in the dashboard notes.

## Official references

- OpenAI Responses API: https://developers.openai.com/api/docs/guides/text
- OpenAI API key safety: https://developers.openai.com/api/docs/guides/production-best-practices
- Google Business Profile APIs: https://developers.google.com/my-business
- Google Search Console API: https://developers.google.com/webmaster-tools
