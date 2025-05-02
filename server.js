const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Optional: Add an API route to process data server-side
// Example: /api/sheet → fetch, clean, and return JSON

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
