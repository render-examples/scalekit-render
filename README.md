# GitHub PR Summarizer on Render

Deploy a multi-user GitHub PR summarizer on Render in one click. Each visitor connects their own GitHub account once, then gets plain-language summaries of the most-discussed open pull requests in any repo.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/render-examples/scalekit-render)

**[Cookbook](https://docs.scalekit.com/cookbooks/render-github-pr-summarizer/)**

https://github.com/user-attachments/assets/b52ae471-9a37-4dbf-8ea4-ae2814ce8ca5

## What it does

The app finds the five most-discussed open pull requests in a repository, fetches each PR's diff and comment thread through Scalekit's GitHub connector, then calls an OpenAI-compatible chat model to summarize them.

Every browser session connects its own GitHub account, and the server never asks the browser for a `userId`. It mints an opaque identifier server-side, stores it in a session record, and sends the browser only a signed HTTP-only cookie. That matters because the connected GitHub token lives in Scalekit under whatever identifier you supply: if the browser could choose that identifier, one user could point requests at another user's stored token. Binding the identifier to the server-side session and completing the flow with Scalekit's [user verification callback](https://docs.scalekit.com/agentkit/user-verification/) closes that hole.

## Deploy

Setup spans three products, and the order matters. GitHub's OAuth callback must point at **Scalekit**, not at your Render URL, and Scalekit's user verification mode must be set before your first **Connect GitHub** click.

**[Follow SETUP.md](SETUP.md)** for the full walkthrough (Scalekit credentials, the GitHub connector, user verification, LLM keys, and troubleshooting). The short version:

1. Scalekit → copy API credentials and add a GitHub connector.
2. GitHub → set the OAuth App callback to Scalekit's Redirect URI.
3. Scalekit → pick a user verification mode.
4. OpenAI (or a LiteLLM proxy) → create a [restricted project key](SETUP.md#openai-api-key--scope-permissions-least-privilege).
5. Click **Deploy to Render** above and fill in the env vars below when prompted.

### Environment variables

`render.yaml` prompts for each secret on first deploy and generates `SESSION_SECRET` for you.

| Variable                   | Required    | Where it comes from                                                                 |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `SCALEKIT_ENVIRONMENT_URL` | Yes         | Scalekit → Developers → API Credentials                                             |
| `SCALEKIT_CLIENT_ID`       | Yes         | Same                                                                                |
| `SCALEKIT_CLIENT_SECRET`   | Yes         | Same                                                                                |
| `OPENAI_API_KEY`           | Yes         | OpenAI project key, or a LiteLLM virtual key                                        |
| `GITHUB_CONNECTION_NAME`   | Recommended | Scalekit → AgentKit → Connectors. Defaults to the shared demo connector             |
| `OPENAI_MODEL`             | No          | Defaults to `gpt-5-mini`. See [model options](SETUP.md#llm-models-current-defaults) |
| `OPENAI_BASE_URL`          | No          | Leave unset for OpenAI. Set to a proxy base ending in `/v1` for LiteLLM             |
| `SESSION_SECRET`           | Generated   | `generateValue: true` in the Blueprint                                              |
| `PUBLIC_BASE_URL`          | No          | Auto-detected from proxy headers. Set it for a custom domain                        |

## Using the app

1. Open your service URL, `https://<your-service>.onrender.com`.
2. Click **Connect GitHub**. A new tab opens the GitHub OAuth flow through Scalekit.
3. Approve access, then return to the original tab. It polls every few seconds and reloads to a **GitHub connected** banner.
4. Paste a public repo to try it, for example `https://github.com/octocat/Hello-World` or `facebook/react`.
5. Click **Summarize PRs** and wait for the summary panel. The LLM can take up to about 2 minutes.

Public repos work with any connected account. Private repos need a connected GitHub user who can access them.

## How it works

```text
Browser (original tab)                  Browser (new tab)
  │                                       │
  ▼ GET /                                 │
Express server on Render                  │
  │ issues signed session cookie          │
  ▼ POST /api/auth                        │
Scalekit connected account + auth link    │
  │                                       │
  │  opens auth link ─────────────────►   ▼
  │                                     GitHub OAuth consent
  │                                       │
  │  polls GET /api/auth/status           ▼
  │  ◄─── Scalekit API: ACTIVE ──►  Scalekit verifies account
  │
  ▼ page auto-reloads
  │
  ▼ POST /api/summarize { repository }
Scalekit GitHub connector + OpenAI-compatible LLM
```

1. A browser visits `/` and receives a signed, HTTP-only session cookie.
2. The server mints an opaque identifier such as `usr_...` for that session.
3. `POST /api/auth` creates a GitHub auth link through Scalekit.
4. The browser opens that link in a new tab, where the user completes GitHub OAuth.
5. The original tab polls `GET /api/auth/status`, which asks Scalekit whether the connected account is `ACTIVE` yet.
6. Once it is active, the original tab reloads and shows a **GitHub connected** banner.
7. `POST /api/summarize` reads the identifier from the session and runs GitHub tool calls on behalf of that connected account.

With Scalekit's [custom user verification](https://docs.scalekit.com/agentkit/user-verification/) mode enabled, Scalekit also redirects the OAuth tab to `/user/verify`, and the server calls `verifyConnectedAccountUser` before marking the session connected. Both detection paths run in parallel, and whichever fires first wins.

### Tasks

| Task              | Purpose                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| `setupGitHubAuth` | Creates the GitHub authorization link for the current server-side identifier |
| `summarizePRs`    | Orchestrates the PR summary flow for the current session                     |
| `fetchOpenPRs`    | Lists open PRs through Scalekit's GitHub connector                           |
| `fetchPRDetails`  | Fetches PR diffs and comments through the connector                          |
| `generateSummary` | Calls the LLM to produce plain-language summaries                            |

## HTTP API

| Endpoint               | Description                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /`                | The web UI: **Connect GitHub**, then a repository form                                                                                  |
| `POST /api/auth`       | Starts the GitHub connection flow for the current session. No body; returns `{ "authLink": "https://..." }`                             |
| `GET /api/auth/status` | Returns `{ "connected": true \| false }`. Checks the in-memory session first, then the Scalekit API                                     |
| `GET /user/verify`     | Optional callback for custom user verification mode. Validates `state`, calls `verifyConnectedAccountUser`, marks the session connected |
| `POST /api/summarize`  | Summarizes the top open PRs for a repository. Returns `401` if the session has not connected GitHub                                     |

`POST /api/summarize` takes `repository` (a GitHub URL or `owner/repo`), or the older `owner` and `repo` fields:

```bash
curl -X POST https://your-service.onrender.com/api/summarize \
  -H "Content-Type: application/json" \
  --cookie "sid=YOUR_SIGNED_SESSION_COOKIE" \
  -d '{"repository":"https://github.com/octocat/Hello-World"}'
```

## Local development

```bash
cp .env.example .env      # fill in values from SETUP.md steps A–E
npm install
npm run dev               # http://localhost:3000
```

Generate a session secret with `openssl rand -hex 32`. For local runs, use Scalekit's **Scalekit users only** verification mode, because **Custom user verification** needs a public URL Scalekit can reach.

## Production notes

- Sessions live in memory. Use Render Key Value or a database-backed session store before you scale past one instance.
- The signed cookie detects tampering. The identifier itself stays server-side.
- With custom user verification enabled, the `state` value is single-use and expires after 10 minutes.
- Switch to **Custom user verification** in the Scalekit dashboard before going to production.
- Scope the OpenAI project key as tightly as possible ([least privilege](SETUP.md#openai-api-key--scope-permissions-least-privilege)).

## Resources

- [Scalekit AgentKit docs](https://docs.scalekit.com/agent-auth)
- [User verification for connected accounts](https://docs.scalekit.com/agentkit/user-verification/)
- [Render web services docs](https://docs.render.com/web-services)
- [Render Blueprint reference](https://docs.render.com/blueprint-spec)
- [OpenAI model docs](https://platform.openai.com/docs/models)
