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
                  caption: `Не знаете, куда пойти? Давайте найдем, с кем! (инвайт в комнату ${data.data.id})`,
                  thumbnail_url: `${bot_url}/dash/cover.jpg`,
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
