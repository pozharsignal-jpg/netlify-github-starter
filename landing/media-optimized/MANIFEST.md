# Оптимизированные медиафайлы pozharnik.kz

Подготовлено для тестовой главной страницы `/new-home-test`.

## Правила использования

- `*-480.webp` — мобильные экраны и карточки шириной до 480 px.
- `*-960.webp` — планшеты, desktop-карточки и увеличенный просмотр.
- Для изображений ниже первого экрана: `loading="lazy" decoding="async"`.
- Для изображения первого экрана: `loading="eager" fetchpriority="high"` и фиксированные `width`/`height`.
- Оригинальные PNG/JPG сохраняются как архивные и не загружаются на страницу напрямую.
- Документы (лицензия и аттестат) в интерфейсе показываются как WebP-превью; ссылка «Скачать» должна вести на исходный документ/оригинал.

## Карта файлов

| Назначение | 480 px | 960 px |
|---|---:|---:|
| Аттестат аккредитации | `attestat-akkreditacii-kz45vvb00001273-public-480.webp` (24 KB) | `attestat-akkreditacii-kz45vvb00001273-public-960.webp` (63 KB) |
| Диагностика блока питания АПС | `diagnostika-bloka-pitaniya-aps-480.webp` (16 KB) | `diagnostika-bloka-pitaniya-aps-960.webp` (36 KB) |
| Лицензия | `licenziya-23028116-public-480.webp` (20 KB) | `licenziya-23028116-public-960.webp` (53 KB) |
| Диагностика ИПР Resanta | `resanta-diagnostika-ipr-480.webp` (38 KB) | `resanta-diagnostika-ipr-960.webp` (117 KB) |
| Тест ИПР Resanta | `resanta-test-ipr-480.webp` (11 KB) | `resanta-test-ipr-960.webp` (41 KB) |
| Кадры видео | `frames/*-480.webp` | `frames/*-960.webp` |

## Результат

- Исходные изображения: примерно 5,97 MB.
- Комплект 480 px: примерно 0,22 MB (снижение около 96,4%).
- Комплект 960 px: примерно 0,52 MB (снижение около 91,3%).

Следующий этап: разместить каталог на публичном CDN, проверить HTTPS/CORS/cache-control, затем заменить локальные `/media/...` в HTML на постоянные URL CDN.
