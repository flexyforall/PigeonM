# PigeonM

Вёрстка лендинга «Business» по макету Figma
[PigeonM / Concept 2](https://www.figma.com/design/THAEweWSAqB7TEOtSaxAgO/PigeonM?node-id=112-6940).

Чистые HTML + CSS + немного JS, без сборки. Макет — 1440 px; вёрстка тянется на всю ширину экрана (от 1280 px), на 1440 px совпадает с Figma.

## Запуск

Откройте `index.html` в браузере или поднимите локальный сервер:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Структура

```
index.html          разметка страницы
css/styles.css      стили и токены (цвета, шрифты, отступы из Figma)
js/main.js          переключение вкладок и слоёв карты покрытия
assets/
  fonts/            Outfit и Inter (woff2, self-hosted)
  images/           растровые изображения (фон hero, иллюстрации, план этажа)
  icons/            SVG-иконки и логотип PigeonM
  logos/            логотипы клиентов
  decor/            декоративные линии, сетка, круги покрытия
```
