/* Общий скрипт страниц направлений: лента клиентов, портфолио с фильтрами
   и карточка проекта. Данные страница передаёт в <script id="page-data">.
   Шапка, меню, форма, таймлайн, FAQ, отзывы и куки работают от script.js. */
(function () {
  'use strict';

  var raw = document.getElementById('page-data');
  if (!raw) return;

  var data;
  try { data = JSON.parse(raw.textContent); } catch (e) { return; }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Путь до media/ зависит от вложенности страницы.
  var BASE = data.base || '../';

  /* ------------------------------------------------------------------ */
  /* Лента клиентов                                                       */
  /* ------------------------------------------------------------------ */

  (function fillClients() {
    var a = document.getElementById('page-clients-a');
    var b = document.getElementById('page-clients-b');
    if (!a || !b || !data.clients) return;
    var html = data.clients.map(function (c) {
      return '<span class="client-item">' + esc(c) + '</span>';
    }).join('');
    a.innerHTML = html;
    b.innerHTML = html;
  })();

  /* ------------------------------------------------------------------ */
  /* Портфолио                                                            */
  /* ------------------------------------------------------------------ */

  var grid = document.getElementById('page-grid');
  if (!grid || !data.works || !data.works.length) return;

  var works = data.works;
  var filters = data.filters || [];
  var filterBox = document.getElementById('page-filters');
  var active = 'all';

  function cardHtml(w, i) {
    var meta = [w.client, w.year].filter(Boolean).join(' · ');
    return '<button type="button" class="art-work" data-work="' + i + '">' +
      '<span class="art-work__media">' +
        '<img src="' + BASE + 'media/case-' + esc(w.n) + '.jpg" alt="" loading="lazy" data-work-photo="' + i + '">' +
      '</span>' +
      '<span class="art-work__body">' +
        '<span class="art-work__title">' + esc(w.title) + '</span>' +
        '<span class="art-work__meta">' + esc(meta) + '</span>' +
      '</span>' +
    '</button>';
  }

  function render() {
    var list = works.filter(function (w) { return active === 'all' || w.cat === active; });
    grid.innerHTML = list.length
      ? list.map(function (w) { return cardHtml(w, works.indexOf(w)); }).join('')
      : '<p class="art-grid__empty">В этой группе проекты ещё не опубликованы. Напишите нам — покажем работы по этому направлению.</p>';

    // Фото ещё не загружено — вместо битой картинки плашка с названием.
    Array.prototype.forEach.call(grid.querySelectorAll('[data-work-photo]'), function (img) {
      img.addEventListener('error', function () {
        var w = works[parseInt(img.getAttribute('data-work-photo'), 10)];
        var holder = img.parentElement;
        if (holder) holder.innerHTML = '<span class="art-work__holder"><span>' + esc(w.title) + '</span></span>';
      });
    });

    Array.prototype.forEach.call(grid.querySelectorAll('.art-work'), function (btn) {
      btn.addEventListener('click', function () {
        openModal(works[parseInt(btn.getAttribute('data-work'), 10)]);
      });
    });
  }

  if (filterBox && filters.length) {
    filterBox.innerHTML = filters.map(function (f) {
      return '<button type="button" class="chip' + (f.id === 'all' ? ' is-active' : '') +
        '" data-filter="' + esc(f.id) + '" aria-pressed="' + (f.id === 'all') + '">' + esc(f.label) + '</button>';
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
  }

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
      '<div class="art-modal__media"><img src="' + BASE + 'media/case-' + esc(w.n) + '.jpg" alt=""></div>' +
      '<dl class="art-modal__facts">' + facts(w) + '</dl>' +
      '<button type="button" class="btn btn--primary btn--lg" data-close-modal>Хочу похожий проект</button>' +
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

/* --------------------------------------------------------------------------
   Плитка «что мы делаем»: фото ещё загружены не для всех услуг.
   Пока картинки нет — убираем битый <img> и включаем градиентную подложку,
   чтобы карточка выглядела законченной, а не чёрным прямоугольником.
   -------------------------------------------------------------------------- */
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
    // Картинка могла не загрузиться ещё до навешивания обработчика.
    if (img.complete && !img.naturalWidth) fallback();
  });
})();
