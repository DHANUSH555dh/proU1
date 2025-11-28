# Happy Hotel - Booking Management System

A full-stack hotel room booking and management system built with Node.js, Express, MongoDB, and vanilla JavaScript. Features user authentication, room management, booking system, and admin dashboard.

##  Live Demo

- **Backend API**: [Deployed on Render](https://prou-backend.onrender.com)
- **Frontend**: [Deployed on Render](https://prou-frontend.onrender.com)

##  Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Steps](#setup-steps)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Bonus Features](#bonus-features)

##  Tech Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM 7.0.0
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs
- **Environment**: dotenv for configuration management
- **CORS**: Cross-origin resource sharing enabled
- **Deployment**: Render (Web Service)

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables for theming
- **Features**: Responsive design, Dark/Light mode toggle
- **Environment Config**: Dynamic API URL configuration
- **Deployment**: Render (Static Site)

### Development & Deployment
- **Version Control**: Git & GitHub
- **Deployment**: Render with render.yaml configuration
- **Environment**: Separate development and production configurations

##  Features

###  Authentication System
- User registration and login
- JWT-based authentication
- Role-based access control (Customer/Admin)
- Secure password hashing with bcrypt

###  Room Management
- Browse available rooms with filtering
- Room types: Single, Double, Suite, Deluxe, Presidential
- Dynamic pricing and availability
- Room images and detailed descriptions
- Real-time availability checking

###  Booking System
- Interactive room booking with date selection
- Booking history and management
- Booking status tracking (Pending, Confirmed, Cancelled)
- Automatic booking code generation
- Guest count and price calculation

###  Admin Dashboard
- Complete hotel management interface
- Real-time statistics and analytics
- Room inventory management
- Booking oversight and management
- User management capabilities
- Revenue tracking and reporting

###  User Experience
- Responsive design for all devices
- Dark/Light theme toggle
- Intuitive navigation and UI
- Real-time form validation
- Toast notifications for user feedback
- Loading states and error handling

##  Setup Steps

### Prerequisites
- Node.js 18.x or higher
- MongoDB database (local or cloud)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/DHANUSH555dh/proU1.git
cd proU1
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/hotel-booking
# or use MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotel-booking
```

### 3. Database Setup
```bash
# Seed the database with sample data
node seed.js
```

This will create:
- 3 sample users (1 admin, 2 customers)
- 10 hotel rooms with different types and prices
- 1 sample booking

**Default Admin Credentials:**
- Email: `admin@hotel.com`
- Password: `admin123`

### 4. Start Backend Server
```bash
# Start the backend server
npm start

# Server will run on http://localhost:5000
```

### 5. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd frontend

# Serve frontend files (using any static server)
# Option 1: Using Python
python -m http.server 3001

# Option 2: Using Node.js http-server
npx http-server . -p 3001

# Option 3: Using Live Server in VS Code
# Install Live Server extension and right-click index.html → "Open with Live Server"
```

### 6. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

##  Project Structure

```
proU1/
├── backend/                    # Backend Node.js application
│   ├── index.js               # Main server file
│   ├── package.json           # Backend dependencies
│   ├── models/                # MongoDB models
│   │   ├── User.js           # User model
│   │   ├── Room.js           # Room model
│   │   ├── Booking.js        # Booking model
│   │   └── RoomFeature.js    # Room features model
│   ├── routes/                # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── rooms.js          # Room management routes
│   │   ├── bookings.js       # Booking routes
│   │   ├── admin.js          # Admin routes
│   │   └── features.js       # Room features routes
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── admin.js          # Admin authorization middleware
│   └── seed.js               # Database seeding script
│
├── frontend/                   # Frontend static files
│   ├── index.html             # Main homepage
│   ├── script.js              # Main JavaScript file
│   ├── styles.css             # Global styles
│   ├── env-config.js          # Environment configuration
│   ├── pages/                 # Application pages
│   │   ├── login.html        # User login
│   │   ├── register.html     # User registration
│   │   ├── rooms.html        # Room browsing
│   │   └── my-bookings.html  # User bookings
│   └── admin/                 # Admin interface
│       ├── admin-dashboard.html
│       ├── manage-bookings.html
│       ├── add-room.html
│       └── features-test.html
│
├── render.yaml                # Render deployment configuration
└── README.md                  # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create new room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)

### Bookings
- `GET /api/bookings/user/:userId` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Get all users

### Features
- `GET /api/features` - Get room features
- `POST /api/features` - Create room feature

## Screenshots

### Homepage & Navigation
*Clean, responsive homepage with modern navigation and theme toggle*
- Professional landing page with hero section
- Responsive navigation with user authentication states
- Dark/Light mode toggle functionality

### Room Browsing & Filtering
*Advanced room search and filtering capabilities*
- Real-time room availability checking
- Filter by room type, price range, and amenities
- Detailed room information with pricing

### Booking Process
*Intuitive booking flow with date selection*
- Interactive calendar for check-in/check-out dates
- Guest count selection and price calculation
- Booking confirmation with unique booking codes

### User Dashboard
*Personal booking management interface*
- Comprehensive booking history
- Booking status tracking and management
- Cancel and modify existing bookings

### Admin Dashboard
*Complete hotel management system*
- Real-time statistics and analytics
- Revenue tracking and reporting
- User and booking management

### Admin Room Management
*Full CRUD operations for room inventory*
- Add new rooms with detailed information
- Edit existing room details and pricing
- Delete and manage room availability

### Responsive Design
*Mobile-first responsive design*
- Optimized for all screen sizes
- Touch-friendly interface for mobile devices
- Consistent experience across platforms

> **Note**: For live screenshots and demo, please visit the deployed application or run locally following the setup steps.

##  Assumptions & Design Decisions

### Authentication & Authorization
- **JWT-based authentication** for stateless session management
- **Role-based access control** with 'customer' and 'admin' roles
- **Secure password storage** using bcrypt hashing (salt rounds: 10)
- **Token expiration** set to 24 hours for security balance
- **Protected routes** require valid JWT tokens

### Database Design
- **MongoDB** chosen for flexibility in handling varying room data structures
- **Mongoose ODM** for schema validation and data modeling
- **Referential integrity** maintained through ObjectId references
- **Unique booking codes** generated automatically (format: HBK-XXXXXX)
- **Indexed fields** for optimized query performance

### Frontend Architecture
- **Vanilla JavaScript** for lightweight, dependency-free frontend
- **Environment-based configuration** for seamless dev/prod transitions
- **Responsive design** using CSS Grid and Flexbox
- **Progressive enhancement** with graceful degradation
- **Local storage** for client-side state persistence

### API Design
- **RESTful architecture** following HTTP method conventions
- **Consistent error responses** with appropriate status codes
- **Input validation** on both frontend and backend layers
- **CORS configuration** for secure cross-origin requests
- **Rate limiting** considerations for production deployment

### Deployment Strategy
- **Separate deployments** for scalability and independence
- **Environment variables** for configuration management
- **Render platform** chosen for simplicity and reliability
- **Static site hosting** for optimal frontend performance
- **Health checks** for monitoring service status

## 🌟 Bonus Features

### 1. Advanced UI/UX
- ** Dark/Light Mode Toggle**: Complete theme system with CSS custom properties
- ** Fully Responsive Design**: Mobile-first approach with breakpoint optimization
- ** Modern Design System**: Consistent spacing, typography, and color schemes
- ** Smooth Animations**: CSS transitions and hover effects for enhanced interactivity
- ** Loading States**: Visual feedback during API calls and data loading

### 2. Enhanced Security
- ** JWT Authentication**: Stateless token-based authentication system
- ** Password Security**: bcrypt hashing with configurable salt rounds
- ** Route Protection**: Middleware-based authentication and authorization
- ** Input Sanitization**: Comprehensive validation on both client and server
- ** CSRF Protection**: Implementation of security best practices

### 3. Advanced Admin Features
- ** Real-time Analytics**: Live dashboard with booking and revenue metrics
- ** User Management**: Complete user oversight and management capabilities
- ** Revenue Insights**: Detailed financial reporting and trend analysis
- ** Inventory Control**: Advanced room management with availability tracking
- ** Booking Oversight**: Comprehensive booking management and modification

### 4. Smart Booking System
- ** Intelligent Availability**: Real-time room availability with conflict prevention
- ** Dynamic Pricing**: Automatic calculation based on dates and room types
- ** Unique Booking Codes**: Automatic generation for easy reference and tracking
- ** Booking Lifecycle**: Complete management from creation to completion
- ** Status Tracking**: Real-time status updates throughout the booking process

### 5. Developer Experience
- ** One-Click Deployment**: Streamlined deployment with render.yaml configuration
- ** Environment Management**: Flexible configuration for different environments
- ** Database Seeding**: Automated sample data generation for development
- ** Comprehensive Docs**: Detailed documentation with examples and best practices
- ** Development Tools**: Hot reload and development server configuration

### 6. Performance Optimizations
- ** Optimized Queries**: Efficient MongoDB queries with proper indexing
- ** Lazy Loading**: On-demand content loading for improved performance
- ** Client-Side Caching**: Strategic use of localStorage for better UX
- ** Error Recovery**: Robust error handling with user-friendly messaging
- ** Code Splitting**: Modular JavaScript for better load times

### 7. Additional Enhancements
- ** Advanced Search**: Multi-criteria filtering with real-time results
- ** User Notifications**: Toast messages for important actions and events
- ** Personalization**: Customized user experience based on preferences
- ** Usage Analytics**: Detailed insights into booking patterns and user behavior
- ** Internationalization Ready**: Structure prepared for multi-language support

##  Testing Approach

### Manual Testing Coverage
-  User registration and authentication flow
-  Room browsing and filtering functionality
-  Complete booking creation and management process
-  Admin dashboard and management features
-  Responsive design across multiple device sizes
-  Theme switching and accessibility features
-  Error handling and edge cases
-  Cross-browser compatibility testing

### API Testing
```bash
# Health check
curl http://localhost:5000/health

# Authentication test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"admin123"}'

# Room listing
curl http://localhost:5000/api/rooms
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add appropriate comments for complex logic
- Test thoroughly before submitting PRs
- Update documentation for new features

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**DHANUSH555dh**
- GitHub: [@DHANUSH555dh](https://github.com/DHANUSH555dh)
- Repository: [proU1](https://github.com/DHANUSH555dh/proU1)

##  Acknowledgments

- Express.js team for the robust and flexible web framework
- MongoDB team for the powerful and scalable database solution
- Render team for providing excellent deployment infrastructure
- Open source community for valuable tools and libraries
- All contributors who helped improve and test this project

---

**Happy Hotel Booking System** - Built  for seamless hotel management and exceptional user experience

*Last Updated: November 28, 2025*
