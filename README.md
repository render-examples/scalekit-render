# Multi-user GitHub PR summarizer agent

> 📖 **Cookbook:** [Build a multi-user GitHub PR summarizer agent](https://docs.scalekit.com/cookbooks/render-github-pr-summarizer/)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/render-examples/pr-summarizer-agent-scalekit)

### Quick start

Provision these keys before clicking the button above.

**1. `OPENAI_API_KEY` (required), `OPENAI_BASE_URL` (optional), `OPENAI_MODEL` (optional)**

The app accepts any OpenAI-compatible API. Pick the row that matches your setup:

| | `OPENAI_API_KEY` | `OPENAI_BASE_URL` | `OPENAI_MODEL` |
|---|---|---|---|
| **OpenAI direct** | your OpenAI key (`sk-...`) | *(leave empty)* | `gpt-4.1-mini` |
| **LiteLLM proxy** | your proxy token | proxy URL (e.g. `https://llm.example.com`) | any model the proxy serves (e.g. `claude-haiku-4-5`) |
| **Azure / Ollama / other** | your key or token | your endpoint URL | your model name |

Leave `OPENAI_BASE_URL` empty to reach OpenAI directly. The default model is `gpt-4.1-mini`.

**2. Scalekit credentials** → `SCALEKIT_ENVIRONMENT_URL`, `SCALEKIT_CLIENT_ID`, `SCALEKIT_CLIENT_SECRET`

- Sign up or log in at [app.scalekit.com](https://app.scalekit.com)
- Select AgentKit
- Navigate to settings in the left sidebar
- Copy the **Environment URL** and **Client ID** from the environment settings
- Click `Generate new secret` in the bottom right
- Copy the secret you just created
- Go to **User verification** settings
- Set it to **Custom user verifier**

**3. Scalekit GitHub connector** → `GITHUB_CONNECTION_NAME`

- In the Scalekit Dashboard, navigate to **Connectors** in the left sidebar
- Click `Create Connection` in the top right
- Search for GitHub and click **Create**
- Copy the **Redirect URI** shown by Scalekit for this GitHub connection
- In your GitHub OAuth App settings, set **Authorization callback URL** to that Scalekit Redirect URI
- Copy the generated connection name — this is your `GITHUB_CONNECTION_NAME`
- Enter the `SCALEKIT_CLIENT_ID` and `SCALEKIT_CLIENT_SECRET` from the previous step
- Click **Save**

> **Note:** Do not set GitHub's OAuth App callback to your Render service URL. GitHub must redirect back to Scalekit's Redirect URI, not to `PUBLIC_BASE_URL/user/verify`.

**4. Deploy**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/render-examples/pr-summarizer-agent-scalekit)

When Render prompts for environment variables, fill in the values from steps 1–4. Set `PUBLIC_BASE_URL` to the same value as your `SCALEKIT_ENVIRONMENT_URL`. `SESSION_SECRET` and `PORT` are set automatically.

**5. Verify the OAuth callback**

Confirm that `PUBLIC_BASE_URL` matches your `SCALEKIT_ENVIRONMENT_URL`. The app constructs `${PUBLIC_BASE_URL}/user/verify` as the OAuth callback URL, so these must be the same value.

This sample shows how to build a GitHub PR summarizer where each browser session connects its own GitHub account once, then uses that connected token for later tool calls. The server never asks the browser for a `userId`.

The app finds the five most-discussed open pull requests in a repository, fetches each PR's diff and comment thread through Scalekit's GitHub connector, then calls an LLM through any OpenAI-compatible API to produce a plain-language summary.

## Why this version is secure

The server mints an opaque identifier on the server side and stores it in its own session record. The browser only carries a signed, HTTP-only session cookie.

That design matters because the connected GitHub token is stored in Scalekit under the identifier you provide. If you let the browser choose that identifier, one user can point requests at another user's stored token. This sample avoids that cross-user impersonation bug by binding the identifier to the server-side session and completing the OAuth flow with Scalekit's user verification callback.

See [User verification for connected accounts](https://docs.scalekit.com/agentkit/user-verification/) for the full Scalekit flow.

## How it works

1. A browser visits `/` and receives a signed, HTTP-only session cookie.
2. The server mints an opaque identifier such as `usr_...` for that session.
3. `POST /api/auth` creates a GitHub auth link with a one-time `state` and a `userVerifyUrl`.
4. After GitHub OAuth completes, Scalekit redirects the browser to `/user/verify`.
5. The server validates `state`, calls `verifyConnectedAccountUser`, marks the session connected, and redirects back to `/`.
6. `POST /api/summarize` reads the identifier from the session and runs GitHub tool calls on behalf of that connected account.

## Web UI

The app serves a browser UI at `http://localhost:3000` in development or at your Render service URL in production.

The UI has two steps:

1. **Connect GitHub**. Click **Connect GitHub** and complete the OAuth flow in the same browser session.
2. **Summarize pull requests**. Paste a GitHub repository URL or enter `owner/repo`, then generate summaries.

When the callback succeeds, the page shows a **GitHub connected** banner. There is no user ID field anywhere in the UI.

## HTTP API

### `POST /api/auth`

Starts the GitHub connection flow for the current browser session.

- No request body
- Browser-driven flow
- Returns `{ "authLink": "https://..." }`

This endpoint is only useful from a browser session because the callback relies on the signed session cookie.

### `GET /user/verify`

Completes the connected-account verification flow after Scalekit redirects back with `auth_request_id` and `state`.

- Validates the one-time `state`
- Calls `verifyConnectedAccountUser`
- Marks the session as connected
- Redirects back to `/`

### `POST /api/summarize`

Summarizes the top open PRs for a repository using the GitHub account connected to the current session.

```bash
curl -X POST https://your-service.onrender.com/api/summarize \
  -H "Content-Type: application/json" \
  --cookie "sid=YOUR_SIGNED_SESSION_COOKIE" \
  -d '{"repository":"https://github.com/octocat/Hello-World"}'
```

| Field | Description |
|---|---|
| `repository` | GitHub repository URL or `owner/repo` value |
| `owner` | Optional backward-compatible owner field |
| `repo` | Optional backward-compatible repo field |

If the session has not connected GitHub yet, the server returns `401`.

## Setup

### 1. Configure the Scalekit GitHub connector

1. Open [app.scalekit.com](https://app.scalekit.com) and go to **AgentKit > Connectors**
2. Add a **GitHub** connector
3. Copy the **Redirect URI** shown by Scalekit for this GitHub connection
4. In GitHub's OAuth App settings, set **Authorization callback URL** to that Scalekit Redirect URI
5. Finish the connector setup
6. Copy the generated connection name into `GITHUB_CONNECTION_NAME`

Do not set GitHub's OAuth App callback to your Render service URL. GitHub must redirect back to Scalekit's Redirect URI; Scalekit then redirects the browser to `PUBLIC_BASE_URL/user/verify`.

### 2. Enable custom user verification

This sample uses the secure connected-account verification flow from Scalekit's docs.

1. In the Scalekit Dashboard, go to **AgentKit > Settings > User verification** and set it to **Custom user verification**
2. Set `PUBLIC_BASE_URL` to the same value as `SCALEKIT_ENVIRONMENT_URL`
3. The app sends `${PUBLIC_BASE_URL}/user/verify` as `userVerifyUrl` when it creates the GitHub auth link

### 3. Configure local environment variables

```bash
cp .env.example .env
npm install
```

Fill in `.env` with your Scalekit and LLM settings.

Important variables:

- `SESSION_SECRET`: generate with `openssl rand -hex 32`
- `PUBLIC_BASE_URL`: set to the same value as `SCALEKIT_ENVIRONMENT_URL`; used to construct the OAuth callback URL (`${PUBLIC_BASE_URL}/user/verify`)
- `GITHUB_CONNECTION_NAME`: copy from the Scalekit dashboard

**LLM configuration** — the app accepts any OpenAI-compatible API:

| | `OPENAI_API_KEY` | `OPENAI_BASE_URL` | `OPENAI_MODEL` |
|---|---|---|---|
| **OpenAI direct** | your OpenAI key (`sk-...`) | *(leave empty)* | `gpt-4.1-mini` |
| **LiteLLM proxy** | your proxy token | proxy URL (e.g. `https://llm.example.com`) | any model the proxy serves |
| **Azure / Ollama / other** | your key or token | your endpoint URL | your model name |

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`, click **Connect GitHub**, finish OAuth, then paste a GitHub repository URL or enter `owner/repo`.

After the callback succeeds, the page shows a **GitHub connected** banner and the Step 1 button changes to **Reconnect GitHub**.

Public repositories work with any connected GitHub account. Private repositories only work if the connected account has access.

## Architecture

```text
Browser
  │
  ▼ GET /
Express server
  │ issues signed HTTP-only session cookie
  ▼ POST /api/auth
Scalekit connected account + auth link
  │
  ▼ GET /user/verify?auth_request_id=...&state=...
Express server validates state and calls verifyConnectedAccountUser
  │
  ▼ POST /api/summarize { repository }
Render tasks + Scalekit GitHub connector + LLM
```

## Included tasks

| Task | Purpose |
|---|---|
| `setupGitHubAuth` | Creates the GitHub authorization link for the current server-side identifier |
| `summarizePRs` | Orchestrates the PR summary flow for the current session |
| `fetchOpenPRs` | Lists open PRs through Scalekit's GitHub connector |
| `fetchPRDetails` | Fetches PR diffs and comments through the connector |
| `generateSummary` | Calls the LLM to produce plain-language summaries |

## Production notes

- The sample stores sessions in memory. Use Redis or a database-backed shared session store in production.
- The signed cookie detects tampering. The actual identifier stays server-side in the session store.
- The `state` value is single-use and expires after 10 minutes.
- The app requires the connected GitHub token to have access to the target repository.

## Resources

- [Scalekit AgentKit docs](https://docs.scalekit.com/agent-auth)
- [User verification for connected accounts](https://docs.scalekit.com/agentkit/user-verification/)
- [Render web services docs](https://docs.render.com/web-services)
