<?php
/**
 * Досылка уведомлений по расписанию.
 *
 * Заявка всегда сначала записывается в базу, и только потом уходит
 * в Telegram и на почту. Если связи в этот момент не было, заявка остаётся
 * в очереди — этот файл добирает такие и пробует отправить снова.
 *
 * Запускается планировщиком хостинга раз в несколько минут:
 *   как PHP-скрипт:  /путь/до/сайта/form/retry.php
 *   как адрес:       https://sobroom.ru/form/retry.php?key=КЛЮЧ
 *
 * По адресу работает только с ключом из секрета CRON_KEY. Без ключа
 * запуск возможен только с самого сервера (планировщиком).
 */

define('EREVENT_APP', true);
require __DIR__ . '/lib.php';

$isCli = PHP_SAPI === 'cli';
$c = cfg();

if (!$isCli) {
    header('Content-Type: text/plain; charset=utf-8');
    $key = $_GET['key'] ?? '';
    if ($c['cron_key'] === '' || !hash_equals($c['cron_key'], (string) $key)) {
        http_response_code(404);
        exit("Not found\n");
    }
}

// Сколько заявок разбираем за один заход и как долго не сдаёмся:
// 300 попыток при запуске раз в пять минут — это примерно сутки.
const BATCH = 20;
const MAX_TRIES = 300;
const MAX_AGE_DAYS = 14;

$pdo = db();
if (!$pdo) {
    retry_log(['note' => 'база недоступна']);
    exit("База недоступна — пробовать нечего.\n");
}

$pending = $pdo->query(
    'SELECT * FROM leads
      WHERE (tg_sent = 0 OR mail_sent = 0)
        AND notify_tries < ' . MAX_TRIES . '
        AND created_at > DATE_SUB(NOW(), INTERVAL ' . MAX_AGE_DAYS . ' DAY)
      ORDER BY id ASC
      LIMIT ' . BATCH
)->fetchAll();

if (!$pending) {
    retry_log(['pending' => 0]);
    exit("Очередь пуста.\n");
}

echo 'В очереди: ' . count($pending) . PHP_EOL;

$sentTg = 0;
$sentMail = 0;

foreach ($pending as $row) {
    // Заявка ждала связи — помечаем это в заголовке, чтобы не путать
    // с только что пришедшей.
    $waited = max(0, time() - strtotime((string) $row['created_at']));
    $head = $waited > 600
        ? '🔔 <b>Заявка с сайта</b> <i>(доставлена с задержкой)</i>'
        : '';

    [$tg, $mail] = notify_lead($row, (int) $row['id'], $head);
    if ($tg) { $sentTg++; }
    if ($mail) { $sentMail++; }

    printf("заявка №%d: telegram %s, почта %s%s", $row['id'],
        $tg ? 'ок' : 'нет', $mail ? 'ок' : 'нет', PHP_EOL);
}

retry_log([
    'pending' => count($pending),
    'tg' => $sentTg,
    'mail' => $sentMail,
]);

echo "Готово.\n";
