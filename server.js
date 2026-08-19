const express = require('express');
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let lastPosition = { lat: 39.8283, lng: -98.5795 }; 

app.post('/api/location', (req, res) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Raw body:', req.body);
    const { latitude, longitude } = req.body;
    if (latitude && longitude) {
        lastPosition = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
        console.log(`[Phone Update] Lat ${latitude}, Lng ${longitude}`);
        return res.status(200).send("Location updated.");
    }
    res.status(400).send("Missing data.");
});

app.get('/api/current-location', (req, res) => {
    res.json(lastPosition);
});

// Add this error handler AFTER all your routes, right before app.listen:
app.use((err, req, res, next) => {
    console.log('Middleware error caught:', err.message);
    res.status(400).send('Bad request: ' + err.message);
});

//retry
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
