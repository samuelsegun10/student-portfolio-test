(function () {
  var h = window.h;
  if (!window.CMS || !h) return;
  function value(entry, key, fallback) { return entry && entry.get ? (entry.get(key) || fallback || "") : (fallback || ""); }
  window.CMS.registerPreviewTemplate("portfolio", function (props) {
    var data = props.entry.get("data");
    var profile = data.get("profile");
    var about = data.get("about");
    var contact = data.get("contact");
    return h("main", { style: { fontFamily: "Inter, system-ui, sans-serif", maxWidth: "960px", margin: "0 auto", padding: "32px" } }, [
      h("header", { style: { background: "#14283a", color: "white", padding: "32px", textAlign: "center" } }, [h("small", {}, "PORTFOLIO PREVIEW"), h("h1", {}, value(profile, "name", "Your Name")), h("p", {}, [value(profile, "headline"), " ", value(profile, "summary")])]),
      h("section", { style: { padding: "28px 0" } }, [h("h2", {}, value(about, "heading", "About")), h("p", {}, value(about, "summary"))]),
      h("section", { style: { borderTop: "1px solid #d9dfe5", paddingTop: "20px" } }, [h("h2", {}, "Contact"), h("p", {}, [value(contact, "location"), " · ", value(contact, "email")])])
    ]);
  });
}());