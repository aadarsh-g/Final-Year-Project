# 📚 Bookify - Online Bookstore & Rental System

A full-stack web application for buying and renting books online, built with React.js, Node.js, Express, and MongoDB.

## 🌟 Features

### Frontend (React + Tailwind CSS)
- ✅ Responsive Landing Page
- ✅ User Authentication (Login/Signup)
- ✅ Book Catalog with Search & Filters
- ✅ Book Details with Purchase & Rental Options
- ✅ User Order & Rental Tracking
- ✅ Admin Dashboard with User Management
- ✅ Rental Return Management System

### Backend (Node.js + Express + MongoDB)
- ✅ JWT Authentication
- ✅ Role-based Access Control (User & Admin)
- ✅ Password Hashing with bcrypt
- ✅ RESTful API
- ✅ MongoDB Database Integration
- ✅ Protected Routes & Middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd fyp
```

2. **Setup Backend:**
```bash
cd backend
npm install
```

3. **Configure Environment Variables:**
Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=mongodb://localhost:27017/bookify
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

4. **Setup Frontend:**
```bash
cd ../frontend
npm install
```

### Running the Application

**Option 1: Run Separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Use Start Script (Backend)**
```bash
cd backend
./start.sh
```

### Create Admin User

```bash
cd backend
node createAdmin.js
```

Follow the prompts to create an admin account.

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Documentation:** See `backend/README.md`

## 📂 Project Structure

```
fyp/
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions (API)
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js Backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── index.js            # Server entry point
│   ├── createAdmin.js      # Admin creation script
│   └── package.json
│
├── INTEGRATION_GUIDE.md     # Detailed integration guide
└── README.md               # This file
```

## 🔐 Authentication

### User Roles
- **User:** Can browse books, make purchases, rent books
- **Admin:** Full access to admin dashboard, user management

### Default Admin Credentials (after running createAdmin.js)
- Email: admin@bookify.com
- Password: admin123

## 📱 Pages & Routes

### Frontend Routes
- `/` - Landing Page
- `/login` - Login Page
- `/signup` - Signup Page
- `/catalog` - Book Catalog
- `/book/:id` - Book Details
- `/orders` - User Orders & Rentals
- `/admin` - Admin Dashboard (Admin only)
- `/admin/rentals` - Rental Management (Admin only)

### Backend API Routes
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/admin/users` - Get all users (Admin)
- `GET /api/admin/stats` - Dashboard stats (Admin)

## 🛠️ Technologies Used

### Frontend
- React.js
- Tailwind CSS
- React Router DOM
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- CORS

## 📖 Documentation

- **Backend API:** See `backend/README.md`
- **Integration Guide:** See `INTEGRATION_GUIDE.md`

## 🧪 Testing

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "agreedToTerms": true
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- Check connection string in `.env`

### CORS Errors
- Backend must be running on port 5000
- Frontend on port 5173
- CORS is enabled in `backend/index.js`

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET in `.env`
- Verify token in browser DevTools → Application → Local Storage

## 📞 Support

For issues or questions, check:
1. Console logs in browser (F12)
2. Terminal logs for backend
3. `INTEGRATION_GUIDE.md` for detailed setup

## 🎯 Next Steps

- [ ] Add book inventory management
- [ ] Implement payment gateway
- [ ] Add email notifications
- [ ] Add password reset functionality
- [ ] Implement search with elasticsearch
- [ ] Add reviews and ratings system

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ using React.js, Node.js, and MongoDB**

