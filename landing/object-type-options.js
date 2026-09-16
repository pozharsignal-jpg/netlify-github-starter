(() => {
  const options = ['Офис / бизнес-центр', 'Ресторан / магазин', 'Складское помещение', 'Производство / завод', 'Государственный объект', 'Другое'];
  document.querySelectorAll('select').forEach((select) => {
    const label = select.closest('label');
    if (!label || !label.textContent.trim().startsWith('Тип объекта')) return;
    const selected = select.value;
    select.innerHTML = '<option value="">Выберите тип объекта</option>' + options.map((item) => `<option>${item}</option>`).join('');
    if (options.includes(selected)) select.value = selected;
    const otherLabel = document.createElement('label');
    otherLabel.textContent = 'Укажите тип объекта';
    const other = document.createElement('input');
    other.name = 'object_type_other';
    other.placeholder = 'Укажите тип объекта';
    otherLabel.hidden = true;
    otherLabel.style.display = 'none';
    other.required = false;
    otherLabel.append(other);
    label.insertAdjacentElement('afterend', otherLabel);
    select.addEventListener('change', () => {
      const isOther = select.value === 'Другое';
      otherLabel.hidden = !isOther;
      otherLabel.style.display = isOther ? 'grid' : 'none';
      other.required = isOther;
      if (!isOther) other.value = '';
    });
  });
})();
