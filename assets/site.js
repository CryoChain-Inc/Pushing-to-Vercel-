/* CryoChain site script.
   Edit CONFIG below. Everything else works as is. */
var CONFIG = {
  appStoreUrl: "",      // paste the Apple App Store link when the app is live
  playStoreUrl: "",     // paste the Google Play link when the app is live
  formEmail: "fresh@cryochain.co",   // every form is delivered here
  formEndpoint: "https://formsubmit.co/ajax/fresh@cryochain.co",   // FormSubmit forwards each form to formEmail. After activating, you can swap the address in this link for the private code FormSubmit sends you
  whatsapp: "12028789298",   // digits only, with country code
  ghanaPhone: "",       // Ghana phone number shown on the contact pages
  launchDate: "November 1, 2026",
  calendarUrl: "https://calendar.app.google/WrN4hzNk8DwqBT9W7",   // founders' call booking link
  linkedinWill: "",     // paste each founder's LinkedIn link; the button stays hidden until it is set
  linkedinMaabena: "",
  linkedinBaffour: ""
};

(function () {
  "use strict";
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mobile menu */
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  /* values from CONFIG */
  $("[data-config]").forEach(function (el) {
    var v = CONFIG[el.getAttribute("data-config")];
    if (v) { el.textContent = v; el.classList.remove("todo"); }
    else { el.classList.add("todo"); }
  });
  $("a[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
    a.target = "_blank"; a.rel = "noopener";
  });
  /* links set in CONFIG; hidden until a link is filled in */
  $("a[data-link]").forEach(function (a) {
    var v = CONFIG[a.getAttribute("data-link")];
    if (v) { a.href = v; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; } else { a.hidden = true; }
  });

  /* store buttons: live links once the URLs are set, otherwise "coming soon" */
  $("a.store").forEach(function (a) {
    var url = a.getAttribute("data-store") === "ios" ? CONFIG.appStoreUrl : CONFIG.playStoreUrl;
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; a.classList.remove("soon"); }
    else {
      a.classList.add("soon");
      var em = a.querySelector("em"); if (em) em.textContent = "Coming " + CONFIG.launchDate;
    }
  });

  /* image placeholders: look for images/LABEL.jpg, then .png, .jpeg, .webp; show it and hide the prompt */
  $(".ph").forEach(function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    var base = img.getAttribute("src").replace(/\.jpg$/, ""), exts = [".png", ".jpeg", ".webp"], i = 0;
    function ok() { fig.classList.add("has-img"); }
    function bad() { if (i < exts.length) { img.src = base + exts[i++]; } else { img.remove(); } }
    img.addEventListener("load", ok); img.addEventListener("error", bad);
    if (img.complete) { img.naturalWidth > 0 ? ok() : bad(); }
  });

  /* copy an image prompt to the clipboard */
  $(".ph-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".ph-ui").querySelector(".ph-prompt"), text = box.textContent.trim();
      function done() { btn.textContent = "Copied"; btn.classList.add("done"); setTimeout(function () { btn.textContent = "Copy prompt"; btn.classList.remove("done"); }, 1800); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(box); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Press Ctrl+C"; }
      }
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
    });
  });

  /* insights topic filter */
  var filters = $(".filter");
  if (filters.length) {
    filters.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-filter"), shown = 0;
        filters.forEach(function (o) { var on = o === b; o.classList.toggle("on", on); o.setAttribute("aria-pressed", on ? "true" : "false"); });
        $(".posts .post[data-cat]").forEach(function (p) { var ok = k === "all" || p.getAttribute("data-cat") === k; p.hidden = !ok; if (ok) shown++; });
        var none = document.querySelector(".none"); if (none) none.hidden = shown > 0;
      });
    });
  }

  /* route line draws once when it scrolls into view */
  var routes = $(".route");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove("pre"); en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
    routes.forEach(function (r) { r.classList.add("pre"); io.observe(r); });
  }

  /* forms: send to formEndpoint if set, otherwise open the visitor's email with the message filled in */
  $("form[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var label = form.getAttribute("data-form");
      var data = new FormData(form), lines = [], seen = {};
      data.forEach(function (v, k) {
        if (seen[k]) return; seen[k] = true;
        var all = data.getAll(k).filter(Boolean).join(", ");
        if (all) lines.push(k + ": " + all);
      });
      var status = form.querySelector(".form-status");
      function say(msg, err) { status.textContent = msg; status.className = "form-status show" + (err ? " err" : ""); }
      if (CONFIG.formEndpoint) {
        var who = data.get("Business name") || data.get("Company name") || data.get("Full name") || "";
        var body = { _subject: "CryoChain website: " + label + (who ? " from " + who : ""), _template: "table", _captcha: "false", Form: label };
        lines.forEach(function (l) { var i = l.indexOf(": "); body[l.slice(0, i)] = l.slice(i + 2); });
        fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
          .then(function (r) { if (!r.ok) throw new Error("bad"); say("Thank you. We received your details and will contact you soon."); form.reset(); })
          .catch(function () {
            /* if the form service cannot be reached, hand the details to WhatsApp instead */
            window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(label + "\n" + lines.join("\n")), "_blank", "noopener");
            say("We could not send the form just now, so WhatsApp should open with your details filled in. Press send there to reach us.", true);
          });
      } else {
        /* no form service set yet: open WhatsApp with the details filled in */
        var text = label + "\n" + lines.join("\n");
        window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
        say("WhatsApp should open with your details filled in. Press send there to reach us.");
      }
    });
  });
})();
