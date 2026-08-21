const express = require('express');
const app = express();
const path = require('path');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let lastPosition = { 
    lat: 39.8283, 
    lng: -98.5795, 
    altitude: null, 
    speed: null, 
    timestamp: null 
};

// Path history: array of {lat, lng} points forming the trail
let pathHistory = [{ lat: 33.7464, lng: -111.9426 }];

// Minimum raw degree difference before saving a new path point
const MIN_LAT_DIFF = 0.04;
const MIN_LON_DIFF = 0.03;

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

        // Only add to path if lat OR lng has moved enough
        const lastPoint = pathHistory[pathHistory.length - 1];
        if (!lastPoint ||
            Math.abs(lat - lastPoint.lat) > MIN_LAT_DIFF ||
            Math.abs(lng - lastPoint.lng) > MIN_LON_DIFF) {
            pathHistory.push({ lat, lng });
        }

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
