(() => {
  const root = document.getElementById('pz-ognetushiteli-page');
  if (!root) return;
  const calculator = location.pathname.includes('/kalkulyatory/ognetushiteli');
  const objectOptions = '<option value="">Выберите тип объекта</option><option>Офис / бизнес-центр</option><option>Ресторан / магазин</option><option>Складское помещение</option><option>Производство / завод</option><option>Государственный объект</option><option>Другое</option>';
  // Public competitor prices, increased by 5% (coefficient 1.05) on 16 September 2026.
  // The calculator shows an orientation only; delivery and non-standard work are quoted separately.
  const prices = {
    recharge: {
      'ОП-1': 1145, 'ОП-2': 1478, 'ОП-3': 2135, 'ОП-4': 2310, 'ОП-5': 2436,
      'ОП-6': 3481, 'ОП-8': 3812, 'ОП-10': 4893, 'ОП-25': 12075,
      'ОП-35': 22717, 'ОП-50': 30020, 'ОП-80': 43271,
      'ОУ-2': 2636, 'ОУ-3': 3292, 'ОУ-5': 5927, 'ОУ-7': 8033,
      'ОУ-10': 10642, 'ОУ-20': 21068, 'ОУ-25': 23701, 'ОУ-40': 44234, 'ОУ-80': 66628
    },
    supply: {
      'ОП-2': 4725, 'ОП-5': 6300, 'ОП-8': 8400, 'ОП-10': 9975,
      'ОП-35 (50), на тележке': 40740, 'ОП-100, на тележке': 99005,
      'ОУ-2': 10395, 'ОУ-3': 13335, 'ОУ-5': 17325, 'ОУ-10': 39480,
      'ОУ-15 (20)': 54600, 'ОУ-25 (40)': 78750, 'ОУ-55 (80)': 208950,
      'ОВП-4': 23100, 'ОВП-8': 33600, 'ОВП-10': 39900
    }
  };
  const repairs = [
    ['Замена чеки', 95], ['Замена манометра ОП', 550], ['Замена ЗПУ ОП-2–10', 1705],
    ['Замена ЗПУ ОП-25–100', 4950], ['Раструб / распылитель ОП-4–10', 440],
    ['Шланг ОП-25–100', 8250], ['Выкидная трубка ОП-2–10', 275],
    ['Замена ЗПУ ОУ-2–10', 2420], ['Раструб ОУ-1–5', 1650], ['Раструб ОУ-10', 6050],
    ['Уплотнительное кольцо', 330]
  ];
  const modelOptions = mode => {
    const source = prices[mode];
    if (!source) return '<option value="">Сначала выберите услугу</option><option value="unknown">Не знаю модель — помогите определить</option>';
    return '<option value="">Выберите модель</option>' + Object.keys(source).map(model => `<option value="${model}">${model}</option>`).join('') + '<option value="unknown">Не знаю модель — помогите определить</option><option value="other">Другая модель / смешанная партия</option>';
  };
  const contact = `<form class="ex-form ex-contact"><h2>Оставить заявку или задать вопрос</h2><div class="ex-fields"><label>Имя<input required></label><label>Телефон<input required type="tel" autocomplete="tel" inputmode="tel" placeholder="+7 (7XX) XXX-XX-XX"></label><label class="ex-wide">Комментарий <span>необязательно</span><textarea></textarea></label></div><label class="ex-check"><input required type="checkbox"> Согласен на обработку данных обращения</label><button>Отправить заявку</button><p class="ex-result" hidden></p></form>`;
  const calculatorForm = `<form class="ex-form ex-calculator"><p class="ex-kicker">${calculator ? 'КАЛЬКУЛЯТОР ОГНЕТУШИТЕЛЕЙ' : 'БЫСТРЫЙ РАСЧЁТ'}</p><h2>${calculator ? 'Рассчитать стоимость огнетушителей' : 'Рассчитать стоимость партии'}</h2><p>Выберите услугу, модель и количество. Контакты понадобятся только после предварительного результата.</p><div class="ex-fields"><label>Услуга<select class="ex-service" required><option value="">Выберите</option><option value="recharge">Перезарядка</option><option value="supply">Замена и поставка нового</option><option value="mixed">Смешанный заказ</option></select></label><label class="ex-single-model">Модель огнетушителя<select class="ex-model" required>${modelOptions()}</select></label><label class="ex-single-quantity">Количество<input class="ex-quantity" required type="number" min="1" step="1"></label><label class="ex-recharge-date">Дата последней перезарядки <span>для перезарядки, если известна</span><select><option>Не знаю</option><option>Укажу дату при связи</option><option>Менее года назад</option><option>1–3 года назад</option><option>Более 3 лет назад</option></select></label><label>Состояние<select required><option value="">Выберите</option><option>Без видимых повреждений</option><option>Есть повреждения или сомнения</option><option>Требуется уточнение</option></select></label><div class="ex-mixed-fields ex-wide" hidden><h3>Смешанный заказ</h3><div class="ex-fields"><label>Модель для перезарядки<select class="ex-mixed-recharge-model" disabled required>${modelOptions('recharge')}</select></label><label>Количество для перезарядки<input class="ex-mixed-recharge-quantity" disabled required type="number" min="1" step="1"></label><label>Модель нового огнетушителя<select class="ex-mixed-supply-model" disabled required>${modelOptions('supply')}</select></label><label>Количество новых огнетушителей<input class="ex-mixed-supply-quantity" disabled required type="number" min="1" step="1"></label></div></div></div><p class="ex-note">После осмотра могут потребоваться мелкие замены: чека, манометр, раструб, ЗПУ и другие детали. Их согласуем отдельно; счёт выставим после осмотра.</p><button>Показать стоимость</button> <button class="ex-repair-open" type="button">Рассчитать мелкие работы</button><p class="ex-result" hidden></p></form>`;
  const repairModal = `<div class="ex-modal" hidden><div class="ex-modal-box" role="dialog" aria-modal="true" aria-label="Расчёт мелких работ"><button class="ex-modal-close" type="button" aria-label="Закрыть">×</button><p class="ex-kicker">ДОПОЛНИТЕЛЬНЫЕ РАБОТЫ</p><h2>Предварительный расчёт мелких работ</h2><p>Выберите нужные работы и укажите количество. Окончательную необходимость замен подтвердим после осмотра.</p><div class="ex-repairs">${repairs.map(([name, price]) => `<label class="ex-repair"><input type="checkbox" data-price="${price}"><span>${name}</span><b>${price.toLocaleString('ru-RU')} ₸</b><input class="ex-repair-qty" type="number" min="1" value="1" disabled aria-label="Количество: ${name}"></label>`).join('')}</div><button class="ex-repair-calculate" type="button">Показать предварительную стоимость</button><p class="ex-repair-result" hidden></p></div></div>`;
  const stages = `<section class="ex-pale"><div class="ex-wrap"><h2>Как проходит работа</h2><div class="ex-grid"><article><h3>1. Сбор данных</h3><p>Уточняем типы и количество огнетушителей.</p></article><article><h3>3. Согласование</h3><p>Согласуем способ передачи партии и доступ.</p></article><article><h3>4. Работы по партии</h3><p>Перезаряжаем или подбираем замену по согласованному составу.</p></article><article><h3>6. Передача результата</h3><p>Возвращаем партию или передаём новые огнетушители.</p></article></div></div></section>`;
  const serviceVariants = `<section><h2>Варианты услуги</h2><div class="ex-grid"><article><h3>Самовывоз</h3><p>Бесплатно. Доступен в рабочее время: пн–пт, 09:00–17:00.</p><a href="#ex-contact">Оставить заявку</a></article><article><h3>С доставкой</h3><p>Стоимость доставки — по тарифам сервисов Яндекс.</p><a href="#ex-contact">Уточнить доставку</a></article><article><h3>Корпоративная партия</h3><p>В черте города — бесплатно при партии от 30 шт.</p><p>За город — от 8 000 ₸; стоимость зависит от дорожной ситуации в выбранное время.</p><a href="#ex-contact">Получить счёт</a></article></div></section>`;
  const calcVariants = `<section><h2>Варианты расчёта</h2><div class="ex-grid"><article><h3>Перезарядка</h3><p>Расчёт обслуживания имеющихся огнетушителей по типу и количеству.</p></article><article><h3>Замена и поставка</h3><p>Расчёт новых или заменяемых единиц с комплектующими.</p></article><article><h3>Комплекс для объекта</h3><p>Смешанный список и единый расчёт.</p></article></div></section>`;
  root.innerHTML = `<style>#pz-ognetushiteli-page{font-family:Arial,Helvetica,sans-serif;color:#15212b}#pz-ognetushiteli-page .ex-wrap{width:min(1160px,calc(100% - 28px));margin:auto}#pz-ognetushiteli-page section{padding:52px 0}#pz-ognetushiteli-page .ex-hero{padding:72px 0;background:linear-gradient(115deg,#112d3d,#184b5d 55%,#1e596b);color:#fff}#pz-ognetushiteli-page .ex-hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:30px}#pz-ognetushiteli-page h1{font-size:47px;line-height:1.1;margin:0 0 20px}#pz-ognetushiteli-page h2{font-size:32px;margin:0 0 14px}#pz-ognetushiteli-page .ex-hero p{line-height:1.55}#pz-ognetushiteli-page .ex-form{background:#fff;color:#15212b;padding:24px;border:1px solid #dfe6e8;border-radius:18px}#pz-ognetushiteli-page .ex-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}#pz-ognetushiteli-page label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#465a66}#pz-ognetushiteli-page label span{color:#697984;font-weight:400}#pz-ognetushiteli-page input,#pz-ognetushiteli-page select,#pz-ognetushiteli-page textarea{box-sizing:border-box;width:100%;padding:12px;border:1px solid #cfd9dc;border-radius:7px;font:inherit}#pz-ognetushiteli-page textarea{min-height:82px}#pz-ognetushiteli-page .ex-wide{grid-column:1/-1}#pz-ognetushiteli-page .ex-check{margin:14px 0;display:block}#pz-ognetushiteli-page .ex-check input{width:auto}#pz-ognetushiteli-page button,#pz-ognetushiteli-page a{display:inline-block;background:#e54132;color:#fff;border:0;border-radius:8px;padding:13px 17px;text-decoration:none;font-weight:700;cursor:pointer}#pz-ognetushiteli-page .ex-repair-open{background:#fff;color:#b83228;border:1px solid #e54132}#pz-ognetushiteli-page .ex-pale{background:#f5f7f6}#pz-ognetushiteli-page .ex-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}#pz-ognetushiteli-page article{padding:22px;border:1px solid #dfe6e8;border-radius:13px;background:#fff}#pz-ognetushiteli-page .ex-kicker{color:#bd2f25;font-size:12px;font-weight:700;letter-spacing:.08em}#pz-ognetushiteli-page .ex-result,#pz-ognetushiteli-page .ex-repair-result{padding:12px;background:#f5f7f6;border-radius:7px}#pz-ognetushiteli-page .ex-modal{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:rgba(14,32,42,.62)}#pz-ognetushiteli-page .ex-modal[hidden]{display:none}#pz-ognetushiteli-page .ex-modal-box{position:relative;width:min(680px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;padding:28px}#pz-ognetushiteli-page .ex-modal-close{position:absolute;top:10px;right:12px;padding:2px 10px;background:none;color:#15212b;font-size:28px}#pz-ognetushiteli-page .ex-repairs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}#pz-ognetushiteli-page .ex-repair{display:grid;grid-template-columns:auto 1fr auto 54px;align-items:center;gap:7px;padding:10px;border:1px solid #dfe6e8;border-radius:8px}#pz-ognetushiteli-page .ex-repair input[type=checkbox]{width:auto}#pz-ognetushiteli-page .ex-repair-qty{padding:7px;width:54px}@media(min-width:821px){#pz-ognetushiteli-page .ex-pale .ex-grid{grid-template-columns:repeat(4,1fr)}}@media(max-width:820px){#pz-ognetushiteli-page .ex-hero-grid,#pz-ognetushiteli-page .ex-fields,#pz-ognetushiteli-page .ex-grid,#pz-ognetushiteli-page .ex-repairs{grid-template-columns:1fr}#pz-ognetushiteli-page h1{font-size:32px}}</style><main><section class="ex-hero"><div class="ex-wrap ex-hero-grid"><div><p>АЛМАТЫ И АЛМАТИНСКАЯ ОБЛАСТЬ</p><h1>${calculator ? 'Калькулятор стоимости огнетушителей в Алматы' : 'Перезарядка огнетушителей в Алматы'}</h1><p>${calculator ? 'Рассчитайте ориентировочную стоимость перезарядки, проверки или замены огнетушителей по типам и количеству.' : 'Соберём данные по партии огнетушителей и подготовим персональный расчёт или счёт.'}</p><p><a href="#ex-calculator">Рассчитать стоимость</a></p></div><div>${calculatorForm}</div></div></section><section><div class="ex-wrap"><h2>Что входит в расчёт</h2><p>Типы и количество огнетушителей, маркировка, дата последней перезарядки и состояние изделий. Логистику уточним после предварительного результата.</p></div></section>${stages}<section><div class="ex-wrap">${calculator ? calcVariants : serviceVariants}</div></section><section id="ex-calculator"><div class="ex-wrap">${calculatorForm}</div></section><section class="ex-pale" id="ex-contact"><div class="ex-wrap">${contact}</div></section></main>${repairModal}`;
  const hideStyle = document.createElement('style');
  hideStyle.textContent = '#pz-ognetushiteli-page [hidden]{display:none!important}';
  root.prepend(hideStyle);
  const calculatorForms = root.querySelectorAll('.ex-calculator');
  calculatorForms[0].parentElement.id = 'ex-calculator';
  calculatorForms.forEach((form, index) => { if (index > 0) form.closest('section').remove(); });
  root.querySelectorAll('.ex-calculator').forEach(form => {
    const service = form.querySelector('.ex-service');
    const model = form.querySelector('.ex-model');
    const singleModel = form.querySelector('.ex-single-model');
    const singleQuantity = form.querySelector('.ex-single-quantity');
    const rechargeDate = form.querySelector('.ex-recharge-date');
    const mixedFields = form.querySelector('.ex-mixed-fields');
    const mixedControls = mixedFields.querySelectorAll('select,input');
    service.addEventListener('change', () => {
      const isMixed = service.value === 'mixed';
      singleModel.hidden = isMixed;
      singleQuantity.hidden = isMixed;
      rechargeDate.hidden = isMixed;
      model.disabled = isMixed;
      form.querySelector('.ex-quantity').disabled = isMixed;
      mixedFields.hidden = !isMixed;
      mixedControls.forEach(control => { control.disabled = !isMixed; });
      if (!isMixed) model.innerHTML = modelOptions(service.value);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const result = form.querySelector('.ex-result');
      const selected = service.value;
      result.hidden = false;
      if (selected === 'mixed') {
        const rechargeModel = form.querySelector('.ex-mixed-recharge-model').value;
        const rechargeQuantity = Number(form.querySelector('.ex-mixed-recharge-quantity').value);
        const supplyModel = form.querySelector('.ex-mixed-supply-model').value;
        const supplyQuantity = Number(form.querySelector('.ex-mixed-supply-quantity').value);
        if (!prices.recharge[rechargeModel] || !prices.supply[supplyModel]) {
          result.textContent = 'Выберите модели для обеих частей смешанного заказа.';
          return;
        }
        const total = prices.recharge[rechargeModel] * rechargeQuantity + prices.supply[supplyModel] * supplyQuantity;
        result.innerHTML = `Предварительная стоимость: <strong>${total.toLocaleString('ru-RU')} ₸</strong>`;
        return;
      }
      const unitPrice = prices[selected] && prices[selected][model.value];
      if (!unitPrice) {
        result.textContent = 'Для этой модели или смешанной партии нужен точный расчёт. Оставьте контакт ниже — уточним состав и подготовим счёт.';
        return;
      }
      const quantity = Number(form.querySelector('.ex-quantity').value);
      const total = unitPrice * quantity;
      result.innerHTML = `Предварительная стоимость: <strong>${total.toLocaleString('ru-RU')} ₸</strong>`;
    });
  });
  const modal = root.querySelector('.ex-modal');
  root.querySelectorAll('.ex-repair-open').forEach(button => button.addEventListener('click', () => { modal.hidden = false; }));
  modal.querySelector('.ex-modal-close').addEventListener('click', () => { modal.hidden = true; });
  modal.addEventListener('click', event => { if (event.target === modal) modal.hidden = true; });
  modal.querySelectorAll('.ex-repair input[type=checkbox]').forEach(check => check.addEventListener('change', () => { check.closest('.ex-repair').querySelector('.ex-repair-qty').disabled = !check.checked; }));
  modal.querySelector('.ex-repair-calculate').addEventListener('click', () => {
    let total = 0;
    modal.querySelectorAll('.ex-repair input[type=checkbox]:checked').forEach(check => { total += Number(check.dataset.price) * Number(check.closest('.ex-repair').querySelector('.ex-repair-qty').value || 1); });
    const result = modal.querySelector('.ex-repair-result');
    result.hidden = false;
    result.textContent = total ? `Предварительная стоимость мелких работ: ${total.toLocaleString('ru-RU')} ₸` : 'Выберите хотя бы одну работу.';
  });
  root.querySelectorAll('.ex-contact').forEach(form => form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; const result=form.querySelector('.ex-result'); result.hidden=false; result.textContent='Заявка принята. Свяжемся с вами в рабочее время.'; }));
})();
