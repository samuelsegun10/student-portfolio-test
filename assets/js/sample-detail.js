(function () {
  "use strict";

  // Fetch CMS content fresh, but keep image URLs stable so browsers can reuse cached covers.
  var contentRevision = String(Date.now());
  function versionedUrl(value) {
    if (!value || /^data:/i.test(value)) return value;
    return value;
  }

  var slug = document.body.getAttribute("data-sample-slug");
  var title = document.querySelector("[data-sample-title]");
  var type = document.querySelector("[data-sample-type]");
  var industry = document.querySelector("[data-sample-industry]");
  var summary = document.querySelector("[data-sample-summary]");
  var coverType = document.querySelector("[data-sample-cover-type]");
  var coverTitle = document.querySelector("[data-sample-cover-title]");
  var coverImage = document.querySelector("[data-sample-cover-image]");
  var coverFallback = document.querySelector("[data-sample-cover-fallback]");
  var deliverablesSection = document.querySelector("[data-sample-deliverables-section]");
  var deliverables = document.querySelector("[data-sample-deliverables]");
  var documentLink = document.querySelector("[data-sample-document-link]");

  function imageUrl(value) {
    if (!value) return "";
    if (/^(?:https?:|data:|\/)/i.test(value)) return value;
    return "../../" + value.replace(/^\.\//, "");
  }

  fetch("../../content/portfolio.json?cb=" + contentRevision, { cache: "no-store" })
    .then(function (response) { if (!response.ok) throw new Error("Sample could not be loaded."); return response.json(); })
    .then(function (content) {
      var samples = Array.isArray(content.samples) ? content.samples : [];
      var sample = samples.find(function (item) { return item.slug === slug; });
      if (!sample) throw new Error("Sample could not be found.");

      document.title = (sample.title || "Work sample") + " | Student Portfolio";
      if (title) title.textContent = sample.title || "Work sample";
      if (type) type.textContent = sample.content_type || "Work sample";
      if (industry) industry.textContent = sample.industry || "";
      if (summary) summary.textContent = sample.detail_summary || sample.summary || "";
      if (coverType) coverType.textContent = sample.content_type || "Work sample";
      if (coverTitle) coverTitle.textContent = sample.title || "Work sample";
      if (coverImage && sample.cover_image) {
        coverImage.src = versionedUrl(imageUrl(sample.cover_image));
        coverImage.alt = sample.cover_alt || (sample.title || "Work sample") + " document cover";
        coverImage.hidden = false;
        if (coverFallback) coverFallback.hidden = true;
      } else if (coverFallback) {
        coverFallback.hidden = false;
      }
      if (deliverablesSection && Array.isArray(sample.key_deliverables) && sample.key_deliverables.length) {
        if (deliverables) {
          deliverables.replaceChildren();
          sample.key_deliverables.forEach(function (item) {
            var entry = document.createElement("li");
            entry.textContent = item;
            deliverables.appendChild(entry);
          });
        }
        deliverablesSection.hidden = false;
      }
      if (documentLink && sample.url) {
        documentLink.href = sample.url;
        documentLink.target = "_blank";
        documentLink.rel = "noopener noreferrer";
      }
    })
    .catch(function () {
      if (title) title.textContent = "Sample unavailable";
      if (documentLink) documentLink.hidden = true;
    });
}());
