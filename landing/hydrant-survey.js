(() => {
  const calc = document.getElementById('pz-fire_hydrant_testing');
  const request = document.getElementById('request');
  if (!calc || !request) return;

  calc.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!calc.reportValidity()) return;

    const data = Object.fromEntries(new FormData(calc));
    const type = (data.q0 || '').toLowerCase();
    const region = (data.q2 || '').toLowerCase();
    const requiresSurvey = type.includes('государ') || region !== 'алматы';
    const result = calc.querySelector('.result');
    const heading = request.querySelector('h2');
    const description = request.querySelector('.muted');
    const button = request.querySelector('button[type="submit"]');

    if (requiresSurvey) {
      result.textContent = 'Для этого объекта удалённый расчёт не выполняем. Сначала согласуем обследование, после него подготовим стоимость работ.';
      heading.textContent = 'Записаться на обследование';
      description.textContent = 'Укажите имя и телефон. Тип объекта, город, область и адрес уже приложены к обращению.';
      button.textContent = 'Отправить данные для обследования';
    } else {
      result.textContent = 'Параметры получены. После уточнения состава работ подготовим предварительный расчёт.';
      heading.textContent = 'Получить предварительный расчёт';
      description.textContent = 'Укажите имя и телефон. Параметры объекта уже приложены к обращению.';
      button.textContent = 'Отправить параметры';
    }

    result.hidden = false;
    request.hidden = false;
    request.querySelector('[name=calculator_answers]').value = JSON.stringify(data);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'pz_calculator_complete', service: 'fire_hydrant_testing', calculator_answers: data, requires_survey: requiresSurvey });
    request.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.PozharnikAnalytics?.enrichAllForms();
  }, true);
})();
