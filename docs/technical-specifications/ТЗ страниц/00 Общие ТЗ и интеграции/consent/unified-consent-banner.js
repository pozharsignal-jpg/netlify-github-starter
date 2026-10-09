(function () {
  "use strict";
  if (window.__pzUnifiedConsentUI) return;
  window.__pzUnifiedConsentUI = true;
  var panel, manage, settings, previousFocus;
  function current() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)pz_consent_v2=([^;]*)/);
      if (m) { var saved = JSON.parse(decodeURIComponent(m[1])) || {}; saved.marketing = saved.marketing || "denied"; return saved; }
      var c = JSON.parse(localStorage.getItem("pz_analytics_consent") || "{}");
      return {analytics:c.consent_analytics || "denied",ads:c.consent_ads || "denied",marketing:c.consent_marketing || "denied",timestamp:c.consent_timestamp || "",version:c.consent_version || "2.0"};
    } catch (e) { return {analytics:"denied",ads:"denied",marketing:"denied",timestamp:"",version:"2.0"}; }
  }
  function update(c) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "update", {analytics_storage:c.analytics,ad_storage:c.ads,ad_user_data:c.marketing,ad_personalization:c.marketing});
    window.dataLayer.push({event:"pz_consent_update",consent_analytics:c.analytics,consent_ads:c.ads,consent_marketing:c.marketing,consent_timestamp:c.timestamp,consent_version:c.version});
    if (window.PozharnikPageConfig) window.PozharnikPageConfig.sync();
    if (window.PozharnikAnalytics) window.PozharnikAnalytics.enrichAllForms();
  }
  function save(a,b,m) {
    var c = {analytics:a?"granted":"denied",ads:b?"granted":"denied",marketing:m?"granted":"denied",timestamp:new Date().toISOString(),version:"2.0"};
    document.cookie = "pz_consent_v2=" + encodeURIComponent(JSON.stringify(c)) + "; Max-Age=31536000; Path=/; SameSite=Lax; Secure";
    try { localStorage.setItem("pz_analytics_consent",JSON.stringify({consent_analytics:c.analytics,consent_ads:c.ads,consent_marketing:c.marketing,consent_timestamp:c.timestamp,consent_version:c.version})); } catch (e) {}
    update(c);
    panel.hidden = true; manage.hidden = false;
    if (panel.contains(document.activeElement)) {
      if(previousFocus && previousFocus.isConnected && !panel.contains(previousFocus)) previousFocus.focus({preventScroll:true});
      else manage.focus({preventScroll:true});
    }
  }
  function show(custom) {
    previousFocus = document.activeElement;
    var c = current();
    panel.querySelector('[name="pz-ui-analytics"]').checked = c.analytics === "granted";
    panel.querySelector('[name="pz-ui-ads"]').checked = c.ads === "granted";
    panel.querySelector('[name="pz-ui-marketing"]').checked = c.marketing === "granted";
    settings.hidden = !custom;
    panel.querySelector('[data-pz-cookie="save"]').hidden = !custom;
    panel.querySelector('[data-pz-cookie="close"]').hidden = !c.timestamp;
    panel.querySelector('[data-pz-cookie="custom"]').setAttribute("aria-expanded",custom?"true":"false");
    panel.hidden = false; manage.hidden = true;
  }
  function closeSettings() {
    if(!current().timestamp)return;
    panel.hidden=true;manage.hidden=false;
    manage.focus({preventScroll:true});
  }
  var style = document.createElement("style");
  style.id = "pz-unified-consent-style";
  style.textContent = '#pz-consent-banner,#pz-consent-manage,.pz-consent-banner{display:none!important}#pz-unified-cookie-panel,#pz-unified-cookie-panel *,#pz-unified-cookie-manage{box-sizing:border-box;font-family:Arial,sans-serif}#pz-unified-cookie-panel[hidden],#pz-unified-cookie-panel [hidden],#pz-unified-cookie-manage[hidden]{display:none!important}#pz-unified-cookie-panel{position:fixed!important;z-index:100000!important;left:20px!important;bottom:20px!important;width:min(520px,calc(100vw - 40px))!important;max-height:calc(100dvh - 40px);overflow:auto;padding:22px!important;border:1px solid #d6e0e4!important;border-radius:16px!important;background:#fff!important;color:#17313e!important;box-shadow:0 12px 48px rgba(10,33,45,.22);text-align:left!important}#pz-unified-cookie-panel h2{margin:0 0 10px!important;font-size:20px!important;line-height:1.25!important;font-weight:700!important;color:#17313e!important}#pz-unified-cookie-panel p{margin:0 0 16px!important;font-size:14px!important;line-height:1.5!important;color:#455c68!important}#pz-unified-cookie-panel .pz-cookie-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}#pz-unified-cookie-panel button,#pz-unified-cookie-manage{min-height:46px!important;border:1px solid #b8c7cf!important;border-radius:9px!important;padding:12px 16px!important;background:#fff!important;color:#17313e!important;font-size:14px!important;line-height:1.25!important;font-weight:700!important;cursor:pointer!important;white-space:normal!important}#pz-unified-cookie-panel button[data-pz-cookie="all"]{grid-column:1/-1!important;background:#c7352a!important;border-color:#c7352a!important;color:#fff!important;font-size:16px!important;min-height:50px!important}#pz-unified-cookie-panel button[data-pz-cookie="save"]{grid-column:1/-1!important}#pz-unified-cookie-panel button:focus-visible,#pz-unified-cookie-manage:focus-visible{outline:3px solid #087fc2!important;outline-offset:3px!important}#pz-unified-cookie-settings{margin:0 0 16px!important;padding:12px!important;background:#f2f6f8!important;border-radius:9px!important}#pz-unified-cookie-settings label{display:flex!important;align-items:flex-start!important;gap:10px!important;padding:8px 0!important;font-size:14px!important;line-height:1.45!important;color:#17313e!important}#pz-unified-cookie-settings input{appearance:auto!important;width:20px!important;height:20px!important;min-width:20px!important;margin:0!important;accent-color:#c7352a!important}#pz-unified-cookie-manage{position:static!important;display:inline-block!important;width:auto!important;min-height:44px!important;margin:12px 0!important;padding:8px 12px!important;font-size:13px!important;box-shadow:none!important}#pz-cookie-footer-control{padding:8px 20px!important;background:#f3f6f8!important;text-align:center!important}@media(max-width:600px){#pz-unified-cookie-panel{left:12px!important;bottom:calc(88px + env(safe-area-inset-bottom))!important;width:calc(100vw - 24px)!important;max-height:calc(100dvh - 112px);padding:18px!important}#pz-unified-cookie-panel .pz-cookie-actions{grid-template-columns:1fr!important}#pz-unified-cookie-panel button{width:100%!important}}';
  (document.head || document.documentElement).appendChild(style);
  function build() {
    if (document.getElementById("pz-unified-cookie-panel")) return;
    panel = document.createElement("section");
    panel.id = "pz-unified-cookie-panel";
    panel.setAttribute("role","dialog");
    panel.setAttribute("aria-labelledby","pz-unified-cookie-title");
    panel.setAttribute("aria-describedby","pz-unified-cookie-description");
    panel.innerHTML = '<h2 id="pz-unified-cookie-title">Настройки cookies</h2><p id="pz-unified-cookie-description">Используем cookies для аналитики сайта, измерения и персонализации рекламы и маркетинговых коммуникаций только с вашего согласия. Отправить заявку можно при любом выборе.</p><div id="pz-unified-cookie-settings" hidden><label><input type="checkbox" name="pz-ui-analytics">Аналитика сайта</label><label><input type="checkbox" name="pz-ui-ads">Измерение рекламы</label><label><input type="checkbox" name="pz-ui-marketing">Персонализация рекламы и маркетинговые коммуникации</label></div><div class="pz-cookie-actions"><button type="button" data-pz-cookie="all">Принять все</button><button type="button" data-pz-cookie="necessary">Только необходимые</button><button type="button" data-pz-cookie="custom" aria-controls="pz-unified-cookie-settings" aria-expanded="false">Настроить</button><button type="button" data-pz-cookie="save" hidden>Сохранить выбор</button></div>';
    document.body.appendChild(panel);
    var closeButton=document.createElement("button");closeButton.type="button";closeButton.setAttribute("data-pz-cookie","close");closeButton.textContent="Закрыть";closeButton.hidden=true;panel.querySelector(".pz-cookie-actions").appendChild(closeButton);
    settings = document.getElementById("pz-unified-cookie-settings");
    manage = document.createElement("button");manage.id="pz-unified-cookie-manage";manage.type="button";manage.textContent="Настройки cookies";
    var footer=document.querySelector("#pz-global-footer")||document.querySelector("footer");
    if(footer)footer.appendChild(manage);else{var footerControl=document.createElement("div");footerControl.id="pz-cookie-footer-control";footerControl.appendChild(manage);document.body.appendChild(footerControl)}
    panel.addEventListener("click",function(e){var b=e.target.closest("[data-pz-cookie]");if(!b)return;var a=b.getAttribute("data-pz-cookie");if(a==="all")save(true,true,true);if(a==="necessary")save(false,false,false);if(a==="custom"){show(true);settings.querySelector("input").focus()}if(a==="save")save(panel.querySelector('[name="pz-ui-analytics"]').checked,panel.querySelector('[name="pz-ui-ads"]').checked,panel.querySelector('[name="pz-ui-marketing"]').checked)});
    manage.addEventListener("click",function(){show(true);panel.querySelector('[data-pz-cookie="all"]').focus()});
    closeButton.addEventListener("click",closeSettings);
    panel.addEventListener("keydown",function(e){if(e.key==="Escape")closeSettings()});
    var c=current();if(c.timestamp){panel.hidden=true;manage.hidden=false;update(c)}else show(false);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
