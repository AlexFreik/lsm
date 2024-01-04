const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const port = 3000;

const folderName = '.';
const readmePath = path.join(__dirname, folderName, 'README.md');

// Serve static files from the specified folder
app.use(express.static(path.join(__dirname, folderName)));

// Serve README.md as the default route
app.get('/', (req, res) => {
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading README.md');
        } else {
            const htmlContent = marked(data);
            res.send(htmlContent);
        }
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
