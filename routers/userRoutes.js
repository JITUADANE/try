const express = require('express');
const router = express.Router();

// Admin-only route
router.get('/admin', (req, res) => {
    res.json({ message: "Hello, Admin!" });
});

// Admin and Organizer route
router.get('/organizer', (req, res) => {
    res.json({ message: "Hello, Organizer!" });
});

// Public route accessible by all (e.g., attendees)
router.get('/attendee', (req, res) => {
    res.json({ message: "Hello, Attendee!" });
});

module.exports = router;

