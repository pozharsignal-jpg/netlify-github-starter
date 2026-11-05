/* Stage 7 contract 2026-11-04. Install ONCE through existing GTM-WVGQ5BZ4.
   No second analytics SDK or consent banner. Legacy handlers must exclude
   [data-pz-event-owner="stage7"]. Production transport requires the matching
   server receipt adapter in backend/. Preview never sends requests. */
(function () {
  'use strict';
  if (window.PZ_STAGE7) return;
  var VERSION = 'stage7-2026-11-04';
  var ENDPOINT = 'https://tilda-webhook-to-bigquery-324633937237.europe-west3.run.app';
  var PREVIEW = document.documentElement.getAttribute('data-pz-preview') === 'true';
  var started = Date.now(), maxScroll = 0, confirmed = Object.create(null), emitted = Object.create(null);
  var utms = ['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term'];
  var clicks = ['gclid','gbraid','wbraid','dclid','fbclid','yclid','gad_source'];
  var actions = ['calculate','engineer_visit','audit_booking','contact_request','document_download','service_information'];
  var events = ['pz_cta_click','pz_phone_click','pz_whatsapp_click','pz_form_start','pz_form_submit','pz_form_error','pz_form_success','pz_package_select'];
  function uuid() { return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var n=crypto.getRandomValues(new Uint8Array(1))[0]%16;return(c==='x'?n:(n&3)|8).toString(16);}); }
  function consent() {
    var out={consent_analytics:'denied',consent_ads:'denied',consent_marketing:'denied',consent_timestamp:'',consent_version:''};
    (window.dataLayer||[]).forEach(function(item){
      if(!item || typeof item!=='object')return;
      ['consent_analytics','consent_ads','consent_marketing'].forEach(function(k){if(item[k]==='granted'||item[k]==='denied')out[k]=item[k];});
      ['consent_timestamp','consent_version'].forEach(function(k){if(typeof item[k]==='string')out[k]=item[k].slice(0,100);});
    });return out;
  }
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
  function remove(key){try{localStorage.removeItem(key);}catch(_){}}
  function cleanUrl(value,ads){if(!value)return '';try{var u=new URL(value,location.href);if(!/^https?:$/.test(u.protocol))return '';if(!ads)clicks.forEach(function(k){u.searchParams.delete(k);});return u.href;}catch(_){return '';}}
  function currentTouch(state){var query=new URLSearchParams(location.search),out={landing_page:cleanUrl(location.href,state.consent_ads==='granted'),referrer:cleanUrl(document.referrer||'',state.consent_ads==='granted'),captured_at:new Date().toISOString()};
    utms.concat(['search_term']).forEach(function(k){out[k]=(query.get(k)||'').slice(0,512);});
    clicks.forEach(function(k){out[k]=state.consent_ads==='granted'?(query.get(k)||'').slice(0,512):'';});return out;}
  function touches(state){var now=currentTouch(state),first=now,last=now;
    if(state.consent_analytics!=='granted'){['pz_stage7_first_touch','pz_stage7_last_touch','pz_stage7_visitor'].forEach(remove);return{first:first,last:last,current:now};}
    first=read('pz_stage7_first_touch')||now;var previous=read('pz_stage7_last_touch');
    var internal=false;try{internal=!!document.referrer && new URL(document.referrer).hostname===location.hostname;}catch(_){}
    var tagged=utms.concat(clicks).some(function(k){return !!now[k];});
    last=previous && (internal||!tagged && !document.referrer)?previous:now;
    if(state.consent_ads!=='granted'){[first,last].forEach(function(t){clicks.forEach(function(k){delete t[k];});t.landing_page=cleanUrl(t.landing_page,false);t.referrer=cleanUrl(t.referrer,false);});}
    write('pz_stage7_first_touch',first);write('pz_stage7_last_touch',last);return{first:first,last:last,current:now};
  }
  function field(form,name,value){var x=form.elements.namedItem(name);if(!x){x=document.createElement('input');x.type='hidden';x.name=name;form.appendChild(x);}x.value=String(value==null?'':value);}
  function analyticsAllowed(){return !PREVIEW && consent().consent_analytics==='granted';}
  function track(name,data){
    if(!analyticsAllowed()||events.indexOf(name)<0)return false;
    if(name==='pz_form_success' && (!data || !confirmed[data.event_id] || (confirmed[data.event_id].stream!=='commercial'||confirmed[data.event_id].analytics!=='granted')))return false;
    if(name==='pz_form_success' && emitted[data.event_id])return false;
    var allowed=['event_id','event_timestamp','page_type','page_name','page_path','service_type','customer_type','form_id','form_name','form_location','requested_action','cta_location','cta_text','error_type','stream'];
    var out={event:name};allowed.forEach(function(k){if(data && data[k]!=null)out[k]=String(data[k]).slice(0,200);});
    out.event_id=out.event_id||uuid();out.event_timestamp=out.event_timestamp||new Date().toISOString();
    Object.assign(out,consent());window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(out);
    if(name==='pz_form_success'){emitted[data.event_id]=true;window.dataLayer.push(Object.assign({},out,{event:'generate_lead'}));}
    return true;
  }
  function gaGet(name){return new Promise(function(resolve){
    if(!analyticsAllowed() || typeof window.gtag!=='function')return resolve('');
    var settled=false,t=setTimeout(function(){if(!settled){settled=true;resolve('');}},1500);
    try{window.gtag('get','G-K3055R6Y7X',name,function(v){if(!settled){settled=true;clearTimeout(t);resolve(analyticsAllowed()?String(v||''):'');}});}catch(_){clearTimeout(t);resolve('');}
  });}
  async function enrichForm(form,config){
    var state=consent(),t=touches(state),now=new Date().toISOString();Object.keys(state).forEach(function(k){field(form,k,state[k]);});
    field(form,'source_system','tilda');field(form,'schema_version','2.1');field(form,'submission_contract',VERSION);field(form,'stream','commercial');
    field(form,'payload_type','lead');field(form,'event_name','lead_created');field(form,'source','website');field(form,'lead_source','website');field(form,'sent_at',now);
    ['page_name','page_type','service_type','customer_type'].forEach(function(k){field(form,k,config[k]|| (k==='customer_type'?'new':'service'));});
    field(form,'source_page',config.page_name);field(form,'page_url',cleanUrl(location.href,state.consent_ads==='granted'));field(form,'page_path',location.pathname);field(form,'page_title',document.title);
    field(form,'form_id',form.dataset.formId);field(form,'form_name',form.dataset.formName);field(form,'form_location',form.dataset.formLocation);
    field(form,'requested_action',form.dataset.requestedAction);field(form,'cta_location',form.dataset.formLocation);field(form,'cta_text',form.querySelector('[type=submit]').textContent.trim());
    utms.concat(clicks).forEach(function(k){field(form,k,t.current[k]||(!document.referrer?t.last[k]:'')||'');field(form,'first_'+k,t.first[k]||'');field(form,'last_'+k,t.last[k]||'');});
    field(form,'search_term',t.current.search_term||t.last.search_term||'');
    ['first','last'].forEach(function(k){field(form,k+'_landing_page',t[k].landing_page||'');field(form,k+'_referrer',t[k].referrer||'');field(form,k+'_visit_at',t[k].captured_at||'');});
    field(form,'landing_page',t.first.landing_page||'');field(form,'referrer',cleanUrl(document.referrer||'',state.consent_ads==='granted'));
    field(form,'utm_first',JSON.stringify(t.first));field(form,'utm_last',JSON.stringify(t.last));
    var ga=state.consent_analytics==='granted'?await Promise.all([gaGet('client_id'),gaGet('session_id'),gaGet('session_number')]):['','',''];
    if(!analyticsAllowed())ga=['','',''];
    if(state.consent_analytics==='granted'&&analyticsAllowed()){
      var visitor=read('pz_stage7_visitor')||uuid();write('pz_stage7_visitor',visitor);field(form,'visitor_id',visitor);
      if(!ga[0]){var match=(document.cookie||'').match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)/);ga[0]=match?match[1]:'';}
    }else field(form,'visitor_id','');
    field(form,'ga_client_id',ga[0]);field(form,'ga_session_id',ga[1]);field(form,'ga_session_number',ga[2]);
    // A consent change while waiting for Google IDs is reflected in the submission.
    var latest=consent();Object.keys(latest).forEach(function(k){field(form,k,latest[k]);});
    if(latest.consent_ads!=='granted'){clicks.forEach(function(k){field(form,k,'');field(form,'first_'+k,'');field(form,'last_'+k,'');});
      ['page_url','first_landing_page','last_landing_page','landing_page','referrer','first_referrer','last_referrer'].forEach(function(k){var el=form.elements.namedItem(k);if(el)field(form,k,cleanUrl(el.value,false));});
      ['utm_first','utm_last'].forEach(function(k){var el=form.elements.namedItem(k);if(!el)return;try{var v=JSON.parse(el.value);clicks.forEach(function(c){delete v[c];});v.landing_page=cleanUrl(v.landing_page,false);v.referrer=cleanUrl(v.referrer,false);field(form,k,JSON.stringify(v));}catch(_){field(form,k,'');}});
    }
    field(form,'time_on_page_seconds',Math.round((Date.now()-started)/1000));field(form,'max_scroll_percent',maxScroll);
    field(form,'device_type',innerWidth<768?'mobile':innerWidth<1024?'tablet':'desktop');field(form,'platform',navigator.platform||'');
    var ua=navigator.userAgent||'';field(form,'os',/Windows/i.test(ua)?'Windows':/Android/i.test(ua)?'Android':/iPhone|iPad/i.test(ua)?'iOS':/Mac/i.test(ua)?'macOS':'other');
    field(form,'browser',/Edg\//.test(ua)?'Edge':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'other');
    field(form,'screen_resolution',screen.width+'x'+screen.height);field(form,'browser_language',navigator.language||'');field(form,'timezone',Intl.DateTimeFormat().resolvedOptions().timeZone||'');
  }
  async function digest(parameters){var pairs=[];parameters.forEach(function(v,k){if(k!=='snapshot_id')pairs.push([k,String(v)]);});pairs.sort(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0;});
    var hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(pairs)));return Array.from(new Uint8Array(hash)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');}
  async function snapshot(fd){var params=new URLSearchParams();fd.forEach(function(v,k){if(typeof v==='string' && ['service','entry_page','entry_path'].indexOf(k)<0)params.set(k,v);});
    if(params.get('stream')!=='commercial' || params.get('source_system')!=='tilda' || !params.get('event_id') || !params.get('name')?.trim() || !params.get('phone') || params.get('consent_personal_data')!=='granted')throw new Error('Invalid commercial submission');
    var id=await digest(params);params.set('snapshot_id',id);return Object.freeze({event_id:params.get('event_id'),snapshot_id:id,stream:'commercial',body:params.toString(),consent_analytics:params.get('consent_analytics')});
  }
  async function submitSnapshot(snap,context){
    if(PREVIEW)throw Object.assign(new Error('Preview never sends leads'),{kind:'preview'});
    var frozen=new URLSearchParams(snap.body),currentState=consent();
    if(['consent_analytics','consent_ads','consent_marketing'].some(function(k){return frozen.get(k)==='granted'&&currentState[k]!=='granted';}))throw Object.assign(new Error('Consent changed; frozen request not retransmitted'),{kind:'consent_changed'});
    var r=await fetch(ENDPOINT,{method:'POST',body:snap.body,headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},credentials:'omit',signal:context&&context.signal});
    var data;try{data=await r.json();}catch(_){throw Object.assign(new Error('Invalid response'),{kind:'unconfirmed'});}
    var receipt=data.receipt;
    if(!r.ok || data.ok!==true || !receipt || typeof receipt.receipt_id!=='string' || !receipt.receipt_id || receipt.event_id!==snap.event_id || receipt.snapshot_id!==snap.snapshot_id || receipt.source_system!=='tilda' || receipt.stream!=='commercial')throw Object.assign(new Error('Matched receipt missing'),{kind:r.status===503?'not_connected':'unconfirmed'});
    if(receipt.crm_status!=='confirmed' || !/^[1-9]\d*$/.test(String(receipt.deal_id||''))){return{status:'pending',receipt_id:receipt.receipt_id||''};}
    confirmed[snap.event_id]={stream:'commercial',snapshot_id:snap.snapshot_id,analytics:snap.consent_analytics};return{success:true,request_id:String(receipt.deal_id),receipt_id:receipt.receipt_id};
  }
  function qualificationComment(root,choice,comment){
    var lines=[],hasTask=false;
    root.querySelectorAll('[data-qualifier]').forEach(function(input){
      var value=String(input.value||'').trim();if(!value)return;
      if(input.tagName==='SELECT' && input.options && input.selectedIndex>=0)value=input.options[input.selectedIndex].textContent.trim();
      var label=input.getAttribute('data-qualifier-label')||input.dataset.qualifier;
      if(input.dataset.qualifier==='current_situation')hasTask=true;
      lines.push(label+': '+value.slice(0,300));
    });
    if(choice&&!hasTask)lines.unshift('Выбранная задача: '+choice);
    return [String(comment||'').trim(),lines.length?'Сведения для расчёта:\n'+lines.join('\n'):''].filter(Boolean).join('\n\n');
  }
  function mount(config){
    var root=document.getElementById(config.root_id);if(!root||root.dataset.pzInitialized)return;root.dataset.pzInitialized=VERSION;
    var base={page_type:'service',page_name:config.page_name,page_path:config.page_path,service_type:config.service_type,customer_type:'new',stream:'commercial'};
    var choice='',selector=root.querySelector('[data-solution]'),result=root.querySelector('[data-result]');
    function choose(value,explicit){if(!selector)return;selector.value=value;var option=selector.options[selector.selectedIndex];choice=explicit && value!=='' && option?option.textContent.trim():'';
      if(result)result.textContent=choice?'Выбрано: '+choice+'. Специалист уточнит исходные данные и предложит дальнейшие действия.':'Можно выбрать задачу или обсудить её со специалистом после заявки.';
      root.querySelectorAll('[data-selected-choice]').forEach(function(x){x.hidden=!choice;x.textContent=choice?'Вы выбрали: '+choice+'. Уточним объём при разговоре.':'';});
      root.querySelectorAll('form').forEach(function(f){field(f,'selected_solution',choice);});}
    if(selector){var empty=document.createElement('option');empty.value='';empty.textContent='Уточним задачу с инженером';if(!selector.options.length||selector.options[0].value!=='')selector.insertBefore(empty,selector.firstChild);choose('',false);selector.addEventListener('change',function(){choose(selector.value,true);track('pz_package_select',Object.assign({},base,{cta_location:'calculator',requested_action:config.requested_action}));});}
    root.querySelectorAll('[data-select-solution]').forEach(function(button){button.addEventListener('click',function(){choose(button.dataset.selectSolution,true);track('pz_package_select',Object.assign({},base,{cta_location:'after_proof',requested_action:config.requested_action}));root.querySelector('#request').scrollIntoView({behavior:'smooth'});});});
    root.querySelectorAll('[data-qualifier]').forEach(function(input){input.addEventListener('change',function(){var output=root.querySelector('[data-qualifier-result]');if(output)output.textContent='Специалист получит только указанные вами сведения. Они помогут подготовиться к разговору; стоимость подтвердим в коммерческом предложении.';});});
    root.querySelectorAll('a[data-pz-wa]').forEach(function(a){var code=a.dataset.pzWa,question='Здравствуйте! Интересует '+config.title.toLowerCase()+'. ['+code+']';a.href='https://wa.me/77711934976?text='+encodeURIComponent(question);});
    root.querySelectorAll('a[data-cta-location]').forEach(function(a){a.addEventListener('click',function(){var name=a.hasAttribute('data-phone')?'pz_phone_click':a.hasAttribute('data-wa')?'pz_whatsapp_click':'pz_cta_click';track(name,Object.assign({},base,{cta_location:a.dataset.ctaLocation,cta_text:a.textContent.trim(),requested_action:a.dataset.requestedAction}));});});
    root.querySelectorAll('input[name=phone]').forEach(function(input){input.addEventListener('input',function(){var raw=input.value.replace(/\D/g,'');if(!raw){input.value='';return;}if(raw[0]==='8')raw='7'+raw.slice(1);if(raw[0]!=='7')raw='7'+raw;raw=raw.slice(0,11);var v='+7';if(raw.length>1)v+=' ('+raw.slice(1,4);if(raw.length>=4)v+=')';if(raw.length>4)v+=' '+raw.slice(4,7);if(raw.length>7)v+='-'+raw.slice(7,9);if(raw.length>9)v+='-'+raw.slice(9);input.value=v;});});
    root.querySelectorAll('[data-requires-stage7]').forEach(function(button){button.disabled=false;});
    root.querySelectorAll('form').forEach(function(form){var busy=false,startedForm=false,saved=null,fingerprint='',uncertain=false;
      function info(){return Object.assign({},base,{event_id:saved?saved.event_id:form.dataset.pendingEventId||'',form_id:form.dataset.formId,form_name:form.dataset.formName,form_location:form.dataset.formLocation,requested_action:form.dataset.requestedAction,cta_location:form.dataset.formLocation,cta_text:form.querySelector('[type=submit]').textContent.trim()});}
      form.addEventListener('input',function(){form.elements.namedItem('name').setCustomValidity('');if(!startedForm){form.dataset.pendingEventId=uuid();startedForm=true;track('pz_form_start',info());}});
      form.addEventListener('submit',async function(event){event.preventDefault();if(busy)return;
        var ok=form.querySelector('.pz-success'),err=form.querySelector('.pz-error'),fallback=form.querySelector('.pz-fallback'),button=form.querySelector('[type=submit]');ok.style.display='none';err.style.display='none';fallback.hidden=true;
        var name=form.elements.namedItem('name');name.setCustomValidity(name.value.trim()?'':'Укажите имя.');
        if(!form.reportValidity()){err.textContent='Укажите имя, телефон и согласие на обработку заявки.';err.style.display='block';return;}
        if(PREVIEW){err.textContent='Предпросмотр: заявка не отправлена. Проверка имени, телефона и согласия выполнена.';err.style.display='block';return;}
        var values=[form.elements.namedItem('name').value,form.elements.namedItem('phone').value,form.elements.namedItem('comment').value,choice];
        root.querySelectorAll('[data-qualifier]').forEach(function(input){values.push(input.value||'');});var nextFingerprint=JSON.stringify(values);
        if(uncertain && fingerprint!==nextFingerprint){err.textContent='Результат предыдущей отправки пока не подтверждён. Не создавайте новую заявку до проверки — свяжитесь с нами по телефону или WhatsApp.';err.style.display='block';fallback.hidden=false;return;}
        busy=true;button.disabled=true;form.setAttribute('aria-busy','true');var controller=new AbortController(),timer;
        try{
          if(!saved){field(form,'event_id',form.dataset.pendingEventId||uuid());field(form,'event_timestamp',new Date().toISOString());field(form,'selected_solution',choice);
            root.querySelectorAll('[data-qualifier]').forEach(function(input){field(form,input.dataset.qualifier,input.value||'');});
            await enrichForm(form,config);var payload=new FormData(form);payload.set('comment',qualificationComment(root,choice,form.elements.namedItem('comment').value));saved=await snapshot(payload);fingerprint=nextFingerprint;
          }
          track('pz_form_submit',info());timer=setTimeout(function(){controller.abort();},20000);
          var response=await submitSnapshot(saved,{signal:controller.signal});
          if(response.status==='pending'){uncertain=true;err.textContent='Запрос зарегистрирован, но создание обращения в CRM ещё не подтверждено. Не отправляйте новую заявку; уточните статус по телефону.';err.style.display='block';return;}
          track('pz_form_success',info());ok.textContent='Заявка принята. Мы свяжемся с вами в течение 30 минут в рабочее время: пн–пт 09:00–18:00. Обращение вне рабочего времени обработаем в следующий рабочий период.';ok.style.display='block';form.reset();saved=null;fingerprint='';uncertain=false;startedForm=false;form.dataset.pendingEventId='';
        }catch(error){uncertain=!!saved;var kind=error.kind|| (error.name==='AbortError'?'timeout':'delivery');track('pz_form_error',Object.assign(info(),{error_type:kind}));
          err.textContent=kind==='not_connected'?'Онлайн-приём этой версии ещё не подключён. Заявка не подтверждена; позвоните или напишите в WhatsApp.':'Подтверждение приёма не получено. Введённые данные остаются в этой форме; повторная отправка тех же данных использует прежний ID. Для проверки статуса свяжитесь с нами.';err.style.display='block';fallback.hidden=false;
        }finally{clearTimeout(timer);busy=false;button.disabled=false;form.removeAttribute('aria-busy');}
      });
    });
  }
  document.addEventListener('scroll',function(){var total=document.documentElement.scrollHeight-innerHeight;maxScroll=Math.max(maxScroll,total>0?Math.min(100,Math.round(scrollY/total*100)):100);},{passive:true});
  window.PZ_STAGE7={version:VERSION,mount:mount,track:track,enrichForm:enrichForm,snapshot:snapshot,submitSnapshot:submitSnapshot,qualificationComment:qualificationComment};
  (window.PZ_STAGE7_QUEUE||[]).forEach(mount);window.PZ_STAGE7_QUEUE=[];
})();
