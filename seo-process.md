# SEO process — Veyra Trading

These rules apply to every page created or edited on this site, every time, without being asked.
Business facts, audience, competitors and limits are in `site-context.md`. Read both before any SEO or content work.

## Rules

1. **Check before creating.** Before creating a page, check Search Console and `sitemap.xml`. If a page already targets the keyword, optimize that page instead of creating a new one.
2. **One main keyword per page.** The `<title>` starts with that keyword, word for word.
3. **Internal links.** Every new page gets at least 5 internal links from pages on the same topic, placed inside the body text, with the new page's main keyword as the anchor.
4. **Unique anchors.** Never use the same anchor text for two different pages.
5. **Structured data.** Add the schema that fits the page (`Article`, `FAQPage`, `Person` for the author, `Organization` site-wide) and validate it (Google Rich Results Test or validator.schema.org).
6. **Sitemap.** Update `sitemap.xml` (URL and `lastmod`) after every new page.
7. **No invented facts.** Never invent a number, a quote, a review or a source. If a fact is missing, ask the owner.
8. **No self-ranking.** Never rank Veyra Trading first in a list of tools or providers.
9. **Diff before publishing.** Show the diff to the owner before publishing any change to a page that already gets clicks in Search Console.

## Known constraints (October 2026)

- **Rule 1 / 9:** Search Console is set up: the domain property was verified by DNS (TXT record `google-site-verification`) on 24 October 2026. Its data is not readable from this repository's tooling (no Google API credentials), so ask the owner for Search Console figures instead of assuming there are none. The site went live on 21 October 2026; until click data exists, treat `/` as a page that gets clicks: always show the diff before publishing changes to it.
- **Rule 3:** the site has four pages (`/`, `/about`, `/prop-firm-signals`, `/legal`). Five topical body links per page are not possible yet. As of 25 October 2026: `/prop-firm-signals` gets 3 (2 from `/`, 1 from `/about`), `/about` gets 2 (1 from `/`, 1 from `/prop-firm-signals`), plus footer links. Do not add forced or off-topic links to reach the number; flag the shortfall instead, and add links from each new on-topic page.
- **Rule 5:** the trader's public alias is **Veyra** (owner, 25 October 2026). The `Person` node lives on `/about` with `@id` `https://veyra-trading.com/about#veyra`; reference that `@id` as `author` on any new article. Google no longer shows FAQ rich results for most sites; `FAQPage` is still valid markup but expect no visual effect in search.

## Keyword and anchor map (rules 2 and 4)

| Page | Main keyword (title starts with it) | Anchor text used to link to it |
|---|---|---|
| `/` | NQ futures signals | "NQ futures signals" |
| `/about` | About Veyra | "About Veyra" |
| `/prop-firm-signals` | prop firm signals | "prop firm signals" |
| `/legal` | none (legal page) | "Terms", "Privacy", "Risk disclosure", "Billing & cancellation" (footer) |

Add a row for every new page, and never reuse an anchor from this table for a different page.
- **Rule 5 + `site-context.md`:** never add `Review`, `AggregateRating` or any rating markup.
