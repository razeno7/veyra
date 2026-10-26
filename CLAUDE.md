# Veyra Trading — website

**Before any page, content or SEO work, read `site-context.md` (business facts, audience, competitors, limits) and follow every rule in `seo-process.md`. Before any growth or marketing task, read `GROWTH.md` and follow its rules.**

Static marketing site for Veyra Trading, a private Discord membership (Alpha Membership, $200/month) offering NQ futures signals called live during daily streams.

## Stack
- Plain HTML / CSS / vanilla JS. No build step, no framework, no npm.
- Hosted on Cloudflare Pages, deployed automatically from the `main` branch of this repo.
- Payments and Discord access are handled by LaunchPass (Stripe underneath). The site only links to LaunchPass.

## Files
- `index.html` — homepage (all sections).
- `legal.html` — terms, privacy, risk disclosure, billing & cancellation.
- `about.html` — "About Veyra": who calls the signals. Carries the `Person` JSON-LD (`@id` `https://veyra-trading.com/about#veyra`) that other pages reference.
- `prop-firm-signals.html` — guide targeting "prop firm signals" (`Article` JSON-LD, author = the `Person` above). Names no specific firm; any claim about a named firm must link that firm's own rules page.
- `nq-position-size-calculator.html` — free tool targeting "NQ position size calculator" (`WebPage` + `WebApplication` JSON-LD, author = the `Person` above). The calculator logic is in `calculator.js` (no inline script, for the CSP). NQ $20/point and MNQ $2/point come from CME contract specs, cited on the page.
- `llms.txt` — plain-text site summary for AI tools. Update its page list when a page is added.
- `styles.css` — all styles. Design tokens (colors, fonts, spacing) are CSS variables at the top in `:root`.
- `main.js` — mobile menu, FAQ accordion, mobile sticky CTA, wires LaunchPass links.
- `config.js` — `JOIN_URL` and `MEMBER_URL` (LaunchPass links). Change links here, not in the HTML.
- `404.html` — not-found page (served by Cloudflare Pages with a real 404 status). Uses root-relative paths (`/styles.css`) because it can be served at any URL depth.
- `robots.txt`, `sitemap.xml` — update `sitemap.xml` (and its `lastmod`) when a page is added or changed.
- `assets/` — `veyra-logo.png` (the supplied horizontal logo with its black background made transparent; do not redraw or recolor) plus `veyra-logo.webp`, a pixel-identical lossless copy served via `<picture>`; favicon, share image (`og-image.jpg`, 1200×630).
- `assets/fonts/` — self-hosted Sora, Manrope and JetBrains Mono (variable woff2, latin subset), declared with `@font-face` at the top of `styles.css`. No Google Fonts requests.

## Security headers
- `_headers` sets HSTS and a strict Content-Security-Policy: only same-origin scripts, styles, fonts and images (inline `style` attributes allowed, inline `<script>` code is not). Adding any third-party script, font, image, iframe or analytics requires updating the CSP in `_headers`, or it will be blocked in production.

## Analytics
- Google Analytics 4, measurement ID `G-H212X7G6Y8`, on every page (`index.html`, `legal.html`, `404.html`): the gtag.js loader in `<head>` plus `/analytics.js` (the config, kept out of inline script for the CSP). Any new page must include both lines.
- The CSP in `_headers` allows `googletagmanager.com` and `google-analytics.com` for this. The privacy section of `legal.html` mentions Google Analytics; keep it accurate.

## SEO
- Each page has a `<link rel="canonical">` and Open Graph tags with absolute `https://veyra-trading.com/...` URLs. Keep them absolute.
- The homepage carries `Organization` + `WebSite` + `Service` (Alpha Membership, with its `Offer`) JSON-LD; keep the price in sync with the page. Only add facts that are true; no ratings or review markup.
- Link to clean URLs: `/`, `/about`, `/prop-firm-signals`, `/nq-position-size-calculator`, `/legal` (Cloudflare Pages strips `.html`).
- Content pages (about, guides) use `<main class="prose">` and end with a `.page-cta` block.
- Favicons: `favicon-96.png` + `favicon-32.png` in `<head>`, `favicon.ico` at the root.

## Brand rules
- Dark UI: bg `#080A0D`, sections `#0D1117`, cards `#131922`, borders `#252E3A`, text `#F5F6F8` / `#A4ADBA`, accent blue `#54B4FC` (hover `#86CBFD`), sampled from the logo. Blue only for actions, selected states and a few details. No purple, no gold, no glow everywhere.
- Fonts: Sora (headings), Manrope (body), JetBrains Mono (small labels).
- Angular details inspired by the V logo, used sparingly.
- Copy is English, first person, direct.

## Content rules (important)
- Never invent results, trade screenshots, testimonials, member counts, ratings or profit claims.
- Never add countdowns, fake scarcity or crossed-out prices.
- Images on the site are labelled illustrations. Replace them with real, privacy-safe screenshots when available (member names hidden).
- Keep the risk statements and the "not a guarantee of profit" wording around the positive-R refund.
- The primary purchase CTA is always "Join the Desk"; links that scroll to pricing say "Explore the Membership" or "View Membership".

## Facts
- Live sessions: Monday to Friday, first 2–3 hours of the US session (from the 9:30 a.m. New York open).
- Signals are called live during the stream in the private Discord.
- Refund: full refund of the month's $200 if the total R of the signals over the member's billing month is zero or negative. No other refunds.
- Cancel anytime. All experience levels welcome.
- Trader: Veyra (public alias), more than 7 years trading futures. Nothing else about the trader (real name, photo, results) has been supplied; don't add any.
- X account: https://x.com/HisokAAA777 (display name "Veyra Trading", bio links to the site). It's the brand's account: `sameAs` on the `Organization`, `twitter:site`, footer link on `/`, `/about`, `/prop-firm-signals`, `/nq-position-size-calculator`.
- TradingView profile: https://www.tradingview.com/u/Veyraaaa/ (the trader's own profile): `sameAs` on the `Person`, footer link on `/`, `/about`, `/prop-firm-signals`, `/nq-position-size-calculator`, mentioned in the About contact section.
- Contact: contact@veyra-trading.com
