import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import 'dotenv/config';

const adapter = new JSONFile('db.json');
const db = new Low(adapter);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize the database
async function initializeDatabase() {
  await db.read();
  db.data = db.data || { users: [] };
  await db.write();
}

initializeDatabase();

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Endpoint to handle Google sign-in
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();

    await db.read();
    let user = db.data.users.find(u => u.googleId === googleId);

    if (!user) {
      user = { googleId, email, name, picture, virustotalApiKey: null };
      db.data.users.push(user);
      await db.write();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Middleware to verify the user
async function verifyUser(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
  const token = authorization.split(' ')[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId } = ticket.getPayload();
    await db.read();
    const user = db.data.users.find(u => u.googleId === googleId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}

// Endpoint to get the VirusTotal API key
app.get('/api/user/apikey', verifyUser, (req, res) => {
  res.status(200).json({ apiKey: req.user.virustotalApiKey });
});

// Endpoint to store the VirusTotal API key
app.post('/api/user/apikey', verifyUser, async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is missing' });
  }

  await db.read();
  const user = db.data.users.find(u => u.googleId === req.user.googleId);
  user.virustotalApiKey = apiKey;
  await db.write();

  res.status(200).json({ message: 'API key saved successfully' });
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
