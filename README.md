# Veyra Trading — website

Static site for the Veyra Trading Alpha Membership. No build step.

## Preview locally
Open `index.html` in a browser.

## Set the LaunchPass links
Edit `config.js` and paste your links:

```js
JOIN_URL: "https://www.launchpass.com/your-community/your-plan",
MEMBER_URL: "your LaunchPass member portal link"
```

## Deploy on Cloudflare Pages
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pick this repository.
3. Framework preset: **None**. Build command: *(leave empty)*. Build output directory: `/`.
4. Save and deploy. Every push to `main` redeploys automatically.
5. Custom domain: in the Pages project → Custom domains → add `veyra-trading.com`.

## Edit with Claude Code
Open this repository in Claude Code and describe the change. `CLAUDE.md` gives it the brand and content rules.
