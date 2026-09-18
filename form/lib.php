<?php
/**
 * Общий код приёмника заявок: настройки, база, Telegram, почта.
 *
 * Файл подключается из form/submit.php и со страницы заявок.
 * Напрямую из браузера не открывается — отдаётся пустой страницей.
 */

if (!defined('EREVENT_APP')) {
    http_response_code(404);
    exit;
}

/**
 * Настройки лежат в form/config.php. Этот файл не хранится в репозитории:
 * его собирает выкладка из секретов GitHub. Если файла нет — работаем
 * с пустыми значениями, и заявка всё равно не потеряется (см. save_lead).
 */
function cfg(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }

    $defaults = [
        'db_host' => 'localhost',
        'db_name' => '',
        'db_user' => '',
        'db_pass' => '',
        'bot_token' => '',
        'chat_id' => '',
        'mail_user' => '',
        'mail_pass' => '',
        'mail_to' => '',
        'mail_host' => 'smtp.timeweb.ru',
        'mail_port' => 465,
        'leads_user' => '',
        'leads_pass' => '',
        'site' => 'https://sobroom.ru',
    ];

    $file = __DIR__ . '/config.php';
    $cfg = is_readable($file) ? array_merge($defaults, (array) require $file) : $defaults;
    return $cfg;
}

/** Подключение к базе. Возвращает null, если база недоступна. */
function db(): ?PDO
{
    static $pdo = false;
    if ($pdo !== false) {
        return $pdo;
    }

    $c = cfg();
    if ($c['db_name'] === '' || $c['db_user'] === '') {
        return $pdo = null;
    }

    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $c['db_host'], $c['db_name']);
        $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        ensure_tables($pdo);
    } catch (Throwable $e) {
        error_log('erevent: база недоступна — ' . $e->getMessage());
        $pdo = null;
    }
    return $pdo;
}

