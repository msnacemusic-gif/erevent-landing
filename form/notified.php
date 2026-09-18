<?php
/**
 * Отметка «уведомление отправлено из браузера».
 *
 * Сервер хостинга не выпускает исходящие соединения, поэтому уведомление
 * в Telegram отправляет браузер посетителя — через Cloudflare. Когда это
 * получилось, браузер сообщает сюда, и заявка перестаёт числиться
 * в очереди на досылку: дубля не будет.
 *
 * Отметку принимаем только с подписью, которую выдал form/submit.php.
 */

define('EREVENT_APP', true);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['ok' => false], 405);
}

$id = (int) ($_POST['id'] ?? 0);
$token = s($_POST['token'] ?? '', 128);

if ($id <= 0 || $token === '' || !hash_equals(lead_token($id), $token)) {
    json_out(['ok' => false, 'error' => 'Неверная подпись'], 403);
}

$pdo = db();
if (!$pdo) {
    json_out(['ok' => false, 'error' => 'База недоступна'], 503);
}

try {
    $pdo->prepare(
        'UPDATE leads
            SET tg_sent = 1, notify_tries = notify_tries + 1, notify_last = NOW()
          WHERE id = :id'
    )->execute(['id' => $id]);
} catch (Throwable $e) {
    error_log('erevent: отметка об отправке не прошла — ' . $e->getMessage());
    json_out(['ok' => false], 500);
}

json_out(['ok' => true]);
