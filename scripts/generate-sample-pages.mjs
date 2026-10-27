import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const content = JSON.parse(await readFile(resolve(root, "content", "portfolio.json"), "utf8"));
const samples = Array.isArray(content.samples) ? content.samples : [];
const profile = content.profile || {};
const contact = content.contact || {};
const site = content.site || {};
const owner = profile.name || "Your Name";
const siteUrl = String(site.url || "").replace(/\/$/, "");
const seen = new Set();

function escapeHtml(value) {
  return String(value || "").replace(/[&<>\"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
}
function external(href) { return /^https?:\/\//i.test(href || ""); }
function icon(url, label, icon) {
  return url ? `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="icon brands alt ${icon}"><span class="label">${label}</span></a></li>` : "";
}
function createPage(sample) {
  const title = escapeHtml(sample.title || "Work sample");
  const type = escapeHtml(sample.content_type || "Work sample");
  const industry = escapeHtml(sample.industry || "");
  const detailSummary = escapeHtml(sample.detail_summary || sample.summary || "");
  const slug = escapeHtml(sample.slug);
  const canonical = siteUrl ? `${siteUrl}/samples/${slug}/` : "";
  const documentUrl = escapeHtml(sample.url || "#");
  const linkedin = icon(profile.linkedin_url, "LinkedIn", "fa-linkedin-in");
  const github = icon(contact.github_url, "GitHub", "fa-github");
  return `<!DOCTYPE HTML>
<html lang="en"><head>
  <title>${title} | ${escapeHtml(owner)}</title><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${detailSummary}" />
  ${canonical ? `<link rel="canonical" href="${canonical}" />` : ""}
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="../../assets/css/main.css" />
</head><body class="is-preload" data-sample-slug="${slug}"><div id="wrapper">
<nav id="nav" class="top-navigation"><ul class="links"><li><a href="../../">Home</a></li><li><a href="../../projects/">Projects</a></li><li class="active"><a href="../">Samples</a></li><li><a href="../../insights/">Insights</a></li></ul><ul class="icons">${linkedin}${github}</ul></nav>
<div id="main"><section class="post sample-detail"><header class="sample-detail-page-header"><span class="sample-detail-eyebrow">Work sample</span><h1>${title}</h1></header>
<div class="sample-detail-shell"><article class="sample-detail-overview" id="overview"><nav class="sample-detail-tabs" aria-label="Sample details"><a href="#overview" aria-current="page">Overview</a></nav><section class="sample-detail-about"><h2>About this sample</h2><p class="sample-detail-summary">${detailSummary}</p></section><section class="sample-deliverables" data-sample-deliverables-section hidden><h2>What this work covers</h2><ul data-sample-deliverables></ul></section></article>
<aside class="sample-detail-sidebar"><div class="sample-detail-card"><div class="sample-detail-media"><img class="sample-detail-cover-image" data-sample-cover-image alt="" hidden /><div class="sample-cover sample-detail-cover" data-sample-cover-fallback hidden><span>${type}</span><strong>${title}</strong></div></div><dl class="sample-facts sample-detail-facts"><div><dt>Document type</dt><dd>${type}</dd></div><div><dt>Industry</dt><dd>${industry}</dd></div></dl><ul class="actions sample-detail-actions"><li><a class="button primary" href="${documentUrl}"${external(sample.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}>View document</a></li><li><a class="button" href="../">Back to work samples</a></li></ul></div></aside></div></section></div>
<footer id="footer"><section class="split contact"><section><h3>Location</h3><p>${escapeHtml(contact.location || "")}</p></section><section><h3>Email</h3><p><a href="mailto:${escapeHtml(contact.email || "")}">${escapeHtml(contact.email || "")}</a></p></section></section></footer><div id="copyright"><ul><li>&copy; ${escapeHtml(site.year || new Date().getFullYear())}</li><li>${escapeHtml(owner)} Portfolio</li></ul></div>
</div><script src="../../assets/js/sample-detail.js"></script></body></html>`;
}
for (const sample of samples) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sample.slug || "")) throw new Error(`Each sample needs a lowercase hyphenated slug. Invalid slug for: ${sample.title || "Untitled sample"}`);
  if (seen.has(sample.slug)) throw new Error(`Duplicate sample slug: ${sample.slug}`);
  seen.add(sample.slug);
  const directory = resolve(root, "samples", sample.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), createPage(sample));
}
console.log(`Generated ${samples.length} sample detail pages.`);