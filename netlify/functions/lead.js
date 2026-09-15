const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

const env = (name) => globalThis.Netlify?.env?.get(name) || process.env[name] || "";
const clean = (value, limit = 4000) => String(value || "").trim().slice(0, limit);
const corsHeaders = (origin) => {
  const allowed = env("ALLOWED_ORIGINS").split(",").map((item) => item.trim()).filter(Boolean);
  return origin && allowed.includes(origin) ? {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "origin"
  } : {};
};

function validationError(fields) {
  return { accepted: false, error: "validation", fields };
}

export function validateLead(data) {
  const fields = {};
  if (!clean(data.name, 160)) fields.name = "Укажите имя";
  const phone = clean(data.phone, 40).replace(/\D/g, "");
  if (!/^7\d{10}$/.test(phone)) fields.phone = "Укажите номер в формате +7XXXXXXXXXX";
  if (clean(data.consent) !== "true") fields.consent = "Нужно согласие на обработку данных";
  if (!clean(data.service, 100)) fields.service = "Выберите услугу";
  if (!clean(data.event_id, 100)) fields.event_id = "Не найден идентификатор заявки";
  return Object.keys(fields).length ? fields : null;
}

export function bitrixPayload(data) {
  const event = clean(data.event_id, 100);
  const lines = [
    `event_id: ${event}`,
    `Услуга: ${clean(data.service, 100)}`,
    `ICP: ${clean(data.icp_type, 100)}`,
    `Источник CTA: ${clean(data.cta_location, 160)}`,
    `Площадь: ${clean(data.object_area, 80)}`,
    `Тип объекта: ${clean(data.object_type, 100)}`,
    `URL: ${clean(data.page_url, 1000)}`,
    `UTM last: ${clean(data.utm_last_json, 2000)}`
  ].filter((line) => !line.endsWith(": "));
  return {
    fields: {
      TITLE: `Pozharnik.kz — ${clean(data.service, 100)} — ${event}`,
      NAME: clean(data.name, 160),
      PHONE: [{ VALUE: `+${clean(data.phone, 40).replace(/\D/g, "")}`, VALUE_TYPE: "WORK" }],
      EMAIL: clean(data.email, 160) ? [{ VALUE: clean(data.email, 160), VALUE_TYPE: "WORK" }] : undefined,
      COMMENTS: lines.join("\n"),
      SOURCE_DESCRIPTION: "Pozharnik.kz / главная"
    },
    params: { REGISTER_SONET_EVENT: "Y" }
  };
}

async function addToBitrix(data, fetcher = fetch) {
  const webhook = env("BITRIX24_LEAD_WEBHOOK_URL");
  if (!webhook) throw new Error("CRM is not configured");
  const response = await fetcher(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(bitrixPayload(data))
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.result) throw new Error(result.error_description || result.error || "Bitrix24 rejected the lead");
  return String(result.result);
}

async function sendAnalytics(data, leadId, fetcher = fetch) {
  const endpoint = env("ANALYTICS_ENDPOINT");
  if (!endpoint) return;
  const response = await fetcher(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-analytics-token": env("ANALYTICS_TOKEN") },
    body: JSON.stringify({ ...data, lead_id: leadId, event: "lead_created" })
  });
  if (!response.ok) throw new Error("Analytics endpoint rejected the event");
}

export async function processLead(data, { fetcher = fetch, store } = {}) {
  const errors = validateLead(data);
  if (errors) return { status: 422, body: validationError(errors) };
  const leads = store || await getLeadStore();
  const key = `event/${clean(data.event_id, 100)}`;
  const existing = await leads.get(key, { type: "json" });
  if (existing?.lead_id) return { status: 200, body: { accepted: true, lead_id: existing.lead_id, duplicate: true } };
  const leadId = await addToBitrix(data, fetcher);
  await leads.setJSON(key, { lead_id: leadId, created_at: new Date().toISOString() });
  let analyticsRecorded = true;
  try { await sendAnalytics(data, leadId, fetcher); } catch { analyticsRecorded = false; }
  return { status: 201, body: { accepted: true, lead_id: leadId, analytics_recorded: analyticsRecorded } };
}

async function getLeadStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "pozharnik-lead-dedup", consistency: "strong" });
}

export default async (request) => {
  const origin = request.headers.get("origin") || "";
  const headers = corsHeaders(origin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return json({ accepted: false, error: "method_not_allowed" }, 405, headers);
  if (origin && !headers["access-control-allow-origin"]) return json({ accepted: false, error: "origin_not_allowed" }, 403);
  const data = Object.fromEntries((await request.formData()).entries());
  try {
    const result = await processLead(data);
    return json(result.body, result.status, headers);
  } catch (error) {
    console.error("lead submission failed", error.message);
    return json({ accepted: false, error: "temporary_unavailable" }, 503, headers);
  }
};

export const config = { path: "/api/lead" };
