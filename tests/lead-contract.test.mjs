import test from "node:test";
import assert from "node:assert/strict";
import { processLead, validateLead } from "../netlify/functions/lead.js";

class MemoryStore {
  values = new Map();
  async get(key) { return this.values.get(key) || null; }
  async setJSON(key, value) { this.values.set(key, value); }
}

const icps = [
  ["ICP-1", "aps_maintenance", "Бизнес-центр"],
  ["ICP-2", "aps_maintenance", "Торговый центр"],
  ["ICP-3", "aps_installation", "Производство"],
  ["ICP-4", "fire_audit", "Склад"],
  ["ICP-5", "aps_repair", "Медицинский центр"],
];

test("ten valid leads across five ICP profiles create distinct Bitrix24 leads", async () => {
  const store = new MemoryStore();
  const received = [];
  const fetcher = async (_url, init) => {
    received.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ result: 1000 + received.length }), { status: 200 });
  };
  for (let index = 0; index < 10; index += 1) {
    const [icp, service, objectType] = icps[index % icps.length];
    const result = await processLead({
      event_id: `test-${index + 1}`, name: `Тест ${index + 1}`, phone: "+7 701 000 00 0" + index,
      email: `test${index + 1}@example.test`, consent: "true", icp_type: icp,
      service, object_type: objectType, object_area: String(500 + index * 250),
      cta_location: "qa", page_url: "https://example.test/", utm_last_json: "{}"
    }, { store, fetcher });
    assert.equal(result.status, 201);
    assert.equal(result.body.accepted, true);
  }
  assert.equal(received.length, 10);
  assert.deepEqual(new Set(received.map((item) => item.fields.TITLE.match(/test-\d+/)[0])).size, 10);
});

test("same event_id is idempotent", async () => {
  const store = new MemoryStore(); let calls = 0;
  const fetcher = async () => { calls += 1; return new Response(JSON.stringify({ result: 42 }), { status: 200 }); };
  const data = { event_id: "same-event", name: "Тест", phone: "+77010000000", consent: "true", service: "aps_maintenance" };
  await processLead(data, { store, fetcher });
  const repeated = await processLead(data, { store, fetcher });
  assert.equal(calls, 1); assert.equal(repeated.body.duplicate, true);
});

test("invalid lead is rejected before CRM", () => {
  assert.deepEqual(validateLead({}), { name: "Укажите имя", phone: "Укажите номер в формате +7XXXXXXXXXX", consent: "Нужно согласие на обработку данных", service: "Выберите услугу", event_id: "Не найден идентификатор заявки" });
});
