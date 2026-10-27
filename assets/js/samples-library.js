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
  var allSamples = [];
  var grid = document.querySelector("#samples-grid");
  var searchInput = document.querySelector("#sample-search");
  var documentTypeFilter = document.querySelector("#document-type-filter");
  var industryFilter = document.querySelector("#industry-filter");
  var resultsLabel = document.querySelector("#sample-results");
  var pagination = document.querySelector("#sample-pagination");

  function createSampleCard(sample) {
    var article = document.createElement("article");
    var header = document.createElement("header");
    var industry = document.createElement("span");
    var heading = document.createElement("h2");
    var link = document.createElement("a");
    var cover = document.createElement("div");
    var summary = document.createElement("p");
    var actions = document.createElement("ul");
    var action = document.createElement("li");
    var button = document.createElement("a");

    industry.className = "date";
    industry.textContent = sample.industry || "Work sample";
    link.href = sample.slug ? sample.slug + "/" : "#";
    link.textContent = sample.title || "Untitled sample";
    heading.appendChild(link);
    header.append(industry, heading);

    cover.className = "sample-cover";
    if (sample.cover_image) {
      var image = document.createElement("img");
      image.src = versionedUrl(/^(?:https?:|data:|\/)/i.test(sample.cover_image) ? sample.cover_image : "../" + sample.cover_image.replace(/^\.\//, ""));
      image.alt = sample.cover_alt || (sample.title || "Work sample") + " document cover";
      image.loading = "lazy";
      cover.classList.add("has-image");
      cover.appendChild(image);
    } else {
      var coverType = document.createElement("span");
      var coverTitle = document.createElement("strong");
      coverType.textContent = sample.content_type || "Work sample";
      coverTitle.textContent = sample.title || "Sample";
      cover.append(coverType, coverTitle);
    }

    summary.textContent = sample.summary || "";
    actions.className = "actions special";
    button.className = "button";
    button.href = sample.slug ? sample.slug + "/" : "#";
    button.textContent = sample.button_label || "View sample";
    action.appendChild(button);
    actions.appendChild(action);
    article.append(header, cover, summary, actions);
    return article;
  }

  function getFilteredSamples() {
    var term = (searchInput.value || "").trim().toLowerCase();
    var documentType = documentTypeFilter.value;
    var industry = industryFilter.value;
    return allSamples.filter(function (sample) {
      var haystack = [sample.title, sample.content_type, sample.industry, sample.summary].join(" ").toLowerCase();
      return (!documentType || sample.content_type === documentType) && (!industry || sample.industry === industry) && (!term || haystack.indexOf(term) !== -1);
    });
  }

  function makePageButton(label, page, disabled) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "button small";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", function () { currentPage = page; render(); });
    return button;
  }

  function render() {
    var filtered = getFilteredSamples();
    var pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    currentPage = Math.min(currentPage, pageCount);
    var start = (currentPage - 1) * pageSize;
    var visible = filtered.slice(start, start + pageSize);

    grid.replaceChildren();
    if (visible.length) visible.forEach(function (sample) { grid.appendChild(createSampleCard(sample)); });
    else {
      var empty = document.createElement("p");
      empty.textContent = "No samples match this filter yet.";
      grid.appendChild(empty);
    }

    resultsLabel.textContent = filtered.length + (filtered.length === 1 ? " sample" : " samples") + " shown";
    pagination.replaceChildren();
    if (pageCount > 1) {
      pagination.appendChild(makePageButton("Previous", Math.max(1, currentPage - 1), currentPage === 1));
      for (var page = 1; page <= pageCount; page += 1) pagination.appendChild(makePageButton(String(page), page, page === currentPage));
      pagination.appendChild(makePageButton("Next", Math.min(pageCount, currentPage + 1), currentPage === pageCount));
    }
  }

  fetch("../content/portfolio.json?cb=" + contentRevision, { cache: "no-store" })
    .then(function (response) { if (!response.ok) throw new Error("Samples could not be loaded."); return response.json(); })
    .then(function (content) {
      allSamples = (Array.isArray(content.samples) ? content.samples : []).map(function (item, index) { return { item: item, index: index }; }).sort(function (firstEntry, secondEntry) {
        var firstDate = Date.parse(firstEntry.item.published_at || "");
        var secondDate = Date.parse(secondEntry.item.published_at || "");
        if (!isNaN(firstDate) && !isNaN(secondDate)) return secondDate - firstDate;
        if (!isNaN(firstDate)) return -1;
        if (!isNaN(secondDate)) return 1;
        return secondEntry.index - firstEntry.index;
      }).map(function (entry) { return entry.item; });
      Array.from(new Set(allSamples.map(function (sample) { return sample.content_type; }).filter(Boolean))).sort().forEach(function (type) {
        var option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        documentTypeFilter.appendChild(option);
      });
      Array.from(new Set(allSamples.map(function (sample) { return sample.industry; }).filter(Boolean))).sort().forEach(function (industry) {
        var option = document.createElement("option");
        option.value = industry;
        option.textContent = industry;
        industryFilter.appendChild(option);
      });
      searchInput.addEventListener("input", function () { currentPage = 1; render(); });
      documentTypeFilter.addEventListener("change", function () { currentPage = 1; render(); });
      industryFilter.addEventListener("change", function () { currentPage = 1; render(); });
      render();
    })
    .catch(function () {
      resultsLabel.textContent = "Samples could not be loaded.";
    });
}());
