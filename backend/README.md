# Bookify Backend API

Complete authentication system with role-based access control (RBAC) for the Bookify online bookstore.

## 🚀 Features

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (User & Admin roles)
- ✅ Protected routes
- ✅ User profile management
- ✅ Admin dashboard with user management
- ✅ MongoDB database integration

## 📦 Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Install MongoDB** (if not already installed):
   - Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud database)

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/bookify
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

4. **Start MongoDB** (if using local installation):
```bash
# On macOS/Linux:
mongod

# On Windows (run as administrator):
net start MongoDB
```

5. **Run the server:**
```bash
# Development mode (with auto-reload):
npm run dev

# Production mode:
npm start
```

## 📍 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/stats` | Get dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| GET | `/api/admin/users/:id` | Get single user | Admin |
| POST | `/api/admin/users` | Create new user | Admin |
| PUT | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

## 📝 API Usage Examples

### 1. User Signup

**Request:**
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "agreedToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. User Login

**Request:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "lastLogin": "2025-01-15T10:35:00.000Z"
  }
}
```

### 3. Get Current User (Protected Route)

**Request:**
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

### 4. Admin - Get All Users

**Request:**
```bash
GET http://localhost:5000/api/admin/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "users": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

## 🔐 Creating an Admin User

**Option 1: Using MongoDB Shell**
```javascript
// Connect to MongoDB
mongosh

// Switch to bookify database
use bookify

// Update a user to admin role
db.users.updateOne(
  { email: "admin@bookify.com" },
  { $set: { role: "admin" } }
)
```

**Option 2: Using Mongoose Script**

Create a file `createAdmin.js` in the backend folder:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.create({
      fullName: "Admin User",
      email: "admin@bookify.com",
      password: "admin123",
      role: "admin",
      agreedToTerms: true
    });

    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
```

Run it:
```bash
node createAdmin.js
```

## 🛡️ Authentication in Frontend

### Store Token in Frontend

After login/signup, store the token:

```javascript
// Login/Signup response
const { token, user } = response.data;

// Store in localStorage
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Send Token with Requests

```javascript
// Example with Axios
import axios from 'axios';

const token = localStorage.getItem('token');

axios.get('http://localhost:5000/api/auth/me', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### Create Axios Instance (Recommended)

```javascript
// frontend/src/utils/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## 📂 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── adminController.js   # Admin operations
├── middleware/
│   └── auth.js              # JWT verification & role authorization
├── models/
│   └── User.js              # User schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   └── adminRoutes.js       # Admin endpoints
├── utils/
│   └── generateToken.js     # JWT token generation
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore              # Git ignore file
├── index.js                # Server entry point
├── package.json            # Dependencies
└── README.md               # This file
```

## 🧪 Testing the API

You can test the API using:

1. **Postman** - Import the endpoints and test
2. **Thunder Client** (VS Code extension)
3. **cURL** commands
4. **Your frontend application**

## 🔒 Security Best Practices

- ✅ Passwords are hashed using bcrypt
- ✅ JWT tokens for stateless authentication
- ✅ Protected routes with middleware
- ✅ Role-based access control
- ✅ Input validation
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for frontend integration

## 🐛 Troubleshooting

### MongoDB Connection Error

If you see `MongooseServerSelectionError`:
1. Make sure MongoDB is running
2. Check the connection string in `.env`
3. Ensure port 27017 is not blocked

### JWT Errors

If authentication fails:
1. Check if the token is being sent in the `Authorization` header
2. Verify the token format: `Bearer <token>`
3. Ensure JWT_SECRET matches between token generation and verification

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure MongoDB is running and accessible

## 🎉 Next Steps

1. ✅ Backend is ready!
2. Integrate with your frontend React app
3. Add more features like:
   - Password reset via email
   - Email verification
   - Refresh tokens
   - Two-factor authentication
   - User profile pictures

Happy coding! 🚀

