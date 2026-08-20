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

app.post('/api/location', (req, res) => {
    const { latitude, longitude, altitude, speed, timestamp } = req.body;
    if (latitude && longitude) {
        lastPosition = {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            altitude: altitude ? parseFloat(altitude) : null,
            speed: speed ? parseFloat(speed) : null,
            timestamp: timestamp ? parseInt(timestamp) : Date.now() / 1000
        };
        console.log(`[Phone Update] Lat ${latitude}, Lng ${longitude}, Alt ${altitude}, Speed ${speed}`);
        return res.status(200).send("Location updated.");
    }
    res.status(400).send("Missing data.");
});

app.get('/api/current-location', (req, res) => {
    res.json(lastPosition);
});

//retry
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
