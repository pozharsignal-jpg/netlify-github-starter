import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const fixed = readFileSync(new URL('./emergency-handler.fixed.js', import.meta.url), 'utf8');
const published = readFileSync(new URL('./published-emergency-handler.js', import.meta.url), 'utf8');
const analytics = readFileSync(new URL('./analytics-success-listener-v2.1.fixture.js', import.meta.url), 'utf8');
assert.match(analytics, /var VERSION = "2\.1"/);

// Execute the real 2.1 success listener and its dependencies, not a recreated listener.
const analyticsFunctions = ['uuid', 'dataLayerPush', 'setHiddenField', 'formName', 'serviceName', 'ensureEventId']
  .map((name) => {
    const source = analytics.match(new RegExp('  function ' + name + '\\([\\s\\S]*?\\n  }'))?.[0];
    assert.ok(source, 'Missing analytics dependency: ' + name);
    return source;
  }).join('\n');
const analyticsListener = analytics.match(/  document\.addEventListener\("tildaform:aftersuccess", function \(event\) \{[\s\S]*?\n  \}\);/)?.[0];
assert.ok(analyticsListener, 'Missing real analytics success listener');

function field(name, value = '', type = 'text') {
  let current = value;
  return {
    name, type, defaultValue: value,
    get value() { return current; },
    set value(next) {
      current = next;
      // Hidden-input value reflects its content attribute, which reset also reads.
      if (this.type === 'hidden') this.defaultValue = next;
    }
  };
}

function fixture({ handler = fixed, eventId = 'existing-form-id', fetcher = async () => ({ ok: true }) } = {}) {
  const fields = new Map([
    ['name', field('name', 'TEST')], ['phone', field('phone', 'TEST_PHONE')],
    ['panel_message', field('panel_message', 'TEST')], ['problem_type', field('problem_type', 'TEST')],
    ['urgency', field('urgency', 'TEST')], ['address', field('address', 'TEST')],
    ['service', field('service', 'emergency_visit', 'hidden')]
  ]);
  if (eventId !== null) fields.set('event_id', field('event_id', eventId, 'hidden'));
  const button = { disabled: false }, result = { hidden: true, textContent: '' };
  const formListeners = new Map(), documentListeners = new Map();
  const order = [], requests = [];
  let resets = 0, uuids = 0;

  const form = {
    id: 'pz-lead-srabotka',
    querySelector(selector) {
      if (selector === 'button') return button;
      if (selector === '.pz-result') return result;
      for (const match of selector.matchAll(/\[name="([^"]+)"\]/g)) {
        if (fields.has(match[1])) return fields.get(match[1]);
      }
      return null;
    },
    getAttribute(name) { return name === 'data-analytics-form' ? 'lead_srabotka' : null; },
    appendChild(input) { fields.set(input.name, input); },
    addEventListener(type, listener) {
      const existing = formListeners.get(type) || [];
      existing.push(listener); formListeners.set(type, existing);
    },
    dispatchEvent(event) {
      event.target = form;
      order.push(event.type);
      for (const listener of documentListeners.get(event.type) || []) listener(event);
      return true;
    },
    reset() {
      order.push('reset'); resets += 1;
      for (const input of fields.values()) input.value = input.defaultValue;
    }
  };
  const document = {
    getElementById(id) { return id === form.id ? form : null; },
    createElement(type) { assert.equal(type, 'input'); return field(''); },
    addEventListener(type, listener) {
      const existing = documentListeners.get(type) || [];
      existing.push(listener); documentListeners.set(type, existing);
    }
  };
  class MockFormData {
    constructor(source) { this.values = new Map([...fields].map(([name, input]) => [name, input.value])); assert.equal(source, form); }
    set(name, value) { this.values.set(name, value); }
    get(name) { return this.values.get(name) ?? null; }
  }
  class MockCustomEvent {
    constructor(type, options) { this.type = type; Object.assign(this, options); }
  }
  const crypto = { randomUUID() { uuids += 1; return 'new-form-id-' + uuids; } };
  const window = { crypto, dataLayer: [] };
  const context = {
    window, document, crypto, FormData: MockFormData, CustomEvent: MockCustomEvent,
    location: { href: 'https://example.test/srabotka' },
    fetch: async (url, init) => {
      assert.equal(url, '__KEEP_EXISTING_WEBHOOK_URL__');
      requests.push(init);
      return fetcher(url, init);
    }
  };
  runInNewContext(analyticsFunctions + '\n' + analyticsListener, context);
  runInNewContext(handler, context);
  return {
    fields, button, result, requests, order, context, formListeners,
    get events() { return window.dataLayer.filter((item) => item.event === 'pz_form_success'); },
    get resets() { return resets; },
    rebind() { runInNewContext(handler, context); },
    async submit() {
      const event = { preventDefault() {}, stopImmediatePropagation() {} };
      for (const listener of formListeners.get('submit') || []) await listener.call(form, event);
    }
  };
}

