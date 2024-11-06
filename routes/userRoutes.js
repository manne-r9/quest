const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route to create a user (signup)
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = new User({
            name,
            email,
            password,
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', newUser });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err });
    }
});

// Route to login user (check email and password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ message: 'Login successful', user });
        } else {
            res.status(404).json({ message: 'User not found or incorrect credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error during login', error: err });
    }
});

module.exports = router;
