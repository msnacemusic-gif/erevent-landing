(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var EASE = 'cubic-bezier(0.16,1,0.3,1)';

  /* ------------------------------------------------------------------ */
  /* Data                                                                 */
  /* ------------------------------------------------------------------ */

  var VENUES = ['ВДНХ', 'Парк науки и искусства «Сириус»', 'Лужники', 'КВЦ «Экспофорум»',
    'Президентская библиотека им. Б. Н. Ельцина', 'ЦВЗ «Манеж»', 'Гостиный Двор', 'ЦМТ', 'ЦДП',
    'МВЦ «Казань Экспо»', 'ИТ-парк им. Б. Рамеева', 'Казанская Ратуша', 'МВЦ «Екатеринбург-ЭКСПО»'];

  var CLIENTS = ['Росконгресс', 'Сбербанк', 'Parimatch', 'Haval', 'BingX', 'VK', 'Росатом', 'Минтруд', 'Росмолодёжь'];

  // Каждый кейс ищет фото по номеру: media/case-01.jpg … media/case-10.jpg.
  // Файла нет — карточка сама показывает плашку с названием кейса.
  // Чтобы добавить фото, достаточно положить его в media/ под нужным именем.
  function casePhoto(i) {
    return 'media/case-' + (i < 9 ? '0' : '') + (i + 1) + '.jpg';
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

  /* ------------------------------------------------------------------ */
  /* Helpers                                                              */
  /* ------------------------------------------------------------------ */

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  var casesAllShown = false;

  function casePlaceholderHtml(c) {
    return '<div class="case__placeholder"><span>' + c.title + '<br>Фото добавим по готовности</span></div>';
  }

  function caseMediaHtml(c, i) {
    return '<img src="' + casePhoto(i) + '" alt="Фото проекта «' + c.title + '»" loading="lazy" data-case-photo="' + i + '">';
  }

  function renderCases() {
    casesList.innerHTML = CASES.map(function (c, i) {
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

    applyCasesVisibility();
    bindCaseEvents();
  }

  function applyCasesVisibility() {
    var items = Array.prototype.slice.call(casesList.querySelectorAll('.case'));
    items.forEach(function (el, i) {
      el.style.display = (casesAllShown || i < CASES_INITIAL) ? '' : 'none';
    });
    var remaining = CASES.length - CASES_INITIAL;
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
        if (holder) holder.innerHTML = casePlaceholderHtml(CASES[i]);
      });
    });
  }

  casesMoreBtn.addEventListener('click', function () {
    casesAllShown = true;
    applyCasesVisibility();
  });

  renderCases();

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
  /* Hero video — conditional, lazy load                                  */
  /* ------------------------------------------------------------------ */

  // Загрузку видео запускает встроенный скрипт в разметке — здесь только
  // звук, зацикливание и проявление первого кадра, как только он готов.
  (function setupHeroVideo() {
    var video = document.getElementById('hero-video');
    if (!video || !video.getAttribute('src')) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.loop = true;

    function show() { video.classList.add('is-ready'); }
    if (video.readyState >= 2) show();
    else video.addEventListener('loadeddata', show, { once: true });

    video.addEventListener('volumechange', function () { video.muted = true; video.volume = 0; });
    video.addEventListener('ended', function () { video.currentTime = 0; video.play().catch(function () {}); });
    video.play().catch(function () {});
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

  function validateContact() {
    var needContact = touched && !hasPhone() && !hasEmail();
    errPhone.textContent = needContact ? 'Оставьте телефон или email' : '';
    phoneInput.parentElement.classList.toggle('has-error', needContact);
    emailInput.parentElement.classList.toggle('has-error', needContact);
    errEmail.textContent = '';
    return !needContact;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (chip) {
    chip.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (c) { c.classList.remove('is-active'); });
      chip.classList.add('is-active');
      channelInput.value = chip.getAttribute('data-channel');
    });
  });

  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      fileLabel.textContent = 'Файл больше 20 МБ — пришлите ссылкой';
      fileInput.value = '';
      return;
    }
    fileLabel.textContent = f.name;
  });

  agreeInput.addEventListener('change', onAgreeChange);
  function onAgreeChange() {
    document.querySelector('.checkbox').classList.toggle('is-checked', agreeInput.checked);
    if (touched) errAgree.hidden = agreeInput.checked;
  }

  function resetForm() {
    form.reset();
    channelInput.value = 'Telegram';
    Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (c) {
      c.classList.toggle('is-active', c.getAttribute('data-channel') === 'Telegram');
    });
    fileLabel.textContent = 'Прикрепить файл — ТЗ, план площадки, референсы (до 20 МБ)';
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    touched = true;
    var contactOk = validateContact();
    errAgree.hidden = agreeInput.checked;

    if (!contactOk || !agreeInput.checked) return;

    formError.hidden = true;
    submitBtn.disabled = true;
    submitSpinner.hidden = false;
    submitLabel.textContent = 'Отправляем';

    setTimeout(function () {
      submitBtn.disabled = false;
      submitSpinner.hidden = true;
      submitLabel.textContent = 'Отправить заявку';
      form.hidden = true;
      formSuccess.hidden = false;
    }, 1300);
  });

})();