test('live source reproduces both regressions: server ID differs and canonical success is absent', async () => {
  const f = fixture({ handler: published });
  await f.submit();
  assert.notEqual(f.requests[0].body.get('event_id'), 'existing-form-id');
  assert.equal(f.events.length, 0);
});

test('HTTP success shares the enriched ID and emits one canonical event before reset', async () => {
  const f = fixture();
  await f.submit();
  assert.equal(f.requests[0].body.get('event_id'), 'existing-form-id');
  assert.equal(f.events.length, 1);
  assert.equal(f.events[0].event_id, f.requests[0].body.get('event_id'));
  assert.equal(f.events[0].form_name, 'lead_srabotka');
  assert.equal(f.events[0].service, 'emergency_visit');
  assert.deepEqual(f.order, ['tildaform:aftersuccess', 'reset']);
  assert.equal(f.fields.get('event_id').value, '');
  assert.equal(f.button.disabled, false);
});

test('missing event_id is created once and used by both server and canonical event', async () => {
  const f = fixture({ eventId: null });
  await f.submit();
  assert.equal(f.requests[0].body.get('event_id'), 'new-form-id-1');
  assert.equal(f.events[0].event_id, 'new-form-id-1');
  assert.equal([...f.fields].filter(([name]) => name === 'event_id').length, 1);
});

test('HTTP failure emits no success and keeps the same ID for a successful retry', async () => {
  let calls = 0;
  const f = fixture({ fetcher: async () => ({ ok: ++calls > 1 }) });
  await f.submit();
  assert.equal(f.events.length, 0);
  assert.equal(f.resets, 0);
  assert.equal(f.fields.get('event_id').value, 'existing-form-id');
  assert.match(f.result.textContent, /Не удалось/);
  assert.equal(f.button.disabled, false);
  await f.submit();
  assert.equal(f.events.length, 1);
  assert.equal(f.requests[0].body.get('event_id'), f.requests[1].body.get('event_id'));
  assert.equal(f.events[0].event_id, 'existing-form-id');
});

test('network rejection retains entered values and ID without success or reset', async () => {
  const f = fixture({ fetcher: async () => { throw new Error('mock_network_failure'); } });
  await f.submit();
  assert.equal(f.events.length, 0);
  assert.equal(f.resets, 0);
  assert.equal(f.fields.get('name').value, 'TEST');
  assert.equal(f.fields.get('event_id').value, 'existing-form-id');
  assert.equal(f.button.disabled, false);
});

test('a second submit during an active request does not duplicate requests or success events', async () => {
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const f = fixture({ fetcher: () => pending });
  const first = f.submit();
  await f.submit();
  assert.equal(f.requests.length, 1);
  assert.equal(f.events.length, 0);
  release({ ok: true });
  await first;
  assert.equal(f.requests.length, 1);
  assert.equal(f.events.length, 1);
  assert.equal(f.resets, 1);
});

test('loading the handler twice binds once and produces one success', async () => {
  const f = fixture();
  f.rebind();
  assert.equal(f.formListeners.get('submit').length, 1);
  await f.submit();
  assert.equal(f.requests.length, 1);
  assert.equal(f.events.length, 1);
});

test('a new lead after a confirmed success receives a new ID', async () => {
  const f = fixture();
  await f.submit();
  await f.submit();
  assert.equal(f.events.length, 2);
  assert.notEqual(f.requests[0].body.get('event_id'), f.requests[1].body.get('event_id'));
  assert.equal(f.events[1].event_id, f.requests[1].body.get('event_id'));
});
