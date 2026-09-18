<?php
/**
 * Страница заявок. Адрес непредсказуемый, вход по логину и паролю,
 * после пяти неудачных попыток вход с этого адреса блокируется на 15 минут.
 *
 * Здесь же выгрузка в CSV: ?export=csv
 */

define('EREVENT_APP', true);
require __DIR__ . '/../form/lib.php';

const FAIL_LIMIT = 5;
const BLOCK_MINUTES = 15;

/* ------------------------------------------------------------------ */
/* Вход                                                                 */
/* ------------------------------------------------------------------ */

function ask_password(string $note = ''): void
{
    header('WWW-Authenticate: Basic realm="Заявки — СОБЫТИЯ РУМ", charset="UTF-8"');
    http_response_code(401);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><meta charset="utf-8"><title>Нужен вход</title>'
        . '<p style="font:16px/1.5 system-ui;padding:24px">Доступ по логину и паролю.'
        . ($note !== '' ? '<br>' . h($note) : '') . '</p>';
    exit;
}

$pdo = db();
$ip = client_ip();

/** Сколько осталось ждать заблокированному адресу, в минутах. */
function block_left(?PDO $pdo, string $ip): int
{
    if (!$pdo) {
        return 0;
    }
    $row = $pdo->prepare('SELECT blocked_until FROM leads_auth WHERE ip = ?');
    $row->execute([$ip]);
    $until = $row->fetchColumn();
    if (!$until) {
        return 0;
    }
    $left = strtotime((string) $until) - time();
    return $left > 0 ? (int) ceil($left / 60) : 0;
}

function note_fail(?PDO $pdo, string $ip): void
{
    if (!$pdo) {
        return;
    }
    $pdo->prepare(
        'INSERT INTO leads_auth (ip, fails, updated_at) VALUES (:ip, 1, NOW())
         ON DUPLICATE KEY UPDATE fails = fails + 1, updated_at = NOW(),
         blocked_until = IF(fails + 1 >= ' . FAIL_LIMIT . ',
             DATE_ADD(NOW(), INTERVAL ' . BLOCK_MINUTES . ' MINUTE), blocked_until)'
    )->execute(['ip' => $ip]);
}

function reset_fails(?PDO $pdo, string $ip): void
{
    if ($pdo) {
        $pdo->prepare('DELETE FROM leads_auth WHERE ip = ?')->execute([$ip]);
    }
}

$left = block_left($pdo, $ip);
if ($left > 0) {
    http_response_code(429);
    header('Content-Type: text/html; charset=utf-8');
    exit('<!doctype html><meta charset="utf-8"><p style="font:16px/1.5 system-ui;padding:24px">'
        . 'Слишком много неудачных попыток входа. Попробуйте через ' . $left . ' мин.</p>');
}

$c = cfg();
$user = $_SERVER['PHP_AUTH_USER'] ?? '';
$pass = $_SERVER['PHP_AUTH_PW'] ?? '';

// Пока логин и пароль не заданы в выкладке, страница просто закрыта.
if ($c['leads_user'] === '' || $c['leads_pass'] === '') {
    ask_password('Страница ещё не настроена: в выкладке нет логина и пароля.');
}
if ($user === '' && $pass === '') {
    ask_password();
}
if (!hash_equals($c['leads_user'], $user) || !hash_equals($c['leads_pass'], $pass)) {
    note_fail($pdo, $ip);
    ask_password('Неверный логин или пароль. После ' . FAIL_LIMIT . ' попыток вход закроется на ' . BLOCK_MINUTES . ' минут.');
}
reset_fails($pdo, $ip);

/* ------------------------------------------------------------------ */
/* Данные                                                               */
/* ------------------------------------------------------------------ */

$leads = [];
$dbError = '';
if ($pdo) {
    try {
        $leads = $pdo->query('SELECT * FROM leads ORDER BY created_at DESC, id DESC')->fetchAll();
    } catch (Throwable $e) {
        $dbError = 'Не удалось прочитать базу: ' . $e->getMessage();
    }
} else {
    $dbError = 'База недоступна — проверьте настройки подключения в выкладке.';
}

