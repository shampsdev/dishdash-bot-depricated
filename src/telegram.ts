import axios from 'axios';
import { devlog } from './shared';

export function sendMessage(m, ep, channel, messages, extra) {
  return axios
    .post(
      'https://api.telegram.org/bot' +
        channel +
        '/' +
        (ep ? ep : 'sendMessage'),
      m,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    .then((telres) => {
      if (messages && telres.data.ok) {
        let toLog = {
          createdAt: new Date(),
          user: +m.chat_id,
          text: m.text || m.caption || null,
          isReply: true,
          photo: m.photo || null,
          messageId: telres.data.result.message_id,
        };

        if (extra) Object.keys(extra).forEach((f) => (toLog[f] = extra[f]));

        devlog(toLog);
      }

      return telres.data;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

export function getUserProfilePicture(userId, channel) {
  return axios
    .get(`https://api.telegram.org/bot${channel}/getUserProfilePhotos`, {
      params: {
        user_id: userId,
        limit: 1,
      },
    })
    .then((response) => {
      if (response.data.ok && response.data.result.total_count > 0) {
        const fileId = response.data.result.photos[0][0].file_id;
        return axios.get(`https://api.telegram.org/bot${channel}/getFile`, {
          params: {
            file_id: fileId,
          },
        });
      } else {
        throw new Error('No profile picture found');
      }
    })
    .then((response) => {
      if (response.data.ok) {
        const filePath = response.data.result.file_path;
        const fileUrl = `https://api.telegram.org/file/bot${channel}/${filePath}`;
        return axios.get(fileUrl, { responseType: 'arraybuffer' });
      } else {
        throw new Error('Failed to get file URL');
      }
    })
    .then((response) => {
      return Buffer.from(response.data, 'binary');
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}
