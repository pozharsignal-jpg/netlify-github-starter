(() => {
  const calc = document.getElementById('pz-fire_system_stress_test');
  const request = document.getElementById('request');
  if (!calc || !request) return;

  calc.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!calc.reportValidity()) return;
    const data = Object.fromEntries(new FormData(calc));
    const type = (data.q0 || '').toLowerCase();
    const region = (data.q1 || '').toLowerCase();
    const requiresSurvey = type.includes('государ') || region !== 'алматы';
    const result = calc.querySelector('.result');
    const heading = request.querySelector('h2');
    const description = request.querySelector('.muted');
    const button = request.querySelector('button[type="submit"]');
    if (requiresSurvey) {
      result.textContent = 'Для этого объекта сначала согласуем обследование. После него определим сценарии проверки, состав работ и стоимость.';
      heading.textContent = 'Записаться на обследование';
      description.textContent = 'Укажите имя и телефон. Данные объекта уже приложены к обращению.';
      button.textContent = 'Отправить данные для обследования';
    } else {
      result.textContent = 'Данные получены. Согласуем безопасные сценарии проверки и подготовим предварительный расчёт.';
      heading.textContent = 'Получить предварительный расчёт';
      description.textContent = 'Укажите имя и телефон. Данные объекта уже приложены к обращению.';
      button.textContent = 'Отправить параметры';
    }
    result.hidden = false;
    request.hidden = false;
    request.querySelector('[name=calculator_answers]').value = JSON.stringify(data);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'pz_calculator_complete', service: 'fire_system_stress_test', calculator_answers: data, requires_survey: requiresSurvey });
    request.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.PozharnikAnalytics?.enrichAllForms();
  }, true);
})();