// Заявки из запасного журнала: они появляются, только если база была недоступна.
$fallback = __DIR__ . '/../form/fallback/leads.jsonl';
if (is_readable($fallback)) {
    foreach (file($fallback, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $row = json_decode($line, true);
        if (is_array($row)) {
            $row['id'] = 0;
            $row['from_file'] = true;
            $leads[] = $row;
        }
    }
    usort($leads, fn($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));
}

/* ------------------------------------------------------------------ */
/* Выгрузка в CSV                                                       */
/* ------------------------------------------------------------------ */

if (($_GET['export'] ?? '') === 'csv') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="zayavki-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    // Метка BOM — иначе Excel открывает кириллицу кракозябрами.
    fwrite($out, "\xEF\xBB\xBF");
    fputcsv($out, ['Дата', 'Имя', 'Телефон', 'Email', 'Ответить в', 'Услуга',
        'Комментарий', 'Файл', 'Ссылка на файл', 'IP', 'Страница'], ';');
    foreach ($leads as $l) {
        fputcsv($out, [
            $l['created_at'] ?? '', $l['name'] ?? '', $l['phone'] ?? '', $l['email'] ?? '',
            $l['channel'] ?? '', $l['service'] ?? '', $l['comment'] ?? '',
            $l['file_name'] ?? '', $l['file_url'] ?? '', $l['ip'] ?? '', $l['page'] ?? '',
        ], ';');
    }
    fclose($out);
    exit;
}

/** Телефон в таблице показываем не полностью. */
function mask_phone(string $phone): string
{
    $d = preg_replace('/\D+/', '', $phone);
    if (strlen($d) < 10) {
        return $phone === '' ? '' : '•••';
    }
    // Оставляем код страны, код оператора и две последние цифры.
    $tail = substr($d, -2);
    $code = substr($d, -10, 3);
    $country = substr($d, 0, strlen($d) - 10);
    return trim('+' . $country . ' ' . $code) . ' •••-••-' . $tail;
}

