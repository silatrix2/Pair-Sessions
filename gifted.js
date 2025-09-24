import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import code from './pair.js';
import events from 'events';

const app = express();
const PORT = process.env.PORT || 8000;

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

events.EventEmitter.defaultMaxListeners = 500;

app.use('/code', code);

// Serve 'main.html' as the default page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Serve 'pair.html' when visiting '/pair' route
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

// Serve 'qr.html' when visiting '/qr' route
app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
Deployment Successful!

Silva-Session-Server Running on http://localhost:` + PORT)
});

export default app;
