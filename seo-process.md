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

- **Rule 1 / 9:** Search Console is not connected to this repository's tooling yet, and the site went live on 21 October 2026. Until click data exists, treat `/` as a page that gets clicks: always show the diff before publishing changes to it.
- **Rule 3:** the site has only two pages (`/`, `/legal`). Five topical internal links are not possible until enough related pages exist. Do not add forced or off-topic links to reach the number; flag the shortfall instead.
- **Rule 5:** no `Person` schema until the owner supplies the public name or alias to use (the homepage has no author section). Google no longer shows FAQ rich results for most sites; `FAQPage` is still valid markup but expect no visual effect in search.
- **Rule 5 + `site-context.md`:** never add `Review`, `AggregateRating` or any rating markup.
