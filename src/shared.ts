import { sendMessage } from './telegram';

let bot_url = process.env.bot_url;
let api_url = process.env.api_url;
let frontend_url = process.env.frontend_url;

const host = `dash`;

const token = process.env.bot_token;
const bot_username = process.env.bot_username;
const report_chat_id = process.env.report_chat_id; // ID чата для пересылки сообщений

export function handleError(err, res) {
  console.log(err);

  if (res) res.status(500).send(err.message);
}

export function devlog(v: any) {
  if (process.env.develop == 'true') {
    console.log(v);
  } else {
    // push to telegram notifications
  }
}

export function devalert(message: string) {
  sendMessage(
    {
      chat_id: report_chat_id,
      text: message,
      parse_mode: 'HTML',
    },
    'sendMessage',
    token,
    undefined,
    undefined
  );
}
