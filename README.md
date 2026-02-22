# Kodbank - Banking Application

A full-stack banking application with a professional landing page, user registration, JWT-based authentication, balance checking, transfers, cards, transaction history, and an in-app AI assistant (KodAI).

## Features

- **Landing Page**: Professional home page at `/` with hero, feature highlights, trust strip, and clear Sign in / Create account links
- **User Registration**: Register with UID, username, email, password, phone, and role (customer only)
- **User Login**: Secure login with username/password validation and JWT token (HTTP-only cookie)
- **Dashboard**: Check balance, send money, manage cards, view transactions, and chat with KodAI
- **Balance**: Protected endpoint to check user balance with JWT verification
- **Send Money**: Transfer funds to another user by username or UID
- **Cards**: List and add cards (card type and brand)
- **Transactions**: View recent transactions with optional filters (type, search, limit)
- **KodAI Assistant**: In-app chat powered by Hugging Face for help with balance, transfers, UID, and usage
- **UI**: Modern, responsive design with animations and consistent dark theme (amber accent)

## Tech Stack

### Backend
- Node.js + Express
- MySQL (Aiven DB)
- JWT (jsonwebtoken), HTTP-only cookies
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18
- React Router DOM
- Axios for API calls (with credentials for cookies)
- Canvas Confetti for animations
- Vite for build tooling

## Project Structure

```
kodbank/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers (auth, balance, cards, transfer, transactions, ai)
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # JWT utilities
│   │   └── server.js       # Express server
│   ├── database-setup.sql  # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Landing, Register, Login, Dashboard, AnimatedBackground
│   │   ├── services/       # API service layer
│   │   └── App.jsx         # Main app with routing
│   └── package.json
├── README.md
├── VERCEL_DEPLOYMENT.md
└── VERCEL_ENV_SETUP.md
```

## Routes (Frontend)

| Path        | Description                    |
|------------|--------------------------------|
| `/`        | Landing page (home)            |
| `/login`   | Sign in                        |
| `/register`| Create account                 |
| `/dashboard`| Main app (balance, transfer, cards, transactions, KodAI) |

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL database (e.g. Aiven)
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

4. Update `.env` with your database and app settings:
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
   - Run the SQL script `database-setup.sql` in your MySQL database (or Aiven console)

6. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend runs at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional; defaults to localhost:5000):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

### Verify Build

From project root:
```bash
cd frontend && npm run build
```
Ensures the frontend compiles without errors. (No automated test suite is configured; manual testing recommended.)

## API Endpoints

### Auth
- **POST** `/api/auth/register` – Register (body: uid, username, email, password, phone, role)
- **POST** `/api/auth/login` – Login (body: username, password); sets HTTP-only cookie `token`

### Protected (require JWT cookie)
- **GET** `/api/balance` – Get current balance
- **POST** `/api/transfer` – Send money (body: recipient username or uid, amount)
- **GET** `/api/cards` – List cards
- **POST** `/api/cards` – Add card (body: cardType?, brand?)
- **GET** `/api/transactions` – List transactions (query: type?, search?, limit?)
- **POST** `/api/ai` – KodAI chat (body: messages array)

### Health
- **GET** `/api/health` – API status
- **GET** `/api/health/env` – Env vars check
- **GET** `/api/health/db` – Database connection check

## Database Schema

### KodUser
- `uid`, `username`, `email`, `password`, `phone`, `role`, `balance`, `created_at`, `updated_at`

### UserToken
- `tid`, `token`, `uid`, `expairy`, `created_at`

(Schema details and additional tables in `database-setup.sql`.)

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT in HTTP-only cookies
- CORS and input validation (frontend and backend)
- Parameterized queries to prevent SQL injection
- Token expiration and optional token table tracking

## Development Notes

- Default initial balance: ₹100,000
- JWT expiry configurable via `JWT_EXPIRY` (e.g. 24h)
- Registration restricted to role `customer`
- KodAI uses Hugging Face Router API; configure if using your own key

## License

ISC
