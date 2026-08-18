# Раздел "Как мы работаем"

_Started 2026-08-17 22:53 UTC_

---

## User

Continuing from "Дизайн «События РУМ»".

## Assistant

Мы собирали лендинг для СОБЫТИЯ РУМ — компании по организации и техоснащению мероприятий. Проект строится на Зелёной дизайн-системе (стиль международных переводов: лаймовый акцент, мятный холст, дисплейный Manrope и Inter).

Создали две версии: десктопную (12 блоков в строках и колонках) и мобильную (390×844, всё в один столбец).

**Основные решения, которые приняли:**
- Hero: видео на десктопе (без звука, на повторе), на мобильном — статичный кадр с драконом.
- Услуги: 6 карточек с фото при наведении на десктопе, постоянно видны на мобильном (под тёмной вуалью).
- Площадки и заказчики: бегущая строка слева направо на десктопе; на мобильном помеялись местами (заказчики в hero, площадки отдельно).
- Контакты: телефон, Telegram, WhatsApp, MAX (ссылка стоит заглушкой на номер).
- Форма: чипы услуг, выбранные услуги остаются в кейсе.
- Мобильный: закреплённая панель звонка внизу, прогресс-линия на таймлайне по скроллу, тап-раскрытие кейсов.

**Текущее состояние:**
- Обе версии готовы к согласованию.
- Все 6 услуг с фото, 10 кейсов с логотипами и описаниями.
- Пункт MAX для связи ведёт на номер телефона (по точной ссылке профиля обновим).
- Счётчик «400+ проектов» на месте.
- Нужно собрать standalone-файл для отправки на согласование.

**Файлы:**
- `Лендинг СОБЫТИЯ РУМ.dc.html` (десктоп)
- `Лендинг СОБЫТИЯ РУМ - мобильная.dc.html` (мобильный)
- Папка `media/` с фото услуг, логотипами и кейсами.

## User

измени раздел как мы работаем
01
Заявка и бриф
Задача, площадка, тайминг
02
Смета за день
Расчёт с вариантами по бюджету, визуалы
03
Производство
Чертежи, изготовление, логистика
04
Монтаж и сопровождение
Установка, дежурство, демонтаж

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: grep]_

_[tool: run_script]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Раздел «Как мы работаем» теперь 4 этапа (сетка на десктопе перестроена в 4 колонки), в мобильной версии тоже.

## User

Добавь стартовое видео в мобильную версию сайта

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Now the mobile hero:

_[tool: read_file]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Add the tweak prop so video can be turned off:

_[tool: grep]_

_[tool: read_file]_

_[tool: grep]_

_[tool: show_html]_

_[tool: eval_js_user_view]_

_[tool: dc_set_props]_

_[tool: ready_for_verification]_

В мобильном hero теперь то же showreel-видео (без звука, на повторе, playsinline). Статичный кадр остаётся постером и подстраховкой: видео подгружается после первой отрисовки и плавно проявляется, а при экономии трафика / «уменьшить движение» не запускается вовсе. В тweaks добавлен переключатель «heroVideo: auto/off».

## User

давай сделаем 
06 раздел и 02 раздел поменяем местами
05 разде поменяем местами с 03 и 04

## Assistant

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now renumber the visible labels so they read 01→06 down the page:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now the same order in the mobile version:

_[tool: grep]_

_[tool: grep]_

_[tool: read_file]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Порядок направлений теперь: 01 Арт-объекты → 02 Оформление → 03 Кейтеринг → 04 Мебель → 05 Шатры → 06 Экраны, звук и свет. Номера перенумерованы по новому порядку, размеры плиток сохранены (Оформление и Экраны — широкие, Кейтеринг остаётся лаймовым акцентом). В мобильной версии тот же порядок.

## User

Apply drawing

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Поменял группы местами: справа от большой плитки теперь 02 Мебель и 03 Шатры, под ними 04 Экраны, звук и свет; нижний ряд — 05 Оформление и 06 Кейтеринг (лаймовый акцент вернулся в нижнюю полосу, как было). Мобильная версия — в том же порядке.

## User

нет ты меня неправильно понял 
верни как писал
давай сделаем 
06 раздел и 02 раздел поменяем местами
05 разде поменяем местами с 03 и 04

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Вернул порядок: 01 Арт-объекты, 02 Оформление, 03 Кейтеринг, 04 Мебель, 05 Шатры, 06 Экраны — на десктопе и в мобильной версии.

Достигнут лимит по объёму работы в этой сессии. Если нужно доработать цвета плиток (комментарий «цвета поменяй как раньше было») — скажите, что именно вернуть: лаймовый фон на конкретной плитке или прежнее распределение белых/тёмных карточек.

## User

кейтеринг сделай белым а экраны сделай лаймовым

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Кейтеринг теперь белый (тёмный текст, как у остальных светлых плиток), Экраны, звук и свет — лаймовые с чёрным текстом.

Достигнут лимит по объёму работы в этой сессии — хорошая точка остановки: обе версии в согласованном состоянии.

## User

Apply drawing

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Надпись в hero теперь в одну строку (10px, уменьшен трекинг).

Достигнут лимит по объёму работы в этой сессии — остановился здесь; обе версии в рабочем состоянии.

## User

Apply drawing

## Assistant

_[tool: grep]_

_[tool: dc_html_str_replace]_

Заголовок hero увеличен до 46px.

Достигнут лимит по объёму работы — останавливаюсь здесь; файлы в согласованном состоянии.

## User

Давай скорректируем форму обратной связи
интересующие услуги удаляем
Обязательной графой для заполнения оставляем только телефон или емейл
и согласие на обработку

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Desktop edits:

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now the mobile version:

_[tool: read_file]_

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Форма скорректирована в обеих версиях: блок «Интересующие услуги» удалён, звёздочки с «Имя» и «Телефон» сняты. Обязательны только контакт (телефон **или** email — если ни одного, ошибка «Оставьте телефон или email») и согласие на обработку. Клик по плитке услуги теперь дописывает направление в комментарий, а не в чипы.

