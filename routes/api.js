const express = require('express');
const router = express.Router();

const generateHotels = require('../data/generator');

// Generate hotels on startup
const allHotels = generateHotels(5000);
console.log(`Generated ${allHotels.length} hotels.`);

// In-memory storage (Netlify functions are stateless/read-only fs)
let bookings = [];
let users = [];

// Helper to read bookings (from memory)
const getBookings = () => {
    return bookings;
};

const saveBooking = (booking) => {
    bookings.push(booking);
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
        const currentBookings = getBookings();
        // Enrich with hotel details
        const enrichedBookings = currentBookings.map(b => {
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

    res.status(201).json({ message: 'Registration successful', user: newUser });
});

// GET /api/admin/users
router.get('/admin/users', (req, res) => {
    res.json(users);
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
