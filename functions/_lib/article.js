// Turns a Distribb article into a page for review: sanitizes its HTML, renders the
// site template and lists what a human must check before merging.

const SITE = 'https://veyra-trading.com';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ALLOWED = {
  p: [], h2: [], h3: [], h4: [], h5: [], h6: [], ul: [], ol: [], li: [], strong: [], em: [], b: [], i: [],
  blockquote: [], code: [], pre: [], br: [], hr: [], sub: [], sup: [], figure: [], figcaption: [],
  table: [], thead: [], tbody: [], tr: [], th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'],
  a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'],
};
const RENAMED = { h1: 'h2' };
const VOID = new Set(['br', 'hr', 'img']);
const DROP_WITH_CONTENT = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'svg', 'math', 'form', 'select', 'textarea', 'title', 'head']);
const TOKEN = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?)\s*\/?>/g;
const ATTR = /([a-zA-Z_:][-\w:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

export const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const escapeAttr = (value) => value.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isOwnUrl = (url) => (url.startsWith('/') && !url.startsWith('//')) || url.startsWith('#') || url.startsWith(`${SITE}/`) || url === SITE;

/** Rebuilds the HTML from an allowlist. Every tag in the output is written here, never copied. */
export function sanitizeHtml(html) {
  const report = { externalLinks: [], removedImages: [], removedElements: [] };
  let out = '';
  let last = 0;
  let skipping = null;

  const text = (chunk) => (skipping ? '' : chunk.replace(/</g, '&lt;'));

  for (const match of String(html).matchAll(TOKEN)) {
    out += text(html.slice(last, match.index));
    last = match.index + match[0].length;

    const name = match[2]?.toLowerCase();
    if (!name) continue; // comment
    const closing = match[1] === '/';

    if (skipping) {
      if (closing && name === skipping) skipping = null;
      continue;
    }
    if (DROP_WITH_CONTENT.has(name)) {
      if (!closing) {
        report.removedElements.push(name);
        if (!match[0].endsWith('/>')) skipping = name;
      }
      continue;
    }

    const tag = RENAMED[name] ?? name;
    const allowedAttrs = ALLOWED[tag];
    if (!allowedAttrs) {
      if (!closing) report.removedElements.push(name);
      continue;
    }
    if (closing) {
      if (!VOID.has(tag)) out += `</${tag}>`;
      continue;
    }

    const attrs = {};
    for (const attr of (match[3] ?? '').matchAll(ATTR)) {
      const key = attr[1].toLowerCase();
      if (allowedAttrs.includes(key)) attrs[key] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    }

    if (tag === 'img') {
      if (!attrs.src || !isOwnUrl(attrs.src)) {
        report.removedImages.push(attrs.src ?? '(no src)');
        continue;
      }
      attrs.alt ??= '';
      attrs.loading = 'lazy';
    }
    if (tag === 'a') {
      if (attrs.href && !/^(https?:\/\/|\/|#|mailto:)/i.test(attrs.href)) delete attrs.href;
      if (attrs.href && /^(https?:)?\/\//i.test(attrs.href) && !isOwnUrl(attrs.href)) {
        report.externalLinks.push(attrs.href);
        attrs.rel = 'nofollow noopener';
      }
    }

    out += `<${tag}${Object.entries(attrs).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('')}>`;
  }
  out += text(String(html).slice(last));
  return { html: out, report };
}

export const slugify = (value) => String(value ?? '')
  .toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');

// Words that break the site's content rules when used carelessly. A hit means "read this", not "wrong".
const REVIEW_TERMS = [
  [/\bguarante\w*/i, 'guarantee wording'],
  [/\bwin[- ]?rate\b/i, 'win rate claim'],
  [/\b\d+(?:[.,]\d+)?\s?%/, 'percentage: is it sourced?'],
  [/\bprofit\w*/i, 'profit wording'],
  [/\b(?:pass|passing|passed)\s+(?:\w+\s+){0,3}(?:challenge|evaluation|combine)/i, 'promise of passing a challenge'],
  [/\btestimonial|\breview(?:s|ed)?\b|\bmembers?\s+(?:say|said|made)\b/i, 'testimonial or review'],
  [/\b(?:I|we)\s+(?:made|earned|returned|gained|won)\b/i, 'first-person result'],
  [/\b\d+\s+(?:\w+\s+)?(?:traders|members|customers)\b/i, 'customer count'],
  [/\b(?:Topstep|Apex|Take Profit Trader|Tradeify|BluSky|Alpha Futures|FTMO)\b/, 'named firm: claims must link its own rules page'],
  [/\bbest\b/i, '"best": never rank Veyra first'],
];

export function reviewFlags(text) {
  const plain = String(text).replace(/<[^>]+>/g, ' ');
  return REVIEW_TERMS.filter(([pattern]) => pattern.test(plain)).map(([, label]) => label);
}

const jsonForScript = (data) => JSON.stringify(data, null, 2).replace(/</g, '\\u003c');

/** Renders the full page. Links are root-relative because the page lives under /blog/. */
export function renderPage({ title, slug, description, bodyHtml, date, modified, author, imagePath, altText, status }) {
  const url = `${SITE}/blog/${slug}`;
  const isVeyra = String(author ?? '').trim().toLowerCase() === 'veyra';
  const image = imagePath ? `${SITE}/${imagePath}` : `${SITE}/assets/og-image.jpg`;
  const when = new Date(date);
  const byline = [
    author ? `By ${escapeHtml(author)}` : null,
    `${MONTHS[when.getUTCMonth()]} ${when.getUTCFullYear()}`,
    isVeyra ? '<a href="/about">About Veyra</a>' : null,
  ].filter(Boolean).join(' · ');

  const article = {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    image,
    datePublished: date.slice(0, 10),
    dateModified: modified.slice(0, 10),
    inLanguage: 'en',
    publisher: { '@id': `${SITE}/#organization` },
  };
  if (isVeyra) article.author = { '@id': `${SITE}/about#veyra` };
  else if (author) article.author = { '@type': 'Person', name: author };

  const graph = [article];
  if (isVeyra) graph.push({ '@type': 'Person', '@id': `${SITE}/about#veyra`, name: 'Veyra', url: `${SITE}/about`, sameAs: ['https://www.tradingview.com/u/Veyraaaa/'] });
  graph.push({
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'Veyra Trading',
    url: `${SITE}/`,
    logo: { '@type': 'ImageObject', url: `${SITE}/assets/apple-touch-icon.png`, width: 180, height: 180 },
    sameAs: ['https://x.com/HisokAAA777'],
  });

  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title>
<meta name="description" content="${d}">
${status === 'Draft' ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#080A0D">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/favicon-96.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Veyra Trading">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@HisokAAA777">
<link rel="preload" href="/assets/fonts/sora-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">
${jsonForScript({ '@context': 'https://schema.org', '@graph': graph })}
</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H212X7G6Y8"></script>
<script src="/analytics.js"></script>
<script src="/config.js" defer></script>
<script src="/main.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="/" aria-label="Veyra Trading — home">
      <picture><source srcset="/assets/veyra-logo.webp" type="image/webp"><img src="/assets/veyra-logo.png" alt="Veyra Trading" width="520" height="141"></picture>
    </a>
    <div class="header-actions">
      <a class="btn btn-primary btn-sm" href="/#membership" data-join>Join the Desk</a>
    </div>
  </div>
</header>

<main id="main" class="prose">
  <p class="label">Article</p>
  <h1>${t}</h1>
  <p class="updated">${byline}</p>
${imagePath ? `  <img src="/${imagePath}" alt="${escapeHtml(altText)}" style="display:block;width:100%;height:auto;margin-top:24px;border-radius:var(--radius-card)">\n` : ''}
${bodyHtml}

  <p>Futures and CFD trading involves substantial risk of loss and is not suitable for every investor. Only trade with money you can afford to lose.</p>

  <div class="page-cta">
    <h2>Join the Veyra desk.</h2>
    <p>My <a href="/">NQ futures signals</a> are called live in the private Discord, Monday to Friday from the 9:30 a.m. New York open.</p>
    <div class="actions">
      <a class="btn btn-primary" href="/#membership" data-join>Join the Desk</a>
      <a class="link-arrow" href="/#membership">View Membership
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>
  </div>
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <picture><source srcset="/assets/veyra-logo.webp" type="image/webp"><img src="/assets/veyra-logo.png" alt="Veyra Trading" width="520" height="141" loading="lazy"></picture>
        <p>Contact: <a href="mailto:contact@veyra-trading.com">contact@veyra-trading.com</a></p>
      </div>
      <nav class="footer-nav" aria-label="Footer">
        <a href="/about">About Veyra</a>
        <a href="/prop-firm-signals">Prop firm signals</a>
        <a href="/nq-position-size-calculator">NQ position size calculator</a>
        <a href="/legal#terms">Terms</a>
        <a href="/legal#privacy">Privacy</a>
        <a href="/legal#risk">Risk disclosure</a>
        <a href="/legal#billing">Billing &amp; cancellation</a>
        <a href="https://x.com/HisokAAA777" rel="me">Veyra on X</a>
        <a href="https://www.tradingview.com/u/Veyraaaa/" rel="me">Veyra on TradingView</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <p>Futures trading involves substantial risk of loss. Signals and live sessions do not guarantee results. Prop-firm rules vary; check yours before trading from signals.</p>
      <p>© ${when.getUTCFullYear()} Veyra Trading</p>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

const list = (items) => (items.length ? items.map((item) => `- \`${String(item).replace(/`/g, "'")}\``).join('\n') : '- None');

export function renderPrBody({ id, slug, status, date, isUpdate, author, flags, report, imageWarning }) {
  return `Sent by Distribb (article id \`${id}\`). **Nothing is live until this pull request is merged.** To reject it, close it.

- URL once merged: ${SITE}/blog/${slug}
- Type: ${isUpdate ? 'update of an existing article' : 'new article'}
- Distribb status: ${status}${status === 'Draft' ? ' (page is `noindex`)' : ''}
- Post date: ${date}
- Author: ${author || '(none sent)'}${String(author ?? '').trim().toLowerCase() === 'veyra' ? '' : ' (not the site author: check the byline)'}
- Preview: open the Cloudflare Pages check on this pull request, then go to \`/blog/${slug}\`

### Words to read closely
${list(flags)}

### External links (set to \`nofollow\`; remove any you didn't choose)
${list(report.externalLinks)}

### Removed from the article
Images hosted elsewhere (blocked by the site's CSP):
${list(report.removedImages)}

Unsafe or unsupported elements:
${list([...new Set(report.removedElements)])}
${imageWarning ? `\nFeatured image not copied: ${imageWarning}\n` : ''}
### Before merging (\`site-context.md\`, \`seo-process.md\`)
- [ ] Every fact is true and sourced. No invented results, members, quotes or experience.
- [ ] Nothing the trader didn't say is written in the first person.
- [ ] No promise of profit or of passing a challenge. Anything about a named firm links that firm's rules page.
- [ ] The title starts with one main keyword that no other page targets.
- [ ] New article only: add it to \`sitemap.xml\` and \`llms.txt\`, add internal links, and add it to the anchor map and the SEO ledger.
`;
}
