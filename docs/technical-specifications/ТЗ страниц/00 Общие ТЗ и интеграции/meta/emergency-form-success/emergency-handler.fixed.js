(function () {
  if (window.__pzEmergencyHandlerBound) return;
  window.__pzEmergencyHandlerBound = true;
  var form = document.getElementById('pz-lead-srabotka');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var button = form.querySelector('button'), result = form.querySelector('.pz-result');
    if (button.disabled) return;
    button.disabled = true;

    var eventField = form.querySelector('input[name="event_id"]');
    if (!eventField) {
      eventField = document.createElement('input');
      eventField.type = 'hidden';
      eventField.name = 'event_id';
      form.appendChild(eventField);
    }
    var eventId = eventField.value || crypto.randomUUID();
    eventField.value = eventId;
    var data = new FormData(form);
    data.set('event_id', eventId);
    data.set('page_url', location.href);
    data.set('landing_page', location.href);
    data.set('service_type', 'emergency_visit');
    data.set('cta_location', 'services');
    data.set('comment', [
      'Сообщение на панели: ' + (data.get('panel_message') || ''),
      'Тип проблемы: ' + (data.get('problem_type') || ''),
      'Срочность: ' + (data.get('urgency') || ''),
      'Адрес: ' + (data.get('address') || '')
    ].join('; '));

    try {
      var r = await fetch('__KEEP_EXISTING_WEBHOOK_URL__', { method: 'POST', body: data });
      if (!r.ok) throw new Error();
      result.hidden = false;
      result.textContent = 'Заявка принята. Обработаем её в течение 10 минут в рабочее время.';
      form.dispatchEvent(new CustomEvent('tildaform:aftersuccess', {
        bubbles: true,
        detail: { source: 'pozharnik_server_adapter' }
      }));
      form.reset();
    } catch (err) {
      result.hidden = false;
      result.textContent = 'Не удалось отправить заявку. Позвоните __KEEP_EXISTING_SUPPORT_PHONE__ или напишите в WhatsApp.';
    } finally {
      button.disabled = false;
    }
  });
})();
