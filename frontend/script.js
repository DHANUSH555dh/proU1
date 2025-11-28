// API Configuration
const API_URL = window.ENV ? window.ENV.API_URL + '/api' : '/api';

// Enhanced Fetch with JWT Interceptor
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showToast('Session expired. Please login again.', 'error');
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 2000);
            throw new Error('Unauthorized');
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Dark Mode Functions
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const slider = document.querySelector('.theme-toggle-slider');
    if (slider) {
        slider.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// Enhanced Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Utility Functions
function showAlert(message, type = 'info') {
    // Backward compatibility - use showToast
    showToast(message, type);
}

// Loading Spinner
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'spinner-overlay';
    overlay.id = 'loadingSpinner';
    overlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.remove();
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAlert('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1000);
}

// Check authentication and update UI
function checkAuth() {
    const token = getToken();
    const user = getUser();

    const loginNav = document.getElementById('loginNav');
    const registerNav = document.getElementById('registerNav');
    const userNav = document.getElementById('userNav');
    const myBookingsNav = document.getElementById('myBookingsNav');
    const adminNav = document.getElementById('adminNav');
    const userName = document.getElementById('userName');

    if (token && user) {
        // User is logged in
        if (loginNav) loginNav.style.display = 'none';
        if (registerNav) registerNav.style.display = 'none';
        if (userNav) userNav.style.display = 'block';
        if (userName) userName.textContent = user.name;

        // Show/hide nav items based on role
        if (user.role === 'admin') {
            // Admin users: show admin nav, hide my bookings
            if (adminNav) adminNav.style.display = 'block';
            if (myBookingsNav) myBookingsNav.style.display = 'none';
        } else {
            // Regular users: show my bookings, hide admin nav
            if (myBookingsNav) myBookingsNav.style.display = 'block';
            if (adminNav) adminNav.style.display = 'none';
        }
    } else {
        // User is not logged in
        if (loginNav) loginNav.style.display = 'block';
        if (registerNav) registerNav.style.display = 'block';
        if (userNav) userNav.style.display = 'none';
        if (myBookingsNav) myBookingsNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
    }
}

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('Login successful!', 'success');

            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = '../admin/admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Error connecting to server. Please try again.', 'error');
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isAdmin = document.getElementById('registerAsAdmin').checked;

    // Validate password match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
    }

    const userData = {
        name,
        email,
        password,
        role: isAdmin ? 'admin' : 'customer'
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showAlert('Registration successful!', 'success');

            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = '../admin/admin-dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1000);
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Error connecting to server. Please try again.', 'error');
    }
}

// Room Functions
let allRooms = [];

