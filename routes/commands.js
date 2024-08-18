// handlers.js

function handleReportMessage(message, chat_id, report_chat_id, token) {
    let reportTime = new Date().toLocaleString();
    sendMessage({
        chat_id: report_chat_id,
        text: `⚠️ <b>Репорт от пользователя:</b>\n\n<b>Имя:</b> ${message.from.first_name} ${message.from.last_name || ''}\n<b>Юзернейм:</b> @${message.from.username || 'нет юзернейма'}\n<b>Chat ID:</b> ${chat_id}\n<b>Время обращения:</b> ${reportTime}\n\n<b>Сообщение:</b>\n${message.text}`,
        parse_mode: 'HTML',
    }, 'sendMessage', token);

    sendMessage({
        chat_id: chat_id,
        text: 'Ваш репорт был успешно отправлен администрации.',
    }, 'sendMessage', token);
}

function handleStartCommand(chat_id, message, token) {
    let fullName = message.from.first_name;
    if (message.from.last_name) {
        fullName += ` ${message.from.last_name}`;
    }

    sendMessage({
        chat_id: chat_id,
        text: `Добро пожаловать, <b>${fullName}</b>!\n\nИспользуйте DishDash, чтобы легко и быстро выбрать место для встречи в компании. Упомяните бота в чате и введите <code>@dishdash_bot start</code> для создания лобби.\n\nБот <a href='https://dishdash.ru'>DishDash</a> разработан командой <a href='https://t.me/+4l8DChDSxMQxNWUy'>\"Шампиньоны\"</a>.`,
        parse_mode: 'HTML',
    }, 'sendMessage', token);
}

function handleHelpCommand(chat_id, token) {
    sendMessage({
        chat_id: chat_id,
        text: 'Доступные команды:\n/start - Запуск бота\n/help - Справка\n/report - сообщить о баге/проблеме',
    }, 'sendMessage', token);
}

function handleReportCommand(chat_id, token) {
    sendMessage({
        chat_id: chat_id,
        text: 'Теперь отправьте сообщение, которое вы хотите сообщить администрации.',
    }, 'sendMessage', token);
}

function handleUnknownCommand(chat_id, token) {
    sendMessage({
        chat_id: chat_id,
        text: 'Извините, я не понимаю эту команду.',
    }, 'sendMessage', token);
}

module.exports = {
    handleReportMessage,
    handleStartCommand,
    handleHelpCommand,
    handleReportCommand,
    handleUnknownCommand,
};
