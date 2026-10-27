# Topical plan — Veyra Trading

Plan for the "prop firm signals" topic, built on 2026-10-27 from the SEO audit and a 7-step topical authority method (product page, grouped searches, one pillar guide, link plan, real author, one researched question, next problem).
Status of each row: **live**, **proposed** (needs the owner's approval before any page is created or changed) or **blocked** (needs an input from the owner).
Rules from `seo-process.md` and `site-context.md` still apply: no invented facts, unique anchors, title starts with the main keyword.

## 1. Product page and buyer
- Product page: `/` (Alpha Membership, $200/month).
- Buyer: a futures or CFD trader, often on a prop-firm challenge or funded account, who wants NQ calls they can take live.
- Questions before buying, and where they're answered: who calls the signals (`/about`), can I follow them on my prop account (`/prop-firm-signals`), how many contracts (`/nq-position-size-calculator`), what if the month is bad (`/#refund-terms`).

## 2. Pages (one row per page; searches that need the same answer share a page)
| Main question | Searches grouped | Page type | URL | Status | Evidence needed |
|---|---|---|---|---|---|
| Where do I get NQ futures signals? | NQ futures signals, NQ signals Discord | Product page | `/` | live | — |
| Who calls the signals? | About Veyra | Author page | `/about` | live | Real public work (see 5) |
| What do I check before following signals on a prop account? | prop firm signals, signals for prop firm challenge | Pillar guide | `/prop-firm-signals` | live | — |
| How many NQ/MNQ contracts can I trade? | NQ position size calculator, MNQ position size calculator, NQ contract calculator | Tool | `/nq-position-size-calculator` | live | CME specs (cited) |
| Which futures prop firms allow trading from signals placed by hand? | prop firms that allow signals, can I use signals on Topstep/Apex… | Research page | to be decided | proposed | Section 6 |
| How do I size around a trailing drawdown? | trailing drawdown calculator NQ | Tool or guide | to be decided | proposed | SERP check first |

## 3. Pillar
`/prop-firm-signals` is the pillar. It already links to the calculator (section 2) and `/about` (byline). When the research page exists, section "1. Are third-party signals allowed?" links to it.

## 4. Internal link plan
Live links are recorded in `seo-process.md` (keyword and anchor map). Proposed links to the research page, once approved (anchor = its main keyword, never reused for another page):
| Source | Where in the page | Reader's reason to click |
|---|---|---|
| `/prop-firm-signals` | Section 1, after "look for sections on third-party signals…" | See what specific firms actually say |
| `/` | FAQ "Can I use the signals on a prop-firm account?" | Check their own firm before joining |
| `/nq-position-size-calculator` | "Your firm's other rules" bullet | Rules beyond sizing |
| `/about` | "Who it's for", prop-firm paragraph | Same as above |
Four on-topic sources only: flag the shortfall against rule 3 (five), don't force a fifth.
After publishing, click every link and check it lands on the promised answer.

## 5. Author
- Byline "By Veyra" + link to `/about` on the guide and the tool; `author` in JSON-LD = `https://veyra-trading.com/about#veyra`. Consistent.
- Gap (blocked): `/about` shows no real public work yet. Inputs that would count, only if the owner supplies them: published TradingView ideas on the profile, and the full monthly R log of every signal (after legal review, see memory note on profit proof). Never a single winning day.

## 6. Researched question (proposed)
- Question: which futures prop firms allow a trader to follow third-party signals by placing each order by hand, as of the date checked?
- Why it's open: on 2026-10-27 the top results covered copy trading and automation (trade copiers, bots), mostly from affiliate or vendor sites, and none answered the manual-signal question firm by firm with the firms' own wording and a date.
- Firm list (owner confirmed 2026-10-27): Topstep, Apex Trader Funding, Take Profit Trader, Tradeify, BluSky, Alpha Futures.
- Counting rules, fixed before collecting:
  - Source = the firm's own rules page or help center only. Third-party summaries don't count. A support answer counts only if it's written and the owner keeps it.
  - Each firm gets one of: allows manual third-party signals in writing / prohibits them in writing / addresses copy trading only / doesn't address it.
  - For each firm keep: URL, exact sentence, date checked. Re-check every 3 months; rules change.
- Evidence log, first pass 2026-10-27 (exact sentences copied from the firm's own page that day):
  | Firm | Page | Exact sentence | Category |
  |---|---|---|---|
  | BluSky | https://help.blusky.pro/en/articles/12069208-ethical-trading-conduct-policy-blusky-trading-company | Listed as forbidden: "Copying trades from another trader, account, or signal provider, as this undermines independent trading skill development and risk management." | prohibits in writing |
  | Tradeify | https://tradeify.co/funded-trader-agreement (section 6.7(b)) | "The Trader shall execute the Trader's trading strategies independently. Team trading, collaborative trading, group trading, the management of a Trader's account by or on behalf of any third party, and the copying or mirroring of trades between the Trader and any other person are strictly prohibited. The Trader is responsible for the Trader's own trades, and all trading decisions must reflect the Trader's individual strategy and discretion." | prohibits copying another person's trades; decisions must be the trader's own |
  | Alpha Futures | https://alpha-futures.com/terms-and-conditions | "the only copy trading allowed is that from your own external account to your Alpha Futures Account. Any Analyst found copy trading other analyst's trades will be subject to review and if found to be in breach of the Virtual Trading Rules, will result in instant termination of the Services and the closure of your Alpha Futures Account" | prohibits copying another trader's trades |
  | Alpha Futures | https://help.alpha-futures.com/en/articles/9508585-prohibited-trading-practices | "Semi-Automated Trading, such as a custom indicator that gives buy or sell signals, is permissible under the condition that the user manually places, monitors, and manages the trade…" and "Collaborating with others to execute identical or opposite strategies across unconnected accounts is prohibited. Also referred to as 'Group Trading'." | indicator signals allowed; a person's calls not addressed separately |
  | Take Profit Trader | https://takeprofittrader.com/blog/what-is-a-trade-copier (firm's own blog, not its rulebook) | "Many [firms], including Take Profit Trader, require that all trading decisions and execution remain independent. … Traders are welcome to draw inspiration from other traders' ideas and approaches, but the actual decision-making and execution must remain their own." | requires independent decisions; manual signals not addressed in the terms |
  | Topstep | https://help.topstep.com/en/articles/10296582-prohibited-conduct | Prohibited: "performing trades in concert with others (including unconnected accounts or third parties) to pool risk, hedge aggregate positions, or trade the same or opposite strategy simultaneously" | signals not named; coordinated trading prohibited |
  | Apex Trader Funding | https://apextraderfunding.com/help-center/getting-started/prohibited-activities/ and the PA compliance article | Not collected: the site blocks automated requests. Owner to copy the text from a browser. | pending |
- First-pass reading: none of the five firms read allows following a third-party signal provider in writing; BluSky bans it by name, Tradeify and Alpha Futures ban copying another person's trades. This contradicts the plain "Yes." in the homepage FAQ "Can I use the signals on a prop-firm account?" and needs an owner decision before the research page is written.
- Publish: the method, the table with links to each firm's page (required by `CLAUDE.md`), the date, and "check the current rules yourself". No ranking of firms, no affiliate links.

## 7. Next problem (proposed)
After "can I follow signals" and "how many contracts", the same buyer's next problem is staying inside a trailing drawdown. Check the SERP for "trailing drawdown calculator" before planning a page; extend the calculator if the answer is the same.
