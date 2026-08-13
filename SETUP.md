# Setup guide (Scalekit ↔ GitHub ↔ Render)

Setup involves **three products** that each own a different piece of OAuth:

| Product                    | What it owns in this sample                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| **Scalekit**               | AgentKit app credentials, GitHub **connector**, OAuth **Redirect URI**, user verification   |
| **GitHub**                 | OAuth App (Client ID/secret used _by Scalekit's connector_), **Authorization callback URL** |
| **Render** (or local Node) | Runs this web app, holds env secrets, serves `https://….onrender.com` / `localhost:3000`    |

The browser never completes OAuth "with your Render URL." GitHub redirects to **Scalekit**, and Scalekit stores the connected GitHub token. This app only asks Scalekit for tool calls using a **session-bound** identifier.

## Recommended order (do not skip steps)

```text
A. Scalekit  → API credentials + GitHub connector (copy connection name + Redirect URI)
B. GitHub    → OAuth App callback = Scalekit Redirect URI  ← not Render, not localhost
C. Scalekit  → User verification mode (required before first Connect GitHub)
D. LLM       → OpenAI project key or LiteLLM virtual key + model
E. Env       → local .env and/or Render Environment
F. Run       → local npm run dev  OR  Deploy to Render
G. Browser   → Connect GitHub → paste repo → Summarize PRs
```

Keep a notepad open while you flip tabs. You will copy values from Scalekit into GitHub, then from Scalekit and OpenAI into Render.

---

## A. Scalekit — environment credentials

1. Open [app.scalekit.com](https://app.scalekit.com) and select the environment you will use (dev/demo/prod).
2. Go to **Developers → API Credentials**.
3. Copy and save (you will paste these into `.env` / Render later):
   - **Environment URL** → `SCALEKIT_ENVIRONMENT_URL` (e.g. `https://….scalekit.com`)
   - **Client ID** → `SCALEKIT_CLIENT_ID`
   - **Client secret** → `SCALEKIT_CLIENT_SECRET`

Stay in this Scalekit environment for the rest of setup. Mixing credentials from env A with a connector from env B breaks OAuth.

---

## B. Scalekit — GitHub connector

1. In the **same** Scalekit environment: **AgentKit → Connectors**.
2. Add (or open) a **GitHub** connector.
3. Copy and save:
   - **Connection name** (e.g. `github-qkHFhMip`) → `GITHUB_CONNECTION_NAME`
     Optional: this repo defaults to `github-qkHFhMip` for the public sampleapps Render demo only. **Your** environment almost always needs its own name.
   - **Redirect URI** shown on the connector (a Scalekit host/path, **not** your Render URL).

Leave this tab open. The Redirect URI is what GitHub must use next.

Details: [AgentKit connectors](https://docs.scalekit.com/agentkit/connectors/).

---

## C. GitHub — OAuth App (callback into Scalekit)

You are configuring the OAuth App that **Scalekit's connector** uses to talk to GitHub.

1. GitHub → **Settings → Developer settings → OAuth Apps**
   (or your org: **Settings → Developer settings → OAuth Apps**).
2. Create an OAuth App (or edit the one Scalekit/docs told you to use).
3. Set **Authorization callback URL** to the **exact Scalekit Redirect URI** from step B.
4. **Do not** set the callback to:
   - `https://your-service.onrender.com`
   - `https://your-service.onrender.com/user/verify`
   - `http://localhost:3000`
5. Save. If Scalekit's connector UI asks for GitHub Client ID / Client secret, paste them from this OAuth App into the connector and save in Scalekit.

GitHub only allows one primary callback, and that callback must be Scalekit so Scalekit can store the connected account. Your app later receives session activation through user verification or polling, not from GitHub hitting Render directly.

---

## D. Scalekit — user verification (required)

Do this **before** clicking Connect GitHub in the app.

1. Scalekit → **AgentKit → Settings → User verification** (wording may be under AgentKit settings).
2. Choose a mode:

| Mode                         | Use when          | What happens after GitHub OAuth                                                                                                  |
| ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Scalekit users only**      | Local dev / demos | Scalekit marks the connection active. This app polls `/api/auth/status` and reloads.                                             |
| **Custom user verification** | Production-style  | Scalekit redirects to **your app** at `/user/verify`. The server calls `verifyConnectedAccountUser`. Polling remains a fallback. |

3. For **Custom user verification**, Scalekit must be able to reach your public app URL (Render). Localhost only works if you use a tunnel Scalekit can call, so stick to **Scalekit users only** for local demos.

If you skip this step, the UI almost always sticks on **Waiting for GitHub authorization** even when GitHub OAuth "succeeded."

Full reference: [User verification for connected accounts](https://docs.scalekit.com/agentkit/user-verification/).

---

## E. LLM credentials (OpenAI or LiteLLM)

Pick **one** path. Do not mix an OpenAI project key with a LiteLLM base URL unless that key is registered on the proxy.

**OpenAI direct**

| Env               | Value                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`  | Project key (`sk-proj-…`) — [scope permissions](#openai-api-key--scope-permissions-least-privilege) |
| `OPENAI_BASE_URL` | **Unset / delete** (do not leave a LiteLLM URL)                                                     |
| `OPENAI_MODEL`    | e.g. `gpt-5-mini`                                                                                   |

**LiteLLM / OpenAI-compatible proxy**

| Env               | Value                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`  | Proxy **virtual key** (must exist in that proxy's key table)                     |
| `OPENAI_BASE_URL` | Proxy base **including `/v1`** (e.g. `https://llm.example.com/v1`)               |
| `OPENAI_MODEL`    | An id from `GET {OPENAI_BASE_URL}/models` for that key (e.g. `claude-haiku-4-5`) |

---

## F. Environment variables — local and/or Render

### Local

```bash
cp .env.example .env
npm install
# edit .env with values from steps A–E
openssl rand -hex 32   # paste into SESSION_SECRET
```

### Render

1. Deploy (step G) **or** open an existing service → **Environment**.
2. Set the same secrets as local (table below).
3. Prefer **deleting** unused vars rather than leaving them blank:
   - Empty `OPENAI_API_KEY=""` does **not** fall back to `LITELLM_API_KEY`.
   - Empty `OPENAI_BASE_URL` may still be "set". For OpenAI direct, **delete** `OPENAI_BASE_URL` if it previously pointed at a proxy.
4. Save, then wait for the redeploy.

| Variable                   | Where it comes from                                  | Required                                                                             |
| -------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `SCALEKIT_ENVIRONMENT_URL` | Scalekit → Developers → API Credentials              | Yes                                                                                  |
| `SCALEKIT_CLIENT_ID`       | Same                                                 | Yes                                                                                  |
| `SCALEKIT_CLIENT_SECRET`   | Same                                                 | Yes                                                                                  |
| `GITHUB_CONNECTION_NAME`   | Scalekit → AgentKit → Connectors (connection name)   | Recommended (defaults only for sampleapps demo)                                      |
| `OPENAI_API_KEY`           | OpenAI project key or LiteLLM virtual key            | Yes                                                                                  |
| `OPENAI_MODEL`             | OpenAI model id or proxy catalog id                  | No (default `gpt-5-mini`)                                                            |
| `OPENAI_BASE_URL`          | Empty for OpenAI; proxy `…/v1` for LiteLLM           | Path-dependent                                                                       |
| `SESSION_SECRET`           | `openssl rand -hex 32` (the Blueprint generates one) | Recommended on Render                                                                |
| `PUBLIC_BASE_URL`          | Your public app URL                                  | Optional on Render (auto from headers); set for a custom domain or bad proxy headers |
| `PORT`                     | Usually `3000`                                       | Optional (Render sets PORT)                                                          |

Optional aliases (fallbacks only if the `OPENAI_*` var is **unset**, not empty): `LITELLM_API_KEY`, `LITELLM_BASE_URL`, `LITELLM_MODEL`. Prefer a single `OPENAI_*` set to avoid confusion.

---

## G. Run the app

### Option 1 — local

```bash
npm run dev
# open http://localhost:3000
```

### Option 2 — Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/scalekit-developers/render-ai-agent-deploykit)

Or connect this repo and deploy with `render.yaml`:

1. Create or open the web service.
2. Paste env vars from step F (the Blueprint prompts for secrets on first deploy).
3. The start command is `node dist/main.js` (see `package.json`).
4. After the service is live, if you use **Custom user verification**, confirm Scalekit can reach `https://<your-service>.onrender.com/user/verify`.
5. Open the Render URL in a browser and continue to step H.

`SESSION_SECRET`: set it explicitly, or rely on Blueprint `generateValue` when using `render.yaml`. Dashboard-only deploys that omit it get an ephemeral secret, so sessions reset on restart.

---

## H. First successful run in the browser

1. Open the app URL (local or Render).
2. Click **Connect GitHub**. A **new tab** opens for GitHub OAuth (via Scalekit).
3. Approve access on GitHub, then finish any Scalekit or verification step.
4. Return to the **original** tab. It should show **GitHub connected** (the page polls every few seconds).
5. Paste a public `owner/repo` or GitHub URL, then click **Summarize PRs**.
6. Wait for the summary panel. The LLM can take up to about 2 minutes.

Public repos work with any connected account. Private repos require that the connected GitHub user (and OAuth app / org approval) can access the repo.

---

## Who talks to whom (OAuth)

```text
Browser                This app (Render/local)         Scalekit              GitHub
   |                          |                           |                    |
   |-- Connect GitHub ------->|                           |                    |
   |                          |-- auth link ------------->|                    |
   |<-- open new tab ---------|                           |                    |
   |------------------------------ GitHub OAuth (callback = Scalekit URI) ---->|
   |                          |                           |<-- code/token -----|
   |                          |<-- user verify / poll ----|                    |
   |-- Summarize ------------>|-- GitHub tools via Scalekit ------------------>(API)
   |                          |-- chat.completions ------> OpenAI or LiteLLM
```

---

## Common mistakes

| Symptom                                       | Likely cause                                                              | Fix                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Stuck on "Waiting for GitHub authorization"   | User verification mode not set                                            | Step D                                                                                     |
| OAuth error / redirect_uri mismatch           | GitHub callback is Render or localhost                                    | Step C — must be the Scalekit Redirect URI                                                 |
| `GITHUB_CONNECTION_NAME` / connector errors   | Wrong env or wrong connection name                                        | Steps A–B — same Scalekit environment                                                      |
| `401` on summarize before LLM                 | Session never connected                                                   | Complete step H; check cookie / `SESSION_SECRET`                                           |
| `OPENAI_API_KEY environment variable not set` | Blank or missing key on Render                                            | Step F — set the key; do not leave an empty string                                         |
| LiteLLM `token_not_found_in_db`               | OpenAI key used as proxy token, or wrong proxy                            | Step E — virtual key for that host                                                         |
| LiteLLM `Invalid model name`                  | `OPENAI_MODEL` not in the proxy catalog (e.g. left at the OpenAI default) | `GET /v1/models` and set a listed id                                                       |
| Empty / no PRs                                | No open PRs, or the GitHub account cannot see the repo                    | Different repo, or reconnect with access                                                   |
| LLM quota / credit errors                     | Billing or key scope                                                      | [Key permissions](#openai-api-key--scope-permissions-least-privilege) + provider dashboard |

---

## LLM models (current defaults)

This app only needs **chat completions** (plain text in, summary out). Recommended ids as of 2026 (OpenAI API):

| Setting                    | Recommended model id      | Notes                                                                                      |
| -------------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| Default (demos / low cost) | `gpt-5-mini`              | Fast and cheap; the default for this template                                              |
| Balanced / production      | `gpt-5.6-terra`           | Strong quality per dollar for longer PR diffs                                              |
| Highest quality            | `gpt-5.6-sol`             | Frontier reasoning; highest cost                                                           |
| Via LiteLLM / proxy        | Whatever your proxy lists | e.g. `claude-haiku-4-5`, `claude-sonnet-4-5` — call `GET /v1/models` with your virtual key |

Examples:

|                            | `OPENAI_API_KEY`                                                              | `OPENAI_BASE_URL`                             | `OPENAI_MODEL`                   |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------- |
| **OpenAI direct**          | Project key (`sk-proj-...`)                                                   | _(leave empty / unset)_                       | `gpt-5-mini`                     |
| **OpenAI higher quality**  | Same                                                                          | _(leave empty / unset)_                       | `gpt-5.6-terra` or `gpt-5.6-sol` |
| **LiteLLM proxy**          | LiteLLM **virtual key** (not a raw OpenAI key unless registered on the proxy) | `https://your-proxy.example.com/v1`           | e.g. `claude-haiku-4-5`          |
| **Azure / Ollama / other** | Key or token for that endpoint                                                | Endpoint base URL (include `/v1` if required) | That endpoint's model name       |

**LiteLLM vs OpenAI:** if `OPENAI_BASE_URL` is set, the key is sent only to that host. Use a proxy virtual key plus a model id from that proxy's catalog. Do not mix an OpenAI `sk-proj-` key with a LiteLLM base URL unless the proxy is configured to accept it.

Model IDs change over time. Confirm the latest names in the [OpenAI model docs](https://platform.openai.com/docs/models), or with `GET {OPENAI_BASE_URL}/models` on your proxy, before production.

---

## OpenAI API key — scope permissions (least privilege)

This sample calls **only** chat completions through the OpenAI SDK (`generateSummary` in `src/tasks.ts` → `chat.completions.create`). Scope the project key so a leak cannot create assistants, train models, read files, or manage the org.

### Minimal permissions (Restricted key UI)

In **API keys → Create → Permissions → Restricted**, set the rows like this:

| Dashboard row          | Set to    | Required?       | Why                                                                                                                       |
| ---------------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Model capabilities** | **Write** | **Yes**         | Allows chat completions (the only LLM call this app makes)                                                                |
| **List models**        | **Read**  | Optional        | Lets you call `GET /v1/models` when debugging; the app does not call it at runtime. Use **None** for the absolute minimum |
| **Assistants**         | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Threads**            | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Evals**              | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Fine-tuning**        | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Files**              | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Videos**             | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Vector stores**      | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Prompts**            | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Batch**              | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Tunnels**            | **None**  | Yes (leave off) | Unused                                                                                                                    |
| **Datasets**           | **None**  | Yes (leave off) | Unused                                                                                                                    |

**Strict minimum:** top toggle **Restricted** + **Model capabilities = Write** + every other row **None** (1 permission selected).

**Recommended for demos:** add **List models = Read** (2 permissions selected, which matches a typical restricted key used for this sample).

Do **not** choose **All**. Do **not** set Model capabilities to **None**, or summarize will fail with a permission error.

If the UI expands **Model capabilities** into sub-rows, enable write access only for **chat / model inference** (wording varies). This app needs no image, audio, or other modality writes.

Also, outside the permissions matrix:

- Prefer a **project** secret key, not a broad user key
- Optionally restrict the project's **allowed models** to the ids in `OPENAI_MODEL` (e.g. only `gpt-5-mini`)
- Set a **monthly budget / spend limit** on the project

### How to create a restricted key

On [platform.openai.com](https://platform.openai.com):

1. Create (or reuse) a **Project** dedicated to this template or demo env.
2. **API keys → Create** a **project secret key** for that project.
3. Permissions → **Restricted**.
4. Apply the table above (**Model capabilities → Write**; everything else **None**, optional **List models → Read**).
5. Create the key, then copy it once into Render **Environment** or a local gitignored `.env`. Never commit it, and never paste it into the browser.

### Proxies (LiteLLM, Azure, gateway)

If `OPENAI_BASE_URL` points at a proxy, `OPENAI_API_KEY` is the **proxy** credential:

- Create a **virtual key** (or equivalent) with the minimum model allowlist and spend limits the proxy supports.
- Prefer a key scoped to only the model ids you set in `OPENAI_MODEL`.
- Do not reuse a full-access OpenAI user key as a proxy token unless that is intentional and documented.

### Quick security checklist

- [ ] Restricted project key (not **All**)
- [ ] **Model capabilities = Write**; all other rows **None** (optional **List models = Read**)
- [ ] Project model allowlist matches `OPENAI_MODEL` if your dashboard supports it
- [ ] Project spend limit set
- [ ] Secret only in server env (Render / `.env`), never in the browser
