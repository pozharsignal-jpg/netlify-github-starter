from html import escape
from pathlib import Path

ROOT = Path(__file__).parent

PAGES = {
    "obsluzhivanie": {
        "crumb": "Услуги / Обслуживание АПС", "eyebrow": "ICP 1  Действующая АПС", "title": "Обслуживание пожарной сигнализации для организаций", "lead": "Обследуем действующую систему, определим состав технического обслуживания и подготовим расчет по вашему объекту.",
        "cta": "Запросить обследование", "items": [("АПС есть, но нет контроля", "Проверим состояние системы, доступные журналы и состав работ."), ("Нужны отчеты и регламент", "Согласуем периодичность, фиксацию дефектов и формат отчетности."), ("Несколько объектов", "Подготовим единый подход к обслуживанию сети.")],
        "process": ["Исходные данные", "Обследование системы", "Расчет состава ТО", "Договор и регламент"], "fields": ["Тип объекта", "Площадь, м²", "Есть ли действующая АПС", "Количество объектов"], "related": [("Смена подрядчика", "/smena-podryadchika/"), ("Калькулятор ТО", "/kalkulyatory/obsluzhivanie/")]
    },
    "smena-podryadchika": {
        "crumb": "Услуги / Смена подрядчика", "eyebrow": "ICP 2  Действующая АПС", "title": "Смена подрядчика по обслуживанию АПС", "lead": "Обследуем систему, зафиксируем дефекты и подготовим план перехода с учетом работы объекта.",
        "cta": "Назначить обследование", "items": [("Нет реакции или отчетов", "Зафиксируем, какие работы и документы отсутствуют."), ("Договор заканчивается", "Проверим сроки и подготовим следующий шаг до окончания договора."), ("Нужна приемка системы", "Определим состояние АПС и состав перехода.")],
        "process": ["Квалификация", "Приемка системы", "Дефектовка", "План перехода и расчет"], "fields": ["Текущий подрядчик", "Дата окончания договора", "Причина смены", "Выявленные дефекты"], "related": [("Обслуживание АПС", "/obsluzhivanie/"), ("Срочная помощь", "/srabotka/")]
    },
    "montazh": {
        "crumb": "Услуги / Монтаж АПС", "eyebrow": "ICP 3  Новый или реконструируемый объект", "title": "Монтаж пожарной сигнализации для коммерческого объекта", "lead": "Соберем исходные данные, определим решение, подготовим расчет и согласуем последовательность работ.",
        "cta": "Рассчитать монтаж", "items": [("Новый объект", "Уточним назначение помещений, сроки открытия и необходимые исходные данные."), ("Реконструкция", "Оценим совместимость с действующей системой и этапы работ."), ("Нужна смета", "Подготовим расчет после уточнения площади, этажности и проекта.")],
        "process": ["Исходные планы", "Обследование", "Решение и спецификация", "Монтаж и пусконаладка"], "fields": ["Площадь, м²", "Этажность", "Есть ли проект", "Желаемый срок запуска"], "related": [("Калькулятор монтажа", "/kalkulyatory/montazh/"), ("Обслуживание после монтажа", "/obsluzhivanie/")]
    },
    "audit": {
        "crumb": "Услуги / Пожарный аудит", "eyebrow": "ICP 5  Проверка или внутренний аудит", "title": "Пожарный аудит объекта в Алматы", "lead": "Проведем обследование в согласованном объеме и подготовим отчет с приоритетами и планом дальнейших действий.",
        "cta": "Назначить аудит", "items": [("Перед проверкой", "Уточним дату, состав документов и известные замечания."), ("Перед сделкой", "Оценим риски объекта и исходные данные для дальнейших работ."), ("Нет актуального отчета", "Зафиксируем состояние объекта и доступных систем.")],
        "process": ["Квалификация задачи", "Выезд и осмотр", "Фиксация замечаний", "Отчет и план действий"], "fields": ["Дата проверки или сделки", "Известные замечания", "Документация", "Площадь, м²"], "related": [("Калькулятор аудита", "/kalkulyatory/audit/"), ("Срочная помощь", "/srabotka/")]
    },
    "srabotka": {
        "crumb": "Услуги / Срочная помощь", "eyebrow": "ICP 4  Неисправность или сработка", "title": "Срочная помощь при сработке пожарной сигнализации", "lead": "Для организаций в Алматы: первичная диагностика, согласование безопасного выезда и план дальнейших работ.",
        "cta": "Вызвать инженера", "items": [("Есть дым, огонь или угроза людям", "Немедленно звоните 101 или 112 и действуйте по плану эвакуации."), ("Панель показывает неисправность", "Зафиксируйте текст сообщения, время и затронутую зону."), ("Повторная ложная сработка", "Сообщите модель прибора и условия возникновения проблемы.")],
        "process": ["Звонок и безопасность", "Первичная диагностика", "Согласование выезда", "Проверка и рекомендации"], "fields": ["Сообщение на панели", "Тип проблемы", "Срочность", "Адрес или район"], "related": [("Ремонт и модернизация", "/montazh/"), ("Обслуживание АПС", "/obsluzhivanie/")]
    },
    "kalkulyatory/obsluzhivanie": {
        "crumb": "Калькуляторы / Обслуживание АПС", "eyebrow": "Калькулятор  ICP 1 и ICP 2", "title": "Калькулятор обслуживания пожарной сигнализации", "lead": "Укажите параметры действующей АПС. Сформируем предварительный разбор и уточним данные для персонального расчета.",
        "cta": "Получить разбор", "items": [("Действующая АПС", "Система, площадь и состояние влияют на состав обслуживания."), ("Смена подрядчика", "Дата окончания договора и причины смены определяют следующий шаг."), ("Сеть объектов", "Количество объектов помогает определить формат сопровождения.")],
        "process": ["Параметры объекта", "Состояние АПС", "Предварительный разбор", "Точный расчет"], "fields": ["Тип объекта", "Площадь, м²", "Текущий подрядчик", "Дата окончания договора"], "related": [("Обслуживание АПС", "/obsluzhivanie/"), ("Смена подрядчика", "/smena-podryadchika/")], "calculator": True
    },
    "kalkulyatory/montazh": {
        "crumb": "Калькуляторы / Монтаж АПС", "eyebrow": "Калькулятор  ICP 3", "title": "Калькулятор монтажа пожарной сигнализации", "lead": "Укажите параметры нового или реконструируемого объекта. Подготовим предварительный разбор для точного расчета.",
        "cta": "Получить разбор", "items": [("Площадь и назначение", "Определяют состав решения и объем работ."), ("Проект и этажность", "Помогают уточнить необходимые исходные данные."), ("Срок запуска", "Нужен для планирования расчета и работ.")],
        "process": ["Параметры объекта", "Проект и сроки", "Предварительный разбор", "Персональный расчет"], "fields": ["Тип объекта", "Площадь, м²", "Этажность", "Есть ли проект"], "related": [("Монтаж АПС", "/montazh/"), ("Пожарный аудит", "/audit/")], "calculator": True
    },
    "kalkulyatory/audit": {
        "crumb": "Калькуляторы / Пожарный аудит", "eyebrow": "Калькулятор  ICP 5", "title": "Калькулятор стоимости пожарного аудита", "lead": "Укажите тип и площадь объекта, дату проверки и известные замечания. Сформируем предварительный разбор для записи на аудит.",
        "cta": "Получить разбор", "items": [("Дата проверки", "Помогает определить очередность и следующий шаг."), ("Объект и площадь", "Нужны для оценки объема обследования."), ("Документы и замечания", "Позволяют подготовить вопросы к аудиту.")],
        "process": ["Параметры объекта", "Причина аудита", "Предварительный разбор", "Согласование выезда"], "fields": ["Тип объекта", "Площадь, м²", "Дата проверки", "Известные замечания"], "related": [("Пожарный аудит", "/audit/"), ("Срочная помощь", "/srabotka/")], "calculator": True
    },
}

