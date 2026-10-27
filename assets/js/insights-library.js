(function () {
  "use strict";

  // Fetch CMS content fresh, but keep image URLs stable so browsers can reuse cached covers.
  var contentRevision = String(Date.now());
  function versionedUrl(value) {
    if (!value || /^data:/i.test(value)) return value;
    return value;
  }
  var pageSize = 6;
  var currentPage = 1;
  var allInsights = [];
  var grid = document.querySelector("#insights-grid");
  var searchInput = document.querySelector("#insight-search");
  var insightFilter = document.querySelector("#insight-filter");
  var resultsLabel = document.querySelector("#insight-results");
  var pagination = document.querySelector("#insight-pagination");

  function assetPath(path) { return path && path.indexOf("images/") === 0 ? "../" + path : path; }

  function createCard(insight) {
    var article = document.createElement("article"), header = document.createElement("header"), eyebrow = document.createElement("span"), heading = document.createElement("h2"), title = document.createElement("a"), imageLink = document.createElement("a"), image = document.createElement("img"), summary = document.createElement("p"), actions = document.createElement("ul"), item = document.createElement("li"), button = document.createElement("a"), external = /^https?:\/\//i.test(insight.url || "");
    eyebrow.className = "date"; eyebrow.textContent = insight.eyebrow || "Insight";
    title.href = insight.url || "#"; title.textContent = insight.title || "Untitled insight";
    imageLink.href = insight.url || "#"; imageLink.className = "image fit"; image.src = versionedUrl(assetPath(insight.image) || "../images/project-placeholder.svg"); image.alt = insight.title || "Portfolio insight"; imageLink.appendChild(image);
    button.href = insight.url || "#"; button.className = "button"; button.textContent = insight.button_label || "Read article";
    if (external) [title, imageLink, button].forEach(function (link) { link.target = "_blank"; link.rel = "noopener noreferrer"; });
    heading.appendChild(title); header.append(eyebrow, heading); summary.textContent = insight.summary || ""; item.appendChild(button); actions.className = "actions special"; actions.appendChild(item); article.append(header, imageLink, summary, actions);
    return article;
  }

  function filteredInsights() { var term = (searchInput.value || "").trim().toLowerCase(), area = insightFilter.value; return allInsights.filter(function (insight) { var haystack = [insight.title, insight.eyebrow, insight.summary].join(" ").toLowerCase(); return (!area || insight.eyebrow === area) && (!term || haystack.indexOf(term) !== -1); }); }
  function button(label, page, disabled) { var item = document.createElement("button"); item.type = "button"; item.className = "button small"; item.textContent = label; item.disabled = disabled; item.addEventListener("click", function () { currentPage = page; render(); window.scrollTo({ top: 0, behavior: "smooth" }); }); return item; }
  function render() { var filtered = filteredInsights(), pages = Math.max(1, Math.ceil(filtered.length / pageSize)); currentPage = Math.min(currentPage, pages); grid.replaceChildren(); filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(function (insight) { grid.appendChild(createCard(insight)); }); resultsLabel.textContent = filtered.length + (filtered.length === 1 ? " insight" : " insights") + " shown"; pagination.replaceChildren(); if (pages > 1) { pagination.appendChild(button("Previous", Math.max(1, currentPage - 1), currentPage === 1)); for (var page = 1; page <= pages; page += 1) pagination.appendChild(button(String(page), page, page === currentPage)); pagination.appendChild(button("Next", Math.min(pages, currentPage + 1), currentPage === pages)); } }

  fetch("../content/portfolio.json?cb=" + contentRevision, { cache: "no-store" }).then(function (response) { if (!response.ok) throw new Error(); return response.json(); }).then(function (content) { allInsights = (Array.isArray(content.insights) ? content.insights : []).map(function (item, index) { return { item: item, index: index }; }).sort(function (a, b) { var first = Date.parse(a.item.published_at || ""), second = Date.parse(b.item.published_at || ""); if (!isNaN(first) && !isNaN(second)) return second - first; if (!isNaN(first)) return -1; if (!isNaN(second)) return 1; return b.index - a.index; }).map(function (entry) { return entry.item; }); Array.from(new Set(allInsights.map(function (item) { return item.eyebrow; }).filter(Boolean))).sort().forEach(function (area) { var option = document.createElement("option"); option.value = area; option.textContent = area; insightFilter.appendChild(option); }); searchInput.addEventListener("input", function () { currentPage = 1; render(); }); insightFilter.addEventListener("change", function () { currentPage = 1; render(); }); render(); }).catch(function () { resultsLabel.textContent = "Insights could not be loaded."; });
}());
