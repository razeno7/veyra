# Veyra Trading — website

Static marketing site for Veyra Trading, a private Discord membership (Alpha Membership, $200/month) offering NQ futures signals called live during daily streams.

## Stack
- Plain HTML / CSS / vanilla JS. No build step, no framework, no npm.
- Hosted on Cloudflare Pages, deployed automatically from the `main` branch of this repo.
- Payments and Discord access are handled by LaunchPass (Stripe underneath). The site only links to LaunchPass.

## Files
- `index.html` — homepage (all sections).
- `legal.html` — terms, privacy, risk disclosure, billing & cancellation.
- `styles.css` — all styles. Design tokens (colors, fonts, spacing) are CSS variables at the top in `:root`.
- `main.js` — mobile menu, FAQ accordion, mobile sticky CTA, wires LaunchPass links.
- `config.js` — `JOIN_URL` and `MEMBER_URL` (LaunchPass links). Change links here, not in the HTML.
- `assets/` — `veyra-logo.png` (the supplied horizontal logo with its black background made transparent; do not redraw or recolor), favicon, share image.

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
- Contact: contact@veyra-trading.com
