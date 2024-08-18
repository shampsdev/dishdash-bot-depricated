let bot_url = process.env.bot_url;
let api_url = process.env.api_url;
let frontend_url = process.env.frontend_url;

const host = `dash`;

const token = process.env.bot_token;
const bot_username = process.env.bot_username;

var express = require('express');
var router = express.Router();
var axios = require('axios');

const fileUpload = require('express-fileupload');

router.use(
  fileUpload({
    // Configure file uploads with maximum file size 10MB
    limits: { fileSize: 10 * 1024 * 1024 },

    // Temporarily store uploaded files to disk, rather than buffering in memory
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

const { devlog, handleError } = require('./common.js');

const { sendMessage, getUserProfilePicture } = require('./methods.js');

setTimeout(function () {
  axios
    .get(
      `https://api.telegram.org/bot${token}/setWebHook?url=${bot_url}/${host}/hook`
    )
    .then(() => {
      console.log(`${host} hook set on ${bot_url}`);
    })
    .catch((err) => {
      handleError(err);
    });
}, 1000);

function alertAdmins(mess) {
  let message = {
    text: mess.text,
    isReply: true,
  };

  if (mess.reply_markup) message.reply_markup = mess.reply_markup;
}

router.get(`/app`, (req, res) => {
  // тут будем перекидывать на реакт
  res.redirect(`${frontend_url}/${req.query.tgWebAppStartParam}`);
});

router.get(`/avatar`, (req, res) => {
  res.json({
    url: getUserProfilePicture(req.params.user_id),
  });
});

router.post(`/hook`, (req, res) => {
  res.sendStatus(200);

  devlog(JSON.stringify(req.body, null, 2));

  if (req.body.message) {
    let message = req.body.message;
    let chat_id = message.chat.id;

    if (message.text) {
      let text = message.text;

      if (text === '/start') {
        let fullName = message.from.first_name;
        if (message.from.last_name) {
          fullName += ` ${message.from.last_name}`;
        }

        sendMessage(
          {
            chat_id: chat_id,
            text: `Добро пожаловать, <b>${fullName}</b>!\n\nИспользуйте DishDash, чтобы легко и быстро выбрать место для встречи в компании. Упомяните бота в чате и введите <code>@dishdash_bot start</code> для создания лобби.\n\nБот <a href='https://dishdash.ru'>DishDash</a> разработан командой <a href='https://t.me/+4l8DChDSxMQxNWUy'>\"Шампиньоны\"</a>`,
            parse_mode: 'HTML',
          },
          'sendMessage',
          token
        );
      } else if (text === '/help') {
        sendMessage(
          {
            chat_id: chat_id,
            text: 'Доступные команды:\n/start - Запуск бота\n/report — Баг репорт\n/help - Справка',
          },
          'sendMessage',
          token
        );
      } else if (text === '/report') {
        sendMessage(
          {
            chat_id: chat_id,
            text: 'Извините, я не понимаю эту команду.',
          },
          'sendMessage',
          token
        );
      } else {
        sendMessage(
          {
            chat_id: chat_id,
            text: 'Извините, я не понимаю эту команду.',
          },
          'sendMessage',
          token
        );
      }
    }
  } 

  if (req.body.inline_query) {
    let q = req.body.inline_query;
    if (!q.location) {
      // вежливый отказ
      sendMessage(
        {
          inline_query_id: q.id,
          results: [
            {
              type: `article`,
              id: `noLocation`,
              title: `Бот доступен только с телефона!`,
              input_message_content: {
                message_text: `DishDash работает только при доступе к координатам! Повторите с телефона.`,
              },
            },
          ],
        },
        `answerInlineQuery`,
        token
      );
    } else {
      let coords = q.location;
      axios
        .post(`${api_url}/api/v1/lobbies/find`, {
          dist: 10,
          location: {
            lat: coords.latitude,
            lon: coords.longitude,
          },
        })
        .then((data) => {
          sendMessage(
            {
              inline_query_id: q.id,
              results: [
                {
                  type: `photo`,
                  id: `app2`,
                  photo_url: `${bot_url}/images/dash/cover.jpg`,
                  title: data.data.id,
                  description: `Приглашение в комнату ${data.data.id}`,
                  is_personal: false,
                  caption: `Не знаете, куда пойти? Давайте подберем вам место! (инвайт в комнату ${data.data.id})`,
                  thumbnail_url: `${bot_url}/dash/cover.jpg`,
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: 'В лобби!',
                          url: `https://t.me/${bot_username}/app?startapp=${data.data.id}`,
                        },
                      ],
                    ],
                  },
                },
              ],
            },
            `answerInlineQuery`,
            token
          );
        })
        .catch((err) => {
          console.log(err);

          alertAdmins({
            text: err.message,
          });

          sendMessage(
            {
              inline_query_id: q.id,
              results: [
                {
                  type: `article`,
                  id: `noLocation`,
                  title: `ooops! у нас ошибочка`,
                  input_message_content: {
                    message_text: err.message,
                  },
                },
              ],
            },
            `answerInlineQuery`,
            token
          );
        });
    }
  }
});

module.exports = router;
