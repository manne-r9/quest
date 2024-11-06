const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Route to create a booking
router.post('/create', async (req, res) => {
    const { name, email, packageName, price } = req.body;
    try {
        const newBooking = new Booking({
            name,
            email,
            packageName,
            price,
        });
        await newBooking.save();
        res.status(201).json({ message: 'Booking created successfully', newBooking });
    } catch (err) {
        res.status(500).json({ message: 'Error creating booking', error: err });
    }
});

// Route to fetch all bookings
router.get('/all', async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching bookings', error: err });
    }
});

module.exports = router;
