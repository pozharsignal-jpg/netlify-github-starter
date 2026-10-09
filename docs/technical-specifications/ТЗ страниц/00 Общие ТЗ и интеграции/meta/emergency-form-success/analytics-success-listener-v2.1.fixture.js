// Test fixture: unchanged success-listener functions from analytics 2.1.
// This fragment is not a standalone production script.
var VERSION = "2.1";
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
  function ensureEventId(form) {
    var field = form.querySelector('input[name="event_id"]');
    if (field && field.value) return field.value;
    var value = uuid();
    setHiddenField(form, "event_id", value);
    return value;
  }
  document.addEventListener("tildaform:aftersuccess", function (event) {
    var form = event.target;
    dataLayerPush({
      event: "pz_form_success",
      event_id: ensureEventId(form),
      form_name: formName(form),
      service: serviceName(form)
    });
    var eventField = form.querySelector('input[name="event_id"]');
    if (eventField) eventField.value = "";
  });
