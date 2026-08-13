export function renderAuthCompletePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/favicon.png">
  <title>GitHub Connected</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --surface: #ffffff;
      --text: #0d1216;
      --muted: #5b6570;
      --border: #e2e8ee;
      --accent: #3d8bfd;
      --success: #0f7b4c;
      --success-bg: #e8f8f0;
      --success-border: #a8e0c4;
      --radius: 12px;
      --shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06);
      --font: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      font-family: var(--font);
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background:
        radial-gradient(1200px 600px at 10% -10%, rgba(61, 139, 253, 0.12), transparent 55%),
        radial-gradient(900px 500px at 100% 0%, rgba(15, 123, 76, 0.08), transparent 50%),
        var(--bg);
      color: var(--text);
    }
    .box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      padding: 2.25rem 2.5rem;
      text-align: center;
      max-width: 440px;
      width: calc(100% - 2rem);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 999px;
      background: var(--success-bg);
      border: 1px solid var(--success-border);
      color: var(--success);
      font-size: 1.35rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    h1 { font-size: 1.25rem; font-weight: 650; letter-spacing: -0.02em; margin: 0 0 0.5rem; }
    p { color: var(--muted); font-size: 0.95rem; line-height: 1.55; margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <div class="badge" aria-hidden="true">&#10003;</div>
    <h1>GitHub connected</h1>
    <p>You can close this tab and return to the app. The original page will update automatically.</p>
  </div>
</body>
</html>`;
}

export function renderHomePage({ connected }: { connected: boolean }): string {
  const connectedBanner = connected
    ? `<div class="banner banner-success" role="status">
        <span class="banner-dot" aria-hidden="true"></span>
        <span><strong>GitHub connected</strong> — enter a repository below to summarize pull requests.</span>
      </div>`
    : `<div class="banner banner-warn" role="status">
        <span class="banner-dot" aria-hidden="true"></span>
        <span><strong>Step 1 first:</strong> Connect your GitHub account before summarizing pull requests.</span>
      </div>`;
  const authHeading = connected ? "GitHub connected" : "Connect GitHub";
  const authStep = connected ? "Ready" : "Step 1";
  const authSubtitle = connected
    ? "Your current browser session is already connected to GitHub. Reconnect if you want a different account."
    : "Connect your GitHub account once. The app links your session to your OAuth token — no user ID field.";
  const authButtonLabel = connected ? "Reconnect GitHub" : "Connect GitHub";
  const authButtonClass = connected ? "btn btn-secondary" : "btn btn-primary";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/favicon.png">
  <title>GitHub PR Summarizer</title>
  <style>
    :root {
      --bg: #f4f6f8;
      --surface: #ffffff;
      --text: #0d1216;
      --muted: #5b6570;
      --subtle: #8a949e;
      --border: #e2e8ee;
      --border-strong: #c9d3dc;
      --accent: #3d8bfd;
      --accent-hover: #2f78e6;
      --accent-soft: #eaf2ff;
      --accent-ink: #1a4f9c;
      --success: #0f7b4c;
      --success-bg: #e8f8f0;
      --success-border: #a8e0c4;
      --warn: #8a6200;
      --warn-bg: #fff8e8;
      --warn-border: #f0d48a;
      --danger: #b42318;
      --danger-bg: #fef3f2;
      --danger-border: #fecdca;
      --radius: 12px;
      --radius-sm: 8px;
      --shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 28px rgba(15, 23, 42, 0.06);
      --font: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font);
      color: var(--text);
      min-height: 100vh;
      background:
        radial-gradient(1100px 520px at 8% -8%, rgba(61, 139, 253, 0.14), transparent 55%),
        radial-gradient(900px 480px at 100% 0%, rgba(15, 123, 76, 0.07), transparent 50%),
        var(--bg);
      padding: 2rem 1.25rem 3rem;
      -webkit-font-smoothing: antialiased;
    }
    .container { max-width: 1120px; margin: 0 auto; }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .brand {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      max-width: 44rem;
    }
    .brand-kicker {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--accent-ink);
    }
    .brand-kicker::before {
      content: "";
      width: 0.45rem;
      height: 0.45rem;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 3px rgba(61, 139, 253, 0.2);
    }
    header h1 {
      font-size: clamp(1.45rem, 2.2vw, 1.85rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    header .lede {
      color: var(--muted);
      font-size: 0.98rem;
      line-height: 1.55;
      margin-top: 0.15rem;
    }
    .header-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem 0.75rem;
      font-size: 0.86rem;
      margin-top: 0.65rem;
    }
    .header-links a {
      color: var(--accent-ink);
      font-weight: 550;
      text-decoration: none;
    }
    .header-links a:hover { text-decoration: underline; text-underline-offset: 2px; }
    .header-links-sep { color: var(--subtle); user-select: none; }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      border-radius: var(--radius-sm);
      padding: 0.8rem 1rem;
      font-size: 0.9rem;
      line-height: 1.45;
      margin-bottom: 1.25rem;
      border: 1px solid transparent;
    }
    .banner-dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 999px;
      margin-top: 0.4rem;
      flex-shrink: 0;
    }
    .banner-success {
      background: var(--success-bg);
      border-color: var(--success-border);
      color: var(--success);
    }
    .banner-success .banner-dot { background: var(--success); }
    .banner-warn {
      background: var(--warn-bg);
      border-color: var(--warn-border);
      color: var(--warn);
    }
    .banner-warn .banner-dot { background: #d4a017; }

    .layout {
      display: grid;
      grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
      gap: 1.25rem;
      align-items: start;
    }
    @media (max-width: 840px) {
      .layout { grid-template-columns: 1fr; }
      .right-panel { position: static; }
    }

    .card, .summary-panel, details.card-collapsible {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .card {
      padding: 1.35rem 1.4rem 1.45rem;
      margin-bottom: 1rem;
    }
    .card:last-child { margin-bottom: 0; }
    .card-head {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin-bottom: 0.35rem;
    }
    .step-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 1.35rem;
      padding: 0.12rem 0.5rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 650;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      background: var(--accent-soft);
      color: var(--accent-ink);
      border: 1px solid #cfe0ff;
    }
    .step-pill.ready {
      background: var(--success-bg);
      color: var(--success);
      border-color: var(--success-border);
    }
    .card h2 {
      font-size: 1.05rem;
      font-weight: 650;
      letter-spacing: -0.02em;
    }
    .card .subtitle {
      color: var(--muted);
      font-size: 0.88rem;
      line-height: 1.5;
      margin-bottom: 1.15rem;
    }
    .card .subtitle code {
      font-family: var(--mono);
      font-size: 0.8rem;
      background: #f1f4f7;
      border: 1px solid var(--border);
      padding: 0.08rem 0.35rem;
      border-radius: 5px;
      color: #243040;
    }

    .field { margin-bottom: 1rem; }
    label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: #2a3440;
    }
    input[type="text"] {
      width: 100%;
      padding: 0.65rem 0.8rem;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-sm);
      font-size: 0.92rem;
      font-family: inherit;
      background: #fbfcfd;
      color: var(--text);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    input[type="text"]::placeholder { color: #9aa5b1; }
    input[type="text"]:hover { background: #fff; }
    input[type="text"]:focus {
      border-color: var(--accent);
      background: #fff;
      box-shadow: 0 0 0 3px rgba(61, 139, 253, 0.18);
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.65rem 1.15rem;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      border: 1px solid transparent;
      transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s, transform 0.05s;
    }
    .btn:active:not(:disabled) { transform: translateY(1px); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }
    .btn-primary {
      background: linear-gradient(180deg, #4b95ff 0%, var(--accent) 100%);
      color: #fff;
      box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 1px 2px rgba(26, 79, 156, 0.25);
    }
    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(180deg, #3f8af5 0%, var(--accent-hover) 100%);
    }
    .btn-secondary {
      background: #fff;
      color: #1f2a37;
      border-color: var(--border-strong);
    }
    .btn-secondary:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #b7c3cf;
    }

    .auth-result { margin-top: 1rem; }
    .auth-result.hidden { display: none; }
    .status-line {
      color: var(--muted);
      font-size: 0.88rem;
      margin-top: 0.35rem;
      line-height: 1.45;
    }
    .error-box {
      background: var(--danger-bg);
      border: 1px solid var(--danger-border);
      border-radius: var(--radius-sm);
      padding: 0.75rem 0.9rem;
      color: var(--danger);
      font-size: 0.88rem;
      line-height: 1.45;
    }
    .error-box a { color: var(--accent-ink); font-weight: 600; }

    .right-panel { position: sticky; top: 1.25rem; }
    .summary-panel {
      min-height: 440px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .summary-panel-header {
      padding: 0.95rem 1.25rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.92rem;
      font-weight: 650;
      letter-spacing: -0.01em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: linear-gradient(180deg, #fcfdff 0%, #f7f9fb 100%);
    }
    .summary-panel-header span:last-child {
      font-size: 0.75rem;
      font-weight: 550;
      color: var(--subtle);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .summary-panel-body {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .summary-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--subtle);
      font-size: 0.92rem;
      text-align: center;
      gap: 0.55rem;
      padding: 1.5rem;
      line-height: 1.5;
    }
    .summary-placeholder-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: var(--accent-soft);
      color: var(--accent-ink);
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }
    .summary-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      color: var(--muted);
      font-size: 0.92rem;
      text-align: center;
      line-height: 1.5;
    }
    .spinner {
      width: 1.35rem;
      height: 1.35rem;
      border: 2px solid #d7e0ea;
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .summary-content { display: flex; flex-direction: column; gap: 0.9rem; }
    .summary-meta { font-size: 0.8rem; color: var(--subtle); }
    .prs-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .prs-list span {
      display: inline-block;
      background: var(--accent-soft);
      color: var(--accent-ink);
      border: 1px solid #cfe0ff;
      border-radius: 999px;
      padding: 0.18rem 0.55rem;
      font-size: 0.76rem;
      font-weight: 550;
    }
    .summary-text {
      background: #f8fafc;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 1rem 1.1rem;
      font-size: 0.92rem;
      line-height: 1.7;
      white-space: pre-wrap;
      color: #1a2430;
    }
    .summary-error {
      background: var(--danger-bg);
      border: 1px solid var(--danger-border);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      color: var(--danger);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .summary-error a { color: var(--accent-ink); font-weight: 600; }

    details.card-collapsible {
      padding: 0;
      overflow: hidden;
      margin-bottom: 0.85rem;
    }
    details.card-collapsible > summary {
      list-style: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 1rem 1.2rem;
      user-select: none;
    }
    details.card-collapsible > summary::-webkit-details-marker { display: none; }
    details.card-collapsible > summary::marker { content: ''; }
    .collapsible-summary-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      min-width: 0;
    }
    .collapsible-summary-text strong {
      font-size: 0.95rem;
      font-weight: 650;
      letter-spacing: -0.01em;
    }
    .collapsible-summary-hint {
      font-size: 0.8rem;
      color: var(--muted);
      font-weight: 400;
    }
    .collapsible-chevron {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 999px;
      display: grid;
      place-items: center;
      font-size: 0.6rem;
      color: var(--muted);
      background: #f3f6f9;
      border: 1px solid var(--border);
      transition: transform 0.2s ease, background 0.15s;
    }
    details.card-collapsible[open] .collapsible-chevron {
      transform: rotate(90deg);
      background: var(--accent-soft);
      color: var(--accent-ink);
      border-color: #cfe0ff;
    }
    .collapsible-body {
      padding: 0 1.2rem 1.2rem;
      border-top: 1px solid var(--border);
    }
    .collapsible-body .subtitle { margin-top: 0.9rem; margin-bottom: 0.75rem; }
    .help-list {
      font-size: 0.86rem;
      color: #3a4654;
      line-height: 1.55;
      padding-left: 1.1rem;
    }
    .help-list li { margin-bottom: 0.6rem; }
    .help-list li:last-child { margin-bottom: 0; }
    .help-list code {
      font-family: var(--mono);
      font-size: 0.78rem;
      background: #f1f4f7;
      border: 1px solid var(--border);
      padding: 0.08rem 0.32rem;
      border-radius: 5px;
    }
    .help-list a { color: var(--accent-ink); font-weight: 550; }

    .resource-links {
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(226, 232, 238, 0.9);
      color: var(--subtle);
      font-size: 0.84rem;
      line-height: 1.6;
    }
    .resource-links strong {
      color: var(--muted);
      font-weight: 600;
      margin-right: 0.25rem;
    }
    .resource-links a {
      color: var(--accent-ink);
      font-weight: 550;
      text-decoration: none;
    }
    .resource-links a:hover { text-decoration: underline; text-underline-offset: 2px; }
    .resource-links-sep { color: #c0c8d0; margin: 0 0.4rem; user-select: none; }
  </style>
</head>
<body>
<div class="container">
  <header class="topbar">
    <div class="brand">
      <div class="brand-kicker">Scalekit · Render template</div>
      <h1>GitHub PR Summarizer</h1>
      <p class="lede">Summarize the most-discussed open pull requests in any GitHub repository with a per-session connected account.</p>
      <p class="header-links">
        <a href="https://github.com/scalekit-developers/render-ai-agent-deploykit/blob/main/README.md" target="_blank" rel="noopener noreferrer">README</a>
        <span class="header-links-sep" aria-hidden="true">·</span>
        <a href="https://docs.scalekit.com/cookbooks/render-github-pr-summarizer/" target="_blank" rel="noopener noreferrer">Cookbook</a>
        <span class="header-links-sep" aria-hidden="true">·</span>
        <a href="https://docs.scalekit.com/" target="_blank" rel="noopener noreferrer">Docs</a>
        <span class="header-links-sep" aria-hidden="true">·</span>
        <a href="https://youtu.be/w3atzSkKE1w" target="_blank" rel="noopener noreferrer">Video</a>
      </p>
    </div>
  </header>

  ${connectedBanner}

  <details class="card-collapsible">
    <summary>
      <span class="collapsible-summary-text">
        <strong>Scalekit setup (required)</strong>
        <span class="collapsible-summary-hint">GitHub connector &amp; user verification</span>
      </span>
      <span class="collapsible-chevron" aria-hidden="true">&#9654;</span>
    </summary>
    <div class="collapsible-body">
      <p class="subtitle">Complete these steps in the <a href="https://app.scalekit.com" target="_blank" rel="noopener noreferrer">Scalekit dashboard</a> before using this app. Full order: Scalekit connector → GitHub OAuth callback → user verification → env vars → deploy.</p>
      <ul class="help-list">
        <li><strong>GitHub connector:</strong> Go to <strong>AgentKit → Connectors</strong>, add a <strong>GitHub</strong> connector, and copy the connection name into <code>GITHUB_CONNECTION_NAME</code>. In GitHub's OAuth App settings, set <strong>Authorization callback URL</strong> to the <strong>Redirect URI</strong> shown on the Scalekit connection — not this app's URL.</li>
        <li><strong>User verification (most common setup issue):</strong> Go to <a href="https://docs.scalekit.com/agentkit/user-verification/" target="_blank" rel="noopener noreferrer"><strong>AgentKit → Settings → User verification</strong></a> and choose a mode. Use <strong>Scalekit users only</strong> for development/testing. Use <strong>Custom user verification</strong> for production. <em>If you skip this step, the app will stay stuck on "Waiting for GitHub authorization" after OAuth completes.</em></li>
      </ul>
    </div>
  </details>

  <details class="card-collapsible" style="margin-bottom:1.15rem">
    <summary>
      <span class="collapsible-summary-text">
        <strong>Environment variables</strong>
        <span class="collapsible-summary-hint">Scalekit, OpenAI key scopes &amp; Render</span>
      </span>
      <span class="collapsible-chevron" aria-hidden="true">&#9654;</span>
    </summary>
    <div class="collapsible-body">
      <p class="subtitle">Configure these on Render (or in a local <code>.env</code> for development). See the README for least-privilege OpenAI key setup.</p>
      <ul class="help-list">
        <li><strong>Scalekit credentials:</strong> Dashboard → <strong>Developers → API Credentials</strong> for <code>SCALEKIT_ENVIRONMENT_URL</code>, <code>SCALEKIT_CLIENT_ID</code>, and <code>SCALEKIT_CLIENT_SECRET</code>.</li>
        <li><strong>LLM setup:</strong> Set <code>OPENAI_API_KEY</code> and <code>OPENAI_MODEL</code> (default <code>gpt-4.1-mini</code>). Leave <code>OPENAI_BASE_URL</code> empty for OpenAI direct. For a proxy, set <code>OPENAI_BASE_URL</code> and use the proxy token as the key.</li>
        <li><strong>OpenAI key scope:</strong> Use a project key with <strong>Restricted</strong> permissions. This app only needs chat/model inference — leave Assistants, Fine-tuning, Files, etc. disabled.</li>
        <li><strong>Session security:</strong> Generate <code>SESSION_SECRET</code> with <code>openssl rand -hex 32</code>. On Render, <code>render.yaml</code> auto-generates this.</li>
        <li><strong>PUBLIC_BASE_URL (optional):</strong> Auto-detected from Render proxy headers. Only set for a custom domain or unusual reverse proxy.</li>
      </ul>
    </div>
  </details>

  <div class="layout">
    <div class="left-panel">
      <div class="card">
        <div class="card-head">
          <span class="step-pill ${connected ? "ready" : ""}">${authStep}</span>
          <h2>${authHeading}</h2>
        </div>
        <p class="subtitle">${authSubtitle}</p>
        <button id="auth-btn" class="${authButtonClass}" onclick="connectGitHub()">${authButtonLabel}</button>
        <div class="auth-result hidden" id="auth-result"></div>
      </div>

      <div class="card">
        <div class="card-head">
          <span class="step-pill">Step 2</span>
          <h2>Summarize pull requests</h2>
        </div>
        <p class="subtitle">Paste a GitHub repository URL or an <code>owner/repo</code> value. Public repositories work with any connected account. Private repositories require access.</p>
        <div class="field">
          <label for="sum-repository">GitHub repository</label>
          <input type="text" id="sum-repository" placeholder="https://github.com/render-oss/sdk" autocomplete="off">
        </div>
        <button id="sum-btn" class="btn btn-primary" onclick="summarize()">Summarize PRs</button>
      </div>
    </div>

    <div class="right-panel">
      <div class="summary-panel">
        <div class="summary-panel-header">
          <span>Summary</span>
          <span>Live output</span>
        </div>
        <div class="summary-panel-body" id="summary-panel-body">
          <div class="summary-placeholder" id="summary-placeholder">
            <span class="summary-placeholder-icon" aria-hidden="true">&#128196;</span>
            <span>Connect GitHub, paste a repository, then click <strong>Summarize PRs</strong>.</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <p class="resource-links">
    <strong>Resources</strong>
    <a href="https://www.scalekit.com/" target="_blank" rel="noopener noreferrer">Scalekit</a>
    <span class="resource-links-sep" aria-hidden="true">·</span>
    <a href="https://docs.scalekit.com/" target="_blank" rel="noopener noreferrer">Docs</a>
    <span class="resource-links-sep" aria-hidden="true">·</span>
    <a href="https://docs.scalekit.com/agentkit/connectors/" target="_blank" rel="noopener noreferrer">Connectors</a>
    <span class="resource-links-sep" aria-hidden="true">·</span>
    <a href="https://docs.scalekit.com/agentkit/examples/" target="_blank" rel="noopener noreferrer">Examples</a>
    <span class="resource-links-sep" aria-hidden="true">·</span>
    <a href="https://render.com/deploy?repo=https://github.com/scalekit-developers/render-ai-agent-deploykit" target="_blank" rel="noopener noreferrer">Deploy to Render</a>
  </p>
</div>

<script>
  const RENDER_DEPLOY_URL = 'https://render.com/deploy?repo=https://github.com/scalekit-developers/render-ai-agent-deploykit';

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function mdToHtml(md) {
    return escHtml(md)
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
  }

  function renderErrorHtml(message) {
    return escHtml(message)
      .replace(
        escHtml(RENDER_DEPLOY_URL),
        '<a href="' + RENDER_DEPLOY_URL + '" target="_blank" rel="noopener noreferrer">Deploy this on your own Render</a>',
      )
      .replace(
        'support@scalekit.com',
        '<a href="mailto:support@scalekit.com">support@scalekit.com</a>',
      );
  }

  let authPollTimer = null;

  function startAuthPoll() {
    if (authPollTimer) return;
    authPollTimer = setInterval(async () => {
      try {
        const r = await fetch('/api/auth/status');
        const d = await r.json();
        if (d.connected) {
          clearInterval(authPollTimer);
          authPollTimer = null;
          window.location.reload();
        }
      } catch {}
    }, 2500);
  }

  async function connectGitHub() {
    const resultEl = document.getElementById('auth-result');
    const btn = document.getElementById('auth-btn');

    btn.disabled = true;
    resultEl.className = 'auth-result';
    resultEl.innerHTML = '<p class="status-line">Generating authorization link…</p>';

    try {
      const res = await fetch('/api/auth', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      window.open(data.authLink, '_blank');
      resultEl.innerHTML = '<p class="status-line">Waiting for GitHub authorization… complete the flow in the new tab.</p>';
      startAuthPoll();
    } catch (err) {
      resultEl.innerHTML = \`<div class="error-box">\${renderErrorHtml(err.message)}</div>\`;
      btn.disabled = false;
    }
  }

  async function summarize() {
    const repository = document.getElementById('sum-repository').value.trim();
    const panelBody = document.getElementById('summary-panel-body');
    const btn = document.getElementById('sum-btn');
    if (!repository) { alert('Enter a GitHub repository URL or owner/repo value'); return; }

    btn.disabled = true;
    panelBody.innerHTML = \`
      <div class="summary-loading">
        <div class="spinner" aria-hidden="true"></div>
        <span>Fetching PRs and generating summaries…<br><span style="font-size:0.8rem;color:var(--subtle)">This may take up to 2 minutes.</span></span>
      </div>\`;

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      const prsHtml = data.prsAnalyzed && data.prsAnalyzed.length
        ? \`<div class="prs-list">\${data.prsAnalyzed.map(p => \`<span>\${escHtml(p)}</span>\`).join('')}</div>\`
        : '';

      panelBody.innerHTML = \`
        <div class="summary-content">
          <div class="summary-meta">\${escHtml(data.repository)} &middot; top \${data.prsAnalyzed?.length ?? 0} PRs by discussion</div>
          \${prsHtml}
          <div class="summary-text">\${mdToHtml(data.summary)}</div>
        </div>\`;
    } catch (err) {
      panelBody.innerHTML = \`<div class="summary-error">\${renderErrorHtml(err.message)}</div>\`;
    } finally {
      btn.disabled = false;
    }
  }
</script>
</body>
</html>`;
}
