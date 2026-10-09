(function () {
  "use strict";

  var PIXEL_ID = "3757869821019226";
  var CONSENT_STORAGE = "pz_analytics_consent";
  var SCRIPT_ID = "pz-meta-pixel-library";
  var SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";
  var MARKER = "__pzMetaConsentManager";

  if (window[MARKER]) return;
  window[MARKER] = { version: "1.0", pixelId: PIXEL_ID };

  var validPixel = /^\d+$/.test(PIXEL_ID);
  var loading = false;
  var libraryReady = false;
  var initialized = false;
  var pageViewSent = false;
  var allowed = false;
  var pendingLeads = [];
  var seenLeads = {};
  var own = Object.prototype.hasOwnProperty;

  function hasConsent() {
    if (!validPixel) return false;
    var record, match;
    try {
      match = document.cookie.match(/(?:^|;\s*)pz_consent_v2=([^;]*)/);
      if (match) {
        record = JSON.parse(decodeURIComponent(match[1]));
        return !!record && record.ads === "granted" && record.marketing === "granted";
      }
      record = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE) || "{}");
      return !!record && record.consent_ads === "granted" && record.consent_marketing === "granted";
    } catch (error) {
      return false;
    }
  }

  function pixelCommand() {
    if (typeof window.fbq !== "function") return false;
    try { window.fbq.apply(window, arguments); return true; } catch (error) { return false; }
  }

  function clearPixelCookies() {
    var names = ["_fbp", "_fbc"];
    var host = (window.location.hostname || "").replace(/^\.+|\.+$/g, "");
    var parts = host.split(".");
    var domains = [];
    var i, j, domain, expiry;
    for (i = 0; i < parts.length - 1; i++) {
      domain = parts.slice(i).join(".");
      domains.push(domain, "." + domain);
    }
    for (i = 0; i < names.length; i++) {
      expiry = names[i] + "=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax";
      try { document.cookie = expiry; } catch (error) {}
      for (j = 0; j < domains.length; j++) {
        try { document.cookie = expiry + "; Domain=" + domains[j]; } catch (error) {}
      }
    }
  }

  function revoke() {
    allowed = false;
    pendingLeads = [];
    // Do not clear seenLeads: a cancelled old event must not be replayed later.
    pixelCommand("consent", "revoke");
    clearPixelCookies();
  }

  function installQueue() {
    if (typeof window.fbq === "function") return;
    var fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
  }

  function sendLead(eventId) {
    if (!hasConsent()) { revoke(); return; }
    // No form contact data, matching data, or arbitrary event payload is forwarded.
    pixelCommand("trackSingle", PIXEL_ID, "Lead", {}, { eventID: eventId });
  }

  function permit() {
    if (!allowed && initialized) pixelCommand("consent", "grant");
    allowed = true;
  }

  function flush() {
    if (!libraryReady) return;
    if (!hasConsent()) { revoke(); return; }
    permit();
    if (!initialized) {
      // Disable automatic events before init. No advanced-matching argument is supplied.
      if (!pixelCommand("set", "autoConfig", false, PIXEL_ID)) return;
      pixelCommand("consent", "grant");
      if (!pixelCommand("init", PIXEL_ID)) return;
      initialized = true;
    }
    if (!hasConsent()) { revoke(); return; }
    if (!pageViewSent) {
      pageViewSent = pixelCommand("trackSingle", PIXEL_ID, "PageView");
    }
    while (pendingLeads.length) {
      if (!hasConsent()) { revoke(); return; }
      sendLead(pendingLeads.shift());
    }
  }

  function ensureLibrary() {
    if (!hasConsent()) { revoke(); return; }
    permit();
    if (libraryReady) { flush(); return; }
    if (typeof window.fbq === "function" && typeof window.fbq.callMethod === "function") {
      libraryReady = true;
      flush();
      return;
    }
    if (loading) return;
    loading = true;
    installQueue();
    // Only a consent command is queued before the SDK has executed. Tracking stays local.
    pixelCommand("consent", "revoke");
    var script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = SCRIPT_URL;
    script.onload = function () {
      loading = false;
      libraryReady = typeof window.fbq === "function" && typeof window.fbq.callMethod === "function";
      if (!hasConsent()) { revoke(); return; }
      if (libraryReady) flush();
    };
    script.onerror = function () {
      loading = false;
      pendingLeads = [];
      pixelCommand("consent", "revoke");
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  function syncConsent() {
    if (!hasConsent()) { revoke(); return; }
    ensureLibrary();
  }

  function handleLead(event) {
    if (!hasConsent()) { revoke(); return; }
    var id = event.event_id;
    if (typeof id !== "string" || !/^[A-Za-z0-9_.:-]{1,200}$/.test(id)) return;
    var key = "lead:" + id;
    if (own.call(seenLeads, key)) return;
    seenLeads[key] = true;
    pendingLeads.push(id);
    ensureLibrary();
  }

  function handleEvent(event) {
    if (!event || typeof event !== "object") return;
    if (event.event === "pz_consent_update" || event.event === "consent_update") syncConsent();
    else if (event.event === "pz_form_success") handleLead(event);
  }

  window.dataLayer = window.dataLayer || [];
  var previousPush = window.dataLayer.push;
  window.dataLayer.push = function () {
    var result = previousPush.apply(this, arguments);
    for (var i = 0; i < arguments.length; i++) handleEvent(arguments[i]);
    return result;
  };
  // Only future successful form events are observed; past dataLayer history is not replayed.
  window.addEventListener("storage", function (event) {
    if (!event || event.key === CONSENT_STORAGE || event.key === null) syncConsent();
  });
  syncConsent();
})();
