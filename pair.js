import express from "express";
import { giftedid } from "./id.js";
import makeWASocket, { useMultiFileAuthState, Browsers, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

const router = express.Router();

router.get("/pair", async (req, res) => {
  let num = req.query.number;
  if (!num) return res.status(400).json({ error: "Number required ?number=2557xxxxxx" });

  try {
    // session id yenye prefix "sila"
    const sessionId = "sila-" + giftedid(6);
    const sessionFolder = `./session-${sessionId}`;

    // hakikisha folder ipo
    if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Safari"),
    });

    sock.ev.on("creds.update", saveCreds);

    num = num.replace(/[^0-9]/g, ""); // safisha namba
    const code = await sock.requestPairingCode(num);

    return res.json({ success: true, number: num, sessionId, pairingCode: code });

  } catch (err) {
    console.error("Pair Error:", err);
    res.status(503).send("Service is Currently Unavailable");
  }
});

export default router;
