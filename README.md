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

The current `firebase-config.js` points to the dedicated ResumeBuild project ID `brandblitz-resume-ai-92b9e`. Set the Cloudflare `FIREBASE_PROJECT_ID` variable to this exact value and confirm Firebase Authentication providers are enabled for the deployed domain.

### User flow and privacy

1. A visitor can upload a PDF, DOCX or TXT file for the basic browser-side checklist.
2. The visitor must sign in and tick the explicit AI-processing consent checkbox to request an AI rewrite.
3. The browser sends the extracted text and optional job description over HTTPS with a Firebase ID token.
4. The Pages Function validates the token signature and claims, then calls the OpenAI Responses API using the server-side secret.
5. The generated rewrite is shown for review and can be printed or saved as PDF through the browser.

The function does not intentionally persist or log resume text. The AI provider processes submitted content under its applicable API terms and data policies. The user must verify all generated details. The feature does not promise ATS scores or employment outcomes.

### Cost and availability

OpenAI API usage is billed separately from ChatGPT subscriptions. The AI rewrite feature will return a configuration message until the Cloudflare secret and matching Firebase project variable are set. Static GitHub Pages does not execute Cloudflare Pages Functions; use the Cloudflare Pages deployment for AI rewrite.

## Free resume builder features

The builder includes five selectable layouts (Modern, Classic, Minimal, Executive and Fresher), live preview, project details, certifications/achievements, profile links, browser print-to-PDF, and a Word-compatible `.doc` export. The Word export is HTML-based for Microsoft Word compatibility; it is not a native `.docx` file.

## Existing application files

- `index.html` — website interface
- `assets/css/style.css` — styling
- `assets/js/app.js` — five free resume templates, resume builder, local upload review, AI rewrite UI, PDF print and Word-compatible export
- `auth.js` / `firebase-config.js` — Firebase authentication setup
- `functions/api/rewrite.js` — secure server-side AI rewrite endpoint
- `privacy-policy.html` — privacy disclosures
