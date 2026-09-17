<?php
/**
 * Приёмник заявок с сайта «СОБЫТИЯ РУМ».
 *
 * Порядок строгий: сначала заявка записывается в базу на сервере в России,
 * и только потом уходят уведомления в Telegram и на почту. Если уведомления
 * не отправятся, заявка всё равно сохранена.
 *
 * Если база вдруг недоступна, заявка пишется в файл рядом с сайтом — это
 * тоже запись на российском сервере, и ни одна заявка не теряется.
 */

define('EREVENT_APP', true);
require __DIR__ . '/lib.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_out(['ok' => false, 'error' => 'Только POST'], 405);
}

// Браузер прислал больше, чем принимает PHP: массивы приходят пустыми.
if (empty($_POST) && empty($_FILES) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
    json_out(['ok' => false, 'error' => 'Файл слишком большой — пришлите его ссылкой'], 413);
}

/* ------------------------------------------------------------------ */
/* Поля                                                                 */
/* ------------------------------------------------------------------ */

// Ловушка для ботов: человек этого поля не видит. Заполнено — делаем вид,
// что всё прошло, но заявку никуда не отправляем.
$suspect = s($_POST['x_ref'] ?? '') !== '';
if ($suspect) {
    json_out(['ok' => true]);
}

$lead = [
    'name' => s($_POST['name'] ?? '', 255),
    'phone' => s($_POST['phone'] ?? '', 64),
    'email' => s($_POST['email'] ?? '', 255),
    'channel' => s($_POST['channel'] ?? '', 255),
    'comment' => s($_POST['comment'] ?? '', 4000),
    'page' => s($_POST['page'] ?? '', 500),
];

if ($lead['phone'] === '' && $lead['email'] === '') {
    json_out(['ok' => false, 'error' => 'Оставьте телефон или почту — иначе мы не сможем ответить'], 422);
}

/** Какая страница — такая и услуга: на направлениях это понятно из адреса. */
function service_from_page(string $page): string
{
    $map = [
        'art-obekty' => 'Декорации и арт-объекты',
        'mebel-oborudovanie' => 'Мебель и оборудование',
        'keitering' => 'Кейтеринг',
        'ekrany-svet-zvuk' => 'Экраны, звук и свет',
    ];
    foreach ($map as $slug => $title) {
        if (strpos($page, '/' . $slug) !== false) {
            return $title;
        }
    }
    return 'Главная страница';
}
$lead['service'] = service_from_page($lead['page']);

/* ------------------------------------------------------------------ */
/* Вложение                                                             */
/* ------------------------------------------------------------------ */

$file = ['name' => '', 'url' => '', 'note' => ''];
$upload = $_FILES['file'] ?? null;

if ($upload && ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    if ((int) $upload['error'] === UPLOAD_ERR_OK && is_uploaded_file($upload['tmp_name'])) {
        $ext = strtolower(pathinfo((string) $upload['name'], PATHINFO_EXTENSION));
        // Расширения с исполняемым кодом на сервер не кладём.
        $banned = ['php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'php8', 'phar',
                   'pht', 'cgi', 'pl', 'py', 'sh', 'htaccess'];
        if ($ext === '' || in_array($ext, $banned, true) || !preg_match('/^[a-z0-9]{1,8}$/', $ext)) {
            $ext = 'bin';
        }

        $dir = __DIR__ . '/uploads';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $stored = bin2hex(random_bytes(16)) . '.' . $ext;

        if (@move_uploaded_file($upload['tmp_name'], $dir . '/' . $stored)) {
            $file['name'] = s($upload['name'], 255);
            $file['url'] = rtrim(cfg()['site'], '/') . '/form/uploads/' . $stored;
        } else {
            $file['note'] = 'Файл не удалось сохранить на сервере';
        }
    } else {
        $file['name'] = s($upload['name'] ?? '', 255);
        $file['note'] = 'Файл не принят: превышен размер или ошибка загрузки';
    }
}

/* ------------------------------------------------------------------ */
/* Запись — раньше любой отправки наружу                                */
/* ------------------------------------------------------------------ */

function save_lead(array $lead, array $file): bool
{
    $row = [
        'created_at' => date('Y-m-d H:i:s'),
        'name' => $lead['name'],
        'phone' => $lead['phone'],
        'email' => $lead['email'],
        'channel' => $lead['channel'],
        'service' => $lead['service'],
        'comment' => $lead['comment'],
        'file_name' => $file['name'],
        'file_url' => $file['url'],
        'ip' => client_ip(),
        'page' => $lead['page'],
    ];

    $pdo = db();
    if ($pdo) {
        try {
            $sql = 'INSERT INTO leads (created_at, name, phone, email, channel, service,
                        comment, file_name, file_url, ip, page)
                    VALUES (:created_at, :name, :phone, :email, :channel, :service,
                        :comment, :file_name, :file_url, :ip, :page)';
            $pdo->prepare($sql)->execute($row);
            return true;
        } catch (Throwable $e) {
            error_log('erevent: запись в базу не прошла — ' . $e->getMessage());
        }
    }

    // Запасная запись — тоже на сервере в России, чтобы заявка не пропала.
    $dir = __DIR__ . '/fallback';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $line = json_encode($row, JSON_UNESCAPED_UNICODE) . PHP_EOL;
    return (bool) @file_put_contents($dir . '/leads.jsonl', $line, FILE_APPEND | LOCK_EX);
}

$saved = save_lead($lead, $file);

/* ------------------------------------------------------------------ */
/* Уведомления                                                          */
/* ------------------------------------------------------------------ */

$rows = [
    'Имя' => $lead['name'],
    'Телефон' => $lead['phone'],
    'Email' => $lead['email'],
    'Ответить в' => $lead['channel'],
    'Услуга' => $lead['service'],
    'Комментарий' => $lead['comment'],
];

$body = '';
foreach ($rows as $label => $value) {
    if ($value !== '') {
        $body .= '<b>' . h($label) . ':</b> ' . h($value) . "\n";
    }
}

if ($file['url'] !== '') {
    $body .= "\n<b>Файл:</b> <a href=\"" . h($file['url']) . '">' . h($file['name']) . "</a>\n"
        . "<i>Ссылка личная — не пересылайте её посторонним.</i>\n";
} elseif ($file['note'] !== '') {
    $body .= "\n⚠️ <b>" . h($file['note']) . '</b>' . ($file['name'] !== '' ? ' — ' . h($file['name']) : '') . "\n";
}

if ($lead['page'] !== '') {
    $body .= "\n<i>" . h($lead['page']) . '</i>';
}

$head = $saved ? '🔔 <b>Новая заявка с сайта</b>' : '⚠️ <b>Заявка с сайта — не записалась в базу!</b>';
tg_send($head . "\n\n" . $body);

$who = trim($lead['name'] . ' ' . ($lead['phone'] !== '' ? $lead['phone'] : $lead['email']));
$replyTo = filter_var($lead['email'], FILTER_VALIDATE_EMAIL) ? $lead['email'] : '';
smtp_send(
    'Заявка с сайта — ' . ($who !== '' ? $who : 'без имени'),
    '<div style="font:15px/1.6 Arial,sans-serif;color:#0e0f0c">'
        . str_replace("\n", '<br>', $body) . '</div>',
    $replyTo
);

json_out(['ok' => true]);