async function loadRooms() {
    try {
        const response = await fetch(`${API_URL}/rooms`);
        allRooms = await response.json();
        displayRooms(allRooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        document.getElementById('roomsGrid').innerHTML = 
            '<p class="error-message">Error loading rooms. Please try again later.</p>';
    }
}

function displayRooms(rooms) {
    const roomsGrid = document.getElementById('roomsGrid');

    if (!rooms || rooms.length === 0) {
        roomsGrid.innerHTML = '<p class="empty-state">No rooms found matching your criteria.</p>';
        return;
    }

    roomsGrid.innerHTML = rooms.map((room, index) => {
        const amenities = room.amenities && room.amenities.length > 0
            ? room.amenities.slice(0, 4).map(a => `<span class="amenity-tag">${getAmenityIcon(a)} ${a}</span>`).join('')
            : '';
        
        const rating = generateRating(room.price);
        
        // Determine room status and styling
        const isOutOfOrder = room.outOfOrder;
        const isAvailable = room.available && !isOutOfOrder;
        const cardClass = isOutOfOrder ? 'room-card out-of-order' : 'room-card';
        
        let statusBadge = '';
        if (isOutOfOrder) {
            statusBadge = '<span class="room-badge out-of-order">Out of Order</span>';
        } else if (isAvailable) {
            statusBadge = '<span class="room-badge available">Available</span>';
        } else {
            statusBadge = '<span class="room-badge booked">Booked</span>';
        }
        
        return `
        <div class="${cardClass}" style="animation-delay: ${index * 0.1}s">
            ${room.images && room.images.length > 0 
                ? `<div class="room-image">
                     <img src="${room.images[0]}" alt="${room.type} Room ${room.roomNumber}" 
                          onerror="this.src='https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; this.onerror=null;">
                     ${statusBadge}
                   </div>` 
                : `<div class="room-image default-room-bg">
                     <div class="room-type-icon">${getRoomTypeIcon(room.type)}</div>
                     <div class="room-number-overlay">Room ${room.roomNumber}</div>
                     ${statusBadge}
                   </div>`
            }
            <div class="room-info">
                <h3>Room ${room.roomNumber}</h3>
                <span class="room-type">${room.type}</span>
                <div class="rating">${rating}</div>
                <p>${room.description.substring(0, 100)}${room.description.length > 100 ? '...' : ''}</p>
                <div class="amenities-list">
                    ${amenities}
                </div>
                ${room.features && room.features.length > 0 ? `
                <div class="room-features">
                    <h4>Features</h4>
                    <div class="features-display-grid">
                        ${room.features.map(feature => `
                            <div class="feature-display-item">
                                <span class="feature-display-icon">${feature.icon}</span>
                                <span class="feature-display-name">${feature.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
                <div class="room-details-line">
                    <span>👥 ${room.capacity} ${room.capacity > 1 ? 'Guests' : 'Guest'}</span>
                </div>
                <div class="room-price">$${room.price} <small>/ night</small></div>
                <div class="room-actions">
                    <button onclick='viewRoomDetailsEnhanced(${JSON.stringify(room)})' class="btn btn-secondary btn-small">View Details</button>
                    ${isOutOfOrder 
                        ? '<button class="btn btn-small" style="background: #ef4444; color: white;" disabled>Out of Order</button>'
                        : isAvailable 
                            ? `<button onclick='openBookingModal("${room._id}", ${room.price}, ${room.capacity})' class="btn btn-primary btn-small">Book Now</button>` 
                            : '<button class="btn btn-small" style="background: #94a3b8;" disabled>Not Available</button>'
                    }
                </div>
            </div>
        </div>
    `}).join('');
}

function getAmenityIcon(amenity) {
    const icons = {
        'WiFi': '📶',
        'TV': '📺',
        'Air Conditioning': '❄️',
        'Mini Bar': '🍷',
        'Mini Fridge': '🧊',
        'Room Service': '🛎️',
        'Balcony': '🌅',
        'Ocean View': '🌊',
        'City View': '🏙️',
        'Jacuzzi': '🛁',
        'Living Room': '🛋️',
        'Kitchen': '🍳',
        'Work Desk': '💼',
        'Butler Service': '👔',
        'Private Terrace': '🏞️',
        'King Bed': '🛏️',
        'Game Console': '🎮',
        'Gym Access': '💪',
        'Pool Access': '🏊',
        'Spa': '💆'
    };
    return icons[amenity] || '✨';
}

function getRoomTypeIcon(roomType) {
    const icons = {
        'Single': '🛏️',
        'Double': '🏩',
        'Suite': '🏛️', 
        'Deluxe': '👑',
        'Presidential': '🏰'
    };
    return icons[roomType] || '🏨';
}

function generateRating(price) {
    let stars = 3;
    if (price > 100) stars = 4;
    if (price > 250) stars = 4.5;
    if (price > 400) stars = 5;
    
    const fullStars = Math.floor(stars);
    const halfStar = stars % 1 !== 0;
    
    let rating = '★'.repeat(fullStars);
    if (halfStar) rating += '½';
    rating += '☆'.repeat(5 - Math.ceil(stars));
    
    return rating;
}

function searchRooms() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let filtered = [...allRooms];
    
    if (searchTerm) {
        filtered = filtered.filter(room => 
            room.type.toLowerCase().includes(searchTerm) ||
            room.description.toLowerCase().includes(searchTerm) ||
            room.roomNumber.toString().includes(searchTerm) ||
            (room.amenities && room.amenities.some(a => a.toLowerCase().includes(searchTerm)))
        );
    }
    
    // Apply other filters
    applyFiltersToList(filtered);
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');
    
    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = '';
    if (priceFilter) priceFilter.value = '';
    
    displayRooms(allRooms);
}

function applyFiltersToList(roomsList) {
    const typeFilter = document.getElementById('typeFilter')?.value;
    const priceFilter = document.getElementById('priceFilter')?.value;

    let filtered = roomsList;

    if (typeFilter) {
        filtered = filtered.filter(room => room.type === typeFilter);
    }

    if (priceFilter) {
        if (priceFilter === '0-100') {
            filtered = filtered.filter(room => room.price >= 0 && room.price <= 100);
        } else if (priceFilter === '100-200') {
            filtered = filtered.filter(room => room.price > 100 && room.price <= 200);
        } else if (priceFilter === '200-500') {
            filtered = filtered.filter(room => room.price > 200 && room.price <= 500);
        } else if (priceFilter === '500+') {
            filtered = filtered.filter(room => room.price > 500);
        }
    }

    displayRooms(filtered);
}

function applyFilters() {
    searchRooms();
}

function viewRoomDetails(room) {
    const amenitiesList = room.amenities && room.amenities.length > 0 
        ? `<ul>${room.amenities.map(a => `<li>${a}</li>`).join('')}</ul>` 
        : '<p>No amenities listed</p>';

    const images = room.images && room.images.length > 0
        ? room.images.map(img => `<img src="${img}" style="width: 100%; margin-bottom: 10px; border-radius: 8px;" alt="Room">`).join('')
        : '<div class="room-image">🏨</div>';

    const details = `
        <h2>Room ${room.roomNumber} - ${room.type}</h2>
        ${images}
        <p><strong>Price:</strong> $${room.price} per night</p>
        <p><strong>Capacity:</strong> ${room.capacity} guests</p>
        <p><strong>Status:</strong> ${room.available ? '<span style="color: #10b981;">Available</span>' : '<span style="color: #ef4444;">Unavailable</span>'}</p>
        <p><strong>Description:</strong></p>
        <p>${room.description}</p>
        <p><strong>Amenities:</strong></p>
        ${amenitiesList}
        ${room.available 
            ? `<button onclick='closeRoomModal(); openBookingModal("${room._id}", ${room.price}, ${room.capacity})' class="btn btn-primary" style="margin-top: 1rem;">Book This Room</button>` 
            : ''
        }
    `;

    document.getElementById('roomDetails').innerHTML = details;
    document.getElementById('roomModal').style.display = 'block';
}

function closeRoomModal() {
    document.getElementById('roomModal').style.display = 'none';
}

// Booking Functions
let currentRoomPrice = 0;
let currentRoomCapacity = 1;

function openBookingModal(roomId, price, capacity) {
    const token = getToken();
    
    if (!token) {
        showAlert('Please login to book a room', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // Close room details modal first
    closeModal('roomDetailsModal');

    currentRoomPrice = price;
    currentRoomCapacity = capacity;
    
    document.getElementById('bookRoomId').value = roomId;
    document.getElementById('guests').setAttribute('max', capacity);
    document.getElementById('bookingModal').style.display = 'block';

    // Add event listeners for date changes
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const guestsInput = document.getElementById('guests');

    [checkInInput, checkOutInput, guestsInput].forEach(input => {
        input.addEventListener('change', calculatePrice);
    });

    calculatePrice();
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('bookingForm').reset();
}

function calculatePrice() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (checkIn && checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

        if (days > 0 && checkOutDate > checkInDate) {
            const total = days * currentRoomPrice;
            const priceElement = document.getElementById('priceCalculation');
            if (priceElement) {
                priceElement.innerHTML = `
                    <div style="background: var(--bg-secondary, #f8fafc); padding: 15px; border-radius: 8px; margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Duration:</span>
                            <span><strong>${days} night${days > 1 ? 's' : ''}</strong></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Rate per night:</span>
                            <span>$${currentRoomPrice}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 1.1em;">
                            <span><strong>Total Amount:</strong></span>
                            <span style="color: var(--primary-color, #10b981);"><strong>$${total}</strong></span>
                        </div>
                        <div style="font-size: 0.9em; color: var(--text-secondary, #64748b); margin-top: 8px;">
                            From ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()}
                        </div>
                    </div>
                `;
            }
        } else {
            const priceElement = document.getElementById('priceCalculation');
            if (priceElement) {
                priceElement.innerHTML = 
                    '<div style="color: #ef4444; padding: 10px; background: #fef2f2; border-radius: 8px; margin: 10px 0;">⚠️ Check-out date must be after check-in date</div>';
            }
        }
    } else {
        const priceElement = document.getElementById('priceCalculation');
        if (priceElement) {
            priceElement.innerHTML = '<div style="color: #64748b; padding: 10px;">Please select both check-in and check-out dates</div>';
        }
    }
}

async function handleBooking(event) {
    event.preventDefault();

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        showAlert('Please login to book a room', 'error');
        return;
    }

    const bookingData = {
        roomId: document.getElementById('bookRoomId').value,
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        guests: parseInt(document.getElementById('guests').value)
    };

    // Validate guests
    if (bookingData.guests > currentRoomCapacity) {
        showAlert(`Maximum capacity is ${currentRoomCapacity} guests`, 'error');
        return;
    }

    // Validate dates
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
        showAlert('Check-in date cannot be in the past', 'error');
        return;
    }

    if (checkOutDate <= checkInDate) {
        showAlert('Check-out date must be after check-in date', 'error');
        return;
    }

    // Calculate days and validate reasonable duration (max 30 days)
    const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (days > 30) {
        showAlert('Booking duration cannot exceed 30 days. For longer stays, please contact us directly.', 'error');
        return;
    }

    if (days < 1) {
        showAlert('Minimum stay is 1 night', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Booking created successfully!', 'success');
            closeBookingModal();
            
            setTimeout(() => {
                window.location.href = 'my-bookings.html';
            }, 1500);
        } else {
            showAlert(data.message || 'Failed to create booking', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showAlert('Error creating booking. Please try again.', 'error');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const roomModal = document.getElementById('roomModal');
    const bookingModal = document.getElementById('bookingModal');
    const editRoomModal = document.getElementById('editRoomModal');
    const deleteModal = document.getElementById('deleteModal');
    const confirmModal = document.getElementById('confirmModal');
    const bookingDetailsModal = document.getElementById('bookingDetailsModal');

    if (event.target == roomModal) {
        closeRoomModal();
    }
    if (event.target == bookingModal) {
        closeBookingModal();
    }
    if (event.target == editRoomModal && typeof closeEditModal === 'function') {
        closeEditModal();
    }
    if (event.target == deleteModal && typeof closeDeleteModal === 'function') {
        closeDeleteModal();
    }
    if (event.target == confirmModal && typeof closeConfirmModal === 'function') {
        closeConfirmModal();
    }
    if (event.target == bookingDetailsModal && typeof closeBookingDetailsModal === 'function') {
        closeBookingDetailsModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initDarkMode();
});

// ==================== MODAL UTILITIES ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// ==================== IMAGE CAROUSEL ====================

class ImageCarousel {
    constructor(containerId, images) {
        this.container = document.getElementById(containerId);
        this.images = images || [];
        this.currentIndex = 0;
        this.render();
    }

    render() {
        if (!this.container || this.images.length === 0) return;

        this.container.innerHTML = `
            <div class="carousel-images" id="carouselImages">
                ${this.images.map((img, index) => `
                    <img src="${img}" alt="Room image ${index + 1}" class="carousel-image" 
                         onerror="this.src='https://via.placeholder.com/800x400?text=Room+Image'">
                `).join('')}
            </div>
            ${this.images.length > 1 ? `
                <button class="carousel-btn prev" onclick="roomCarousel.prev()">‹</button>
                <button class="carousel-btn next" onclick="roomCarousel.next()">›</button>
                <div class="carousel-indicators">
                    ${this.images.map((_, index) => `
                        <div class="indicator ${index === 0 ? 'active' : ''}" 
                             onclick="roomCarousel.goTo(${index})"></div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    goTo(index) {
        this.currentIndex = index;
        const images = document.getElementById('carouselImages');
        if (images) {
            images.style.transform = `translateX(-${index * 100}%)`;
        }
        this.updateIndicators();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.goTo(this.currentIndex);
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goTo(this.currentIndex);
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === this.currentIndex);
        });
    }
}

let roomCarousel = null;

// ==================== AVAILABILITY CALENDAR ====================

class AvailabilityCalendar {
    constructor(containerId, roomId, unavailableDates = []) {
        this.container = document.getElementById(containerId);
        this.roomId = roomId;
        this.unavailableDates = unavailableDates;
        this.currentDate = new Date();
        this.selectedCheckIn = null;
        this.selectedCheckOut = null;
        this.render();
    }

    render() {
        if (!this.container) return;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.container.innerHTML = `
            <div class="calendar-header">
                <h3>${monthNames[month]} ${year}</h3>
                <div class="calendar-nav">
                    <button onclick="availabilityCalendar.prevMonth()">‹ Prev</button>
                    <button onclick="availabilityCalendar.nextMonth()">Next ›</button>
                </div>
            </div>
            <div class="calendar-grid">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
                ${this.generateDays()}
            </div>
            <div class="calendar-instructions">
                <p style="margin-bottom: 10px; font-size: 0.9em; color: var(--text-secondary);">
                    📅 <strong>How to select dates:</strong> Click your check-in date first, then click your check-out date. You can book multiple consecutive nights.
                </p>
            </div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #ffffff; border: 1px solid #e2e8f0;"></div>
                    <span>Available</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: var(--danger-color);"></div>
                    <span>Booked</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #6b7280;"></div>
                    <span>Out of Order</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: var(--primary-color);"></div>
                    <span>Check-in/Check-out</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(16, 185, 129, 0.3);"></div>
                    <span>Selected stay</span>
                </div>
            </div>
        `;
    }

    generateDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let days = '';

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days += '<div class="calendar-day disabled"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            // Use local date formatting to avoid timezone issues
            const dateYear = date.getFullYear();
            const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
            const dateDay = String(date.getDate()).padStart(2, '0');
            const dateStr = `${dateYear}-${dateMonth}-${dateDay}`;
            
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const isUnavailable = this.isDateUnavailable(date);
            const isSelected = this.isDateSelected(date);
            const isInRange = this.isDateInRange(date);

            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isPast) classes += ' disabled';
            if (isUnavailable) classes += ' unavailable';
            if (isSelected && !isUnavailable) classes += ' selected';
            if (isInRange && !isUnavailable) classes += ' in-range';

            const disabled = isPast || isUnavailable;
            const onclick = disabled ? '' : `onclick="availabilityCalendar.selectDate('${dateStr}')"`;

            // Calendar day generated with proper classes

            days += `<div class="${classes}" ${onclick}>${day}</div>`;
        }

        return days;
    }

    isDateUnavailable(date) {
        // Use local date formatting to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Check if date is in the unavailable dates array
        return this.unavailableDates.includes(dateStr);
    }

    isDateSelected(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const checkIn = this.selectedCheckIn?.split('T')[0];
        const checkOut = this.selectedCheckOut?.split('T')[0];
        return dateStr === checkIn || dateStr === checkOut;
    }

    isDateInRange(date) {
        if (!this.selectedCheckIn || !this.selectedCheckOut) return false;
        const checkIn = new Date(this.selectedCheckIn);
        const checkOut = new Date(this.selectedCheckOut);
        return date > checkIn && date < checkOut;
    }

    selectDate(dateStr) {
        const date = new Date(dateStr);
        
        if (!this.selectedCheckIn || (this.selectedCheckIn && this.selectedCheckOut)) {
            // Start new selection
            this.selectedCheckIn = dateStr;
            this.selectedCheckOut = null;
        } else {
            // Complete selection
            const checkIn = new Date(this.selectedCheckIn);
            if (date > checkIn) {
                // Check if there are any unavailable dates in the selected range
                const hasUnavailableDates = this.checkRangeForUnavailableDates(this.selectedCheckIn, dateStr);
                if (hasUnavailableDates) {
                    showToast('Selected date range contains unavailable dates. Please choose different dates.', 'error');
                    this.selectedCheckIn = dateStr;
                    this.selectedCheckOut = null;
                } else {
                    this.selectedCheckOut = dateStr;
                    this.onDateRangeSelected(this.selectedCheckIn, this.selectedCheckOut);
                }
            } else if (date.getTime() === checkIn.getTime()) {
                // Same date clicked, clear selection
                this.selectedCheckIn = null;
                this.selectedCheckOut = null;
            } else {
                // Selected earlier date, restart
                this.selectedCheckIn = dateStr;
                this.selectedCheckOut = null;
            }
        }
        
        this.render();
    }

    checkRangeForUnavailableDates(startDate, endDate) {
        // Normalize dates to avoid timezone issues
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        // Check each date in the range (excluding check-out date)
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const normalized = new Date(d.toISOString().split('T')[0]);
            if (this.isDateUnavailable(normalized)) {
                return true;
            }
        }
        return false;
    }

    onDateRangeSelected(checkIn, checkOut) {
        // Override this method or set as callback
        console.log('Selected dates:', checkIn, checkOut);
        
        // Auto-fill booking form if exists
        const checkInInput = document.getElementById('checkIn');
        const checkOutInput = document.getElementById('checkOut');
        if (checkInInput) checkInInput.value = checkIn;
        if (checkOutInput) checkOutInput.value = checkOut;
        
        // Update checkout minimum date
        if (checkInInput && checkOutInput) {
            const checkInDate = new Date(checkIn);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const minCheckOut = nextDay.toISOString().split('T')[0];
            checkOutInput.setAttribute('min', minCheckOut);
        }
        
        // Trigger price calculation if function exists
        if (typeof calculatePrice === 'function') {
            calculatePrice();
        }
        
        // Show success message for date selection
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const days = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        showToast(`Selected ${days} night${days > 1 ? 's' : ''} stay from ${checkInDate.toLocaleDateString()} to ${checkOutDate.toLocaleDateString()}`, 'success');
    }

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    }

    async checkAvailability(checkIn, checkOut) {
        try {
            const response = await fetch(`${API_URL}/rooms/check-availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: this.roomId,
                    checkIn,
                    checkOut
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking availability:', error);
            return { available: false, message: 'Error checking availability' };
        }
    }
}

let availabilityCalendar = null;

// ==================== ENHANCED ROOM DETAILS MODAL ====================

async function viewRoomDetailsEnhanced(room) {
    showLoading();
    
    try {
        // Fetch unavailable dates for this room (public endpoint)
        const bookingsResponse = await fetch(`${API_URL}/rooms/${room._id}/bookings`);
        let unavailableDates = [];
        
        if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            // Use the pre-calculated unavailable dates array from backend
            unavailableDates = bookingsData.unavailableDates || [];
            // Check if room is out of order
            room.outOfOrder = bookingsData.outOfOrder || room.outOfOrder;
            console.log('Loaded unavailable dates for room:', unavailableDates.length, 'dates', 'Out of order:', room.outOfOrder);
        } else {
            console.error('Failed to fetch bookings:', bookingsResponse.status);
        }

        // Create modal if not exists
        let modal = document.getElementById('roomDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'roomDetailsModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Room ${room.roomNumber} - ${room.type}</h2>
                    <span class="close-modal" onclick="closeModal('roomDetailsModal')">×</span>
                </div>
                <div class="modal-body">
                    ${room.images && room.images.length > 0 ? 
                        `<div class="image-carousel" id="roomCarouselContainer"></div>` : 
                        `<div class="default-room-detail-bg">
                            <div class="room-type-icon">${getRoomTypeIcon(room.type)}</div>
                            <h3>Room ${room.roomNumber}</h3>
                            <p>${room.type} Room</p>
                        </div>`}
                    
                    <div class="room-detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Price</div>
                            <div class="detail-value">$${room.price}/night</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Capacity</div>
                            <div class="detail-value">${room.capacity} ${room.capacity > 1 ? 'Guests' : 'Guest'}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Type</div>
                            <div class="detail-value">${room.type}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">View</div>
                            <div class="detail-value">${room.view || 'City View'}</div>
                        </div>
                    </div>

                    <div style="margin: 1.5rem 0;">
                        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Description</h3>
                        <p style="color: var(--text-secondary); line-height: 1.8;">${room.description}</p>
                    </div>

                    ${room.amenities && room.amenities.length > 0 ? `
                        <div style="margin: 1.5rem 0;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Amenities</h3>
                            <div class="amenities-grid">
                                ${room.amenities.map(amenity => `
                                    <div class="amenity-item">
                                        <span>${getAmenityIcon(amenity)}</span>
                                        <span>${amenity}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${room.features && room.features.length > 0 ? `
                        <div style="margin: 1.5rem 0;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Room Features</h3>
                            <div class="features-display-grid">
                                ${room.features.map(feature => `
                                    <div class="feature-display-item">
                                        <span class="feature-display-icon">${feature.icon}</span>
                                        <span class="feature-display-name">${feature.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${room.outOfOrder ? `
                        <div style="margin: 2rem 0; padding: 1.5rem; background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; text-align: center;">
                            <h3 style="color: #ef4444; margin-bottom: 0.5rem;">🚫 Room Out of Order</h3>
                            <p style="color: #991b1b; margin: 0;">This room is currently out of order and unavailable for booking.</p>
                        </div>
                    ` : `
                        <div style="margin: 2rem 0;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Check Availability</h3>
                            <div class="calendar-container" id="availabilityCalendarContainer"></div>
                        </div>
                    `}

                    ${room.outOfOrder ? `
                        <button class="btn" style="width: 100%; margin-top: 1rem; background: #ef4444; color: white;" disabled>
                            Room Out of Order
                        </button>
                    ` : `
                        <button onclick="openBookingModal('${room._id}', ${room.price}, ${room.capacity})" 
                                class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                            Book This Room
                        </button>
                    `}
                </div>
            </div>
        `;

        openModal('roomDetailsModal');
        hideLoading();

        // Initialize carousel if images exist
        if (room.images && room.images.length > 0) {
            roomCarousel = new ImageCarousel('roomCarouselContainer', room.images);
        }

        // Initialize availability calendar
        availabilityCalendar = new AvailabilityCalendar('availabilityCalendarContainer', room._id, unavailableDates);

    } catch (error) {
        console.error('Error showing room details:', error);
        hideLoading();
        showToast('Error loading room details', 'error');
    }
}

