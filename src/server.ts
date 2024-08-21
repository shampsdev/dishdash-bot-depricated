import express from 'express';
import axios from 'axios';

let bot_url = process.env.bot_url;
let api_url = process.env.api_url;
let frontend_url = process.env.frontend_url;

const host = `dash`;

const token = process.env.bot_token;
const bot_username = process.env.bot_username;
const report_chat_id = process.env.report_chat_id; // ID чата для пересылки сообщений

export var router = express.Router();

// Very bad practice, but works. Just put all of the bot stuff in another file.
let sessionStates = {};

import { devlog, handleError } from './shared';

import { sendMessage, getUserProfilePicture } from './telegram';

setTimeout(function () {
  axios
    .get(
      `https://api.telegram.org/bot${token}/setWebHook?url=${bot_url}/${host}/hook`
    )
    .then(() => {
      console.log(`${host} hook set on ${bot_url}`);
    })
    .catch((err) => {
      // handleError(err);
    });
}, 1000);

function alertAdmins(mess) {
  let message = {
    text: mess.text,
    isReply: true,
  };

  // @ts-ignore
  if (mess.reply_markup) message.reply_markup = mess.reply_markup;
}

router.get(`/app`, (req, res) => {
  // тут будем перекидывать на реакт
  res.redirect(`${frontend_url}/${req.query.tgWebAppStartParam}`);
});

router.get(`/avatar`, (req, res) => {
  res.json({
    // @ts-ignore
    url: getUserProfilePicture(req.params.user_id, undefined),
  });
});

router.post(`/hook`, (req, res) => {
  res.sendStatus(200);

  devlog(JSON.stringify(req.body, null, 2));
});
