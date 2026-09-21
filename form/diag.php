<?php
/**
 * Временная страница диагностики уведомлений.
 *
 * Показывает, что отвечают Telegram и почтовый сервер, не раскрывая ни
 * токена, ни паролей — только длины значений. Закрыта тем же логином
 * и паролем, что и страница заявок. После починки файл удаляется.
 */

define('EREVENT_APP', true);
require __DIR__ . '/lib.php';

header('Content-Type: text/plain; charset=utf-8');

$c = cfg();
if ($c['leads_user'] === '' || !hash_equals($c['leads_user'], $_SERVER['PHP_AUTH_USER'] ?? '')
    || !hash_equals($c['leads_pass'], $_SERVER['PHP_AUTH_PW'] ?? '')) {
    header('WWW-Authenticate: Basic realm="Диагностика", charset="UTF-8"');
    http_response_code(401);
    exit("Нужен логин и пароль\n");
}

function line(string $k, $v): void { echo str_pad($k, 26) . $v . PHP_EOL; }
function filled($v): string { return $v === '' ? 'ПУСТО' : 'задано, длина ' . mb_strlen((string) $v); }

echo "== окружение\n";
line('PHP', PHP_VERSION);
foreach (['curl', 'openssl', 'pdo_mysql', 'mbstring'] as $ext) {
    line('расширение ' . $ext, extension_loaded($ext) ? 'есть' : 'НЕТ');
}
line('allow_url_fopen', ini_get('allow_url_fopen') ? 'вкл' : 'выкл');
line('upload_max_filesize', ini_get('upload_max_filesize'));
line('post_max_size', ini_get('post_max_size'));

echo "\n== настройки (значения не показываем)\n";
foreach (['db_host', 'db_name', 'db_user', 'db_pass', 'bot_token', 'mail_user',
          'mail_pass', 'mail_to', 'mail_host', 'leads_user'] as $key) {
    line($key, filled($c[$key]));
}
// Адрес чата виден целиком: это не секрет, а именно он чаще всего и виноват.
line('chat_id', $c['chat_id'] === '' ? 'ПУСТО' : $c['chat_id']);
line('mail_port', (string) $c['mail_port']);

echo "\n== база\n";
$pdo = db();
if ($pdo) {
    line('подключение', 'ок');
    line('заявок в таблице', (string) $pdo->query('SELECT COUNT(*) FROM leads')->fetchColumn());
} else {
    line('подключение', 'НЕ УДАЛОСЬ');
}

echo "\n== очередь уведомлений\n";
if ($pdo) {
    $q = $pdo->query(
        'SELECT COUNT(*) AS n,
                SUM(tg_sent = 0) AS bez_tg,
                SUM(mail_sent = 0) AS bez_pochty,
                MAX(notify_tries) AS popytok,
                MAX(notify_last) AS posledniy
           FROM leads
          WHERE tg_sent = 0 OR mail_sent = 0'
    )->fetch();
    line('заявок в очереди', (string) $q['n']);
    line('из них без telegram', (string) $q['bez_tg']);
    line('из них без почты', (string) $q['bez_pochty']);
    line('попыток у самой старой', (string) ($q['popytok'] ?? 0));
    line('последняя попытка', $q['posledniy'] ?? 'не было');
}

echo "\n== запуски досылки по расписанию\n";
$runs = retry_runs();
if (!$runs) {
    echo "  записей нет — планировщик ни разу не запускал form/retry.php\n";
} else {
    foreach ($runs as $run) {
        $ago = max(0, time() - strtotime((string) $run['at']));
        $what = isset($run['note'])
            ? $run['note']
            : 'в очереди ' . $run['pending']
                . (isset($run['tg'])
                    ? ', ушло в telegram ' . $run['tg'] . ', на почту ' . $run['mail']
                    : '');
        printf("  %s (%d мин назад, %s): %s%s",
            $run['at'], intdiv($ago, 60), $run['sapi'] ?? '?', $what, PHP_EOL);
    }
    $last = end($runs);
    $ago = max(0, time() - strtotime((string) $last['at']));
    line('последний запуск', intdiv($ago, 60) . ' мин назад');
}

echo "\n== Telegram\n";
if ($c['bot_token'] !== '' && extension_loaded('curl')) {
    foreach (['getMe' => [], 'getChat' => ['chat_id' => $c['chat_id']]] as $method => $params) {
        $ch = curl_init('https://api.telegram.org/bot' . $c['bot_token'] . '/' . $method);
        curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15]);
        $res = curl_exec($ch);
        line($method, $res === false
            ? 'ошибка связи: ' . curl_error($ch)
            : 'код ' . curl_getinfo($ch, CURLINFO_RESPONSE_CODE) . ' ' . mb_substr((string) $res, 0, 400));
        curl_close($ch);
    }
}
$log = [];
$sent = tg_send("🧪 <b>Проверка связи</b>\n\nЕсли вы это видите — бот пишет в этот чат.", $log);
line('пробная отправка', $sent ? 'ушла' : 'НЕ УШЛА');
foreach ($log as $l) { echo '  ' . $l . PHP_EOL; }

echo "\n== почта\n";
$log = [];
$sent = smtp_send('Проверка связи — СОБЫТИЯ РУМ',
    '<p>Если вы это видите, письма с сайта уходят.</p>', '', $log);
line('пробное письмо', $sent ? 'ушло' : 'НЕ УШЛО');
foreach ($log as $l) { echo '  ' . $l . PHP_EOL; }

echo "\nГотово.\n";
