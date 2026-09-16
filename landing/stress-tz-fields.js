(() => {
  const quiz = document.getElementById('pz-stress-quiz');
  const faq = document.querySelector('#pz-stress-test-page details:last-of-type')?.parentElement;
  if (faq && faq.querySelectorAll('details').length < 7) faq.insertAdjacentHTML('beforeend', `
    <details><summary>Какие системы можно включить в проверку?</summary><p>Состав систем и безопасных сценариев согласуем до выезда с учётом объекта.</p></details>
    <details><summary>Сколько длится выезд?</summary><p>Продолжительность зависит от площади, состава систем, режима работы и доступности ответственных лиц.</p></details>
    <p class="muted">FAQ актуализируется после проверки пожарным инженером.</p>`);
})();
