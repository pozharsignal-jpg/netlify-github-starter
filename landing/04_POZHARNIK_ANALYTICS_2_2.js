(function () {
  "use strict";

  if (window.__pozharnikAnalyticsV2) return;
  window.__pozharnikAnalyticsV2 = true;

  var VERSION = "2.2";
  var PREFIX = "pz_analytics_";
  var FIRST_KEY = PREFIX + "first_touch";
  var LAST_KEY = PREFIX + "last_touch";
  var VISITOR_KEY = PREFIX + "visitor_id";
  var VISITS_KEY = PREFIX + "visit_count";
  var SESSION_KEY = PREFIX + "session_id";
  var SESSION_START_KEY = PREFIX + "session_started_at";
  var CTA_KEY = PREFIX + "last_cta";
  var startedAt = Date.now();
  var maxScroll = 0;
  var startedForms = [];

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
      var random = (Math.random() * 16) | 0;
      var value = char === "x" ? random : (random & 3) | 8;
      return value.toString(16);
    });
  }

  function safeParse(value, fallback) {
    try {
      var parsed = JSON.parse(value);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function localGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function localSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {}
  }

  function sessionGet(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function sessionSet(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {}
  }

  function readCookie(name) {
    var parts = document.cookie ? document.cookie.split(";") : [];
    for (var index = 0; index < parts.length; index += 1) {
      var item = parts[index].trim();
      var equalsAt = item.indexOf("=");
      if (equalsAt > -1 && item.slice(0, equalsAt) === name) {
        return decodeURIComponent(item.slice(equalsAt + 1));
      }
    }
    return "";
  }

  function queryParameter(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function normalizeHost(host) {
    return host.indexOf("www.") === 0 ? host.slice(4) : host;
  }

  function inferredChannel() {
    if (queryParameter("gclid") || queryParameter("gbraid") || queryParameter("wbraid")) return {source:"google", medium:"cpc"};
    if (queryParameter("yclid")) return {source:"yandex", medium:"cpc"};
    var source = queryParameter("utm_source");
    var medium = queryParameter("utm_medium");
    if (source || medium) {
      return { source: source || "(not set)", medium: medium || "(not set)" };
    }

    if (!document.referrer) return { source: "direct", medium: "none" };

    try {
      var host = new URL(document.referrer).hostname.toLowerCase();
      var searchHosts = ["google.", "yandex.", "bing.", "mail.ru"];
      var isSearch = searchHosts.some(function (fragment) {
        return host.indexOf(fragment) > -1;
      });

      if (isSearch) return { source: normalizeHost(host), medium: "organic" };
      if (normalizeHost(host) === normalizeHost(window.location.hostname)) return { source: "internal", medium: "referral" };
      return { source: normalizeHost(host), medium: "referral" };
    } catch (error) {
      return { source: "unknown", medium: "referral" };
    }
  }

  function buildTouch() {
    var channel = inferredChannel();
    return {
      utm_source: queryParameter("utm_source") || channel.source,
      utm_medium: queryParameter("utm_medium") || channel.medium,
      utm_campaign: queryParameter("utm_campaign"),
      utm_content: queryParameter("utm_content"),
      utm_term: queryParameter("utm_term"),
      gclid: queryParameter("gclid"),
      gbraid: queryParameter("gbraid"),
      wbraid: queryParameter("wbraid"),
      yclid: queryParameter("yclid"),
      landing_page: window.location.href,
      referrer: document.referrer || "",
      captured_at: new Date().toISOString()
    };
  }

  function hasCampaignParameters() {
    return [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "gclid",
      "gbraid",
      "wbraid",
      "yclid"
    ].some(function (name) {
      return Boolean(queryParameter(name));
    });
  }

  var currentTouch = buildTouch();
  var firstTouch = safeParse(localGet(FIRST_KEY), null);
  if (!firstTouch) {
    firstTouch = currentTouch;
    localSet(FIRST_KEY, JSON.stringify(firstTouch));
  }

  var lastTouch = safeParse(localGet(LAST_KEY), null);
  var externalEntry = false;
  if (document.referrer) {
    try { externalEntry = normalizeHost(new URL(document.referrer).hostname) !== normalizeHost(window.location.hostname); } catch (ignore) {}
  }
  if (!lastTouch || hasCampaignParameters() || externalEntry) {
    lastTouch = currentTouch;
    localSet(LAST_KEY, JSON.stringify(lastTouch));
  }

  var visitorId = localGet(VISITOR_KEY) || uuid();
  localSet(VISITOR_KEY, visitorId);

  var ACTIVITY_KEY = PREFIX + "session_last_activity";
  var existingSession = sessionGet(SESSION_KEY);
  var lastActivity = Number(sessionGet(ACTIVITY_KEY) || 0);
  var newSession = !existingSession || !lastActivity || Date.now() - lastActivity > 30 * 60 * 1000;
  var sessionId = newSession ? uuid() : existingSession;
  var sessionStartedAt = newSession ? new Date().toISOString() : sessionGet(SESSION_START_KEY) || new Date().toISOString();
  var visitCount = parseInt(localGet(VISITS_KEY) || "0", 10) + (newSession ? 1 : 0);
  if (!Number.isFinite(visitCount) || visitCount < 1) visitCount = 1;
  localSet(VISITS_KEY, String(visitCount));
  sessionSet(SESSION_KEY, sessionId);
  sessionSet(SESSION_START_KEY, sessionStartedAt);
  if (newSession) sessionSet(ACTIVITY_KEY, String(Date.now()));
  function recordActivity() {
    var previous = Number(sessionGet(ACTIVITY_KEY) || 0);
    if (previous && Date.now() - previous > 30 * 60 * 1000) {
      sessionId = uuid(); sessionStartedAt = new Date().toISOString();
      visitCount = parseInt(localGet(VISITS_KEY) || "0", 10) + 1;
      if (!Number.isFinite(visitCount)) visitCount = 1;
      localSet(VISITS_KEY, String(visitCount));
      sessionSet(SESSION_KEY, sessionId); sessionSet(SESSION_START_KEY, sessionStartedAt);
    }
    sessionSet(ACTIVITY_KEY, String(Date.now()));
  }
  recordActivity();
  ["click", "keydown", "scroll"].forEach(function(type) { document.addEventListener(type, recordActivity, {passive:true}); });

  var resolvedGaClientId = "";
  function gaClientId() {
    if (resolvedGaClientId) return resolvedGaClientId;
    var value = readCookie("_ga");
    if (!value) return "";
    var parts = value.split(".");
    return parts.length >= 4 ? parts.slice(2).join(".") : value;
  }

  function ymClientId() {
    return readCookie("_ym_uid");
  }

  function deviceType() {
    var width = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    if (width < 768) return "mobile";
    if (width < 1200) return "tablet";
    return "desktop";
  }

  function operatingSystem() {
    var userAgent = navigator.userAgent || "";
    if (/Android/i.test(userAgent)) return "Android";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
    if (/Windows/i.test(userAgent)) return "Windows";
    if (/Mac OS/i.test(userAgent)) return "macOS";
    if (/Linux/i.test(userAgent)) return "Linux";
    return "Other";
  }

  function dataLayerPush(data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }

  function setHiddenField(form, name, value) {
    var field = form.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value == null ? "" : String(value);
  }

  function formName(form) {
    var field = form.querySelector('[name="tildaspec-formname"]');
    return field ? field.value : form.getAttribute("data-analytics-form") || "";
  }

  function serviceName(form) {
    var field = form.querySelector('[name="service"], [name="Service"]');
    return field ? field.value : form.getAttribute("data-service") || "";
  }

  function currentCta() {
    var cta = safeParse(sessionGet(CTA_KEY), {});
    if (cta.captured_at && Date.now() - Date.parse(cta.captured_at) > 30 * 60 * 1000) return {};
    return cta;
  }

  function ensureEventId(form) {
    var field = form.querySelector('input[name="event_id"]');
    if (field && field.value) return field.value;
    var value = uuid();
    setHiddenField(form, "event_id", value);
    return value;
  }

  function enrichForm(form) {
    if (!form || !form.querySelector("input, textarea, select")) return;

    var cta = currentCta();
    var eventId = ensureEventId(form);
    var fields = {
      event_id: eventId,
      event_name: "lead_created",
      schema_version: VERSION,
      visitor_id: visitorId,
      session_id: sessionId,
      session_started_at: sessionStartedAt,
      first_visit_at: firstTouch.captured_at || "",
      visit_count: visitCount,
      ga_client_id: gaClientId(),
      ym_client_id: ymClientId(),
      utm_source: lastTouch.utm_source || "",
      utm_medium: lastTouch.utm_medium || "",
      utm_campaign: lastTouch.utm_campaign || "",
      utm_content: lastTouch.utm_content || "",
      utm_term: lastTouch.utm_term || "",
      gclid: lastTouch.gclid || "",
      gbraid: lastTouch.gbraid || "",
      wbraid: lastTouch.wbraid || "",
      yclid: lastTouch.yclid || "",
      utm_first_json: JSON.stringify(firstTouch),
      utm_last_json: JSON.stringify(lastTouch),
      referrer: document.referrer || "",
      entry_page: firstTouch.landing_page || "",
      entry_path: (function () {
        try {
          return new URL(firstTouch.landing_page).pathname;
        } catch (error) {
          return "";
        }
      })(),
      page_url: window.location.href,
      page_title: document.title,
      lead_source_block: cta.location || "",
      cta_location: cta.location || "",
      cta_text: cta.text || "",
      time_on_page_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
      max_scroll_percent: maxScroll,
      device_type: deviceType(),
      os: operatingSystem(),
      platform: navigator.platform || "",
      user_agent: navigator.userAgent || "",
      screen_width: window.screen.width || 0,
      screen_height: window.screen.height || 0,
      viewport_width: window.innerWidth || 0,
      viewport_height: window.innerHeight || 0,
      language: navigator.language || "",
      is_returning_visitor: visitCount > 1 ? "true" : "false"
    };

    Object.keys(fields).forEach(function (name) {
      setHiddenField(form, name, fields[name]);
    });

    dataLayerPush({
      event: "pz_form_enriched",
      event_id: eventId,
      form_name: formName(form),
      service: serviceName(form),
      cta_location: fields.cta_location
    });
  }

  function enrichAllForms() {
    document.querySelectorAll("form, .t-form").forEach(enrichForm);
  }

  document.addEventListener(
    "scroll",
    function () {
      var scrollableHeight =
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) -
        window.innerHeight;
      var percentage =
        scrollableHeight > 0
          ? Math.round((window.scrollY / scrollableHeight) * 100)
          : 100;
      maxScroll = Math.max(maxScroll, Math.min(100, percentage));
    },
    { passive: true }
  );

  document.addEventListener(
    "click",
    function (event) {
      var element = event.target.closest(
        "[data-analytics-location], a, button, .t-btn, [role='button']"
      );
      if (!element) return;
      if (element.matches("[type=submit], [data-close], summary")) return;
      if (element.tagName === "BUTTON" && !element.hasAttribute("data-analytics-location")) return;

      var record = element.closest("[id^='rec']");
      var locationName =
        element.getAttribute("data-analytics-location") ||
        (record ? record.id : "global");
      var text = (
        element.getAttribute("data-analytics-label") ||
        element.innerText ||
        element.getAttribute("aria-label") ||
        ""
      )
        .trim()
        .slice(0, 160);

      var cta = {
        location: locationName,
        text: text,
        captured_at: new Date().toISOString()
      };
      sessionSet(CTA_KEY, JSON.stringify(cta));
      dataLayerPush({
        event: "pz_cta_click",
        cta_location: locationName,
        cta_text: text
      });

      var form = element.closest("form, .t-form");
      if (form) enrichForm(form);
    },
    true
  );

  document.addEventListener(
    "focusin",
    function (event) {
      var form = event.target.closest("form, .t-form");
      if (!form || startedForms.indexOf(form) > -1) return;
      startedForms.push(form);
      enrichForm(form);
      dataLayerPush({
        event: "pz_form_start",
        form_name: formName(form),
        service: serviceName(form)
      });
    },
    true
  );

  document.addEventListener(
    "submit",
    function (event) {
      enrichForm(event.target);
      dataLayerPush({
        event: "pz_form_submit",
        event_id: ensureEventId(event.target),
        form_name: formName(event.target),
        service: serviceName(event.target)
      });
    },
    true
  );

  document.addEventListener("tildaform:aftersuccess", function (event) {
    var form = event.target;
    if (!form || typeof form.querySelector !== "function") return;
    dataLayerPush({
      event: "pz_form_success",
      event_id: ensureEventId(form),
      form_name: formName(form),
      service: serviceName(form)
    });
    var eventField = form.querySelector('input[name="event_id"]');
    if (eventField) eventField.value = "";
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enrichAllForms);
  } else {
    enrichAllForms();
  }

  window.setTimeout(enrichAllForms, 1500);
  function resolveGaClientId() {
    var cfg = window.PozharnikAnalyticsConfig || window.PozharnikHomeConfig || {};
    if (window.gtag && cfg.gaMeasurementId) {
      try { window.gtag("get", cfg.gaMeasurementId, "client_id", function(id) { if (id) resolvedGaClientId = String(id); }); } catch (ignore) {}
    }
  }
  resolveGaClientId();
  window.setTimeout(resolveGaClientId, 2000);
  window.PozharnikAnalytics = {
    version: VERSION,
    enrichAllForms: enrichAllForms
  };
})();
