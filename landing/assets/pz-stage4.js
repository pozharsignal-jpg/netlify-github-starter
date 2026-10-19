/* Shared runtime for the ten stage-4 pages. Load once, after PZ_PAGE_CONFIG.
 * GA4 generate_lead belongs to the GTM tag triggered by pz_form_success. */
(() => {
  'use strict';
  if (window.PZStage4) return;
  const cfg = window.PZ_PAGE_CONFIG || {};
  const formLocation = cfg.form_location || 'hero_form';
  const version = '2.1';
  const consentKey = 'pz_consent_v1';
  const params = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'dclid', 'fbclid', 'gad_source'];
  const query = new URLSearchParams(location.search);
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Optional storage. */ } };
  const now = () => new Date().toISOString();
  const id = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const form = document.querySelector('form[data-form-id]');
  let consent = read(consentKey);
  const visitorId = consent.consent_analytics === 'granted' ? read('pz_stage4_visitor').id || id() : '';
  if(visitorId) save('pz_stage4_visitor',{id:visitorId});
  const current = Object.fromEntries(params.map(k => [k, query.get(k) || '']));
  const incoming = params.some(k => current[k]);
  let touch = read('pz_attribution_stage4');
  const sameSiteReferrer = document.referrer && (() => { try { return new URL(document.referrer).host === location.host; } catch { return false; } })();
  const visit = { ...current, page_url: location.href, referrer: document.referrer, timestamp: now() };
  if (!touch.first) touch.first = visit;
  if (incoming || !touch.last || !sameSiteReferrer) touch.last = visit;
  if (consent.consent_analytics === 'granted') save('pz_attribution_stage4', touch);
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: consent.consent_analytics || 'denied', ad_storage: consent.consent_ads || 'denied',
    ad_user_data: consent.consent_ads || 'denied', ad_personalization: consent.consent_ads || 'denied',
  });
  const emit = (event, values = {}) => window.dataLayer.push({
    event, event_name: event, timestamp: now(), event_timestamp: now(), schema_version: version,
    source_system: 'website', page_url: location.href, page_path: location.pathname, page_title: document.title,
    page_type: cfg.page_type, page_name: cfg.page_name, source_page: location.pathname,
    service_type: cfg.service_type, requested_action: cfg.requested_action, customer_type: cfg.customer_type,
    ...Object.fromEntries(params.map(k => [k, current[k] || touch.last?.[k] || ''])), ...values,
  });
  const hidden = (name, value) => {
    let field = form.querySelector(`[name="${name}"]`);
    if (!field) { field = document.createElement('input'); field.type = 'hidden'; field.name = name; form.append(field); }
    field.value = value ?? '';
  };
  const meta = () => {
    const eventId = form.dataset.eventId || (form.dataset.eventId = id());
    return {
      ...cfg, schema_version: version, event_id: eventId, event_name: 'lead_submit', source_system: 'website',
      timestamp: now(), sent_at: now(), page_url: location.href, page_path: location.pathname, page_title: document.title,
      source_page: location.pathname, form_id: form.dataset.formId, form_name: cfg.form_name,
      lead_type: cfg.requested_action, lead_source_block: formLocation, visitor_id: visitorId,
      form_location: formLocation, cta_location: form.dataset.ctaLocation || formLocation, cta_text: cfg.cta_text,
      referrer: document.referrer, ...Object.fromEntries(params.map(k => [k, current[k] || touch.last?.[k] || ''])),
      first_touch_json: JSON.stringify(touch.first), last_touch_json: JSON.stringify(touch.last),
      utm_first_json: JSON.stringify(touch.first), utm_last_json: JSON.stringify(touch.last),
      ...Object.fromEntries(['first','last'].flatMap(kind => params.map(k => [`${kind}_${k}`,touch[kind]?.[k] || '']))),
      first_landing_page: touch.first?.page_url || '', last_landing_page: touch.last?.page_url || '',
      first_referrer: touch.first?.referrer || '', last_referrer: touch.last?.referrer || '',
      consent_analytics: consent.consent_analytics || 'denied', consent_ads: consent.consent_ads || 'denied',
      consent_marketing: consent.consent_marketing || 'denied', consent_timestamp: consent.consent_timestamp || '',
      consent_version: consent.consent_version || version, platform: navigator.platform || '',
      device_type: innerWidth <= 520 ? 'mobile' : innerWidth <= 820 ? 'tablet' : 'desktop',
      ga_client_id: form.querySelector('[name=ga_client_id]')?.value || '',
      ga_session_id: form.querySelector('[name=ga_session_id]')?.value || '',
      ga_session_number: form.querySelector('[name=ga_session_number]')?.value || '',
      browser_language: navigator.language || '', screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };
  const formEvent = () => ({event_id: form.dataset.eventId, form_id: form.dataset.formId, form_name: cfg.form_name, form_location: formLocation, cta_location: form.dataset.ctaLocation || formLocation, cta_text: cfg.cta_text});
  const enrich = () => Object.entries(meta()).forEach(([k,v]) => hidden(k,v));
  form.dataset.formName = cfg.form_name;
  form.dataset.formLocation = formLocation;
  const objectSelect=form.querySelector('select[name=object_type]');
  if(objectSelect) {
    const label=document.createElement('label');label.hidden=true;label.textContent='Укажите тип объекта';
    const input=document.createElement('input');input.name='object_type_detail';input.placeholder='Например, медицинский центр';label.append(input);objectSelect.closest('label').after(label);
    objectSelect.addEventListener('change',()=>{const other=/друг/i.test(objectSelect.value);label.hidden=!other;input.required=other;input.disabled=!other;if(!other)input.value='';});input.disabled=true;
  }
  enrich();
  if (consent.consent_analytics === 'granted') {
    window.gtag('get','G-K3055R6Y7X','client_id',value => { if(value) hidden('ga_client_id',value); });
    window.gtag('get','G-K3055R6Y7X','session_id',value => { if(value) hidden('ga_session_id',value); });
  }
  document.querySelectorAll('a[href],button[type=submit]').forEach(cta => {
    if (!cta.matches('.btn,.pz-btn,[data-phone],[data-wa],button[type=submit]')) return;
    cta.dataset.ctaLocation ||= cta.closest('.hero,.pz-hero') ? 'hero' : cta.closest('.final,.pz-final') ? 'final_cta' : 'page';
    cta.dataset.requestedAction ||= cfg.requested_action;
  });
  document.addEventListener('click', event => {
    const cta = event.target.closest('[data-cta-location]');
    const link = event.target.closest('a[href]');
    const data = {cta_location: cta?.dataset.ctaLocation || 'page', cta_text: (cta || link)?.textContent.trim() || '', requested_action: cta?.dataset.requestedAction || cfg.requested_action};
    if (cta) emit('pz_cta_click',data);
    if (link?.getAttribute('href')?.startsWith('tel:')) emit('pz_phone_click',data);
    if (link && /wa\.me|whatsapp\.com/.test(link.href)) emit('pz_whatsapp_click',data);
    if (link?.getAttribute('href') === '#lead-form') {form.dataset.ctaLocation = data.cta_location;const details=form.closest('details');if(details)details.open=true;}
    if (link?.hasAttribute('download')) emit('pz_document_download',data);
  });
  form.addEventListener('focusin', () => { if (!form.dataset.started) { form.dataset.started='1'; emit('pz_form_start',formEvent()); } });
  let invalidQueued = false;
  form.addEventListener('invalid',event => {
    if(invalidQueued) return;
    invalidQueued=true;
    emit('pz_form_error',{...formEvent(),reason:'validation',field:event.target.name});
    setTimeout(()=>{invalidQueued=false;},0);
  },true);
  form.addEventListener('submit',async event => {
    event.preventDefault();
    if(form.dataset.sending || !form.reportValidity()) return;
    enrich();
    const data = new FormData(form);
    if(objectSelect && /друг/i.test(objectSelect.value)) data.set('object_type',form.querySelector('[name=object_type_detail]').value.trim());
    const checked = form.querySelector('[name=consent]').checked;
    if(!checked) return;
    data.set('consent','true');
    const button=form.querySelector('[type=submit]'), status=form.querySelector('[data-form-status]');
    form.dataset.sending='1'; button.disabled=true; status.textContent='Отправляем заявку…';
    emit('pz_form_submit',formEvent());
    try {
      const response=await fetch('/api/lead',{method:'POST',body:data});
      const result=await response.json();
      if(!response.ok || result.accepted!==true || !result.lead_id) throw new Error('Не удалось отправить заявку. Попробуйте ещё раз или свяжитесь с нами по телефону.');
      emit('pz_form_success',{...formEvent(),lead_id:String(result.lead_id)});
      status.textContent='Заявка принята. Мы свяжемся с вами по указанному телефону.';
      form.reset();
      if(objectSelect) objectSelect.dispatchEvent(new Event('change'));
      delete form.dataset.started; delete form.dataset.eventId;
      document.querySelectorAll('[data-checks] input:checked,[data-pz-checklist] input:checked').forEach(x=>{x.checked=false;});
      checklistStep=0;checklistFinished=false;
      refreshSelection(); enrich();
    } catch(error) {
      status.textContent=error.message;
      emit('pz_form_error',{...formEvent(),reason:'submission'});
    } finally { delete form.dataset.sending;button.disabled=false; }
  });
  form.querySelectorAll('input[type=tel]').forEach(input=>input.addEventListener('input',()=>{
    let digits=input.value.replace(/\D/g,'');if(digits.startsWith('8'))digits='7'+digits.slice(1);if(!digits.startsWith('7'))digits='7'+digits;
    input.value='+'+digits.slice(0,11);
  }));
  let selectionStarted=false;
  let checklistStep=0,checklistFinished=false;
  const checklistBox=document.querySelector('[data-pz-checklist]');
  let checklistProgress,checklistPrevious,checklistNext;
  if(checklistBox) {
    checklistBox.classList.add('is-wizard');
    checklistProgress=document.createElement('p');checklistProgress.className='checklist-progress';checklistProgress.setAttribute('aria-live','polite');checklistBox.prepend(checklistProgress);
    const navigation=document.createElement('div');navigation.className='checklist-navigation';
    checklistPrevious=document.createElement('button');checklistPrevious.type='button';checklistPrevious.textContent='Назад';
    checklistNext=document.createElement('button');checklistNext.type='button';
    navigation.append(checklistPrevious,checklistNext);checklistBox.querySelector('[data-audit-plan]').before(navigation);
    checklistPrevious.onclick=()=>{if(checklistFinished){checklistFinished=false;}else{checklistStep=Math.max(0,checklistStep-1);}refreshSelection();};
    checklistNext.onclick=()=>{
      const groups=[...checklistBox.querySelectorAll('fieldset')];
      if(checklistStep===groups.length-1)checklistFinished=true;else checklistStep++;
      refreshSelection();emit('pz_checklist_step',{step:checklistStep+1,completed:checklistFinished});
    };
  }
  function refreshSelection() {
    const box=document.querySelector('[data-checks]');
    if(box) {
      const selected=[...box.querySelectorAll('input:checked')].map(x=>x.parentElement.textContent.trim());
      hidden('selected_topics',JSON.stringify(selected));
      const answers=[...box.querySelectorAll('input[type=checkbox]')].map(x=>({statement:x.parentElement.textContent.trim(),answer:x.checked?'yes':'no'}));
      hidden('interactive_answers',JSON.stringify(answers));
      const target=document.querySelector('[data-result]');
      const danger=cfg.page_type==='emergency' && selected.some(x=>/дым|огонь|признаки пожара|«Пожар»/.test(x));
      target.replaceChildren();
      if(danger) {
        target.textContent='Есть признак возможного пожара. Действуйте по инструкции объекта и плану эвакуации. Сообщите о пожаре по номеру 101 или 112. Подготовка заявки не должна задерживать эти действия.';
      } else {
        const text=document.createElement('p');text.textContent='После отправки заявки специалист рассмотрит сведения, уточнит задачу и согласует дальнейшие действия.';
        target.append(text);
        if(!box.closest('.request-card')){const link=document.createElement('a');link.href='#lead-form';link.className='source';link.textContent='Перейти к оформлению заявки →';target.append(link);}
      }
    }
    const checklist=document.querySelector('[data-pz-checklist]');
    if(checklist) {
      const groups=[...checklist.querySelectorAll('fieldset')];
      groups.forEach((group,index)=>{group.hidden=checklistFinished||index!==checklistStep;});
      checklistProgress.textContent=checklistFinished?'Чек-лист заполнен':`Вопрос ${checklistStep+1} из ${groups.length}`;
      checklistPrevious.hidden=!checklistFinished&&checklistStep===0;
      checklistNext.hidden=checklistFinished;
      checklistNext.textContent=checklistStep===groups.length-1?'Показать итог':'Далее →';
      checklistNext.disabled=false;
      checklist.querySelector('[data-audit-plan]').hidden=!checklistFinished;
      checklist.querySelector('a[href="#lead-form"]').hidden=!checklistFinished;
      const answers=groups.map(group=>({topic:group.querySelector('p').textContent,value:group.querySelector('input').checked?'yes':'no'}));
      hidden('checklist_answers',JSON.stringify(answers));
      const result=checklist.querySelector('[data-audit-plan]');result.replaceChildren();
      const answered=checklistFinished?groups.length:checklistStep;
      const p=document.createElement('p');p.textContent='Сведения подготовлены для аудитора. Для их направления заполните контактные данные и отправьте заявку. Оценка соответствия объекта выполняется при аудите.';result.append(p);
      const list=document.createElement('ul');
      answers.forEach(x=>{const li=document.createElement('li');li.textContent=`${x.topic} — ${x.value==='yes'?'Да':'Нет'}`;list.append(li);});result.append(list);
      if(answered===groups.length && !selectionStarted){selectionStarted=true;emit('pz_checklist_complete',{answered_count:answered});}
    }
    const summary=form.querySelector('[data-selection-summary]');
    const selected=JSON.parse(form.querySelector('[name=selected_topics]')?.value || '[]');
    const answered=checklist ? (checklistFinished?checklist.querySelectorAll('fieldset').length:checklistStep) : 0;
    summary.textContent=box?.dataset.touched || answered ? 'Сведения из чек-листа будут направлены вместе с заявкой.' : '';
  }
  refreshSelection();
  document.querySelectorAll('[data-checks],[data-pz-checklist]').forEach(box=>box.addEventListener('change',()=>{box.dataset.touched='1';refreshSelection();emit('pz_checklist_update',{selected_count:box.querySelectorAll('input:checked').length});}));
  function showConsent() {
    if(document.querySelector('[data-stage4-consent]'))return;
    const bar=document.createElement('aside');bar.dataset.stage4Consent='';bar.setAttribute('aria-label','Настройки cookies');
    bar.innerHTML='<b>Настройки cookies</b><p>Аналитика и реклама включаются с вашего согласия. Для отправки заявки они не требуются.</p><button type="button" data-consent-all>Принять все</button> <button type="button" data-consent-min>Только необходимые</button> <a href="/privacy/">Подробнее</a>';
    const apply=granted=>{
      const value=granted?'granted':'denied';
      consent={consent_analytics:value,consent_ads:value,consent_marketing:value,consent_timestamp:now(),consent_version:version};save(consentKey,consent);
      window.gtag('consent','update',{analytics_storage:value,ad_storage:value,ad_user_data:value,ad_personalization:value});
      if(granted)save('pz_attribution_stage4',touch);enrich();bar.remove();emit('pz_consent_update',{consent_analytics:value,consent_ads:value});
    };
    bar.querySelector('[data-consent-all]').onclick=()=>apply(true);bar.querySelector('[data-consent-min]').onclick=()=>apply(false);document.body.append(bar);
  }
  if(!consent.consent_timestamp)showConsent();
  const settings=document.createElement('button');settings.type='button';settings.className='pz-consent-settings';settings.textContent='Cookies';settings.onclick=showConsent;document.body.append(settings);
  document.querySelectorAll('[data-policy]').forEach(button=>button.addEventListener('click',()=>{location.href='/privacy/';}));
  window.PZStage4={emit,refreshSelection};
})();
