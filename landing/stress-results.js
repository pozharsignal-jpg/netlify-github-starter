(() => {
  const root = document.getElementById('pz-stress-test-page');
  if (!root) return;

  for (const form of root.querySelectorAll('form')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      const result = form.querySelector('.result') || (() => {
        const node = document.createElement('div');
        node.className = 'result';
        form.append(node);
        return node;
      })();

      if (form.id === 'pz-stress-quiz') {
        const values = [...form.querySelectorAll('select')].map((field) => field.value);
        const [objectType, area, systems, goal] = values;
        let packageName = 'Экспресс';
        let price = '30 000 ₸';
        if (systems === 'Расширенный комплекс систем') {
          packageName = 'Объект плюс';
          price = '70 000 ₸';
        } else if (systems === 'АПС, АПТ и другие инженерные системы') {
          packageName = 'Объект';
          price = '50 000 ₸';
        }
        sessionStorage.setItem('pzStressPackage', packageName);
        const packageField = root.querySelector('#pz-stress-order select[name="package"]');
        if (packageField) packageField.value = packageName;
        result.innerHTML = `
          <b>Предварительная рекомендация: «${packageName}» — ${price}</b>
          <p>Рекомендация сформирована по площади объекта и количеству систем.</p>
          <p class="muted">${objectType} · ${area}<br>Системы: ${systems}. Причина обращения: ${goal}.</p>
          <p><b>На выезде:</b> согласуем безопасные сценарии, проверим выбранные системы и зафиксируем выявленные отклонения.</p>
          <p class="muted">Следующий шаг: инженер уточнит режим работы и доступность ответственных лиц, затем подтвердит дату выезда.</p>
          <p><a class="btn" href="#pz-stress-order">Заказать выбранный пакет</a></p>`;
      } else {
        result.innerHTML = form.id === 'pz-stress-question'
          ? '<b>Заявка на консультацию принята.</b><br><span class="muted">Свяжемся с вами в рабочее время по указанному телефону.</span>'
          : '<b>Заявка на стресс-тест принята.</b><br><span class="muted">Свяжемся с вами в рабочее время, подтвердим пакет, дату и порядок выезда.</span>';
      }
      result.hidden = false;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'calculator_request', service: 'stress_test', form_id: form.id });
    }, true);
  }

  const selectedPackage = sessionStorage.getItem('pzStressPackage');
  const packageField = root.querySelector('#pz-stress-order select[name="package"]');
  if (selectedPackage && packageField) packageField.value = selectedPackage;
})();