function nice_date(string $value): string
{
    $ts = strtotime($value);
    return $ts ? date('d.m.Y H:i', $ts) : $value;
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Заявки — СОБЫТИЯ РУМ</title>
<style>
  :root{--ink:#0e0f0c;--body:#454745;--mute:#868685;--canvas:#fff;--soft:#e8ebe6;--lime:#9fe870}
  *{box-sizing:border-box}
  body{margin:0;padding:clamp(16px,3vw,40px);background:var(--soft);color:var(--ink);
       font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif}
  h1{margin:0 0 4px;font-size:clamp(24px,3vw,36px);letter-spacing:-.02em}
  .sub{margin:0 0 24px;color:var(--body)}
  .bar{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:20px}
  .btn{display:inline-block;padding:10px 20px;border-radius:9999px;border:1px solid var(--ink);
       background:var(--canvas);color:var(--ink);text-decoration:none;font-weight:600;cursor:pointer}
  .btn--primary{background:var(--lime);border-color:var(--lime)}
  .warn{padding:12px 16px;border-radius:12px;background:#ffe9e9;color:#8d1f24;margin-bottom:16px}
  .wrap{overflow-x:auto;background:var(--canvas);border-radius:16px}
  table{border-collapse:collapse;width:100%;min-width:760px}
  th,td{padding:12px 14px;text-align:left;vertical-align:top;border-bottom:1px solid #e6e8e4}
  th{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--mute);white-space:nowrap}
  tr:last-child td{border-bottom:none}
  .date{white-space:nowrap;color:var(--body)}
  .name{font-weight:600}
  .muted{color:var(--mute)}
  .phone{cursor:pointer;border-bottom:1px dashed var(--mute)}
  .comment{max-width:38ch}
  .comment.is-short{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;cursor:pointer}
  .empty{padding:40px;text-align:center;color:var(--mute)}
  .tag{display:inline-block;padding:2px 10px;border-radius:9999px;background:var(--soft);font-size:12px}
  .tag--wait{background:#ffe9c9;color:#7a4a00}
</style>
</head>
<body>

<h1>Заявки с сайта</h1>
<p class="sub">Всего: <?= count($leads) ?>. Новые сверху. Телефон и длинный комментарий раскрываются по клику.
  Пометка «ждёт» — уведомление ещё не дошло, сайт досылает его сам.</p>

<?php if ($dbError !== ''): ?>
  <p class="warn"><?= h($dbError) ?></p>
<?php endif; ?>

<div class="bar">
  <a class="btn btn--primary" href="?export=csv">Выгрузить в CSV</a>
  <a class="btn" href="">Обновить</a>
</div>

<div class="wrap">
<?php if (!$leads): ?>
  <p class="empty">Заявок пока нет.</p>
<?php else: ?>
  <table>
    <thead>
      <tr>
        <th>Дата</th><th>Имя</th><th>Телефон</th><th>Услуга</th>
        <th>Комментарий</th><th>Файл</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($leads as $l): ?>
      <tr>
        <td class="date"><?= h(nice_date((string) ($l['created_at'] ?? ''))) ?>
          <?php if (!empty($l['from_file'])): ?><br><span class="tag">из журнала</span><?php endif; ?>
          <?php
            // Что из уведомлений ещё не дошло. Такие заявки досылает
            // form/retry.php по расписанию.
            $pending = [];
            if (isset($l['tg_sent']) && !$l['tg_sent']) { $pending[] = 'telegram'; }
            if (isset($l['mail_sent']) && !$l['mail_sent']) { $pending[] = 'почта'; }
          ?>
          <?php if ($pending && empty($l['from_file'])): ?>
            <br><span class="tag tag--wait">ждёт: <?= h(implode(', ', $pending)) ?></span>
          <?php endif; ?>
        </td>
        <td>
          <span class="name"><?= h($l['name'] ?? '') ?: '<span class="muted">без имени</span>' ?></span>
          <?php if (!empty($l['email'])): ?>
            <br><a href="mailto:<?= h($l['email']) ?>"><?= h($l['email']) ?></a>
          <?php endif; ?>
          <?php if (!empty($l['channel'])): ?>
            <br><span class="muted"><?= h($l['channel']) ?></span>
          <?php endif; ?>
        </td>
        <td>
          <?php if (!empty($l['phone'])): ?>
            <span class="phone" data-full="<?= h($l['phone']) ?>"><?= h(mask_phone((string) $l['phone'])) ?></span>
          <?php else: ?>
            <span class="muted">—</span>
          <?php endif; ?>
        </td>
        <td><?= h($l['service'] ?? '') ?></td>
        <td>
          <?php $comment = (string) ($l['comment'] ?? ''); ?>
          <?php if ($comment !== ''): ?>
            <div class="comment<?= mb_strlen($comment) > 120 ? ' is-short' : '' ?>"><?= nl2br(h($comment)) ?></div>
          <?php else: ?>
            <span class="muted">—</span>
          <?php endif; ?>
        </td>
        <td>
          <?php if (!empty($l['file_url'])): ?>
            <a href="<?= h($l['file_url']) ?>" target="_blank" rel="noopener"><?= h($l['file_name'] ?: 'файл') ?></a>
          <?php else: ?>
            <span class="muted">—</span>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
<?php endif; ?>
</div>

<script>
  // Телефон раскрывается по клику, длинный комментарий разворачивается.
  document.addEventListener('click', function (e) {
    var phone = e.target.closest('.phone');
    if (phone && phone.dataset.full) {
      phone.textContent = phone.dataset.full;
      phone.classList.remove('phone');
      return;
    }
    var comment = e.target.closest('.comment');
    if (comment) comment.classList.toggle('is-short');
  });
</script>

</body>
</html>
