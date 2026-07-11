//REQUEST HANDLER

// RETURNS THE GOOGLE MAPS API KEY FOR CLIENT-SIDE USE (STATIC HTML CAN'T READ .env DIRECTLY)
function getMapsKey(req, res) {
    res.json({ success: true, key: process.env.GOOGLE_MAPS_API_KEY });
}

module.exports = { getMapsKey };
