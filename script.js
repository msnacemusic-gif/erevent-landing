(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var EASE = 'cubic-bezier(0.16,1,0.3,1)';

  /* Адрес приёмника заявок (Cloudflare Worker из serverless/telegram-relay.js).
     Он держит токен бота у себя и пересылает заявку в @Ereventbot_bot.
     Пустая строка — форма только имитирует отправку и заявки никуда
     не уходят. */
  var LEAD_ENDPOINT = 'https://lingering-credit-51ce.msnace-music.workers.dev/';

  /* ------------------------------------------------------------------ */
  /* Data                                                                 */
  /* ------------------------------------------------------------------ */

  var VENUES = ['ВДНХ', 'Парк науки и искусства «Сириус»', 'Лужники', 'КВЦ «Экспофорум»',
    'Президентская библиотека им. Б. Н. Ельцина', 'ЦВЗ «Манеж»', 'Гостиный Двор', 'ЦМТ', 'ЦДП',
    'МВЦ «Казань Экспо»', 'ИТ-парк им. Б. Рамеева', 'Казанская Ратуша', 'МВЦ «Екатеринбург-ЭКСПО»',
    'Парк Горького', 'Зарядье', 'ТРЦ «Метрополис»', 'Музей Москвы', 'Loft Hall',
    'Технопарк Сколково', 'Городские парки', 'ТРЦ «Меридиан»'];

  // Отзывы. Пока рыба: карточки помечены placeholder и выглядят как заготовки,
  // чтобы никто не принял их за настоящие отзывы. Чтобы добавить реальный —
  // впишите quote, name, role и company и уберите placeholder.
  var REVIEWS = [
    { placeholder: true, quote: 'Здесь будет отзыв заказчика: что делали, в какие сроки и как всё прошло.', name: 'Имя Фамилия', role: 'Должность', company: 'Компания' },
    { placeholder: true, quote: 'Хорошо работают короткие живые цитаты в два-три предложения.', name: 'Имя Фамилия', role: 'Должность', company: 'Компания' },
    { placeholder: true, quote: 'Ценно, когда в отзыве названы площадка, объём работ и сроки.', name: 'Имя Фамилия', role: 'Должность', company: 'Компания' },
    { placeholder: true, quote: 'Отзывы от разных заказчиков убеждают сильнее, чем один длинный.', name: 'Имя Фамилия', role: 'Должность', company: 'Компания' },
    { placeholder: true, quote: 'Лишние карточки просто удалите — блок подстроится сам.', name: 'Имя Фамилия', role: 'Должность', company: 'Компания' }
  ];

  /* Страницы направлений отдают свои данные блоком
     <script type="application/json" id="page-data">: список клиентов,
     кейсы направления и, если нужны, фильтры. На главной блока нет —
     тогда работают массивы из этого файла. */
  var PAGE = (function () {
    var el = document.getElementById('page-data');
    if (!el) return {};
    try { return JSON.parse(el.textContent) || {}; } catch (e) { return {}; }
  })();

  var CLIENTS = ['Росконгресс', 'Сбербанк', 'Parimatch', 'Haval', 'BingX', 'VK', 'Росатом', 'Минтруд', 'Росмолодёжь'];

  // Каждый кейс ищет фото по номеру: media/case-01.jpg … media/case-10.jpg.
  // Файла нет — карточка сама показывает плашку с названием кейса.
  // Чтобы добавить фото, достаточно положить его в media/ под нужным именем.
  function casePhoto(c, i) {
    var n = c.n || ((i < 9 ? '0' : '') + (i + 1));
    return (PAGE.base || '') + 'media/case-' + n + '.jpg';
  }

  var CASES = [
    { n: '01', title: 'World Atomic Week', year: '2025', client: 'ATOM EXPO', tasks: 'Аренда оборудования, застройка тематической зоны', place: 'ВДНХ' },
    { n: '02', title: 'Сбер Бизнес Фест', year: '2025', client: 'ПАО Сбербанк, ген. подрядчик', tasks: 'Застройка пространства фестиваля, фудкорт и кофестанции, аренда мебели', place: 'Москва, Казань, Волгоград, Омск, Новосибирск' },
    { n: '03', title: 'МТФ «Путешествуй»', year: '2024, 2025, 2026', client: 'Фонд Росконгресс', tasks: 'Застройка стендов, шатры, мебель и оборудование на стенды, изготовление арт-объекта, застройка VIP-зоны', place: 'ВДНХ' },
    { n: '04', title: 'Всероссийская неделя охраны труда', year: '2024, 2025', client: 'Министерство труда, ген. подрядчик', tasks: 'Мебельное обеспечение форумной программы, оборудование стендов, клининг, хэлперы', place: 'Университет «Сириус»' },
    { n: '05', title: 'Фестиваль «Таврида»', year: '2024', client: 'Росмолодёжь, ген. подрядчик', tasks: 'Монтаж палаточного городка и коммуникаций', place: 'Судак' },
    { n: '06', title: 'VK Fest', year: '2025', client: 'VK Community', tasks: 'Кальянный кейтеринг VIP-зон, мебель и оборудование лаунж-зон', place: 'Москва, Лужники' },
    { n: '07', title: 'Турнир по падл-теннису', year: '2025', client: 'Parimatch, ген. подрядчик', tasks: 'Звук, TV-панели, мебель, техническое сопровождение', place: 'Яхт-клуб «Адмирал»' },
    { n: '08', title: 'Запуск спорткомплекса Padel Ball', year: '', client: 'Padel Ball', tasks: 'Дизайн, строительные работы, брендирование, навигация, мебель и оборудование', place: 'Химки, Gopark' },
    { n: '09', title: 'Оформление входной группы БЦ', year: '', client: 'БЦ «Парк Победы»', tasks: 'Дизайн, изготовление и монтаж декораций входной группы', place: 'БЦ «Парк Победы»' },
    { n: '10', title: 'Yandex Data (exclusive event)', year: '', client: 'Yandex Data', tasks: 'Барное и кальянное обслуживание, лаунж-пространство', place: 'Сочи, Красная Поляна' }
  ];

  var CASES_INITIAL = 6;

  if (PAGE.clients && PAGE.clients.length) CLIENTS = PAGE.clients;
  if (PAGE.works && PAGE.works.length) CASES = PAGE.works;

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Тексты берутся из массивов в этом файле, но кавычки и угловые скобки
  // в живом отзыве не должны ломать разметку.
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function scrollToEl(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: top, behavior: reduced() ? 'auto' : 'smooth' });
  }

  /* ------------------------------------------------------------------ */
  /* Header scroll state                                                  */
  /* ------------------------------------------------------------------ */

  var header = document.getElementById('site-header');
  var heroBg = document.getElementById('hero-bg');
  var rafId = null;

  // За сколько пикселей прокрутки логотип доходит от крупного до обычного.
  var LOGO_SHRINK = 240;

  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      var y = window.scrollY || 0;
      header.classList.toggle('is-scrolled', y > 40);
      if (!reduced()) {
        document.documentElement.style.setProperty('--logo-t', Math.min(1, y / LOGO_SHRINK).toFixed(3));
        if (heroBg) heroBg.style.transform = 'translateY(' + Math.min(120, y * 0.18) + 'px)';
      }
      updateTimeline();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Mobile menu                                                          */
  /* ------------------------------------------------------------------ */

  var menu = document.getElementById('mobile-menu');
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var menuCta = document.getElementById('menu-cta');

  function openMenu() {
    menu.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  menuToggle.addEventListener('click', function () { menu.hidden ? openMenu() : closeMenu(); });
  menuClose.addEventListener('click', closeMenu);
  Array.prototype.forEach.call(document.querySelectorAll('.js-menu-link'), function (a) {
    a.addEventListener('click', closeMenu);
  });
  menuCta.addEventListener('click', function () {
    closeMenu();
    setTimeout(function () { scrollToEl('form'); }, 80);
  });

  /* ------------------------------------------------------------------ */
  /* "Рассчитать смету" / go to form                                      */
  /* ------------------------------------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll('.js-go-form'), function (btn) {
    if (btn.id === 'menu-cta') return;
    btn.addEventListener('click', function () { scrollToEl('form'); });
  });

  /* ------------------------------------------------------------------ */
  /* Marquees (venues in hero, clients strip)                             */
  /* ------------------------------------------------------------------ */

  function fillVenues() {
    var track = document.getElementById('venues-track');
    if (!track) return;
    var groups = track.querySelectorAll('.marquee-group');
    var html = VENUES.map(function (v) {
      return '<span class="venue-item"><span>' + v + '</span><span>·</span></span>';
    }).join('');
    groups[0].innerHTML = html;
    groups[1].innerHTML = html;
  }

  function fillClients() {
    var a = document.getElementById('clients-group-a');
    var b = document.getElementById('clients-group-b');
    if (!a || !b) return;
    var html = CLIENTS.map(function (c) {
      return '<span class="client-item">' + c + '</span>';
    }).join('');
    a.innerHTML = html;
    b.innerHTML = html;
  }

  fillVenues();
  fillClients();

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                     */
  /* ------------------------------------------------------------------ */

  function setupReveal() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('.reveal, .reveal-init'));
    if (reduced() || !('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var vh = window.innerHeight;
    var pending = nodes.filter(function (el) { return el.getBoundingClientRect().top > vh * 0.92; });
    nodes.filter(function (el) { return pending.indexOf(el) === -1; }).forEach(function (el) { el.classList.add('is-visible'); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    pending.forEach(function (el) { io.observe(el); });
  }
  setupReveal();

  /* ------------------------------------------------------------------ */
  /* Stats counters                                                       */
  /* ------------------------------------------------------------------ */

  function setupCounters() {
    var host = document.getElementById('stats-grid');
    if (!host) return;
    var nums = Array.prototype.slice.call(host.querySelectorAll('.stat__num'));
    if (reduced() || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute('data-value') + el.getAttribute('data-suffix'); });
      return;
    }
    var ran = false;
    function run() {
      if (ran) return;
      ran = true;
      var dur = 1700, t0 = performance.now();
      var targets = nums.map(function (el) { return parseInt(el.getAttribute('data-value'), 10); });
      var suffixes = nums.map(function (el) { return el.getAttribute('data-suffix') || ''; });
      function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (el, i) {
          el.textContent = Math.round(targets[i] * e) + suffixes[i];
        });
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        run();
      });
    }, { threshold: 0.3 });
    io.observe(host);
  }
  setupCounters();

  /* ------------------------------------------------------------------ */
  /* Cases                                                                */
  /* ------------------------------------------------------------------ */

  var casesList = document.getElementById('cases-list');
  var casesMoreWrap = document.getElementById('cases-more');
  var casesMoreBtn = document.getElementById('cases-more-btn');
  var casesFiltersWrap = document.getElementById('cases-filters');
  var casesAllShown = false;
  var casesFilter = 'all';
  var casesShown = [];
  var hasCases = !!(casesList && casesMoreWrap && casesMoreBtn);

  function casePlaceholderHtml(c) {
    return '<div class="case__placeholder"><span>' + c.title + '<br>Фото добавим по готовности</span></div>';
  }

  function caseMediaHtml(c, i) {
    return '<img src="' + casePhoto(c, i) + '" alt="Фото проекта «' + c.title + '»" loading="lazy" data-case-photo="' + i + '">';
  }

  // Фильтры есть только там, где страница их отдала в page-data.
  function currentCases() {
    if (casesFilter === 'all') return CASES;
    return CASES.filter(function (c) { return c.cat === casesFilter; });
  }

  function renderFilters() {
    if (!casesFiltersWrap || !PAGE.filters || !PAGE.filters.length) return;
    casesFiltersWrap.innerHTML = PAGE.filters.map(function (f) {
      var on = f.id === casesFilter;
      return '<button type="button" class="chip' + (on ? ' is-active' : '') + '" data-filter="' +
        esc(f.id) + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(f.label) + '</button>';
    }).join('');
    Array.prototype.forEach.call(casesFiltersWrap.querySelectorAll('[data-filter]'), function (btn) {
      btn.addEventListener('click', function () {
        casesFilter = btn.getAttribute('data-filter');
        casesAllShown = false;
        renderFilters();
        renderCases();
      });
    });
  }

  function renderCases() {
    casesShown = currentCases();
    casesList.innerHTML = casesShown.map(function (c, i) {
      return (
        '<div class="case" data-case="' + i + '">' +
          '<button type="button" class="case__row" data-case-toggle="' + i + '" aria-expanded="false">' +
            '<span class="case__n">' + c.n + '</span>' +
            '<h3 class="case__title">' + c.title + '</h3>' +
            '<span class="case__year">' + c.year + '</span>' +
            '<span class="case__chevron"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 5l5 5 5-5"></path></svg></span>' +
          '</button>' +
          '<div class="case__panel">' +
            '<div class="case__info">' +
              '<div class="case__fields">' +
                '<div class="case__field"><p class="case__field-label">Заказчик</p><p class="case__field-value">' + c.client + '</p></div>' +
                '<div class="case__field"><p class="case__field-label">Площадка</p><p class="case__field-value">' + c.place + '</p></div>' +
              '</div>' +
              '<div class="case__tasks"><p>Задачи</p><span>' + c.tasks + '</span></div>' +
              '<div class="case__cta"><button type="button" class="btn btn--tertiary btn--md js-case-cta">Хочу похожий проект</button></div>' +
            '</div>' +
            '<div class="case__media">' + caseMediaHtml(c, i) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    if (!casesShown.length) {
      casesList.innerHTML = '<p class="cases__empty">В этом разделе кейсы ещё не выложены.</p>';
    }

    applyCasesVisibility();
    bindCaseEvents();
  }

  function applyCasesVisibility() {
    var items = Array.prototype.slice.call(casesList.querySelectorAll('.case'));
    items.forEach(function (el, i) {
      el.style.display = (casesAllShown || i < CASES_INITIAL) ? '' : 'none';
    });
    var remaining = casesShown.length - CASES_INITIAL;
    if (!casesAllShown && remaining > 0) {
      casesMoreWrap.hidden = false;
      casesMoreBtn.textContent = 'Показать ещё ' + remaining;
    } else {
      casesMoreWrap.hidden = true;
    }
  }

  function bindCaseEvents() {
    Array.prototype.forEach.call(casesList.querySelectorAll('[data-case-toggle]'), function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.case');
        var isOpen = card.classList.contains('is-open');
        Array.prototype.forEach.call(casesList.querySelectorAll('.case.is-open'), function (open) {
          if (open !== card) { open.classList.remove('is-open'); open.querySelector('.case__row').setAttribute('aria-expanded', 'false'); }
        });
        card.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
    Array.prototype.forEach.call(casesList.querySelectorAll('.js-case-cta'), function (btn) {
      btn.addEventListener('click', function () { scrollToEl('form'); });
    });
    // Фото ещё не загружено в media/ — карточка возвращается к плашке.
    Array.prototype.forEach.call(casesList.querySelectorAll('[data-case-photo]'), function (img) {
      img.addEventListener('error', function () {
        var i = parseInt(img.getAttribute('data-case-photo'), 10);
        var holder = img.parentElement;
        if (holder) holder.innerHTML = casePlaceholderHtml(casesShown[i]);
      });
    });
  }

  // Страница без блока кейсов — пропускаем, скрипт общий для всего сайта.
  if (hasCases) {
    casesMoreBtn.addEventListener('click', function () {
      casesAllShown = true;
      applyCasesVisibility();
    });

    renderFilters();
    renderCases();
  }

  /* ------------------------------------------------------------------ */
  /* Reviews carousel                                                     */
  /* ------------------------------------------------------------------ */

  (function setupReviews() {
    var viewport = document.getElementById('reviews-track');
    var dotsBox = document.getElementById('reviews-dots');
    var prev = document.getElementById('reviews-prev');
    var next = document.getElementById('reviews-next');
    var section = document.getElementById('reviews');
    if (!viewport || !section) return;

    // Отзывов нет вовсе — блок не показываем, чем пустая полоса.
    if (!REVIEWS.length) { section.hidden = true; return; }

    viewport.innerHTML = REVIEWS.map(function (r) {
      var role = [r.role, r.company].filter(Boolean).join(', ');
      return '<figure class="review' + (r.placeholder ? ' review--placeholder' : '') + '">' +
        '<svg class="review__mark" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M9.7 5.5c-3.4 1.4-5.7 4.6-5.7 8.4 0 2.8 1.8 4.6 4.2 4.6 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.4 0-.9.1-1 .1.4-1.7 2-3.6 3.7-4.5l-1.7-1.4Zm9 0c-3.4 1.4-5.7 4.6-5.7 8.4 0 2.8 1.8 4.6 4.2 4.6 2.2 0 3.8-1.6 3.8-3.7 0-2-1.4-3.5-3.3-3.5-.4 0-.9.1-1 .1.4-1.7 2-3.6 3.7-4.5l-1.7-1.4Z"></path></svg>' +
        '<blockquote class="review__quote">' + esc(r.quote) + '</blockquote>' +
        '<figcaption class="review__author">' +
          '<span class="review__name">' + esc(r.name) + '</span>' +
          (role ? '<span class="review__role">' + esc(role) + '</span>' : '') +
        '</figcaption>' +
      '</figure>';
    }).join('');

    var cards = Array.prototype.slice.call(viewport.querySelectorAll('.review'));
    var dots = [];

    // Шаг прокрутки — ширина карточки с отступом.
    function step() {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : viewport.clientWidth;
    }

    // Сколько карточек помещается разом (задаётся в CSS через --per).
    function perView() {
      var st = step();
      return st > 0 ? Math.max(1, Math.round(viewport.clientWidth / st)) : 1;
    }

    // Столько положений у ленты. Влезли все карточки — положение одно,
    // листать нечего, и органы управления прячем.
    function stops() {
      return Math.max(1, cards.length - perView() + 1);
    }

    function current() {
      var st = step();
      return st > 0 ? Math.min(stops() - 1, Math.round(viewport.scrollLeft / st)) : 0;
    }

    function goTo(i) {
      var target = Math.max(0, Math.min(stops() - 1, i));
      viewport.scrollTo({ left: target * step(), behavior: reduced() ? 'auto' : 'smooth' });
    }

    function buildDots() {
      var n = stops();
      dotsBox.innerHTML = n > 1
        ? Array.apply(null, { length: n }).map(function (_, i) {
            return '<button type="button" class="reviews__dot" role="tab" aria-label="Отзыв ' + (i + 1) + '"></button>';
          }).join('')
        : '';
      dots = Array.prototype.slice.call(dotsBox.querySelectorAll('.reviews__dot'));
      dots.forEach(function (d, i) { d.addEventListener('click', function () { goTo(i); }); });
      section.classList.toggle('reviews--static', n <= 1);
    }

    function sync() {
      var i = current();
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === i);
        d.setAttribute('aria-selected', String(n === i));
      });
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= stops() - 1;
    }

    if (prev) prev.addEventListener('click', function () { goTo(current() - 1); });
    if (next) next.addEventListener('click', function () { goTo(current() + 1); });

    // Стрелками с клавиатуры, когда лента в фокусе.
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current() - 1); }
    });

    var tick = null;
    viewport.addEventListener('scroll', function () {
      if (tick) return;
      tick = requestAnimationFrame(function () { tick = null; sync(); });
    }, { passive: true });

    // Ширина карточки зависит от экрана — при изменении пересобираем точки.
    var was = 0;
    window.addEventListener('resize', function () {
      var n = stops();
      if (n !== was) { was = n; buildDots(); }
      sync();
    });

    was = stops();
    buildDots();
    sync();
  })();

  /* ------------------------------------------------------------------ */
  /* FAQ                                                                  */
  /* ------------------------------------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll('.faq__item'), function (item) {
    var q = item.querySelector('.faq__q');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      Array.prototype.forEach.call(document.querySelectorAll('.faq__item.is-open'), function (open) {
        if (open !== item) { open.classList.remove('is-open'); open.querySelector('.faq__q').setAttribute('aria-expanded', 'false'); }
      });
      item.classList.toggle('is-open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ------------------------------------------------------------------ */
  /* Process timeline — scroll progress                                   */
  /* ------------------------------------------------------------------ */

  var STEP_COUNT = 4;
  var timelineHost = document.getElementById('timeline');
  var timelineSteps = timelineHost ? Array.prototype.slice.call(timelineHost.querySelectorAll('.timeline__step')) : [];
  var activeStep = -1;

  function updateTimeline() {
    if (!timelineHost) return;
    var r = timelineHost.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.78 - r.top) / Math.max(1, r.height);
    var idx = Math.floor(Math.max(0, Math.min(1, p)) * STEP_COUNT) - 1;
    var active = r.top > vh ? -1 : Math.min(STEP_COUNT - 1, idx);
    if (active !== activeStep) {
      activeStep = active;
      timelineSteps.forEach(function (el, i) {
        el.classList.toggle('is-active', i <= activeStep);
      });
    }
  }
  updateTimeline();

  /* ------------------------------------------------------------------ */
  /* Service cards → append to comment + scroll to form                   */
  /* ------------------------------------------------------------------ */

  Array.prototype.forEach.call(document.querySelectorAll('.service-card'), function (card) {
    card.addEventListener('click', function () {
      // У направления есть своя страница — открываем её в новой вкладке,
      // чтобы человек не терял место на главной. Через временную ссылку,
      // а не window.open: с noopener тот возвращает null даже при успехе,
      // и по этому null текущая вкладка уходила туда же.
      var href = card.getAttribute('data-href');
      if (href) {
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      var name = card.getAttribute('data-service');
      var textarea = document.getElementById('f-comment');
      if (textarea && name) {
        var c = textarea.value;
        if (c.indexOf(name) === -1) textarea.value = c ? c + ', ' + name : name;
      }
      scrollToEl('form');
    });
  });

  /* ------------------------------------------------------------------ */
  /* Hero video — грузится и запускается всегда                          */
  /* ------------------------------------------------------------------ */

  (function setupHeroVideo() {
    var video = document.getElementById('hero-video');
    if (!video) return;

    // Автозапуск разрешают только беззвучному видео — держим звук выключенным
    // жёстко, даже если браузер или расширение попробуют его вернуть.
    function silence() { video.muted = true; video.defaultMuted = true; video.volume = 0; }
    silence();
    video.loop = true;
    video.playsInline = true;
    video.addEventListener('volumechange', silence);

    function attempt() {
      if (!video.paused) return;
      silence();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    video.addEventListener('playing', function () { video.classList.add('is-ready'); });

    // Ролик поставили на паузу извне — энергосбережение, уход в фон,
    // расширение браузера. Поднимаем сразу же.
    video.addEventListener('pause', function () { setTimeout(attempt, 150); });

    // Пробуем на каждом рубеже загрузки: чем раньше готов первый кадр,
    // тем раньше уйдёт первая попытка.
    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(function (e) {
      video.addEventListener(e, attempt);
    });
    attempt();

    // Автозапуск заблокирован — энергосбережение, настройки браузера,
    // политика вкладки. Стартуем при первом же действии человека.
    // Слушатели не снимаем: блокировка может включиться и посреди просмотра,
    // а attempt при играющем ролике выходит сразу.
    ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'].forEach(function (e) {
      window.addEventListener(e, attempt, { passive: true });
    });

    // Вернулись на вкладку — пробуем снова.
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) attempt();
    });

    // Постоянная подстраховка на случай, если ролик встал молча, без события.
    setInterval(attempt, 2000);

    // Зацикливание через loop иногда срывается — возвращаем в начало руками.
    video.addEventListener('ended', function () { video.currentTime = 0; attempt(); });

    // Источник не открылся вовсе — под видео остаётся его же первый кадр,
    // так что шапка выглядит так же, только без движения.
    video.addEventListener('error', function () {
      if (video.readyState < 2) video.classList.remove('is-ready');
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Form                                                                 */
  /* ------------------------------------------------------------------ */

  var form = document.getElementById('lead-form');
  var phoneInput = document.getElementById('f-phone');
  var emailInput = document.getElementById('f-email');
  var errPhone = document.getElementById('err-phone');
  var errEmail = document.getElementById('err-email');
  var errAgree = document.getElementById('err-agree');
  var agreeInput = document.getElementById('f-agree');
  var fileInput = document.getElementById('f-file');
  var fileLabel = document.getElementById('file-label');
  var submitBtn = document.getElementById('submit-btn');
  var submitLabel = document.getElementById('submit-label');
  var submitSpinner = document.getElementById('submit-spinner');
  var formError = document.getElementById('form-error');
  var formSuccess = document.getElementById('form-success');
  var formReset = document.getElementById('form-reset');
  var channelInput = document.getElementById('f-channel');
  var touched = false;

  function formatPhone(raw) {
    var d = String(raw).replace(/\D/g, '');
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }

  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
    if (touched) validateContact();
  });
  emailInput.addEventListener('input', function () { if (touched) validateContact(); });

  function digits() { return phoneInput.value.replace(/\D/g, ''); }
  function hasPhone() { return digits().length >= 11; }
  function hasEmail() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim()); }

  // Единственное обязательное поле — способ связи: телефон или почта, любой
  // на выбор. Имя, комментарий, файл и мессенджеры заполнять не обязательно.
  function validateContact() {
    var needContact = touched && !hasPhone() && !hasEmail();
    errPhone.textContent = needContact ? 'Оставьте телефон или email — этого достаточно' : '';
    phoneInput.parentElement.classList.toggle('has-error', needContact);
    emailInput.parentElement.classList.toggle('has-error', needContact);
    errEmail.textContent = '';
    return !needContact;
  }

  // Способов связи может быть несколько — чипы работают как переключатели,
  // а не как выбор одного из. В заявку уходят через запятую.
  var chips = Array.prototype.slice.call(document.querySelectorAll('#channel-options .chip'));

  function syncChannels() {
    var picked = chips
      .filter(function (c) { return c.classList.contains('is-active'); })
      .map(function (c) { return c.getAttribute('data-channel'); });
    channelInput.value = picked.join(', ');
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var on = !chip.classList.contains('is-active');
      chip.classList.toggle('is-active', on);
      chip.setAttribute('aria-pressed', String(on));
      syncChannels();
    });
  });

  // Предел вложения. 50 МБ — столько бот может выложить в Telegram напрямую.
  // Когда в воркере включено хранилище R2, можно поднять до 90: файл ляжет
  // в хранилище, а в заявку попадёт ссылка на скачивание.
  var MAX_UPLOAD_MB = 50;

  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      fileLabel.textContent = 'Файл больше ' + MAX_UPLOAD_MB + ' МБ — пришлите ссылкой';
      fileInput.value = '';
      return;
    }
    fileLabel.textContent = f.name + ' — ' + (f.size / 1024 / 1024).toFixed(1) + ' МБ';
  });

  agreeInput.addEventListener('change', onAgreeChange);
  function onAgreeChange() {
    document.querySelector('.checkbox').classList.toggle('is-checked', agreeInput.checked);
    if (touched) errAgree.hidden = agreeInput.checked;
  }

  function resetForm() {
    form.reset();
    chips.forEach(function (c) {
      var on = c.getAttribute('data-channel') === 'Telegram';
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    syncChannels();
    fileLabel.textContent = 'Прикрепить файл — ТЗ, план площадки, референсы (до ' + MAX_UPLOAD_MB + ' МБ)';
    touched = false;
    errPhone.textContent = '';
    errEmail.textContent = '';
    errAgree.hidden = true;
    document.querySelector('.checkbox').classList.remove('is-checked');
    phoneInput.parentElement.classList.remove('has-error');
    emailInput.parentElement.classList.remove('has-error');
    formError.hidden = true;
    form.hidden = false;
    formSuccess.hidden = true;
    submitBtn.disabled = false;
  }

  formReset.addEventListener('click', resetForm);

  function sendingState(on) {
    submitBtn.disabled = on;
    submitSpinner.hidden = !on;
    submitLabel.textContent = on ? 'Отправляем' : 'Отправить заявку';
  }

  function showSent() {
    sendingState(false);
    form.hidden = true;
    formSuccess.hidden = false;
  }

  function showFailed() {
    sendingState(false);
    formError.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    touched = true;
    var contactOk = validateContact();
    errAgree.hidden = agreeInput.checked;

    if (!contactOk || !agreeInput.checked) return;

    formError.hidden = true;
    sendingState(true);

    // Адрес приёмника не задан — оставляем прежнее поведение-заглушку,
    // чтобы форма не показывала ошибку до подключения бота.
    if (!LEAD_ENDPOINT) {
      setTimeout(showSent, 1300);
      return;
    }

    var payload = new FormData(form);
    payload.set('page', document.title + ' — ' + window.location.href);

    fetch(LEAD_ENDPOINT, { method: 'POST', body: payload })
      .then(function (res) { return res.ok ? res.json() : { ok: false }; })
      .then(function (data) { if (data && data.ok) showSent(); else showFailed(); })
      .catch(showFailed);
  });

  /* ------------------------------------------------------------------ */
  /* Cookie notice                                                        */
  /* ------------------------------------------------------------------ */

  (function setupCookieNotice() {
    var banner = document.getElementById('cookie-banner');
    var accept = document.getElementById('cookie-accept');
    if (!banner || !accept) return;

    var KEY = 'erevent-cookie-consent';

    // В приватном режиме и при запрете хранения обращение к localStorage
    // бросает исключение — тогда просто показываем баннер на эту сессию.
    function stored() {
      try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function remember() {
      try { window.localStorage.setItem(KEY, '1'); } catch (e) {}
    }

    if (stored()) return;

    banner.hidden = false;
    banner.classList.add('is-visible');

    accept.addEventListener('click', function () {
      remember();
      banner.classList.remove('is-visible');
      banner.hidden = true;
    });
  })();

  /* ------------------------------------------------------------------ */
  /* Плитка услуг: фото загружены не для всех карточек                    */
  /* ------------------------------------------------------------------ */

  // Пока картинки нет, убираем битый <img> и включаем градиентную подложку,
  // чтобы карточка выглядела законченной, а не чёрным прямоугольником.
  (function () {
    var photos = document.querySelectorAll('.bento .service-card__photo');
    if (!photos.length) return;

    Array.prototype.forEach.call(photos, function (img) {
      function fallback() {
        var card = img.closest('.service-card');
        if (card) card.classList.add('service-card--nophoto');
        img.remove();
      }
      img.addEventListener('error', fallback);
      if (img.complete && !img.naturalWidth) fallback();
    });
  })();

})();
