// qr.js
import express from "express";
import { giftedid } from "./id.js";
import makeWASocket, { useMultiFileAuthState, Browsers } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import pino from "pino";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./qr-session-" + giftedid(6));
    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Safari"),
    });

    sock.ev.on("connection.update", async (update) => {
      const { qr } = update;
      if (qr) {
        // tengeneza QR image
        const qrImage = await qrcode.toDataURL(qr);
        res.send(`
          <html>
            <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0f172a;color:#fff;">
              <h2>Scan QR to Login</h2>
              <img src="${qrImage}" />
            </body>
          </html>
        `);
      }
    });

    sock.ev.on("creds.update", saveCreds);
  } catch (err) {
    console.error("QR Error:", err);
    res.status(503).send("Service is Currently Unavailable");
  }
});

export default router;
