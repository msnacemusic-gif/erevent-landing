<?php
/**
 * Пример настроек. Рабочий config.php в репозитории не хранится — его
 * собирает выкладка из секретов GitHub (см. .github/workflows/deploy.yml).
 * Этот файл нужен только как список полей.
 */

return [
    'db_host' => 'localhost',
    'db_name' => 'имя_базы',
    'db_user' => 'пользователь_базы',
    'db_pass' => 'пароль_базы',

    'bot_token' => 'токен бота от @BotFather',
    'chat_id' => '-5380417256',

    'mail_host' => 'smtp.timeweb.ru',
    'mail_port' => 465,
    'mail_user' => 'info@sobroom.ru',
    'mail_pass' => 'пароль почтового ящика',
    'mail_to' => 'info@sobroom.ru',

    'leads_user' => 'логин для страницы заявок',
    'leads_pass' => 'пароль для страницы заявок',

    'site' => 'https://sobroom.ru',
];
