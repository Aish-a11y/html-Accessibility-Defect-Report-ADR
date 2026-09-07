(function () {
  "use strict";

  /* =========================================================
     WCAG 2.2 reference list (Level A + AA) — powers the datalist
     ========================================================= */
  var WCAG_CRITERIA = [
    "1.1.1 Non-text Content (A)",
    "1.2.1 Audio-only and Video-only (Prerecorded) (A)",
    "1.2.2 Captions (Prerecorded) (A)",
    "1.2.3 Audio Description or Media Alternative (Prerecorded) (A)",
    "1.2.4 Captions (Live) (AA)",
    "1.2.5 Audio Description (Prerecorded) (AA)",
    "1.3.1 Info and Relationships (A)",
    "1.3.2 Meaningful Sequence (A)",
    "1.3.3 Sensory Characteristics (A)",
    "1.3.4 Orientation (AA)",
    "1.3.5 Identify Input Purpose (AA)",
    "1.4.1 Use of Color (A)",
    "1.4.2 Audio Control (A)",
    "1.4.3 Contrast (Minimum) (AA)",
    "1.4.4 Resize Text (AA)",
    "1.4.5 Images of Text (AA)",
    "1.4.10 Reflow (AA)",
    "1.4.11 Non-text Contrast (AA)",
    "1.4.12 Text Spacing (AA)",
    "1.4.13 Content on Hover or Focus (AA)",
    "2.1.1 Keyboard (A)",
    "2.1.2 No Keyboard Trap (A)",
    "2.1.4 Character Key Shortcuts (A)",
    "2.2.1 Timing Adjustable (A)",
    "2.2.2 Pause, Stop, Hide (A)",
    "2.3.1 Three Flashes or Below Threshold (A)",
    "2.4.1 Bypass Blocks (A)",
    "2.4.2 Page Titled (A)",
    "2.4.3 Focus Order (A)",
    "2.4.4 Link Purpose (In Context) (A)",
    "2.4.5 Multiple Ways (AA)",
    "2.4.6 Headings and Labels (AA)",
    "2.4.7 Focus Visible (AA)",
    "2.4.11 Focus Not Obscured (Minimum) (AA)",
    "2.5.1 Pointer Gestures (A)",
    "2.5.2 Pointer Cancellation (A)",
    "2.5.3 Label in Name (A)",
    "2.5.4 Motion Actuation (A)",
    "2.5.7 Dragging Movements (AA)",
    "2.5.8 Target Size (Minimum) (AA)",
    "3.1.1 Language of Page (A)",
    "3.1.2 Language of Parts (AA)",
    "3.2.1 On Focus (A)",
    "3.2.2 On Input (A)",
    "3.2.3 Consistent Navigation (AA)",
    "3.2.4 Consistent Identification (AA)",
    "3.2.6 Consistent Help (AA)",
    "3.3.1 Error Identification (A)",
    "3.3.2 Labels or Instructions (A)",
    "3.3.3 Error Suggestion (AA)",
    "3.3.4 Error Prevention (Legal, Financial, Data) (AA)",
    "3.3.7 Redundant Entry (AA)",
    "3.3.8 Accessible Authentication (Minimum) (AA)",
    "4.1.2 Name, Role, Value (A)",
    "4.1.3 Status Messages (AA)"
  ];

  /* =========================================================
     Deep links to the W3C "Understanding" page for each criterion.
     The slug is derived from the criterion name, e.g.
     "2.1.1 Keyboard (A)" -> .../Understanding/keyboard.html
     ========================================================= */
  function scSlug(name) {
    return name
      .replace(/\s*\(A{1,3}\)\s*$/i, "")   /* drop the trailing level marker */
      .toLowerCase()
      .replace(/[(),.]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  var WCAG_URLS = {};
  WCAG_CRITERIA.forEach(function (c) {
    var m = c.match(/^(\d+\.\d+\.\d+)\s+(.+)$/);
    if (m) WCAG_URLS[m[1]] = "https://www.w3.org/WAI/WCAG22/Understanding/" + scSlug(m[2]) + ".html";
  });

  /* Only criteria from the list above get a link, so a hand-typed or
     unrecognised entry never produces a dead URL. */
  function wcagUrl(code) {
    return WCAG_URLS[String(code == null ? "" : code).trim()] || null;
  }

  /* =========================================================
     Offline rules engine: keyword -> WCAG SC / severity / fix
     ========================================================= */
  var RULES = [
    { id: "keyboard-trap", keywords: ["keyboard trap", "cannot tab out", "stuck in", "trapped focus"],
      sc: "2.1.2 No Keyboard Trap (A)", changeType: "Code", impact: "Critical",
      fix: "Ensure that keyboard focus can be moved out of every component with Tab, Shift+Tab and Esc so that keyboard-only users are not stranded inside a widget. " +
        "Make sure to build modal content with the <dialog> element opened using showModal(), which returns focus to the triggering control on close, or Provide role=\"dialog\" and aria-modal=\"true\" with a scripted focus loop and a keyboard-reachable close <button>." },

    { id: "flash", keywords: ["flashing", "flash", "strobe", "seizure"],
      sc: "2.3.1 Three Flashes or Below Threshold (A)", changeType: "Design", impact: "Critical",
      fix: "Ensure that no content flashes more than three times in any one second so that users with photosensitive epilepsy are not put at risk of a seizure. " +
        "Make sure to remove the flashing content, slow it to three flashes per second or fewer, or keep the flashing area below 25 percent of 10 degrees of visual field, as there is no ARIA equivalent for a timing-based fix." },

    { id: "alt", keywords: ["alt text", "alt attribute", "missing alt", "no alt", "decorative image", "image without alt", "informative image"],
      sc: "1.1.1 Non-text Content (A)", changeType: "Code", impact: "High",
      fix: "Ensure that every informative image has a text alternative that conveys its meaning so that screen reader users receive the same information as sighted users. " +
        "Make sure to add a descriptive alt attribute to the <img> element, and alt=\"\" to purely decorative images so that screen readers skip them, or Provide role=\"img\" with aria-label on inline <svg> graphics." },

    { id: "focus", keywords: ["focus indicator", "focus outline", "focus ring", "no visible focus", "focus not visible"],
      sc: "2.4.7 Focus Visible (AA)", changeType: "Code", impact: "High",
      fix: "Ensure that the component with keyboard focus has a clearly visible focus indicator so that keyboard-only users can always tell which control they are on. " +
        "Make sure to keep the browser default outline or replace it using the :focus-visible selector, and never set outline: none without a replacement, as there is no ARIA equivalent for a visual indicator. " +
        "Also ensure that the focus indicator is 2px thick and that the focus indicator color and background color have a contrast ratio of at least 3:1 in various states (focus, hover, active, etc.)." },

    { id: "keyboard", keywords: ["keyboard", "tab order", "tab key", "not focusable", "cannot access via keyboard", "mouse only"],
      sc: "2.1.1 Keyboard (A)", changeType: "Code", impact: "High",
      fix: "Ensure that all the interactive items should be accessible by the keyboard so that keyboard-only users can reach and operate every control. " +
        "Make sure to wrap the interactive elements in <button> or <a href> tags and provide aria-label attribute with unique and descriptive names or Provide role=\"button\", tabindex=\"0\", and aria-label attributes with unique and descriptive names to the elements. " +
        "Also ensure that the focus indicator should be 2px thick and the focus indicator color and background color of each author-customized interactive component have a contrast ratio of at least 3:1 in various states (focus, hover, active, etc.)." },

    { id: "label", keywords: ["label", "form field", "input field", "unlabeled", "no label", "placeholder as label"],
      sc: "3.3.2 Labels or Instructions (A)", changeType: "Code", impact: "High",
      fix: "Ensure that every form control has a persistent visible label associated with it so that screen reader users know what to enter and speech-input users can address the field by name. " +
        "Make sure to code a <label> with a for attribute matching the id of the <input>, or wrap the <input> inside the <label>, or Provide aria-label or aria-labelledby where a visible label cannot be shown. " +
        "Make sure not to rely on placeholder text as the only label, as it disappears as soon as the user types." },

    { id: "aria", keywords: ["aria", "role", "custom component", "name role value", "accessible name"],
      sc: "4.1.2 Name, Role, Value (A)", changeType: "Code", impact: "High",
      fix: "Ensure that every interactive component exposes a correct name, role and value so that screen reader users can identify the control, operate it and hear its current state. " +
        "Make sure to build the control from native elements such as <button>, <a href>, <input>, <select> and <details>, which carry the role and keyboard behaviour by default, or Provide the matching ARIA role with the states that role requires, such as role=\"tab\" with aria-selected and aria-controls, or role=\"checkbox\" with aria-checked. " +
        "Also ensure that the focus indicator on each author-customized component is 2px thick with a contrast ratio of at least 3:1 against the adjacent background." },

    { id: "error-id", keywords: ["error message", "validation error", "form error", "no error shown"],
      sc: "3.3.1 Error Identification (A)", changeType: "Code", impact: "High",
      fix: "Ensure that each form error is described in text next to the field it belongs to so that screen reader users can find the failing field and understand what to correct without relying on color. " +
        "Make sure to render the message in the DOM and link it to the control with aria-describedby, or Provide aria-invalid=\"true\" on the failing control and announce the message through a container with role=\"alert\"." },

    { id: "caption", keywords: ["caption", "video", "subtitle", "transcript"],
      sc: "1.2.2 Captions (Prerecorded) (A)", changeType: "Content", impact: "High",
      fix: "Ensure that prerecorded video with audio has synchronized captions so that users who are Deaf or hard of hearing receive the spoken dialogue and the meaningful sounds. " +
        "Make sure to add a <track kind=\"captions\" srclang=\"en\" label=\"English\" src=\"captions.vtt\"> element inside the <video> element and correct any auto-generated text before publishing, as there is no ARIA equivalent for caption content." },

    { id: "contrast", keywords: ["contrast", "color contrast", "text color", "hard to read", "low contrast", "faded text"],
      sc: "1.4.3 Contrast (Minimum) (AA)", changeType: "Design", impact: "Medium",
      fix: "Ensure that body text has a contrast ratio of at least 4.5:1 against its background, and 3:1 for large text of 24px or 18.66px bold and above, so that low vision users can read it without magnification. " +
        "Make sure to darken the foreground color or lighten the background color until the ratio is met and verify the value with a contrast checker, as there is no ARIA equivalent for a color fix. " +
        "Also ensure that the contrast ratio stays at 4.5:1 or above in hover, focus, visited and dark mode states and over background images and gradients." },

    { id: "heading", keywords: ["heading", "heading order", "heading level", "heading structure", "skips heading"],
      sc: "1.3.1 Info and Relationships (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that headings are coded as real headings in a sequential order so that screen reader users can understand the page structure and jump between sections with the H key. " +
        "Make sure to code the elements in <h1> to <h6> tags that follow the visual hierarchy without skipping levels, or Provide role=\"heading\" with an explicit aria-level attribute where a native heading cannot be used." },

    { id: "list", keywords: ["list item", "list markup", "list semantics", "coded as list", "not a list", "tiles", "cards", "grouped items", "number of items"],
      sc: "1.3.1 Info and Relationships (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that the tiles in the main section of webpage are coded as list items, so that the screen reader users are aware about the number of items in the webpage. " +
        "Make sure to code the elements in <ul> and <li> tags or Provide role=\"list\" and role=\"listitem\" to the elements." },

    { id: "landmark", keywords: ["landmark", "main landmark", "region", "banner", "contentinfo", "main content", "skip to main"],
      sc: "1.3.1 Info and Relationships (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that the main landmark is defined in the webpage so that the screen reader users will be able to identify the landmark and navigate to it without any confusion. " +
        "Make sure to wrap the main content in <main> tag or Provide role=\"main\" attribute to the main section element." },

    { id: "autoplay", keywords: ["autoplay", "auto-play", "audio plays automatically"],
      sc: "1.4.2 Audio Control (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that audio which plays automatically for more than three seconds can be stopped so that screen reader users can still hear their own speech output. " +
        "Make sure to remove the autoplay attribute from the <audio> or <video> element, or Provide a <button> to pause, stop or mute the sound as one of the first focusable elements on the page, working independently of the system volume." },

    { id: "target-size", keywords: ["target size", "tap target", "button too small", "hard to tap", "touch target"],
      sc: "2.5.8 Target Size (Minimum) (AA)", changeType: "Design", impact: "Medium",
      fix: "Ensure that pointer targets measure at least 24x24 CSS px so that users with motor impairments can activate them without hitting an adjacent control. " +
        "Make sure to grow the <button> or <a> element with padding or a min-width and min-height of 24px rather than relying on the icon's own dimensions, or leave at least 24px between the centers of adjacent targets so that a 24x24 CSS px circle drawn around each one does not overlap another, as there is no ARIA equivalent for a sizing fix." },

    { id: "reflow", keywords: ["zoom", "resize text", "reflow", "horizontal scroll", "200%"],
      sc: "1.4.10 Reflow (AA)", changeType: "Code", impact: "Medium",
      fix: "Ensure that content reflows into a single column at a 320 CSS px viewport width, equivalent to 400 percent zoom on a 1280px screen, so that low vision users do not have to scroll horizontally to read a line of text. " +
        "Make sure to replace fixed pixel widths with relative units and a wrapping flex or grid layout, as there is no ARIA equivalent for a layout fix. " +
        "Also ensure that exempt content such as data tables and code blocks scrolls inside its own container with overflow-x: auto rather than widening the whole page." },

    { id: "skip-link", keywords: ["skip link", "skip to content", "skip navigation", "bypass"],
      sc: "2.4.1 Bypass Blocks (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that a skip link is provided before the repeated navigation so that keyboard-only users can bypass the header on every page instead of tabbing through it. " +
        "Make sure to code an <a href=\"#main\"> element as the first focusable element on the page pointing at the id of the <main> element, and give that target tabindex=\"-1\" so that focus moves there reliably, or Provide role=\"main\" on the main container so that screen reader users can jump to it by landmark. " +
        "Also ensure that the skip link is visually hidden until it receives focus and then shows a 2px focus indicator with a contrast ratio of at least 3:1." },

    { id: "page-title", keywords: ["page title", "tab title", "browser title", "no title"],
      sc: "2.4.2 Page Titled (A)", changeType: "Content", impact: "Medium",
      fix: "Ensure that each page has a unique and descriptive title so that screen reader users know which page has loaded and users with many tabs open can tell them apart. " +
        "Make sure to write the specific page name first in the <title> element, for example Checkout - Payment details | Example Store, as there is no ARIA equivalent for the document title. " +
        "Make sure to update the <title> element on route changes in a single page application, where no full page load occurs." },

    { id: "link-text", keywords: ["link text", "read more", "click here", "learn more", "generic link"],
      sc: "2.4.4 Link Purpose (In Context) (A)", changeType: "Content", impact: "Medium",
      fix: "Ensure that the purpose of every link is clear from its link text so that screen reader users who list all the links on the page can tell where each one goes. " +
        "Make sure to write the destination into the text of the <a> element, for example Read the accessibility policy instead of Click here, or Provide the missing context in visually hidden text inside the link, or in an aria-label that still contains the visible wording so that speech input continues to work." },

    { id: "timeout", keywords: ["timeout", "session expire", "session timed out", "time limit"],
      sc: "2.2.1 Timing Adjustable (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that any session time limit can be extended so that screen reader users and users who read slowly are not signed out before they finish and do not lose the data they entered. " +
        "Make sure to warn the user at least 20 seconds before the session expires and Provide a <button> to extend the time that can be used at least ten times, announcing the warning through a container with role=\"alert\", as there is no ARIA equivalent for the time limit itself." },

    { id: "lang", keywords: ["language attribute", "lang attribute", "wrong language", "no lang"],
      sc: "3.1.1 Language of Page (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that the default language of the page is set programmatically so that screen reader users hear the correct pronunciation, voice and braille tables. " +
        "Make sure to add a valid BCP 47 code to the root element, for example <html lang=\"en\"> or <html lang=\"en-GB\">, and add a lang attribute to any passage written in another language, for example <span lang=\"fr\">, as there is no ARIA equivalent for language." },

    { id: "table", keywords: ["data table", "table header", "table structure"],
      sc: "1.3.1 Info and Relationships (A)", changeType: "Code", impact: "Medium",
      fix: "Ensure that data tables expose their header relationships so that screen reader users hear the relevant row and column header as they move between cells. " +
        "Make sure to code header cells as <th> with scope=\"col\" or scope=\"row\" and add a <caption> element describing the table, or Provide headers and id attributes to associate each data cell with more than one header in complex tables." },

    { id: "drag", keywords: ["drag and drop", "drag to reorder", "dragging"],
      sc: "2.5.7 Dragging Movements (AA)", changeType: "Code", impact: "Medium",
      fix: "Ensure that every function operated by a dragging movement has a single-pointer alternative so that users with motor impairments can complete the same task without a sustained drag. " +
        "Make sure to add <button> controls that move the item with discrete clicks, such as Move up and Move down, or a click-to-select then click-to-place pattern, as there is no ARIA equivalent for a pointer alternative. " +
        "Also ensure that these controls are permanently visible and measure at least 24x24 CSS px." },

    { id: "orientation", keywords: ["orientation", "portrait only", "landscape only", "locked orientation"],
      sc: "1.3.4 Orientation (AA)", changeType: "Code", impact: "Medium",
      fix: "Ensure that the page works in both portrait and landscape so that low vision users and users with a device mounted to a wheelchair can use it in the orientation their hardware is fixed in. " +
        "Make sure to remove any CSS or script that locks the layout and drop the orientation key from the web app manifest, as there is no ARIA equivalent for a layout lock." },

    { id: "consistent-nav", keywords: ["inconsistent navigation", "navigation changes", "menu order changes"],
      sc: "3.2.3 Consistent Navigation (AA)", changeType: "Design", impact: "Low",
      fix: "Ensure that navigation repeated across pages appears in the same relative order on every page so that screen reader users and low vision users using magnification can predict where each control will be. " +
        "Make sure to keep the header, primary navigation, search and footer links in a fixed sequence in the DOM, adding or removing items without reordering the ones that remain, as there is no ARIA equivalent for information architecture." }
  ];

  /* Too vague to name a fix — ask for the missing detail rather than
     emitting a generic recommendation. */
  var FALLBACK_RULE = {
    sc: "4.1.2 Name, Role, Value (A)", changeType: "Code", impact: "Medium",
    fix: "This finding is too vague to name a specific fix. " +
      "Add the DOM snippet for the element in question, the exact foreground and background color values if this is a contrast issue, or what the screen reader announced compared with what was expected, then use Suggest again for a specific recommendation."
  };

  function matchRule(text) {
    var t = text.toLowerCase();
    var best = null, bestScore = 0;
    RULES.forEach(function (rule) {
      var score = 0;
      rule.keywords.forEach(function (kw) {
        if (t.indexOf(kw) !== -1) score++;
      });
      if (score > bestScore) { bestScore = score; best = rule; }
    });
    return best;
  }

  /* =========================================================
     Contrast ratio (WCAG relative luminance)
     ========================================================= */
  function hexToRgb(hex) {
    if (!hex) return null;
    var h = hex.trim().replace(/^#/, "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.substr(0, 2), 16),
      g: parseInt(h.substr(2, 2), 16),
      b: parseInt(h.substr(4, 2), 16)
    };
  }
  function channelLum(c) {
    var cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  }
  function relLuminance(rgb) {
    return 0.2126 * channelLum(rgb.r) + 0.7152 * channelLum(rgb.g) + 0.0722 * channelLum(rgb.b);
  }
  function contrastRatio(hex1, hex2) {
    var c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
    if (!c1 || !c2) return null;
    var l1 = relLuminance(c1), l2 = relLuminance(c2);
    var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /* =========================================================
     Report schema — one definition drives the on-screen log,
     the downloadable template and the exported report so all
     three always show the same 13 columns in the same order.
     ========================================================= */
  var COLUMNS = [
    { header: "Sr. No.",             key: "srNo",           width: 8,  get: function (d, i) { return i + 1; } },
    { header: "Page / Screen",       key: "page",           width: 22 },
    { header: "Steps to Reproduce",  key: "steps",          width: 34 },
    { header: "Link and Tools Used", key: "linkTools",      width: 26 },
    { header: "WCAG SC",             key: "wcagFull",       width: 28,
      linkUrl: function (d) { return wcagUrl(d.wcagSc); } },
    { header: "Finding",             key: "finding",        width: 40 },
    { header: "Screenshot",          key: "screenshot",     width: 20,
      get: function (d) { return d.screenshot ? "Attached (" + d.screenshot.name + ")" : (d.screenshotRef || ""); } },
    { header: "Recommendation",      key: "recommendation", width: 80 },
    { header: "Change Type",         key: "changeType",     width: 14, list: ["Code", "Design", "Content"] },
    { header: "User Impact",         key: "impact",         width: 13, list: ["Critical", "High", "Medium", "Low"] },
    { header: "Status",              key: "status",         width: 13, list: ["Open", "In Progress", "Fixed", "Verified", "Won't Fix"] },
    { header: "Test Comments",       key: "comments",       width: 26 },
    { header: "Business Sign-off",   key: "signoff",        width: 17, list: ["Pending", "Approved", "Rejected"] }
  ];

  var HEADER_FILL = "FF1F3864";   /* dark navy, matches the sample report */
  var HEADER_INK  = "FFFFFFFF";
  var LINK_INK    = "FF1B4FD1";   /* 6.81:1 on white */

  var REFERENCES = [
    { text: "WCAG 2.2 (W3C Recommendation)",   url: "https://www.w3.org/TR/WCAG22/" },
    { text: "How to Meet WCAG (Quick Reference)", url: "https://www.w3.org/WAI/WCAG22/quickref/" },
    { text: "WAI-ARIA Roles for Developers",   url: "https://www.w3.org/TR/wai-aria-1.2/#roles" },
    { text: "MDN: Web Accessibility",          url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
    { text: "MDN: ARIA",                       url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA" }
  ];

  function cellValue(d, i, col) {
    return col.get ? col.get(d, i) : (d[col.key] == null ? "" : d[col.key]);
  }

  /* =========================================================
     State + persistence
     ========================================================= */
  var STORAGE_KEY = "adr_defects_v1";
  var defects = loadState();
  var pendingScreenshot = null; // { name, dataUrl }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(defects)); }
    catch (e) { /* storage full or unavailable — keep working in memory */ }
  }

  /* =========================================================
     DOM refs
     ========================================================= */
  var el = {};
  [
    "fPage", "fSteps", "fLinkTools", "fFinding", "fWcag",
    "fChangeType", "fImpact", "fStatus", "fSignoff", "fFg", "fBg",
    "fRecommendation", "fComments", "fScreenshot", "screenshotPreviewName",
    "contrastResult", "contrastOutput", "wcagList", "issueForm",
    "suggestBtn", "clearFormBtn", "exportBtn", "clearAllBtn",
    "defectTableBody", "emptyState", "countBadge",
    "downloadTemplateBtn", "uploadTemplateInput", "importStatus",
    "imageModal", "imageModalImg", "imageModalClose",
    "formErrors", "formErrorsList", "liveStatus"
  ].forEach(function (id) { el[id] = document.getElementById(id); });

  /* =========================================================
     4.1.3 Status Messages — announced without moving focus
     ========================================================= */
  function announce(msg, kind) {
    el.liveStatus.textContent = msg;
    el.liveStatus.className = "hint" + (kind ? " is-" + kind : "");
  }

  /* =========================================================
     3.3.1 / 3.3.3 Error identification and suggestion
     ========================================================= */
  function setFieldError(field, message) {
    var errEl = document.getElementById(field.id + "-error");
    if (message) {
      field.setAttribute("aria-invalid", "true");
      if (errEl) { errEl.textContent = message; errEl.hidden = false; }
    } else {
      field.removeAttribute("aria-invalid");
      if (errEl) { errEl.textContent = ""; errEl.hidden = true; }
    }
  }

  function clearErrors(fields) {
    fields.forEach(function (f) { setFieldError(f, ""); });
    el.formErrors.hidden = true;
    el.formErrorsList.innerHTML = "";
  }

  function showErrorSummary(errors) {
    el.formErrorsList.innerHTML = errors.map(function (e) {
      return '<li><a href="#' + e.field.id + '">' + esc(e.message) + "</a></li>";
    }).join("");
    el.formErrors.hidden = false;
    el.formErrors.focus();
  }

  /* populate WCAG datalist */
  WCAG_CRITERIA.forEach(function (c) {
    var opt = document.createElement("option");
    opt.value = c;
    el.wcagList.appendChild(opt);
  });

  /* =========================================================
     Suggest button
     ========================================================= */
  function updateContrastPreview() {
    var ratio = contrastRatio(el.fFg.value, el.fBg.value);
    if (ratio === null) { el.contrastResult.hidden = true; return; }
    var passesNormal = ratio >= 4.5, passesLarge = ratio >= 3;
    el.contrastResult.hidden = false;
    el.contrastOutput.innerHTML = ratio.toFixed(2) + ":1 &mdash; " +
      "<span class=\"" + (passesNormal ? "pass" : "fail") + "\">" +
      (passesNormal ? "Passes AA (normal text)" : passesLarge ? "Large text only" : "Fails AA") + "</span>";
  }
  el.fFg.addEventListener("input", updateContrastPreview);
  el.fBg.addEventListener("input", updateContrastPreview);

  el.suggestBtn.addEventListener("click", function () {
    var text = (el.fFinding.value + " " + el.fSteps.value).trim();
    if (!text) {
      setFieldError(el.fFinding, "Describe the issue before asking for a suggestion — the rules engine reads the Finding text.");
      el.fFinding.focus();
      return;
    }
    setFieldError(el.fFinding, "");
    var ratio = contrastRatio(el.fFg.value, el.fBg.value);
    var rule;
    if (ratio !== null) {
      rule = RULES.filter(function (r) { return r.id === "contrast"; })[0];
    } else {
      rule = matchRule(text) || FALLBACK_RULE;
    }

    el.fWcag.value = rule.sc;
    el.fChangeType.value = rule.changeType;
    el.fImpact.value = rule.impact;

    var fixText = rule.fix;
    if (ratio !== null) {
      var passesNormal = ratio >= 4.5;
      var passesLargeOnly = !passesNormal && ratio >= 3;
      fixText =
        "Ensure that body text has a contrast ratio of at least 4.5:1 against its background, and 3:1 for large text of " +
        "24px or 18.66px bold and above, so that low vision users can read it without magnification. " +
        "The measured contrast between " + el.fFg.value.trim() + " and " + el.fBg.value.trim() + " is " + ratio.toFixed(2) + ":1, which " +
        (passesNormal
          ? "meets the 4.5:1 minimum for body text. "
          : passesLargeOnly
            ? "meets 3:1 for large text only and falls short of the 4.5:1 minimum for body text. "
            : "falls short of both the 4.5:1 minimum for body text and the 3:1 minimum for large text. ") +
        (passesNormal
          ? "Make sure to keep this pair as the design changes and re-check it with a contrast checker, as there is no ARIA equivalent for a color fix. "
          : "Make sure to darken the foreground color or lighten the background color until the ratio reaches 4.5:1 and verify the value with a contrast checker, as there is no ARIA equivalent for a color fix. ") +
        "Also ensure that the contrast ratio stays at 4.5:1 or above in hover, focus, visited and dark mode states and over background images and gradients.";
    }
    el.fRecommendation.value = fixText;
    updateContrastPreview();
    announce("Suggestion applied: " + rule.sc + ", " + rule.impact + " impact, " + rule.changeType +
      " change. Review the pre-filled fields before adding the issue.");
  });

  /* =========================================================
     Screenshot handling (downscaled to a thumbnail data URL)
     ========================================================= */
  el.fScreenshot.addEventListener("change", function () {
    var file = el.fScreenshot.files[0];
    if (!file) { pendingScreenshot = null; el.screenshotPreviewName.textContent = ""; return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var MAX = 160;
        var scale = Math.min(1, MAX / Math.max(img.width, img.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pendingScreenshot = { name: file.name, dataUrl: canvas.toDataURL("image/jpeg", 0.72) };
        el.screenshotPreviewName.textContent = "Attached: " + file.name;
      };
      img.onerror = function () {
        pendingScreenshot = null;
        el.screenshotPreviewName.textContent = "That file could not be read as an image. Choose a PNG, JPG or GIF.";
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* =========================================================
     Form submit / clear
     ========================================================= */
  function clearForm() {
    el.issueForm.reset();
    el.fImpact.value = "High";
    el.fStatus.value = "Open";
    el.fSignoff.value = "Pending";
    el.contrastResult.hidden = true;
    pendingScreenshot = null;
    el.screenshotPreviewName.textContent = "";
    clearErrors([el.fPage, el.fFinding]);
  }

  function addDefect(d) {
    d.id = "d" + Date.now() + Math.random().toString(16).slice(2);
    d.srNo = defects.length + 1;
    defects.push(d);
    saveState();
    renderTable();
  }

  el.issueForm.addEventListener("submit", function (ev) {
    ev.preventDefault();

    clearErrors([el.fPage, el.fFinding]);
    var errors = [];
    if (!el.fPage.value.trim()) {
      errors.push({ field: el.fPage, message: "Enter the page or screen name where you found the issue, for example “Login Page”." });
    }
    if (!el.fFinding.value.trim()) {
      errors.push({ field: el.fFinding, message: "Describe what you found, for example “The submit button has no visible focus outline”." });
    }
    if (errors.length) {
      errors.forEach(function (e) { setFieldError(e.field, e.message); });
      showErrorSummary(errors);
      return;
    }

    var scRaw = el.fWcag.value.trim();
    var scCode = scRaw ? (scRaw.match(/^[\d.]+/) || [""])[0] : "";
    var level = scRaw ? ((scRaw.match(/\(([^)]+)\)\s*$/) || [, ""])[1]) : "";

    addDefect({
      page: el.fPage.value.trim(),
      steps: el.fSteps.value.trim(),
      linkTools: el.fLinkTools.value.trim(),
      finding: el.fFinding.value.trim(),
      wcagSc: scCode,
      wcagFull: scRaw,
      level: level,
      changeType: el.fChangeType.value,
      impact: el.fImpact.value,
      status: el.fStatus.value,
      signoff: el.fSignoff.value,
      fg: el.fFg.value.trim(),
      bg: el.fBg.value.trim(),
      recommendation: el.fRecommendation.value.trim(),
      comments: el.fComments.value.trim(),
      screenshot: pendingScreenshot,
      screenshotRef: ""
    });
    var page = el.fPage.value.trim();
    clearForm();
    announce("Issue added: " + page + ". " + defects.length + " issue(s) now in the log.", "success");
    el.fPage.focus();
  });

  el.clearFormBtn.addEventListener("click", clearForm);

  /* =========================================================
     Table render
     ========================================================= */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  /* WCAG SC cell: links to the W3C Understanding page when the criterion
     is recognised, otherwise plain text. */
  function scCell(d) {
    var text = d.wcagFull || d.wcagSc;
    if (!text) return "";
    var url = wcagUrl(d.wcagSc);
    if (!url) return esc(text);
    return '<a class="sc-link" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(text) + '<span class="visually-hidden"> — how to meet this criterion (opens in a new tab)</span></a>';
  }

  function renderTable() {
    el.countBadge.textContent = defects.length;
    el.emptyState.hidden = defects.length > 0;
    el.defectTableBody.innerHTML = defects.map(function (d, i) {
      var chipClass = ["Critical", "High", "Medium", "Low"].indexOf(d.impact) !== -1 ? d.impact : "Medium";
      var rowLabel = d.page || d.finding || "issue " + (i + 1);
      /* 2.1.1 + 4.1.2 — a real button, not a click-handled <img> */
      var thumb = d.screenshot
        ? '<button type="button" class="thumb-btn" data-full="' + d.screenshot.dataUrl + '">' +
            '<img class="thumb" src="' + d.screenshot.dataUrl + '" alt="">' +
            '<span class="visually-hidden">Enlarge screenshot for ' + esc(rowLabel) + '</span>' +
          "</button>"
        : d.screenshotRef
          ? (/^https?:\/\//i.test(d.screenshotRef)
              ? '<a class="shot-link" href="' + esc(d.screenshotRef) + '" target="_blank" rel="noopener noreferrer">Open image' +
                  '<span class="visually-hidden"> for ' + esc(rowLabel) + ' (opens in a new tab)</span></a>'
              : '<span class="col-wrap">' + esc(d.screenshotRef) + "</span>")
          : '<span class="no-thumb" aria-hidden="true">—</span><span class="visually-hidden">No screenshot</span>';
      return "<tr data-id=\"" + d.id + "\">" +
        "<td class=\"col-num\">" + (i + 1) + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.page) + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.steps) + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.linkTools) + "</td>" +
        "<td class=\"col-sc\">" + scCell(d) + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.finding) + "</td>" +
        "<td>" + thumb + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.recommendation) + "</td>" +
        "<td>" + esc(d.changeType) + "</td>" +
        "<td><span class=\"chip chip--" + chipClass + "\">" + esc(d.impact) + "</span></td>" +
        "<td>" + esc(d.status) + "</td>" +
        "<td class=\"col-wrap\">" + esc(d.comments) + "</td>" +
        "<td>" + esc(d.signoff) + "</td>" +
        "<td><button type=\"button\" class=\"row-remove\" data-remove=\"" + d.id + "\">" +
          "<span aria-hidden=\"true\">&times;</span>" +
          "<span class=\"visually-hidden\">Remove issue " + (i + 1) + ": " + esc(rowLabel) + "</span>" +
        "</button></td>" +
        "</tr>";
    }).join("");
  }

  el.defectTableBody.addEventListener("click", function (ev) {
    var removeBtn = ev.target.closest("[data-remove]");
    if (removeBtn) {
      var removeId = removeBtn.getAttribute("data-remove");
      var gone = defects.filter(function (d) { return d.id === removeId; })[0];
      defects = defects.filter(function (d) { return d.id !== removeId; });
      saveState();
      renderTable();
      announce("Removed " + ((gone && gone.page) || "issue") + ". " + defects.length + " issue(s) left in the log.");
      /* 2.4.3 Focus Order — the removed button is gone, so park focus somewhere sensible */
      (defects.length ? el.defectTableBody.querySelector("[data-remove]") : el.exportBtn).focus();
      return;
    }
    var thumbBtn = ev.target.closest(".thumb-btn");
    if (thumbBtn) openModal(thumbBtn.getAttribute("data-full"), thumbBtn.textContent.trim());
  });

  /* Native <dialog> gives the dialog role, focus trap, Esc and focus restore */
  function openModal(src, label) {
    el.imageModalImg.src = src;
    el.imageModalImg.alt = label || "Screenshot preview";
    if (typeof el.imageModal.showModal === "function") el.imageModal.showModal();
    else el.imageModal.setAttribute("open", "");
    el.imageModalClose.focus();
  }
  function closeModal() {
    if (typeof el.imageModal.close === "function") el.imageModal.close();
    else el.imageModal.removeAttribute("open");
    el.imageModalImg.removeAttribute("src");
    el.imageModalImg.alt = "";
  }
  el.imageModalClose.addEventListener("click", closeModal);
  /* Clicking the backdrop lands on the dialog element itself */
  el.imageModal.addEventListener("click", function (ev) {
    if (ev.target === el.imageModal) closeModal();
  });
  el.imageModal.addEventListener("close", function () {
    el.imageModalImg.removeAttribute("src");
    el.imageModalImg.alt = "";
  });

  el.clearAllBtn.addEventListener("click", function () {
    if (defects.length === 0) {
      announce("There are no logged issues to clear.", "error");
      return;
    }
    if (!confirm("Remove all " + defects.length + " logged issue(s)? This cannot be undone.")) return;
    defects = [];
    saveState();
    renderTable();
    announce("All issues removed. The log is now empty.");
  });

  /* =========================================================
     Excel: template download / bulk import / export
     ========================================================= */
  var COL_LETTERS = "ABCDEFGHIJKLM".split("");

  function saveWorkbook(wb, filename) {
    return wb.xlsx.writeBuffer().then(function (buf) {
      var blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    });
  }

  function newWorkbook(title) {
    var wb = new ExcelJS.Workbook();
    wb.creator = "Accessibility Defect Report";
    wb.created = new Date();
    wb.title = title;                 /* a document title helps AT in Excel */
    return wb;
  }

  /* Builds the 13-column sheet with the navy header used by both files. */
  function addIssuesSheet(wb, name) {
    var ws = wb.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = COLUMNS.map(function (c) {
      return { header: c.header, key: c.key, width: c.width };
    });
    var head = ws.getRow(1);
    head.font = { bold: true, color: { argb: HEADER_INK }, size: 11 };
    head.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    head.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    head.height = 26;
    ws.autoFilter = { from: "A1", to: COL_LETTERS[COLUMNS.length - 1] + "1" };
    return ws;
  }

  /* Call only AFTER any rows are added — touching these cells materialises
     the rows, so addRow() would otherwise append below the whole range. */
  function applyDropdowns(ws, lastRow) {
    COLUMNS.forEach(function (c, ci) {
      if (!c.list) return;
      for (var r = 2; r <= lastRow; r++) {
        ws.getCell(COL_LETTERS[ci] + r).dataValidation = {
          type: "list",
          allowBlank: true,
          showErrorMessage: true,
          formulae: ['"' + c.list.join(",") + '"']
        };
      }
    });
  }

  function styleBodyRow(row) {
    row.alignment = { vertical: "top", wrapText: true };
  }

  /* ---- Instructions sheet (sheet 1 of the template) ---- */
  var INSTRUCTIONS = [
    "1. Fill in one row per accessibility issue on the \"Issues\" sheet. Do not change the header row.",
    "2. Only \"Page / Screen\" and \"Finding\" are required. Describe what you found in plain language, " +
      "e.g. \"Hero image has no alt text\" or \"Submit button loses its focus outline when tabbed to\". " +
      "\"Sr. No.\" is optional and only for your own reference while filling this in — the tool renumbers issues itself on import.",
    "3. WCAG SC, Change Type, User Impact and Recommendation are optional — leave them blank and the tool " +
      "suggests them from your Finding text when you upload the file. Fill them in yourself if you already " +
      "know them; Change Type, User Impact, Status and Business Sign-off have dropdowns so the values stay consistent.",
    "4. Occurrence is not part of this template — every imported issue is recorded as \"Desktop - Chrome/Edge\".",
    "5. Automatic suggestions are keyword-based against WCAG 2.2, not a real accessibility audit — review them " +
      "after import and correct anything that looks wrong, especially for unusual issues.",
    "6. Screenshot (optional): paste a link to the image, or a short note saying where it lives. The tool records " +
      "that reference against the issue and carries it into the exported report, but it does not embed the picture. " +
      "To embed an actual image, log that issue with the \"Attachment / screenshot\" field on the " +
      "Accessibility Defect Report page instead.",
    "7. Save this file, then upload it on the Accessibility Defect Report page. Your issues are added to the log " +
      "and a formatted Excel defect report downloads automatically."
  ];

  function addTextSheet(wb, name, title) {
    var ws = wb.addWorksheet(name, { views: [{ showGridLines: false }] });
    ws.columns = [{ width: 112 }];
    ws.getCell("A1").value = title;
    ws.getCell("A1").font = { bold: true, size: 14 };
    return ws;
  }

  function writeLines(ws, startRow, lines, opts) {
    var r = startRow;
    lines.forEach(function (line) {
      var cell = ws.getCell("A" + r);
      cell.value = line;
      cell.alignment = { wrapText: true, vertical: "top" };
      if (opts && opts.bold) cell.font = { bold: true };
      r++;
    });
    return r;
  }

  function writeReferences(ws, startRow) {
    var r = startRow;
    ws.getCell("A" + r).value = "Reference material";
    ws.getCell("A" + r).font = { bold: true, size: 12 };
    r++;
    REFERENCES.forEach(function (ref) {
      var cell = ws.getCell("A" + r);
      cell.value = { text: ref.text, hyperlink: ref.url };
      /* link colour is 6.8:1 on white, so the reference list stays readable */
      cell.font = { color: { argb: "FF1B4FD1" }, underline: true };
      r++;
    });
    return r;
  }

  el.downloadTemplateBtn.addEventListener("click", function () {
    el.downloadTemplateBtn.disabled = true;
    setImportStatus("Building template…");
    var wb = newWorkbook("Accessibility defect report template");

    var ws = addTextSheet(wb, "Instructions", "How to use this template");
    var r = writeLines(ws, 3, INSTRUCTIONS);
    r++;
    ws.getCell("A" + r).value = "Allowed values";
    ws.getCell("A" + r).font = { bold: true, size: 12 };
    r++;
    r = writeLines(ws, r, COLUMNS.filter(function (c) { return c.list; }).map(function (c) {
      return c.header + ": " + c.list.join(", ");
    }));
    r++;
    writeReferences(ws, r);

    var issues = addIssuesSheet(wb, "Issues");
    /* one worked example so the expected level of detail is obvious */
    var example = issues.addRow({
      srNo: 1,
      page: "Login Page",
      steps: "1. Go to Login Page  2. Tab to the submit button",
      linkTools: "https://example.com/login, NVDA + Chrome",
      wcagFull: "",
      finding: "The submit button loses its focus outline when tabbed to",
      screenshot: "",
      recommendation: "",
      changeType: "",
      impact: "",
      status: "Open",
      comments: "",
      signoff: "Pending"
    });
    styleBodyRow(example);
    applyDropdowns(issues, 200);

    saveWorkbook(wb, "accessibility-defect-template.xlsx").then(function () {
      setImportStatus("Template downloaded. Fill in the Issues sheet, then upload it here.", "success");
    })["catch"](function () {
      setImportStatus("Could not build the template file. Check your connection and try again.", "error");
    }).then(function () {
      el.downloadTemplateBtn.disabled = false;
    });
  });

  function setImportStatus(msg, kind) {
    el.importStatus.textContent = msg;
    el.importStatus.className = "hint" + (kind ? " is-" + kind : "");
  }

  /* Tolerant header lookup: ignores case, surrounding space and a trailing
     "(optional)", so files saved from older templates still import. */
  function normHeader(s) {
    return String(s).trim().toLowerCase().replace(/\s*\(optional\)\s*$/, "").replace(/\s+/g, " ");
  }
  function pick(row, names) {
    var keys = Object.keys(row);
    for (var i = 0; i < names.length; i++) {
      var want = normHeader(names[i]);
      for (var j = 0; j < keys.length; j++) {
        if (normHeader(keys[j]) === want) {
          var v = row[keys[j]];
          return String(v == null ? "" : v).trim();
        }
      }
    }
    return "";
  }

  el.uploadTemplateInput.addEventListener("change", function () {
    var file = el.uploadTemplateInput.files[0];
    if (!file) return;
    setImportStatus("Reading " + file.name + "…");
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var wb = XLSX.read(e.target.result, { type: "array" });
        /* Prefer the "Issues" sheet; the template's first sheet is Instructions */
        var sheetName = wb.SheetNames.filter(function (n) {
          return n.trim().toLowerCase() === "issues";
        })[0] || wb.SheetNames[0];
        var ws = wb.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!rows.length) { setImportStatus("No rows found on the \"" + sheetName + "\" sheet.", "error"); return; }

        var added = 0;
        rows.forEach(function (row) {
          var page = pick(row, ["Page / Screen", "Page/Screen", "Page", "Screen"]);
          var finding = pick(row, ["Finding"]);
          if (!page && !finding) return;

          var steps = pick(row, ["Steps to Reproduce", "Steps"]);
          var linkTools = pick(row, ["Link and Tools Used", "Link and Tools"]);
          var scRaw = pick(row, ["WCAG SC", "WCAG Success Criterion", "WCAG"]);
          var changeType = pick(row, ["Change Type"]);
          var impact = pick(row, ["User Impact", "Impact"]);
          var recommendation = pick(row, ["Recommendation"]);
          var screenshotRef = pick(row, ["Screenshot"]);
          var comments = pick(row, ["Test Comments", "Comments"]);
          var status = pick(row, ["Status"]) || "Open";
          var signoff = pick(row, ["Business Sign-off", "Business Signoff", "Sign-off", "Signoff"]) || "Pending";

          if (!scRaw || !changeType || !impact || !recommendation) {
            var rule = matchRule((finding + " " + steps).trim()) || FALLBACK_RULE;
            if (!scRaw) scRaw = rule.sc;
            if (!changeType) changeType = rule.changeType;
            if (!impact) impact = rule.impact;
            if (!recommendation) recommendation = rule.fix;
          }
          var scCode = (scRaw.match(/^[\d.]+/) || [""])[0];
          var level = (scRaw.match(/\(([^)]+)\)\s*$/) || [, ""])[1];

          addDefect({
            page: page, steps: steps, linkTools: linkTools, finding: finding,
            wcagSc: scCode, wcagFull: scRaw, level: level,
            changeType: changeType, impact: impact,
            status: status, signoff: signoff, fg: "", bg: "",
            recommendation: recommendation, comments: comments,
            screenshot: null, screenshotRef: screenshotRef
          });
          added++;
        });

        if (added === 0) {
          setImportStatus("No usable rows — each row needs at least a Page / Screen or a Finding.", "error");
          return;
        }
        setImportStatus(added + " issue(s) imported and added to the log below. Preparing Excel export…", "success");
        exportToExcel().then(function () {
          setImportStatus(added + " issue(s) imported. Defect report exported as Excel.", "success");
        })["catch"](function () {
          setImportStatus(added + " issue(s) imported, but the Excel export failed. Use \"Export to Excel\" to retry.", "error");
        });
      } catch (err) {
        setImportStatus("Could not read that file — make sure it's a .xlsx/.xls exported from the template.", "error");
      } finally {
        el.uploadTemplateInput.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  });

  function countBy(key, values) {
    return values.map(function (v) {
      return { label: v, n: defects.filter(function (d) { return d[key] === v; }).length };
    });
  }

  function exportToExcel() {
    var wb = newWorkbook("Accessibility defect report");

    /* ---- Sheet 1: summary + reference material ---- */
    var about = addTextSheet(wb, "About", "Accessibility Defect Report");
    var r = 3;
    r = writeLines(about, r, [
      "Generated: " + new Date().toLocaleDateString(undefined,
        { day: "2-digit", month: "short", year: "numeric" }),
      "Standard: WCAG 2.2, Level AA",
      "Total issues: " + defects.length
    ]);
    r++;
    about.getCell("A" + r).value = "By user impact";
    about.getCell("A" + r).font = { bold: true, size: 12 };
    r++;
    r = writeLines(about, r, countBy("impact", ["Critical", "High", "Medium", "Low"]).map(function (c) {
      return "    " + c.label + ": " + c.n;
    }));
    r++;
    about.getCell("A" + r).value = "By status";
    about.getCell("A" + r).font = { bold: true, size: 12 };
    r++;
    r = writeLines(about, r, countBy("status", ["Open", "In Progress", "Fixed", "Verified", "Won't Fix"]).map(function (c) {
      return "    " + c.label + ": " + c.n;
    }));
    r++;
    r = writeLines(about, r, [
      "Suggested WCAG criteria, change types, impacts and recommendations are keyword-based " +
      "against WCAG 2.2 and are not a substitute for a manual accessibility audit."
    ]);
    r++;
    writeReferences(about, r);

    /* ---- Sheet 2: the defect data ---- */
    var ws = addIssuesSheet(wb, "Defect Report");
    defects.forEach(function (d, i) {
      var values = {};
      COLUMNS.forEach(function (c) { values[c.key] = cellValue(d, i, c); });
      var row = ws.addRow(values);
      styleBodyRow(row);
      /* turn recognised criteria into links to the W3C Understanding page */
      COLUMNS.forEach(function (c, ci) {
        if (!c.linkUrl) return;
        var url = c.linkUrl(d);
        var text = String(values[c.key] == null ? "" : values[c.key]);
        if (!url || !text) return;
        var cell = row.getCell(ci + 1);
        cell.value = { text: text, hyperlink: url, tooltip: "Understanding " + text };
        cell.font = { color: { argb: LINK_INK }, underline: true };
      });
    });

    return saveWorkbook(wb, "accessibility-defect-report.xlsx");
  }

  el.exportBtn.addEventListener("click", function () {
    if (defects.length === 0) {
      announce("Nothing to export yet — add or import at least one issue first.", "error");
      return;
    }
    el.exportBtn.disabled = true;
    announce("Building the Excel report…");
    exportToExcel().then(function () {
      announce("Exported " + defects.length + " issue(s) to accessibility-defect-report.xlsx.", "success");
    })["catch"](function () {
      announce("Could not build the Excel report. Check your connection and try again.", "error");
    }).then(function () {
      el.exportBtn.disabled = false;
    });
  });

  /* =========================================================
     init
     ========================================================= */
  renderTable();
})();
