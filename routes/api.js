const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const generateHotels = require('../data/generator');

// Generate hotels on startup
const allHotels = generateHotels(5000);
console.log(`Generated ${allHotels.length} hotels.`);

const bookingsDataPath = path.join(__dirname, '../data/bookings.json');

// Helper to read/write bookings
const getBookings = () => {
    try {
        if (!fs.existsSync(bookingsDataPath)) return [];
        const data = fs.readFileSync(bookingsDataPath);
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const saveBooking = (booking) => {
    const bookings = getBookings();
    bookings.push(booking);
    fs.writeFileSync(bookingsDataPath, JSON.stringify(bookings, null, 2));
};

// GET /api/hotels
router.get('/hotels', (req, res) => {
    try {
        let { page = 1, limit = 20, search, minPrice, maxPrice, minRating } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        let filteredHotels = allHotels;

        // Search
        if (search) {
            const term = search.toLowerCase();
            filteredHotels = filteredHotels.filter(h =>
                h.name.toLowerCase().includes(term) ||
                h.city.toLowerCase().includes(term) ||
                h.country.toLowerCase().includes(term)
            );
        }

        // Filter
        if (minPrice) filteredHotels = filteredHotels.filter(h => h.price >= parseInt(minPrice));
        if (maxPrice) filteredHotels = filteredHotels.filter(h => h.price <= parseInt(maxPrice));
        if (minRating) filteredHotels = filteredHotels.filter(h => parseFloat(h.rating) >= parseFloat(minRating));

        // Pagination
        const total = filteredHotels.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const results = filteredHotels.slice(startIndex, endIndex);

        res.json({
            hotels: results,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching hotels' });
    }
});

// POST /api/bookings
router.post('/bookings', (req, res) => {
    const { hotelId, name, email, date } = req.body;

    if (!hotelId || !name || !email || !date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newBooking = {
        id: Date.now(),
        hotelId,
        name,
        email,
        date,
        createdAt: new Date().toISOString()
    };

    saveBooking(newBooking);
    console.log('New Booking:', newBooking);

    // Simulate Email Sending
    console.log(`[Email Service] Sending booking confirmation to ${email}...`);
    console.log(`[Email Service] Subject: Booking Confirmed - ${newBooking.id}`);
    console.log(`[Email Service] Body: Dear ${name}, your booking at Hotel ID ${hotelId} for ${date} is confirmed.`);

    res.status(201).json({ message: 'Booking successful! Confirmation email sent.', booking: newBooking });
});

// GET /api/admin/bookings
router.get('/admin/bookings', (req, res) => {
    try {
        const bookings = getBookings();
        // Enrich with hotel details
        const enrichedBookings = bookings.map(b => {
            const hotel = allHotels.find(h => h.id == b.hotelId);
            return {
                ...b,
                hotelName: hotel ? hotel.name : 'Unknown Hotel',
                hotelCity: hotel ? hotel.city : 'Unknown City'
            };
        });
        res.json(enrichedBookings.reverse()); // Newest first
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// POST /api/register
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const usersPath = path.join(__dirname, '../data/users.json');
    let users = [];

    if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath);
        users = JSON.parse(data);
    }

    // Check if user exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // In a real app, hash this!
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Registration successful', user: newUser });
});

// GET /api/admin/users
router.get('/admin/users', (req, res) => {
    const usersPath = path.join(__dirname, '../data/users.json');
    if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath);
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

module.exports = router;
