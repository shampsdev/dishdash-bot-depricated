let ngrok = process.env.ngrok;

if (process.env.develop) ngrok = process.env.ngrok2;

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

const { sendMessage2 } = require('./methods.js');

setTimeout(function () {
  axios
    .get(
      `https://api.telegram.org/bot${token}/setWebHook?url=${ngrok}/${host}/hook`
    )
    .then(() => {
      console.log(`${host} hook set on ${ngrok}`);
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
  res.redirect(`http://172.20.10.3:5173/${req.query.tgWebAppStartParam}`);
});

router.post(`/hook`, (req, res) => {
  res.sendStatus(200);

  devlog(JSON.stringify(req.body, null, 2));

  if (req.body.inline_query) {
    let q = req.body.inline_query;
    if (!q.location) {
      // вежливый отказ
      sendMessage2(
        {
          inline_query_id: q.id,
          results: [
            {
              type: `article`,
              id: `noLocation`,
              title: `Phones only`,
              input_message_content: {
                message_text: `Эта штука будет работать только с телефона. Увых.`,
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
        .post(`https://dishdash.ru/api/v1/lobbies/find`, {
          dist: 10,
          location: {
            lat: coords.latitude,
            lon: coords.longitude,
          },
        })
        .then((data) => {
          sendMessage2(
            {
              inline_query_id: q.id,
              results: [
                {
                  type: `photo`,
                  id: `app2`,
                  photo_url: `${ngrok}/images/dash/cover.jpg`,
                  title: data.data.room_id,
                  description: `Приглашение в комнату ${data.data.room_id}`,
                  is_personal: false,
                  caption: `Не знаете, куда пойти? Давайте найдем, с кем! (инвайт в комнату ${data.data.room_id})`,
                  thumbnail_url: `${ngrok}/dash/cover.jpg`,
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: 'Some app',
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

          sendMessage2(
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
