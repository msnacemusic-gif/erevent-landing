/**
 * Приёмник заявок с лендинга «СОБЫТИЯ РУМ» → бот @Ereventbot_bot.
 *
 * Зачем нужен: чтобы бот отправил сообщение, нужен его секретный ключ
 * (токен). Если положить токен в код сайта, его увидит любой посетитель
 * и сможет забрать бота себе. Поэтому токен живёт здесь, на стороне
 * сервера, а сайт просто отправляет сюда данные формы.
 *
 * Разворачивается как Cloudflare Worker (бесплатный тариф).
 * Переменные окружения:
 *   BOT_TOKEN   — токен от @BotFather (Secret, не Plain text)
 *   CHAT_ID     — куда слать заявки: ваш ID или ID группы
 *   ALLOW_ORIGIN— адрес сайта, которому разрешено слать сюда заявки
 *   SETUP_KEY   — любая строка; нужна один раз, чтобы узнать CHAT_ID
 */

const MAX_FILE_BYTES = 20 * 1024 * 1024; // ограничение Telegram на документ
const MAX_FIELD_CHARS = 2000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOW_ORIGIN || '*';

    if (request.method === 'OPTIONS') return preflight(origin);

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

    // Скрытое поле, которого не видит человек. Заполнено — значит бот.
    if (str(form.get('company'))) return json({ ok: true }, 200, origin);

    const lead = {
      name: str(form.get('name')),
      phone: str(form.get('phone')),
      email: str(form.get('email')),
      when: str(form.get('when')),
      channel: str(form.get('channel')),
      comment: str(form.get('comment')),
      page: str(form.get('page')),
    };

    if (!lead.phone && !lead.email) return json({ ok: false, error: 'no_contact' }, 400, origin);

    const text = buildMessage(lead);
    const file = form.get('file');
    const hasFile = file && typeof file === 'object' && file.size > 0;

    try {
      if (hasFile && file.size <= MAX_FILE_BYTES) {
        const body = new FormData();
        body.append('chat_id', env.CHAT_ID);
        body.append('caption', text);
        body.append('parse_mode', 'HTML');
        body.append('document', file, file.name || 'attachment');
        await tgForm(env, 'sendDocument', body);
      } else {
        const note = hasFile ? '\n\n⚠️ Файл не приложен — больше 20 МБ.' : '';
        await tg(env, 'sendMessage', { chat_id: env.CHAT_ID, text: text + note, parse_mode: 'HTML' });
      }
    } catch (e) {
      return json({ ok: false, error: 'telegram_failed' }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  },
};

function buildMessage(lead) {
  const rows = [
    ['Имя', lead.name],
    ['Телефон', lead.phone],
    ['Email', lead.email],
    ['Дата и площадка', lead.when],
    ['Ответить в', lead.channel],
    ['Комментарий', lead.comment],
  ];
  const body = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`)
    .join('\n');
  const from = lead.page ? `\n\n<i>${esc(lead.page)}</i>` : '';
  return `🔔 <b>Новая заявка с сайта</b>\n\n${body}${from}`;
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
