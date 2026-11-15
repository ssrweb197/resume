# ResumeBuild

A browser-based resume builder and resume review tool with an optional authenticated AI rewrite endpoint.

## AI resume rewrite — Cloudflare Pages setup

The AI rewrite endpoint is implemented at `functions/api/rewrite.js`. It is designed for Cloudflare Pages Functions and is not available on static GitHub Pages hosting.

### Required Cloudflare settings

In Cloudflare Dashboard → Workers & Pages → `resume` → Settings → Variables and Secrets:

| Name | Type | Value |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Variable | Must exactly match the Firebase project ID used in `firebase-config.js` |
| `OPENAI_MODEL` | Variable (optional) | `gpt-5-mini` (default if omitted) |
| `OPENAI_API_KEY` | **Secret** | Your OpenAI API key |

Add `OPENAI_API_KEY` as an encrypted Secret. Never add it to frontend JavaScript, HTML, GitHub commits, or a public `.env` file. Redeploy the Pages project after adding or changing settings.

### Important Firebase project check

The current `firebase-config.js` points to project ID `billvault-d7976`. Before setting `FIREBASE_PROJECT_ID`, confirm in Firebase Console that this is the intended Firebase project for ResumeBuild and that its Authentication providers are configured for this website. If it is a different product's project, create a dedicated Firebase project and update the web configuration and Cloudflare variable together. Do not guess or reuse another product's user database.

### User flow and privacy

1. A visitor can upload a PDF, DOCX or TXT file for the basic browser-side checklist.
2. The visitor must sign in and tick the explicit AI-processing consent checkbox to request an AI rewrite.
3. The browser sends the extracted text and optional job description over HTTPS with a Firebase ID token.
4. The Pages Function validates the token signature and claims, then calls the OpenAI Responses API using the server-side secret.
5. The generated rewrite is shown for review and can be printed or saved as PDF through the browser.

The function does not intentionally persist or log resume text. The AI provider processes submitted content under its applicable API terms and data policies. The user must verify all generated details. The feature does not promise ATS scores or employment outcomes.

### Cost and availability

OpenAI API usage is billed separately from ChatGPT subscriptions. The AI rewrite feature will return a configuration message until the Cloudflare secret and matching Firebase project variable are set. Static GitHub Pages does not execute Cloudflare Pages Functions; use the Cloudflare Pages deployment for AI rewrite.

## Existing application files

- `index.html` — website interface
- `assets/css/style.css` — styling
- `assets/js/app.js` — resume builder, local upload review and AI rewrite UI
- `auth.js` / `firebase-config.js` — Firebase authentication setup
- `functions/api/rewrite.js` — secure server-side AI rewrite endpoint
- `privacy-policy.html` — privacy disclosures
