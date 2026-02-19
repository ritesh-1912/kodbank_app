# Kodbank - Banking Application

A full-stack banking application with user registration, JWT-based authentication, and balance checking functionality.

## Features

- **User Registration**: Register with UID, username, email, password, phone, and role (customer only)
- **User Login**: Secure login with username/password validation and JWT token generation
- **Balance Check**: Protected endpoint to check user balance with JWT verification
- **Beautiful UI**: Modern, responsive design with animations

## Tech Stack

### Backend
- Node.js + Express
- MySQL (Aiven DB)
- JWT (jsonwebtoken)
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- Canvas Confetti for animations
- Vite for build tooling

## Project Structure

```
kodbank/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # JWT utilities
│   │   └── server.js        # Express server
│   ├── database-setup.sql   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── App.jsx         # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL database (Aiven DB)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DB_HOST=your_aiven_host
DB_PORT=3306
DB_USER=your_aiven_user
DB_PASSWORD=your_aiven_password
DB_NAME=your_database_name
JWT_SECRET=your_strong_random_secret_key
JWT_EXPIRY=24h
PORT=5000
FRONTEND_URL=http://localhost:3000
```

5. Set up database schema:
   - Run the SQL script `database-setup.sql` in your MySQL database
   - Or execute the SQL commands manually in your Aiven DB console

6. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "uid": "12345",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please login."
}
```

### POST `/api/auth/login`
Login user and receive JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "johndoe",
    "role": "customer"
  }
}
```

**Cookie:** JWT token is set as HTTP-only cookie named `token`

### GET `/api/balance`
Check user balance (requires authentication).

**Headers:** Cookie with JWT token (automatically sent by browser)

**Response:**
```json
{
  "success": true,
  "balance": 100000,
  "message": "Your balance is: 100000"
}
```

## Database Schema

### KodUser Table
- `uid` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `username` (VARCHAR(100), UNIQUE, NOT NULL)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL) - Hashed
- `phone` (VARCHAR(20), NOT NULL)
- `role` (ENUM: 'customer', 'manager', 'admin', DEFAULT: 'customer')
- `balance` (DECIMAL(15,2), DEFAULT: 100000.00)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### UserToken Table
- `tid` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `token` (TEXT, NOT NULL) - JWT token
- `uid` (INT, FOREIGN KEY → KodUser.uid)
- `expairy` (DATETIME, NOT NULL)
- `created_at` (TIMESTAMP)

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT tokens with HTTP-only cookies
- CORS configuration
- Input validation on both frontend and backend
- SQL injection prevention with parameterized queries
- Token expiration management

## Development Notes

- Default initial balance: ₹100,000
- JWT token expires in 24 hours (configurable)
- Role is enforced to 'customer' only during registration
- Tokens are stored in UserToken table for tracking
- Frontend automatically sends cookies with API requests

## License

ISC
