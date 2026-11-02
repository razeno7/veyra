// POST /api/blog-webhook: receives Distribb articles and opens a pull request for each.
// It never writes to main, so nothing goes live until the owner merges.
//
// Environment (Cloudflare Pages > Settings > Variables and Secrets, Production):
//   DISTRIBB_WEBHOOK_TOKEN  secret shared with Distribb
//   GITHUB_TOKEN            fine-grained token for this repo (Contents + Pull requests: read/write)
//   GITHUB_REPO             optional, defaults to razeno7/veyra
//
// GitHub is the only store. `.distribb/<id>.json` keeps each article's id, slug, date and
// processed Idempotency-Keys, and `blog/<slug>.html` is the page.

import { renderPage, renderPrBody, reviewFlags, sanitizeHtml, slugify } from '../_lib/article.js';

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };
const KEEP_KEYS = 20;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

function tokensMatch(given, expected) {
  if (!given) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i += 1) diff |= (a[i] ?? 0) ^ b[i];
  return diff === 0;
}

function isAuthorized(request, expected) {
  const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  // Check all three without stopping early, so timing doesn't show which one matched.
  return [bearer, request.headers.get('x-api-key'), request.headers.get('x-make-apikey')]
    .map((value) => tokensMatch(value, expected))
    .some(Boolean);
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

const fromBase64Utf8 = (value) => new TextDecoder().decode(Uint8Array.from(atob(value.replace(/\s/g, '')), (c) => c.charCodeAt(0)));

function githubClient(env) {
  const repo = env.GITHUB_REPO || 'razeno7/veyra';
  const call = async (method, path, body) => {
    const response = await fetch(`https://api.github.com/repos/${repo}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'veyra-distribb-webhook',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 404 && method === 'GET') return null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path} returned ${response.status}`);
    return response.json();
  };
  return {
    owner: repo.split('/')[0],
    get: (path) => call('GET', path),
    post: (path, body) => call('POST', path, body),
    patch: (path, body) => call('PATCH', path, body),
    async readFile(path, ref) {
      const file = await call('GET', `/contents/${path}?ref=${encodeURIComponent(ref)}`);
      return file ? fromBase64Utf8(file.content) : null;
    },
  };
}

async function fetchImage(url) {
  if (!/^https:\/\//i.test(url)) return { warning: 'image_url is not https' };
  try {
    const response = await fetch(url);
    if (!response.ok) return { warning: `download returned ${response.status}` };
    const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
    const extension = IMAGE_TYPES[type];
    if (!extension) return { warning: `unsupported type ${type}` };
    if (Number(response.headers.get('content-length')) > MAX_IMAGE_BYTES) return { warning: 'larger than 3 MB' };
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) return { warning: 'larger than 3 MB' };
    return { extension, base64: toBase64(buffer) };
  } catch (error) {
    return { warning: `download failed: ${error.message}` };
  }
}

async function processArticle(gh, eventType, article, idempotencyKey) {
  const id = String(article.id ?? '');
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new HttpError(422, 'article id is missing or invalid');

  const isUpdate = eventType === 'update_articles';
  const branch = `distribb/${id}`;
  const recordPath = `.distribb/${id}.json`;

  const mainSha = (await gh.get('/git/ref/heads/main')).object.sha;
  const openPrs = await gh.get(`/pulls?state=open&head=${encodeURIComponent(`${gh.owner}:${branch}`)}`);
  const openPr = openPrs?.[0] ?? null;

  const storedRecord = await gh.readFile(recordPath, openPr ? branch : 'main');
  const record = storedRecord ? JSON.parse(storedRecord) : null;

  if (idempotencyKey && record?.keys?.includes(idempotencyKey)) {
    return { id, slug: record.slug, status: 'already_processed' };
  }

  const slug = record?.slug ?? slugify(article.slug);
  if (!slug) throw new HttpError(422, 'article slug is missing or invalid');

  if (!record) {
    const pageExists = await gh.get(`/contents/blog/${slug}.html?ref=main`);
    if (isUpdate && !pageExists) throw new HttpError(404, `no post found for id ${id} or slug ${slug}`);
    if (!isUpdate && pageExists) throw new HttpError(409, `slug ${slug} already belongs to another post`);
  }

  if (typeof article.title !== 'string' || !article.title.trim()) throw new HttpError(422, 'article title is missing');
  if (typeof article.content_html !== 'string' || !article.content_html.trim()) throw new HttpError(422, 'article content_html is missing');

  const nowIso = new Date().toISOString();
  const date = !Number.isNaN(Date.parse(article.published_at))
    ? new Date(article.published_at).toISOString()
    : record?.date ?? nowIso;
  const status = article.status === 'Draft' ? 'Draft' : 'Published';
  const description = String(article.meta_description ?? '').trim();
  const author = String(article.author ?? '').trim();

  let imagePath = record?.imagePath ?? null;
  let imageSource = record?.imageSource ?? null;
  let imageWarning = null;
  let imageBlobBase64 = null;
  if (article.image_url && article.image_url !== imageSource) {
    const image = await fetchImage(article.image_url);
    if (image.warning) {
      imageWarning = image.warning;
    } else {
      imagePath = `assets/blog/${slug}.${image.extension}`;
      imageSource = article.image_url;
      imageBlobBase64 = image.base64;
    }
  }

  const { html: bodyHtml, report } = sanitizeHtml(article.content_html);
  const page = renderPage({
    title: article.title.trim(), slug, description, bodyHtml, date, modified: nowIso, author, imagePath, altText: article.alt_text ?? '', status,
  });
  const newRecord = {
    id,
    slug,
    date,
    status,
    imagePath,
    imageSource,
    tags: Array.isArray(article.tags) ? article.tags.map(String) : [],
    keys: [...(record?.keys ?? []), ...(idempotencyKey ? [idempotencyKey] : [])].slice(-KEEP_KEYS),
  };

  // Build one commit holding the page, its record and its image, on top of the review branch.
  const parentSha = openPr ? openPr.head.sha : mainSha;
  const parent = await gh.get(`/git/commits/${parentSha}`);
  const tree = [
    { path: `blog/${slug}.html`, mode: '100644', type: 'blob', content: page },
    { path: recordPath, mode: '100644', type: 'blob', content: `${JSON.stringify(newRecord, null, 2)}\n` },
  ];
  if (imageBlobBase64) {
    const blob = await gh.post('/git/blobs', { content: imageBlobBase64, encoding: 'base64' });
    tree.push({ path: imagePath, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await gh.post('/git/trees', { base_tree: parent.tree.sha, tree });
  const commit = await gh.post('/git/commits', {
    message: `${isUpdate || record ? 'Update' : 'Add'} article: ${article.title.trim()}`,
    tree: newTree.sha,
    parents: [parentSha],
  });

  // A leftover branch from a merged or closed pull request is moved to the new commit.
  const branchExists = await gh.get(`/git/ref/heads/${branch}`);
  if (branchExists) await gh.patch(`/git/refs/heads/${branch}`, { sha: commit.sha, force: !openPr });
  else await gh.post('/git/refs', { ref: `refs/heads/${branch}`, sha: commit.sha });

  const prTitle = `${status === 'Draft' ? '[Draft] ' : ''}Article: ${article.title.trim()}`;
  const prBody = renderPrBody({
    id, slug, status, date, isUpdate: Boolean(isUpdate || record), author, report, imageWarning,
    flags: reviewFlags(`${article.title} ${description} ${bodyHtml}`),
  });
  const pr = openPr
    ? await gh.patch(`/pulls/${openPr.number}`, { title: prTitle, body: prBody })
    : await gh.post('/pulls', { title: prTitle, body: prBody, head: branch, base: 'main' });

  return { id, slug, status: 'pending_review', pull_request: pr.html_url };
}

export async function onRequestPost({ request, env }) {
  if (!env.DISTRIBB_WEBHOOK_TOKEN || !env.GITHUB_TOKEN) {
    console.error('Missing DISTRIBB_WEBHOOK_TOKEN or GITHUB_TOKEN');
    return json(503, { error: 'webhook is not configured' });
  }
  if (!isAuthorized(request, env.DISTRIBB_WEBHOOK_TOKEN)) return json(401, { error: 'unauthorized' });

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: 'body too large' });

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(400, { error: 'body is not valid JSON' });
  }

  const eventType = payload?.event_type;
  if (eventType !== 'publish_articles' && eventType !== 'update_articles') {
    return json(400, { error: 'unknown event_type' });
  }
  const articles = payload?.data?.articles;
  if (!Array.isArray(articles) || articles.length === 0) return json(400, { error: 'no articles in payload' });

  const gh = githubClient(env);
  const idempotencyKey = request.headers.get('idempotency-key');
  const results = [];
  let failureStatus = null;

  // One at a time. A retry skips the articles whose record already holds this key,
  // so a failure partway through a batch is safe to resend.
  for (const article of articles) {
    try {
      results.push(await processArticle(gh, eventType, article ?? {}, idempotencyKey));
    } catch (error) {
      if (error instanceof HttpError) {
        results.push({ id: article?.id ?? null, error: error.message });
        failureStatus ??= error.status;
      } else {
        console.error(error);
        results.push({ id: article?.id ?? null, error: 'could not save the article, retry later' });
        failureStatus = 502;
      }
    }
  }

  return json(failureStatus ?? 200, { results });
}