CSS = '''
:root{--ink:#15212b;--muted:#697984;--red:#e54132;--blue:#14364b;--line:#dfe6e8;--pale:#f5f7f6}*{box-sizing:border-box}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--ink);line-height:1.55}.wrap{width:min(1160px,calc(100% - 28px));margin:auto}.header{background:#14364b;color:#fff;position:sticky;top:0;z-index:5}.header .wrap{height:70px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{font-weight:900;font-size:21px;color:#fff;text-decoration:none}.brand b{color:#ff7567}.header nav{display:flex;gap:20px}.header nav a,.header .phone{color:#fff;text-decoration:none;font-size:13px}.hero{padding:80px 0;background:linear-gradient(115deg,#112d3d,#184b5d 55%,#1e596b);color:#fff}.crumb{font-size:13px;color:#c8d8dd;margin-bottom:34px}.eyebrow{font-size:12px;font-weight:bold;letter-spacing:1.3px;text-transform:uppercase;color:#ffc7bd}.hero h1{font-size:47px;line-height:1.08;max-width:800px;margin:16px 0}.hero p{max-width:720px;color:#e4eef1;font-size:18px}.btn{display:inline-block;border:0;border-radius:8px;background:var(--red);color:#fff;text-decoration:none;font-weight:bold;padding:15px 20px;margin:16px 10px 0 0;cursor:pointer}.btn.alt{background:transparent;border:1px solid #a5bbc5}.section{padding:70px 0}.pale{background:var(--pale)}h2{font-size:34px;line-height:1.12;margin:0 0 15px}.intro{max-width:720px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:30px}.card{background:#fff;border:1px solid var(--line);border-radius:13px;padding:26px}.card h3{margin-top:0}.card p{color:var(--muted)}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:30px}.step{border-top:3px solid var(--red);padding:16px 0;font-weight:bold}.form{margin-top:28px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:30px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.form h2,.form p,.form .result,.form .full{grid-column:1/-1}.field{display:flex;flex-direction:column;font-size:13px;color:var(--muted);gap:6px}.field input,.field select,.field textarea{padding:12px;border:1px solid #cfd9dc;border-radius:7px;font:inherit;color:var(--ink)}.field textarea{min-height:88px}.result{padding:18px;background:#eef5f7;border-radius:8px;color:var(--blue)}.links{display:flex;gap:12px;flex-wrap:wrap;margin-top:25px}.links a{color:var(--blue);font-weight:bold}.footer{background:#102633;color:#c9d8dd;padding:35px 0;font-size:13px}.footer a{color:#fff}@media(max-width:820px){.header nav{display:none}.hero{padding:55px 0}.hero h1{font-size:34px}.grid,.steps{grid-template-columns:1fr}.form{grid-template-columns:1fr;padding:20px}.section{padding:50px 0}h2{font-size:28px}}
'''

