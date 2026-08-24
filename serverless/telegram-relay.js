/**
 * Приёмник заявок с лендинга «СОБЫТИЯ РУМ».
 *
 * Заявка уходит сразу в двух направлениях: в бот @Ereventbot_bot и на почту.
 * Вложение кладётся в хранилище, ссылка на скачивание идёт в обоих письмах —
 * так файл доступен и когда он слишком велик для Telegram или для письма.
 *
 * Зачем нужен посредник: чтобы бот отправил сообщение, нужен его секретный
 * ключ. Если положить ключ в код сайта, его увидит любой посетитель. Поэтому
 * ключи живут здесь, на стороне сервера, а сайт просто отправляет сюда форму.
 *
 * Разворачивается как Cloudflare Worker (бесплатный тариф).
 *
 * Обязательные переменные:
 *   BOT_TOKEN    — токен от @BotFather (тип Secret)
 *   CHAT_ID      — куда слать заявки: ваш ID или ID группы
 *   ALLOW_ORIGIN — адрес сайта, которому разрешено слать сюда заявки
 *
 * Почта (необязательно, но заказчик просил дубль):
 *   MAIL_API_KEY — ключ Brevo (тип Secret)
 *   MAIL_TO      — куда слать письма, можно несколько через запятую
 *   MAIL_FROM    — подтверждённый адрес отправителя в Brevo
 *
 * Хранилище файлов (необязательно):
 *   FILES        — привязка R2-бакета (Settings → Bindings → R2 bucket)
 *   PUBLIC_URL   — адрес самого воркера, из него собирается ссылка на файл
 *
 * Служебное:
 *   SETUP_KEY    — любая строка; нужна один раз, чтобы узнать CHAT_ID
 */

// Бот может выложить документ до 50 МБ — это предел Telegram, не наш.
const TELEGRAM_MAX = 50 * 1024 * 1024;
// Больше этого в письмо не вкладываем: почтовые службы режут тяжёлые письма.
const MAIL_ATTACH_MAX = 8 * 1024 * 1024;
// Предел самого Cloudflare на размер запроса.
const REQUEST_MAX = 95 * 1024 * 1024;
const MAX_FIELD_CHARS = 2000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOW_ORIGIN || '*';

    if (request.method === 'OPTIONS') return preflight(origin);

    // Скачивание вложения. Адрес содержит случайный ключ, угадать его нельзя.
    if (request.method === 'GET' && url.pathname.startsWith('/f/')) {
      return serveFile(url, env);
    }

    // Разовая помощь при настройке: показывает, кто писал боту,
    // чтобы взять оттуда CHAT_ID. Закрыто ключом SETUP_KEY.
    if (request.method === 'GET' && url.pathname === '/chats') {
      if (!env.SETUP_KEY || url.searchParams.get('key') !== env.SETUP_KEY) {
        return new Response('Not found', { status: 404 });
      }
      const updates = await tg(env, 'getUpdates', { allowed_updates: '["message"]' });
      const chats = (updates.result || [])
        .map((u) => u.message && u.message.chat)
        .filter(Boolean)
        .map((c) => ({ id: c.id, type: c.type, title: c.title || [c.first_name, c.last_name].filter(Boolean).join(' '), username: c.username }));
      return json({ chats: dedupe(chats) }, 200, origin);
    }

    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (!env.BOT_TOKEN || !env.CHAT_ID) return json({ ok: false, error: 'not_configured' }, 500, origin);

    let form;
    try {
      form = await request.formData();
    } catch (e) {
      return json({ ok: false, error: 'bad_request' }, 400, origin);
    }

    // Скрытое поле, которого не видит человек. Заполнено — почти наверняка
    // бот. Не выбрасываем: помечаем и всё равно доставляем — потерять живую
    // заявку хуже, чем получить помеченный спам.
    const suspect = !!str(form.get('x_ref'));

    const lead = {
      name: str(form.get('name')),
      phone: str(form.get('phone')),
      email: str(form.get('email')),
      channel: str(form.get('channel')),
      comment: str(form.get('comment')),
      page: str(form.get('page')),
    };

    if (!lead.phone && !lead.email) return json({ ok: false, error: 'no_contact' }, 400, origin);

    const file = form.get('file');
    const hasFile = file && typeof file === 'object' && file.size > 0;
    if (hasFile && file.size > REQUEST_MAX) return json({ ok: false, error: 'file_too_big' }, 413, origin);

    // Файл читаем в память один раз и переиспользуем: и в Telegram, и в почту,
    // и в хранилище. Совсем тяжёлый в память не берём — только в хранилище,
    // потоком, иначе воркеру не хватит памяти.
    const attach = { name: '', size: 0, type: '', buf: null, link: '' };
    if (hasFile) {
      attach.name = safeName(file.name || 'attachment');
      attach.size = file.size;
      attach.type = file.type || 'application/octet-stream';
      if (file.size <= TELEGRAM_MAX) attach.buf = await file.arrayBuffer();

      if (env.FILES) {
        try {
          const key = randomKey() + '/' + attach.name;
          await env.FILES.put(key, attach.buf || file.stream(), {
            httpMetadata: { contentType: attach.type, cacheControl: 'private, max-age=0' },
            customMetadata: { uploaded: new Date().toISOString(), lead: lead.name || lead.phone || lead.email },
          });
          attach.link = (env.PUBLIC_URL || url.origin).replace(/\/+$/, '') + '/f/' + key;
        } catch (e) {
          // Хранилище не настроено или отказало — заявка важнее файла,
          // продолжаем без ссылки.
        }
      }
    }

    const text = buildMessage(lead, suspect, hasFile ? attach : null);

    let sentTg = false;
    try {
      if (attach.buf) {
        const body = new FormData();
        body.append('chat_id', env.CHAT_ID);
        body.append('caption', text);
        body.append('parse_mode', 'HTML');
        body.append('document', new Blob([attach.buf], { type: attach.type }), attach.name);
        await tgForm(env, 'sendDocument', body);
      } else {
        await tg(env, 'sendMessage', { chat_id: env.CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true });
      }
      sentTg = true;
    } catch (e) {
      // Разбираемся ниже: письмо ещё может уйти.
    }

    const sentMail = await sendMail(env, lead, text, attach);

    // Заявка потеряна, только если не сработал ни один канал.
    if (!sentTg && !sentMail) return json({ ok: false, error: 'delivery_failed' }, 502, origin);
    return json({ ok: true, telegram: sentTg, mail: sentMail }, 200, origin);
  },
};

