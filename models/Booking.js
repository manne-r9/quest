const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    packageName: {
        type: String,
        required: true,
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    price: {
        type: Number,
        required: true,
    },
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
