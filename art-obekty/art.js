/* Страница «Декорации и арт-объекты» — своё: лента клиентов, фильтры
   портфолио и карточка проекта. Всё остальное (шапка, меню, форма,
   таймлайн, FAQ, отзывы, куки) работает от общего script.js. */
(function () {
  'use strict';

  var CLIENTS = ['Сбербанк', 'Haval', 'Parimatch', 'BingX', 'ВДНХ', 'Парк Горького', 'Зарядье',
    'ТРЦ «Метрополис»', 'Музей Москвы', 'Loft Hall', 'Технопарк Сколково', 'ЦВЗ «Манеж»',
    'Городские парки', 'ТРЦ «Меридиан»', 'Таврида', 'БЦ Парк Победы'];

  /* Проекты. cat — группа для фильтра: art, events, photo, ny, city.
     Фото ищется по номеру в media/case-NN.jpg — положите файл с нужным
     именем, и он подхватится сам; без файла показывается плашка.
     Чтобы добавить проект, скопируйте строку и поменяйте значения. */
  var WORKS = [
    { n: '01', cat: 'events', title: 'World Atomic Week', year: '2025', client: 'ATOM EXPO', tasks: 'Аренда оборудования, застройка тематической зоны', place: 'ВДНХ' },
    { n: '02', cat: 'events', title: 'Сбер Бизнес Фест', year: '2025', client: 'ПАО Сбербанк, ген. подрядчик', tasks: 'Застройка пространства фестиваля, фудкорт и кофестанции, аренда мебели', place: 'Москва, Казань, Волгоград, Омск, Новосибирск' },
    { n: '03', cat: 'art', title: 'МТФ «Путешествуй»', year: '2024, 2025, 2026', client: 'Фонд Росконгресс', tasks: 'Застройка стендов, шатры, мебель и оборудование на стенды, изготовление арт-объекта, застройка VIP-зоны', place: 'ВДНХ' },
    { n: '04', cat: 'events', title: 'Всероссийская неделя охраны труда', year: '2024, 2025', client: 'Министерство труда, ген. подрядчик', tasks: 'Мебельное обеспечение форумной программы, оборудование стендов, клининг, хэлперы', place: 'Университет «Сириус»' },
    { n: '05', cat: 'events', title: 'Фестиваль «Таврида»', year: '2024', client: 'Росмолодёжь, ген. подрядчик', tasks: 'Монтаж палаточного городка и коммуникаций', place: 'Судак' },
    { n: '06', cat: 'events', title: 'VK Fest', year: '2025', client: 'VK Community', tasks: 'Кальянный кейтеринг VIP-зон, мебель и оборудование лаунж-зон', place: 'Москва, Лужники' },
    { n: '07', cat: 'events', title: 'Турнир по падл-теннису', year: '2025', client: 'Parimatch, ген. подрядчик', tasks: 'Звук, TV-панели, мебель, техническое сопровождение', place: 'Яхт-клуб «Адмирал»' },
    { n: '08', cat: 'art', title: 'Запуск спорткомплекса Padel Ball', year: '', client: 'Padel Ball', tasks: 'Дизайн, строительные работы, брендирование, навигация, мебель и оборудование', place: 'Химки, Gopark' },
    { n: '09', cat: 'art', title: 'Оформление входной группы БЦ', year: '', client: 'БЦ «Парк Победы»', tasks: 'Дизайн, изготовление и монтаж декораций входной группы', place: 'БЦ «Парк Победы»' },
    { n: '10', cat: 'events', title: 'Yandex Data (exclusive event)', year: '', client: 'Yandex Data', tasks: 'Барное и кальянное обслуживание, лаунж-пространство', place: 'Сочи, Красная Поляна' }
  ];

  /* Группы из макета. Пустые пока есть — заказчик дописывает проекты,
     которые на главную не выкладывались. Пустая группа показывает
     объяснение, а не пустоту. */
  var FILTERS = [
    { id: 'all', label: 'Все' },
    { id: 'art', label: 'Арт-объекты' },
    { id: 'events', label: 'Мероприятия' },
    { id: 'photo', label: 'Фотозоны' },
    { id: 'ny', label: 'Новый год' },
    { id: 'city', label: 'Городские проекты' }
  ];

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ------------------------------------------------------------------ */
  /* Лента клиентов                                                       */
  /* ------------------------------------------------------------------ */

  (function fillClients() {
    var a = document.getElementById('art-clients-a');
    var b = document.getElementById('art-clients-b');
    if (!a || !b) return;
    var html = CLIENTS.map(function (c) {
      return '<span class="client-item">' + esc(c) + '</span>';
    }).join('');
    a.innerHTML = html;
    b.innerHTML = html;
  })();

  /* ------------------------------------------------------------------ */
  /* Портфолио                                                            */
  /* ------------------------------------------------------------------ */

  var grid = document.getElementById('art-grid');
  var filterBox = document.getElementById('art-filters');
  if (!grid || !filterBox) return;

  var active = 'all';

  function cardHtml(w, i) {
    var meta = [w.client, w.year].filter(Boolean).join(' · ');
    return '<button type="button" class="art-work" data-work="' + i + '">' +
      '<span class="art-work__media">' +
        '<img src="../media/case-' + w.n + '.jpg" alt="" loading="lazy" data-work-photo="' + i + '">' +
      '</span>' +
      '<span class="art-work__body">' +
        '<span class="art-work__title">' + esc(w.title) + '</span>' +
        '<span class="art-work__meta">' + esc(meta) + '</span>' +
      '</span>' +
    '</button>';
  }

  function render() {
    var list = WORKS.filter(function (w) { return active === 'all' || w.cat === active; });
    grid.innerHTML = list.length
      ? list.map(function (w) { return cardHtml(w, WORKS.indexOf(w)); }).join('')
      : '<p class="art-grid__empty">В этой группе проекты ещё не опубликованы. Напишите нам — покажем работы по этому направлению.</p>';

    // Фото ещё не загружено — вместо битой картинки плашка с названием.
    Array.prototype.forEach.call(grid.querySelectorAll('[data-work-photo]'), function (img) {
      img.addEventListener('error', function () {
        var w = WORKS[parseInt(img.getAttribute('data-work-photo'), 10)];
        var holder = img.parentElement;
        if (holder) holder.innerHTML = '<span class="art-work__holder"><span>' + esc(w.title) + '</span></span>';
      });
    });

    Array.prototype.forEach.call(grid.querySelectorAll('.art-work'), function (btn) {
      btn.addEventListener('click', function () {
        openModal(WORKS[parseInt(btn.getAttribute('data-work'), 10)]);
      });
    });
  }

  filterBox.innerHTML = FILTERS.map(function (f) {
    return '<button type="button" class="chip' + (f.id === 'all' ? ' is-active' : '') +
      '" data-filter="' + f.id + '" aria-pressed="' + (f.id === 'all') + '">' + esc(f.label) + '</button>';
  }).join('');

  Array.prototype.forEach.call(filterBox.querySelectorAll('.chip'), function (chip) {
    chip.addEventListener('click', function () {
      active = chip.getAttribute('data-filter');
      Array.prototype.forEach.call(filterBox.querySelectorAll('.chip'), function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      render();
    });
  });

  render();

  /* ------------------------------------------------------------------ */
  /* Карточка проекта                                                     */
  /* ------------------------------------------------------------------ */

  var modal = document.createElement('div');
  modal.className = 'art-modal';
  modal.id = 'art-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.hidden = true;
  document.body.appendChild(modal);

  var lastFocus = null;

  function facts(w) {
    return [['Заказчик', w.client], ['Задачи', w.tasks], ['Площадка', w.place], ['Год', w.year]]
      .filter(function (f) { return f[1]; })
      .map(function (f) {
        return '<div class="art-modal__fact"><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
      }).join('');
  }

  function openModal(w) {
    lastFocus = document.activeElement;
    modal.innerHTML = '<div class="art-modal__box" role="document">' +
      '<button type="button" class="art-modal__close" aria-label="Закрыть">×</button>' +
      '<p class="art-modal__num">Проект ' + esc(w.n) + '</p>' +
      '<h2 class="art-modal__title" id="art-modal-title">' + esc(w.title) + '</h2>' +
      '<div class="art-modal__media"><img src="../media/case-' + w.n + '.jpg" alt=""></div>' +
      '<dl class="art-modal__facts">' + facts(w) + '</dl>' +
      '<button type="button" class="btn btn--primary btn--lg js-go-form" data-close-modal>Хочу похожий проект</button>' +
    '</div>';
    modal.setAttribute('aria-labelledby', 'art-modal-title');
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    var img = modal.querySelector('.art-modal__media img');
    img.addEventListener('error', function () { img.parentElement.remove(); });

    modal.querySelector('.art-modal__close').addEventListener('click', closeModal);
    modal.querySelector('[data-close-modal]').addEventListener('click', function () {
      closeModal();
      var form = document.getElementById('form');
      if (form) {
        var top = form.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: top, behavior: reduced() ? 'auto' : 'smooth' });
      }
    });
    modal.querySelector('.art-modal__close').focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.hidden = true;
    modal.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Клик по затемнению и Esc закрывают карточку.
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
