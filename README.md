# 🔨 BidMaster - MERN Stack Auction Platform

**Task 799 - Final Testing & Deployment**

A beginner-friendly, yet professional MERN stack application featuring live bidding, role-based authorization, automated auction closing, and an admin analytics dashboard.

## 🌟 Features

### 👥 Role-Based System
- **Buyer (User)**: Can browse active auctions, place bids, and view bid history.
- **Seller**: Can create, manage, and delete their own auctions. Cannot bid on their own items.
- **Admin**: Has access to platform-wide analytics and reporting tools.

### ⚡ Core Functionality
- **Real-Time Bidding**: Secure bidding logic ensuring new bids are higher than the current price.
- **Automated Closing**: A Node.js CRON job automatically checks for and closes expired auctions every minute, assigning a winner if bids exist.
- **Smart Notifications**: Users receive alerts when they are outbid, when an auction ends, or when they win.
- **Analytics Dashboard**: Admins can view Recharts-powered graphs showing monthly user registrations, auction creation trends, and estimated revenue.

### 🛡️ Security & Architecture
- **Centralized Error Handling**: Custom `CustomError` class and middleware for clean, consistent API responses.
- **JWT Authentication**: Secure token-based auth with HTTP-only interceptors via Axios.
- **API Protection**: Helmet security headers, Express Rate Limiting, and CORS configurations.

---

## 💻 Tech Stack

**Frontend**
- React.js (Vite)
- React Router v6
- Axios
- Recharts (Data Visualization)
- Lucide React (Icons)
- Vanilla CSS (Glassmorphism & Custom Properties)

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & Bcrypt.js
- Node-Cron (Automated background tasks)

---

## 📁 Folder Structure

```
task799/
├── backend/
│   ├── config/           # Database connection
│   ├── controllers/      # API Logic (Auth, Auction, Notification, Admin)
│   ├── middleware/       # Auth Guard, Global Error Handler
│   ├── models/           # Mongoose Schemas
│   ├── routes/           # Express Routers
│   ├── utils/            # Async Handler, Custom Error
│   ├── .env.example
│   └── server.js         # Entry Point
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── components/   # Navbar, UI elements
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # React Pages (Dashboards, Auth, Lists)
│   │   ├── index.css     # Global Design System
│   │   ├── App.jsx       # Routing setup
│   │   └── main.jsx
│   └── package.json
│
├── TESTING_CHECKLIST.md  # QA & Testing Guide
└── DEPLOYMENT_GUIDE.md   # Hosting & Domain Setup
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas URI (or local MongoDB)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT Secret.
4. `npm run dev` (Runs on port 5000)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

---

## 📄 Documentation

- Check `TESTING_CHECKLIST.md` for API and UI testing workflows.
- Check `DEPLOYMENT_GUIDE.md` for production deployment and custom domain linking instructions.
