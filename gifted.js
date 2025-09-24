import express from "express";
import path from "path";
import bodyParser from "body-parser";
import codeRouter from "./pair.js";
import qrRouter from "./qr.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use("/code", codeRouter); // Pair code endpoint
app.use("/qr", qrRouter);     // QR endpoint

// Default pages
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "main.html"));
});

app.get("/pair", (req, res) => {
  res.sendFile(path.join(process.cwd(), "pair.html"));
});

app.get("/qrpage", (req, res) => {
  res.sendFile(path.join(process.cwd(), "qr.html"));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`🚀 Server Running on http://localhost:${PORT}`);
});

export default app;
