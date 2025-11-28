// Environment Configuration
window.ENV = {
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000'
        : 'https://prou-backend.onrender.com'
};