/** Таблицы создаются сами при первом обращении — заводить их руками не нужно. */
function ensure_tables(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS leads (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            created_at DATETIME NOT NULL,
            name VARCHAR(255) NOT NULL DEFAULT "",
            phone VARCHAR(64) NOT NULL DEFAULT "",
            email VARCHAR(255) NOT NULL DEFAULT "",
            channel VARCHAR(255) NOT NULL DEFAULT "",
            service VARCHAR(255) NOT NULL DEFAULT "",
            comment TEXT,
            file_name VARCHAR(255) NOT NULL DEFAULT "",
            file_url VARCHAR(255) NOT NULL DEFAULT "",
            ip VARCHAR(64) NOT NULL DEFAULT "",
            page VARCHAR(500) NOT NULL DEFAULT "",
            suspect TINYINT(1) NOT NULL DEFAULT 0,
            INDEX (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    // Счётчик неудачных входов на страницу заявок — для блокировки перебора.
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS leads_auth (
            ip VARCHAR(64) NOT NULL PRIMARY KEY,
            fails SMALLINT UNSIGNED NOT NULL DEFAULT 0,
            blocked_until DATETIME NULL,
            updated_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

/* ------------------------------------------------------------------ */
/* Мелкие помощники                                                     */
/* ------------------------------------------------------------------ */

function s($value, int $limit = 2000): string
{
    $v = is_string($value) ? $value : '';
    $v = str_replace(["\0", "\r"], ['', ''], $v);
    $v = trim($v);
    return mb_substr($v, 0, $limit);
}

function h(?string $v): string
{
    return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function client_ip(): string
{
    foreach (['HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = explode(',', (string) $_SERVER[$key])[0];
            return substr(trim($ip), 0, 64);
        }
    }
    return '';
}

function json_out(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ------------------------------------------------------------------ */
/* Telegram                                                             */
/* ------------------------------------------------------------------ */

function tg_send(string $html, ?array &$log = null): bool
{
    $c = cfg();
    $note = function (string $line) use (&$log) { if (is_array($log)) { $log[] = $line; } };

    if ($c['bot_token'] === '' || $c['chat_id'] === '') {
        $note('не задан токен бота или адрес чата');
        return false;
    }
    if (!function_exists('curl_init')) {
        $note('на хостинге нет расширения curl');
        return false;
    }

    $url = 'https://api.telegram.org/bot' . $c['bot_token'] . '/sendMessage';
    $body = http_build_query([
        'chat_id' => $c['chat_id'],
        'text' => $html,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $ok = $res !== false && $code === 200;
    $note('ответ Telegram: код ' . $code
        . ($res === false ? ', ошибка связи: ' . curl_error($ch) : ' ' . mb_substr((string) $res, 0, 300)));
    if (!$ok) {
        error_log('erevent: telegram не ответил — ' . curl_error($ch) . ' ' . (string) $res);
    }
    curl_close($ch);
    return $ok;
}

/* ------------------------------------------------------------------ */
/* Почта: прямой SMTP хостинга                                          */
/* ------------------------------------------------------------------ */

/**
 * Небольшой SMTP-клиент. Готовой библиотеки на хостинге нет, а встроенная
 * функция mail() не умеет авторизацию, поэтому говорим с сервером сами.
 */
function smtp_send(string $subject, string $html, string $replyTo = '', ?array &$log = null): bool
{
    $c = cfg();
    $note = function (string $line) use (&$log) { if (is_array($log)) { $log[] = $line; } };

    if ($c['mail_user'] === '' || $c['mail_pass'] === '' || $c['mail_to'] === '') {
        $note('не заданы адрес ящика, пароль или получатель');
        return false;
    }

    $recipients = array_values(array_filter(array_map('trim', explode(',', $c['mail_to']))));
    if (!$recipients) {
        return false;
    }

    $port = (int) $c['mail_port'];
    $host = ($port === 465 ? 'ssl://' : '') . $c['mail_host'];
    $note('соединяемся с ' . $host . ':' . $port);
    $conn = @fsockopen($host, $port, $errno, $errstr, 20);
    if (!$conn) {
        $note('соединение не открылось: ' . $errstr . ' (' . $errno . ')');
        error_log("erevent: SMTP не открылся — $errstr");
        return false;
    }
    stream_set_timeout($conn, 20);

    $read = function () use ($conn): string {
        $out = '';
        while (($line = fgets($conn, 515)) !== false) {
            $out .= $line;
            if (strlen($line) < 4 || $line[3] === ' ') {
                break;
            }
        }
        return $out;
    };
    $say = function (string $cmd) use ($conn, $read): string {
        fwrite($conn, $cmd . "\r\n");
        return $read();
    };
    $code = fn(string $r): int => (int) substr($r, 0, 3);

    $ok = $code($read()) === 220;
    $hello = $say('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'sobroom.ru'));

    // Порт 587 — открытое соединение с последующим переходом на шифрование.
    if ($ok && $port !== 465 && stripos($hello, 'STARTTLS') !== false) {
        if ($code($say('STARTTLS')) === 220
            && stream_socket_enable_crypto($conn, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            $hello = $say('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'sobroom.ru'));
        } else {
            $ok = false;
        }
    }

    if ($ok) {
        $say('AUTH LOGIN');
        $say(base64_encode($c['mail_user']));
        $answer = $say(base64_encode($c['mail_pass']));
        $ok = $code($answer) === 235;
        $note('вход в ящик: ' . trim(mb_substr($answer, 0, 200)));
    }
    if ($ok) {
        $answer = $say('MAIL FROM:<' . $c['mail_user'] . '>');
        $ok = $code($answer) === 250;
        $note('отправитель: ' . trim(mb_substr($answer, 0, 200)));
    }
    foreach ($recipients as $to) {
        if (!$ok) {
            break;
        }
        $ok = in_array($code($say('RCPT TO:<' . $to . '>')), [250, 251], true);
    }

    if ($ok && $code($say('DATA')) === 354) {
        $boundaryless = [
            'From: =?UTF-8?B?' . base64_encode('СОБЫТИЯ РУМ — сайт') . '?= <' . $c['mail_user'] . '>',
            'To: ' . implode(', ', $recipients),
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Date: ' . date('r'),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
        ];
        if ($replyTo !== '') {
            $boundaryless[] = 'Reply-To: ' . $replyTo;
        }
        $message = implode("\r\n", $boundaryless) . "\r\n\r\n"
            . chunk_split(base64_encode($html));
        // Точка в начале строки завершила бы письмо — экранируем.
        $message = preg_replace('/^\./m', '..', $message);
        fwrite($conn, $message . "\r\n.\r\n");
        $answer = $read();
        $ok = $code($answer) === 250;
        $note('отправка письма: ' . trim(mb_substr($answer, 0, 200)));
    } else {
        $note('сервер не принял команду DATA');
        $ok = false;
    }

    $say('QUIT');
    fclose($conn);

    if (!$ok) {
        error_log('erevent: письмо не ушло');
    }
    return $ok;
}