def page(path, data):
    cards = ''.join(f'<article class="card"><h3>{escape(title)}</h3><p>{escape(text)}</p></article>' for title, text in data["items"])
    steps = ''.join(f'<div class="step">0{i+1}<br>{escape(item)}</div>' for i, item in enumerate(data["process"]))
    options = ''.join(f'<option>{escape(item)}</option>' for item in data["fields"])
    field_html = ''.join(f'<label class="field">{escape(item)}<input name="{i}" required></label>' for i, item in enumerate(data["fields"]))
    calc = '<div class="result" hidden aria-live="polite"></div>' if data.get("calculator") else ''
    related = ''.join(f'<a href="{url}">{escape(label)} →</a>' for label, url in data["related"])
    return f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(data['title'])} | Pozharnik.kz</title><meta name="description" content="{escape(data['lead'])}"><style>{CSS}</style></head><body>
<header class="header"><div class="wrap"><a class="brand" href="/">POZHARNIK<b>.KZ</b></a><nav><a href="/obsluzhivanie/">Обслуживание</a><a href="/montazh/">Монтаж</a><a href="/audit/">Аудит</a><a href="/srabotka/">Срочная помощь</a></nav><a class="phone" href="tel:+77711934976">+7 771 193 4976</a></div></header>
<main><section class="hero"><div class="wrap"><div class="crumb"><a href="/" style="color:inherit">Главная</a> / {escape(data['crumb'])}</div><div class="eyebrow">{escape(data['eyebrow'])}</div><h1>{escape(data['title'])}</h1><p>{escape(data['lead'])}</p><a class="btn" href="#request">{escape(data['cta'])}</a><a class="btn alt" href="https://wa.me/77711934976" target="_blank" rel="noopener">WhatsApp</a></div></section>
<section class="section"><div class="wrap"><h2>Начнем с вашей ситуации</h2><p class="intro">Уточним параметры объекта и предложим следующий шаг без неподтвержденных обещаний по срокам или стоимости.</p><div class="grid">{cards}</div></div></section>
<section class="section pale"><div class="wrap"><h2>Как проходит работа</h2><div class="steps">{steps}</div></div></section>
<section class="section" id="request"><div class="wrap"><form class="form" id="lead"><h2>{escape(data['cta'])}</h2><p>Оставьте данные объекта. Менеджер уточнит задачу и согласует следующий шаг.</p>{field_html}<label class="field full">Имя и организация<input name="contact" autocomplete="organization" required></label><label class="field">Телефон<input name="phone" type="tel" inputmode="tel" placeholder="+7 (7XX) XXX-XX-XX" required></label><label class="field">Регион<select name="region"><option>Алматы</option><option>Алматинская область</option><option>Другой регион</option></select></label>{calc}<label class="field full"><input type="checkbox" required> Согласен на обработку данных для ответа на обращение</label><button class="btn full" type="submit">{escape(data['cta'])} →</button></form><div class="links">{related}<a href="/">На главную →</a></div></div></section></main>
<footer class="footer"><div class="wrap">Pozharnik.kz · Алматы и Алматинская область · <a href="tel:+77711934976">+7 771 193 4976</a> · <a href="https://wa.me/77711934976">WhatsApp</a></div></footer>
<script>document.getElementById('lead').addEventListener('submit',function(e){{e.preventDefault();var r=this.querySelector('.result');if(r){{r.hidden=false;r.textContent='Предварительный разбор сформирован. Для точного расчета и согласования следующего шага менеджер свяжется с вами.'}}else{{this.querySelector('button').textContent='Заявка подготовлена';}}}});</script></body></html>'''

for route, data in PAGES.items():
    target = ROOT / route / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(page(route, data), encoding="utf-8")
    print(target)