/* ------------------------------------------------------------------ */
/* Сообщение                                                            */
/* ------------------------------------------------------------------ */

function buildMessage(lead, suspect, attach) {
  const rows = [
    ['Имя', lead.name],
    ['Телефон', lead.phone],
    ['Email', lead.email],
    ['Ответить в', lead.channel],
    ['Комментарий', lead.comment],
  ];
  const body = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`)
    .join('\n');

  let fileLine = '';
  if (attach) {
    const size = mb(attach.size);
    if (attach.link) {
      fileLine = `\n\n<b>Файл:</b> <a href="${esc(attach.link)}">${esc(attach.name)}</a> (${size})`;
      if (!attach.buf) fileLine += '\n<i>Слишком велик для Telegram — только по ссылке.</i>';
    } else if (attach.buf) {
      fileLine = `\n\n<b>Файл:</b> ${esc(attach.name)} (${size}) — приложен ниже`;
    } else {
      fileLine = `\n\n⚠️ <b>Файл не доставлен:</b> ${esc(attach.name)} (${size}). Хранилище не настроено, а для Telegram файл слишком велик.`;
    }
  }

  const from = lead.page ? `\n\n<i>${esc(lead.page)}</i>` : '';
  const head = suspect ? '⚠️ <b>Похоже на спам</b>' : '🔔 <b>Новая заявка с сайта</b>';
  return `${head}\n\n${body}${fileLine}${from}`;
}

/* ------------------------------------------------------------------ */
/* Почта — Brevo                                                        */
/* ------------------------------------------------------------------ */

async function sendMail(env, lead, text, attach) {
  if (!env.MAIL_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) return false;

  const to = String(env.MAIL_TO)
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));
  if (!to.length) return false;

  const who = lead.name || lead.phone || lead.email || 'без имени';
  const payload = {
    sender: { email: env.MAIL_FROM, name: 'Сайт СОБЫТИЯ РУМ' },
    to,
    subject: 'Заявка с сайта — ' + who,
    htmlContent: '<div style="font:15px/1.6 Arial,sans-serif;color:#0e0f0c">' +
      text.replace(/\n/g, '<br>') + '</div>',
  };

  // Отвечать удобно прямо на письмо, если человек оставил почту.
  if (lead.email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    payload.replyTo = { email: lead.email, name: lead.name || lead.email };
  }

  if (attach && attach.buf && attach.size <= MAIL_ATTACH_MAX) {
    payload.attachment = [{ name: attach.name, content: base64(attach.buf) }];
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.MAIL_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Выдача файла                                                         */
/* ------------------------------------------------------------------ */

async function serveFile(url, env) {
  if (!env.FILES) return new Response('Not found', { status: 404 });
  const key = decodeURIComponent(url.pathname.slice(3));
  if (!/^[0-9a-f]{32}\//.test(key)) return new Response('Not found', { status: 404 });

  const obj = await env.FILES.get(key);
  if (!obj) return new Response('Файл не найден или срок хранения истёк', { status: 404 });

  const name = key.slice(33);
  return new Response(obj.body, {
    headers: {
      'content-type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'content-disposition': 'attachment; filename*=UTF-8\'\'' + encodeURIComponent(name),
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

/* ------------------------------------------------------------------ */
/* Мелочи                                                               */
/* ------------------------------------------------------------------ */

function randomKey() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Имя файла попадает в адрес и в заголовок ответа — оставляем безобидное.
function safeName(name) {
  return String(name).split(/[\\/]/).pop().replace(/[^\w.\-А-Яа-яЁё ]+/g, '_').slice(0, 120) || 'attachment';
}

function mb(bytes) {
  return bytes >= 1024 * 1024
    ? (bytes / 1024 / 1024).toFixed(1) + ' МБ'
    : Math.max(1, Math.round(bytes / 1024)) + ' КБ';
}

function base64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function esc(v) {
  return String(v).slice(0, MAX_FIELD_CHARS).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((c) => (seen.has(c.id) ? false : seen.add(c.id)));
}

async function tg(env, method, params) {
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'telegram error');
  return data;
}

async function tgForm(env, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, { method: 'POST', body });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'telegram error');
  return data;
}

function cors(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
  };
}

function preflight(origin) {
  return new Response(null, { status: 204, headers: cors(origin) });
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors(origin) },
  });
}
