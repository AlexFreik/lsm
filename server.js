const express = require('express');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');
const net = require('net');
const os = require('os');

const app = express();
const folderName = '.';
const readmePath = path.join(__dirname, folderName, 'README.md');

// Serve static files under /lsm route
app.use('/lsm', express.static(path.join(__dirname, folderName)));

// Serve README.md at /lsm as the default content
app.get('/lsm', (req, res) => {
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading README.md');
        } else {
            const htmlContent = marked(data);
            res.send(htmlContent);
        }
    });
});

// Redirect root (/) to /lsm/
app.get('/', (req, res) => {
    res.redirect('/lsm/');
});

// Handle 404 errors for undefined routes
app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

// Function to get the local IP address
const getLocalIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Fallback in case no IP is found
};

// Function to check if a port is available
const checkPort = (port) => {
    return new Promise((resolve, reject) => {
        const tester = net
            .createServer()
            .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(false) : reject(err)))
            .once('listening', () => tester.once('close', () => resolve(true)).close())
            .listen(port);
    });
};

// Start the server with dynamic port allocation
const startServer = async (port) => {
    let currentPort = port;
    while (!(await checkPort(currentPort))) {
        console.log(`Port ${currentPort} is taken. Trying port ${currentPort + 1}...`);
        currentPort++;
    }

    const ipAddress = getLocalIPAddress();
    app.listen(currentPort, () => {
        console.log(`Server is running at http://${ipAddress}:${currentPort}/lsm/`);
    });
};

// Start the process by checking port 3000
startServer(3000).catch((err) => {
    console.error('Error starting the server:', err);
});
