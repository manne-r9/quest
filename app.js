const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

// Initialize the app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve start.html as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'start.html'));
});

// Serve static files
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quest_mapper')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// User schema and model
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// Register new user
app.post('/api/users/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });

    try {
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(400).json({ message: 'Error registering user', error: error.message });
    }
});

// User login
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, name: user.name }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful!', token, name: user.name });
    } catch (error) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Unified booking schema
const bookingSchema = new mongoose.Schema({
    from: { type: String, default: 'India' },
    destination: String,
    howMany: Number,
    totalPrice: Number,
    hotelFromDate: { type: Date, default: null },  // Allow null if not booked
    hotelToDate: { type: Date, default: null },    // Allow null if not booked
    roomType: { type: String, default: 'Not Booked' }, // Default to 'Not Booked'
    flightStartDate: Date,
    flightReturnDate: Date,
    flightType: String,
    type: { type: String, enum: ['package', 'flight', 'hotel'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to user
});

const Booking = mongoose.model('Booking', bookingSchema);

// POST route to handle bookings (both hotel and flight)
app.post('/api/book', async (req, res) => {
    const {
        from,
        destination,
        howMany,
        price,  // Ensure price is passed in the request
        hotelFromDate,
        hotelToDate,
        roomType,
        flightStartDate,
        flightReturnDate,
        flightType,
        type,
        userId
    } = req.body;

    console.log('Booking data:', req.body);

    // Validate required fields based on the type of booking
    if (!destination || !howMany || !price || !type) {
        return res.status(400).json({ message: 'Destination, howMany, price, and type are required' });
    }

    // For flight bookings, ensure flight details are provided
    if (type === 'flight' || type === 'package') {
        if (!flightStartDate || !flightReturnDate || !flightType) {
            return res.status(400).json({ message: 'Flight details (start date, return date, and type) are required for flight bookings' });
        }
    }

    try {
        const totalPrice = price * howMany;

        // Create new booking with all data (flight, hotel, or package)
        const newBooking = new Booking({
            from,
            destination,
            howMany,
            totalPrice,
            hotelFromDate: hotelFromDate || null,  // Handle hotel booking optionality
            hotelToDate: hotelToDate || null,      // Handle hotel booking optionality
            roomType: roomType || 'Not Booked',    // Set to 'Not Booked' if no hotel
            flightStartDate,
            flightReturnDate,
            flightType,
            type,
            userId
        });

        const savedBooking = await newBooking.save();
        console.log('Booking saved:', savedBooking);
        res.status(200).json({ message: 'Booking successful!', booking: savedBooking });
    } catch (error) {
        console.error('Error saving booking:', error.message);
        res.status(500).json({ message: 'Booking failed', error: error.message });
    }
});

// GET route to fetch all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        if (bookings.length > 0) {
            res.status(200).json({ packages: bookings });
        } else {
            res.status(200).json({ message: 'No packages booked' });
        }
    } catch (error) {
        console.error('Error fetching packages:', error.message);
        res.status(500).json({ message: 'Failed to fetch packages', error: error.message });
    }
});

// POST route to confirm payment for a booking
app.post('/api/bookings/:id/pay', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Here, you can add logic to process the payment
        booking.status = 'paid'; // Assuming you're updating the booking status
        await booking.save();

        res.status(200).json({ message: 'Payment confirmed', booking });
    } catch (error) {
        console.error('Error confirming payment:', error.message);
        res.status(500).json({ message: 'Payment failed', error: error.message });
    }
});

// Catch-all route for unknown paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'start.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
