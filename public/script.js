document.addEventListener('DOMContentLoaded', () => {
    const hotelGrid = document.getElementById('hotel-grid');

    // Modals
    const bookingModal = document.getElementById('booking-modal');
    const paymentModal = document.getElementById('payment-modal');
    const signinModal = document.getElementById('signin-modal');

    // Close Buttons
    const closeBookingModal = bookingModal.querySelector('.close-modal');
    const closeSigninModal = signinModal.querySelector('.close-signin');

    // Forms & Inputs
    const bookingForm = document.getElementById('booking-form');
    const signinForm = document.getElementById('signin-form');
    const registerForm = document.getElementById('register-form');
    const modalHotelName = document.getElementById('modal-hotel-name');
    const hotelIdInput = document.getElementById('hotel-id');
    const signinBtn = document.getElementById('nav-signin-btn');

    // UI Elements
    const searchInput = document.getElementById('search-input');
    const ratingFilter = document.getElementById('rating-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // Auth Tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // State
    let currentPage = 1;
    let totalPages = 1;
    let currentFilters = {};
    let currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

    // Update Sign In Button State
    const updateAuthUI = () => {
        if (currentUser) {
            signinBtn.textContent = `Hi, ${currentUser.name}`;
            signinBtn.onclick = () => {
                if (confirm('Do you want to logout?')) {
                    localStorage.removeItem('user');
                    currentUser = null;
                    updateAuthUI();
                    window.location.reload();
                }
            };
        } else {
            signinBtn.textContent = 'Sign In';
            signinBtn.onclick = () => signinModal.classList.add('show');
        }
    };
    updateAuthUI();

    // Sign In Logic
    signinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        // Mock Login for now (or verify against registered users if we implemented that endpoint)
        // For this step, we'll stick to mock login but persist it
        currentUser = { name: email.split('@')[0], email };
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateAuthUI();
        signinModal.classList.remove('show');
        signinForm.reset();
    });

    // Register Logic
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Registration successful') {
                    alert('Registration successful! You are now logged in.');
                    currentUser = data.user;
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    updateAuthUI();
                    signinModal.classList.remove('show');
                    registerForm.reset();
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Registration failed.');
            });
    });

    closeSigninModal.addEventListener('click', () => signinModal.classList.remove('show'));

    // Fetch Hotels
    const fetchHotels = (page = 1) => {
        hotelGrid.innerHTML = '<div class="loading">Loading exclusive stays...</div>';

        const params = new URLSearchParams({
            page,
            limit: 20,
            ...currentFilters
        });

        fetch(`/api/hotels?${params}`)
            .then(response => response.json())
            .then(data => {
                renderHotels(data.hotels);
                updatePagination(data.pagination);
            })
            .catch(error => {
                hotelGrid.innerHTML = '<p>Error loading hotels. Please try again later.</p>';
                console.error('Error:', error);
            });
    };

    const renderHotels = (hotels) => {
        hotelGrid.innerHTML = '';
        if (hotels.length === 0) {
            hotelGrid.innerHTML = '<p>No hotels found matching your criteria.</p>';
            return;
        }

        hotels.forEach(hotel => {
            // Currency formatting (approx conversion 1 USD = 85 INR)
            const price = hotel.price * 85;

            const card = document.createElement('div');
            card.className = 'hotel-card';
            card.innerHTML = `
                <div class="hotel-image">
                    <img src="${hotel.image}" alt="${hotel.name}">
                </div>
                <div class="hotel-info">
                    <h3>${hotel.name}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${hotel.city}, ${hotel.country}</p>
                    <p>${hotel.description}</p>
                    <div class="rating">
                        <i class="fas fa-star" style="color: #f1c40f;"></i> ${hotel.rating}
                    </div>
                    <div class="hotel-footer">
                        <div class="price">Rs ${price.toLocaleString()} <span>/ night</span></div>
                        <button class="btn-primary" onclick="openBookingModal(${hotel.id}, '${hotel.name}')">Book Now</button>
                    </div>
                </div>
            `;
            hotelGrid.appendChild(card);
        });
    };

    const updatePagination = (pagination) => {
        currentPage = pagination.currentPage;
        totalPages = pagination.totalPages;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    };

    // Event Listeners
    applyFiltersBtn.addEventListener('click', () => {
        currentFilters = {
            search: searchInput.value,
            minPrice: minPriceInput.value ? minPriceInput.value / 85 : '',
            maxPrice: maxPriceInput.value ? maxPriceInput.value / 85 : '',
            minRating: ratingFilter.value
        };
        currentPage = 1;
        fetchHotels(1);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyFiltersBtn.click();
        }
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchHotels(currentPage - 1);
            window.scrollTo({ top: document.getElementById('hotels').offsetTop - 100, behavior: 'smooth' });
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            fetchHotels(currentPage + 1);
            window.scrollTo({ top: document.getElementById('hotels').offsetTop - 100, behavior: 'smooth' });
        }
    });

    // Modal Logic
    window.openBookingModal = (id, name) => {
        if (!currentUser) {
            alert('Please Sign In to book a hotel.');
            signinModal.classList.add('show');
            return;
        }
        bookingModal.classList.add('show');
        modalHotelName.textContent = name;
        hotelIdInput.value = id;

        // Auto-fill if user exists
        document.getElementById('name').value = currentUser.name;
        document.getElementById('email').value = currentUser.email;
    };

    closeBookingModal.addEventListener('click', () => {
        bookingModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) bookingModal.classList.remove('show');
        if (e.target === signinModal) signinModal.classList.remove('show');
        if (e.target === paymentModal) { /* Prevent closing payment modal by clicking outside */ }
    });

    // Handle Booking Submission & Payment Flow
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const bookingData = {
            hotelId: hotelIdInput.value,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            date: document.getElementById('date').value
        };

        // Close Booking Modal
        bookingModal.classList.remove('show');

        // Show Payment Modal
        paymentModal.classList.add('show');

        // Start Timer
        const timerSpan = document.getElementById('timer');
        const loader = document.querySelector('.loader-progress');
        let timeLeft = 5;

        // Trigger loader animation
        setTimeout(() => loader.classList.add('active'), 100);

        const countdown = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                completeBooking(bookingData);
            }
        }, 1000);
    });

    const completeBooking = (bookingData) => {
        fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
            .then(response => response.json())
            .then(data => {
                paymentModal.classList.remove('show');
                alert('Payment Successful! ' + data.message);
                bookingForm.reset();
                // Reset loader
                document.querySelector('.loader-progress').classList.remove('active');
                document.getElementById('timer').textContent = '5';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Booking failed. Please try again.');
                paymentModal.classList.remove('show');
            });
    };

    // Recommended Hotels Logic
    const fetchRecommended = () => {
        const recommendedGrid = document.getElementById('recommended-grid');
        if (!recommendedGrid) return;

        // Fetch random high-rated hotels
        fetch('/api/hotels?minRating=4.5&limit=20')
            .then(res => res.json())
            .then(data => {
                const hotels = data.hotels;
                // Shuffle and pick 3
                const shuffled = hotels.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 3);

                recommendedGrid.innerHTML = '';
                selected.forEach(hotel => {
                    const price = hotel.price * 85;
                    const card = document.createElement('div');
                    card.className = 'hotel-card';
                    card.innerHTML = `
                        <div class="hotel-image">
                            <img src="${hotel.image}" alt="${hotel.name}">
                            <div class="badge">Top Pick</div>
                        </div>
                        <div class="hotel-info">
                            <h3>${hotel.name}</h3>
                            <p><i class="fas fa-map-marker-alt"></i> ${hotel.city}, ${hotel.country}</p>
                            <div class="rating">
                                <i class="fas fa-star" style="color: #f1c40f;"></i> ${hotel.rating}
                            </div>
                            <div class="hotel-footer">
                                <div class="price">Rs ${price.toLocaleString()} <span>/ night</span></div>
                                <button class="btn-primary" onclick="openBookingModal(${hotel.id}, '${hotel.name}')">Book Now</button>
                            </div>
                        </div>
                    `;
                    recommendedGrid.appendChild(card);
                });
            })
            .catch(err => console.error('Error fetching recommended:', err));
    };

    // Initial Load
    fetchHotels();
    fetchRecommended();
});
