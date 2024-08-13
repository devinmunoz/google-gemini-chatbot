const express = require('express');
const path = require('path');
const app = express();
const upload = require('./upload');

// Serve static files from the assets folder
const uploadsFolder = path.join(__dirname, "uploads");
app.use('/uploads', express.static(uploadsFolder));

app.use('/upload', upload);

const port = 8000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
