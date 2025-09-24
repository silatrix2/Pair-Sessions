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

// __dirname replacement
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
  let num = req.query.number;
  if (!num) return res.status(400).json({ error: "Number required ?number=2557xxxxxx" });

  const id = "sila-" + giftedid(); // PREFIX Sila
  const tempFolder = './temp/' + id;
  if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

  async function GIFTED_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState(tempFolder);

    try {
      let Gifted = Gifted_Tech({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino({ level: 'fatal' }).child({ level: 'fatal' })
          )
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS('Safari')
      });

      Gifted.ev.on('creds.update', saveCreds);

      if (!Gifted.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await Gifted.requestPairingCode(num);
        console.log(`Your Code: ${code}`);
        if (!res.headersSent) res.json({ number: num, sessionId: id, pairingCode: code });
      }

      Gifted.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection === 'open') {
          await delay(5000);
          const filePath = tempFolder + `/creds.json`;
          if (!fs.existsSync(filePath)) return console.error('File not found:', filePath);

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
✅ SESSION ID GENERATED ✅

🎉 Session Generated Successfully!

💪 Powered by SILA TECH
🔗 Repo: https://github.com/silatrix2/silatrix-md
📚 Support: https://chat.whatsapp.com/FJaYH3HS1rv5pQeGOmKtbM?
`;

          await Gifted.sendMessage(
            Gifted.user.id,
            { text: GIFTED_TEXT },
            { quoted: sidMsg, disappearingMessagesInChat: true, ephemeralExpiration: 86400 }
          );

          await delay(100);
          await Gifted.ws.close();
          return await removeFile(tempFolder);
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
      await removeFile(tempFolder);
      if (!res.headersSent) res.json({ code: 'Service is Currently Unavailable' });
    }
  }

  return await GIFTED_PAIR_CODE();
});

export default router;
