require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/sheet', async (req, res) => {
  try {
    const { value } = req.query;
    let sheetUrl;
    sheetUrl = process.env.GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      return res.status(400).send('Invalid sheet selection or missing environment variable');
    }

    const response = await fetch(sheetUrl);
    const text = await response.text();
    res.type('text/plain').send(text);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).send('Failed to fetch Google Sheet');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
