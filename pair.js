import { giftedid } from './id.js';
import express from 'express';
import fs from 'fs';
import pino from 'pino';
import { Storage } from 'megajs';
import {
  default as Gifted_Tech,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

// badala ya __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function randomMegaId(length = 6, numberLength = 4) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const number = Math.floor(Math.random() * Math.pow(10, numberLength));
  return `${result}${number}`;
}

async function uploadCredsToMega(credsPath) {
  try {
    const storage = await new Storage({
      email: 'techobed4@gmail.com',
      password: 'Trippleo1802obed'
    }).ready;
    console.log('Mega storage initialized.');

    if (!fs.existsSync(credsPath)) {
      throw new Error(`File not found: ${credsPath}`);
    }

    const fileSize = fs.statSync(credsPath).size;
    const uploadResult = await storage.upload(
      { name: `${randomMegaId()}.json`, size: fileSize },
      fs.createReadStream(credsPath)
    ).complete;

    console.log('Session successfully uploaded to Mega.');

    const fileNode = storage.files[uploadResult.nodeId];
    const megaUrl = await fileNode.link();
    console.log(`Session Url: ${megaUrl}`);

    return megaUrl;
  } catch (error) {
    console.error('Error uploading to Mega:', error);
    throw error;
  }
}

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = giftedid();
  let num = req.query.number;

  async function GIFTED_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    try {
      let Gifted = Gifted_Tech({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS('Safari')
      });

      if (!Gifted.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await Gifted.requestPairingCode(num);
        console.log(`Your Code: ${code}`);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      Gifted.ev.on('creds.update', saveCreds);

      Gifted.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection == 'open') {
          await delay(50000);
          const filePath = __dirname + `/temp/${id}/creds.json`;
          if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return;
          }

          const megaUrl = await uploadCredsToMega(filePath);
          const sid = megaUrl.includes('https://mega.nz/file/')
            ? 'sila~' + megaUrl.split('https://mega.nz/file/')[1]
            : 'Error: Invalid URL';

          console.log(`Session ID: ${sid}`);

          Gifted.groupAcceptInvite('Ik0YpP0dM8jHVjScf1Ay5S');

          const sidMsg = await Gifted.sendMessage(
            Gifted.user.id,
            { text: sid },
            { disappearingMessagesInChat: true, ephemeralExpiration: 86400 }
          );

          const GIFTED_TEXT = `
✅ sᴇssɪᴏɴ ɪᴅ ɢᴇɴᴇʀᴀᴛᴇᴅ ✅
______________________________

🎉 SESSION GENERATED SUCCESSFULLY! ✅

💪 Empowering Your Experience with our Bot

🌟 Show your support by giving our repo a star! 🌟
🔗 https://github.com/silatrix2/silatrix-md

💭 Need help? Join our support groups:
📢🫁
https://whatsapp.com/channel/0029Vb6DeKwCHDygxt0RXh0L

📚 Learn & Explore More with Tutorials:
🪄 https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM?mode=ems_copy_c

🥀 Powered by sir sila 🥀
Together, we build the future of automation! 🚀
______________________________
`;

          await Gifted.sendMessage(
            Gifted.user.id,
            { text: GIFTED_TEXT },
            { quoted: sidMsg, disappearingMessagesInChat: true, ephemeralExpiration: 86400 }
          );

          await delay(100);
          await Gifted.ws.close();
          return await removeFile('./temp/' + id);
        } else if (
          connection === 'close' &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode != 401
        ) {
          await delay(10000);
          GIFTED_PAIR_CODE();
        }
      });
    } catch (err) {
      console.error('Service Has Been Restarted:', err);
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: 'Service is Currently Unavailable' });
      }
    }
  }

  return await GIFTED_PAIR_CODE();
});

export default router;
