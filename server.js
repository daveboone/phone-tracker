const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = '/data/tracker-data.json';

let lastPosition = { 
    lat: 39.8283, 
    lng: -98.5795, 
    altitude: null, 
    speed: null, 
    timestamp: null 
};
let pathHistory = [];

// Load persisted data on startup, if it exists
try {
    if (fs.existsSync(DATA_FILE)) {
        const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        lastPosition = saved.lastPosition || lastPosition;
        pathHistory = saved.pathHistory || [];
        console.log(`Loaded ${pathHistory.length} saved path points from disk.`);
    }
} catch (err) {
    console.log('No valid saved data found, starting fresh:', err.message);
}

// Save current state to disk
function saveToDisk() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ lastPosition, pathHistory }));
    } catch (err) {
        console.log('Error saving to disk:', err.message);
    }
}

const MIN_DEGREE_DIFF = 0.01;

app.post('/api/location', (req, res) => {
    const { latitude, longitude, altitude, speed, timestamp } = req.body;
    if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        lastPosition = {
            lat,
            lng,
            altitude: altitude ? parseFloat(altitude) : null,
            speed: speed ? parseFloat(speed) : null,
            timestamp: timestamp ? parseInt(timestamp) : Date.now() / 1000
        };

        const lastPoint = pathHistory[pathHistory.length - 1];
        if (!lastPoint ||
            Math.abs(lat - lastPoint.lat) > MIN_DEGREE_DIFF ||
            Math.abs(lng - lastPoint.lng) > MIN_DEGREE_DIFF) {
            pathHistory.push({ lat, lng });
        }

        saveToDisk();

        console.log(`[Phone Update] Lat ${latitude}, Lng ${longitude}, Alt ${altitude}, Speed ${speed}`);
        return res.status(200).send("Location updated.");
    }
    res.status(400).send("Missing data.");
});

app.get('/api/current-location', (req, res) => {
    res.json(lastPosition);
});

app.get('/api/path-history', (req, res) => {
    res.json(pathHistory);
});

app.get('/api/clear-path', (req, res) => {
    pathHistory = [];
    saveToDisk();
    res.send("Path history cleared.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
