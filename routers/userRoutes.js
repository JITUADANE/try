const express = require('express');
const router = express.Router();
const userController =require('../controllers/userController')
const { authenticateToken} = require('../middlewares/authenticateToken');
const { authorizeRoles }  = require('../middlewares/authorizeRoles');

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
router.get('/', authenticateToken, authorizeRoles(['Admin']), userController.getAllUsers)
module.exports = router;

