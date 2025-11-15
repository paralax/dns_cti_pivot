import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';
import fetch from 'node-fetch';
import CryptoJS from 'crypto-js';
import session from 'express-session';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(bodyParser.json());

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

    req.session.user = { googleId };

    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      const user = { googleId, email, name, picture };
      res.status(200).json(user);
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Endpoint to proxy VirusTotal IP lookups
app.get('/api/virustotal/ip/:ip', verifyUser, async (req, res) => {
  const { ip } = req.params;
  let { virustotalApiKey } = req.session.user;

  if (!virustotalApiKey) {
    return res.status(400).json({ error: 'VirusTotal API key is missing' });
  }

  try {
    virustotalApiKey = CryptoJS.AES.decrypt(virustotalApiKey, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
    const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}/resolutions`, {
      headers: {
        'x-apikey': virustotalApiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    const resolutions = data.data.map(resolution => ({
      hostname: resolution.attributes.host_name,
      last_resolved: new Date(resolution.attributes.date * 1000).toISOString(),
    }));

    res.status(200).json({ resolutions });
  } catch (error) {
    console.error('Error fetching data from VirusTotal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to verify the user
async function verifyUser(req, res, next) {
  next();
}

// Endpoint to get the VirusTotal API key
app.get('/api/user/apikey', verifyUser, (req, res) => {
  const { virustotalApiKey } = req.session.user;
  const apiKeyExists = !!virustotalApiKey;
  res.status(200).json({ apiKeyExists });
});

app.get('/api/user/apikey/full', verifyUser, (req, res) => {
  const { virustotalApiKey } = req.session.user;
  if (!virustotalApiKey) {
    return res.status(404).json({ error: 'API key not found' });
  }
  const decryptedApiKey = CryptoJS.AES.decrypt(virustotalApiKey, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
  res.status(200).json({ apiKey: decryptedApiKey });
});

// Endpoint to store the VirusTotal API key
app.post('/api/user/apikey', verifyUser, (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is missing' });
  }

  const encryptedApiKey = CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_KEY).toString();
  req.session.user.virustotalApiKey = encryptedApiKey;

  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).json({ error: 'Failed to save API key' });
    }
    res.status(200).json({ message: 'API key saved successfully' });
  });
});

// Endpoint to delete the VirusTotal API key
app.delete('/api/user/apikey', verifyUser, (req, res) => {
  req.session.user.virustotalApiKey = null;
  req.session.save((err) => {
    if (err) {
      console.error('Error saving session:', err);
      return res.status(500).json({ error: 'Failed to delete API key' });
    }
    res.status(200).json({ message: 'API key deleted successfully' });
  });
});

// Endpoint to proxy VirusTotal domain lookups
app.get('/api/virustotal/domain/:domain', verifyUser, async (req, res) => {
  const { domain } = req.params;
  let { virustotalApiKey } = req.session.user;

  if (!virustotalApiKey) {
    return res.status(400).json({ error: 'VirusTotal API key is missing' });
  }

  try {
    virustotalApiKey = CryptoJS.AES.decrypt(virustotalApiKey, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

    const [domainResponse, subdomainsResponse] = await Promise.all([
      fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
        headers: { 'x-apikey': virustotalApiKey },
      }),
      fetch(`https://www.virustotal.com/api/v3/domains/${domain}/subdomains`, {
        headers: { 'x-apikey': virustotalApiKey },
      }),
    ]);

    if (!domainResponse.ok) {
      const errorData = await domainResponse.json();
      return res.status(domainResponse.status).json(errorData);
    }

    const domainData = await domainResponse.json();
    const { whois, whois_date, last_dns_records, last_dns_records_date } = domainData.data.attributes;

    const dnsRecords = last_dns_records.map(record => ({
      timestamp: new Date(last_dns_records_date * 1000).toISOString(),
      ip: record.value,
      type: record.type,
      value: record.value,
    }));

    let subdomains = [];
    if (subdomainsResponse.ok) {
      const subdomainsData = await subdomainsResponse.json();
      subdomains = subdomainsData.data.map(subdomain => subdomain.id);
    }


    res.status(200).json({
      dnsRecords,
      whois,
      whoisDate: whois_date ? new Date(whois_date * 1000).toISOString() : null,
      subdomains,
    });
  } catch (error) {
    console.error('Error fetching data from VirusTotal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
