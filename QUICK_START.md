# 🎯 BOOKIFY - QUICK START GUIDE

## 🚀 Start Everything (3 Steps)

### 1️⃣ Start MongoDB
```bash
# macOS/Linux
brew services start mongodb-community

# Windows (as Administrator)
net start MongoDB
```

### 2️⃣ Start Backend
```bash
cd backend
npm run dev
```
✅ Should show: `Server running on http://localhost:5000`

### 3️⃣ Start Frontend
```bash
cd frontend
npm run dev
```
✅ Should show: `Local: http://localhost:5173`

---

## 👤 Create Admin Account (One Time)

```bash
cd backend
node createAdmin.js
```

**Suggested Credentials:**
- Name: `Admin User`
- Email: `admin@bookify.com`
- Password: `admin123`

---

## 🔑 Test Logins

### Regular User (Create via Signup)
- Go to http://localhost:5173/signup
- Fill form and create account
- Auto-logged in → Redirects to catalog

### Admin User
- Go to http://localhost:5173/login
- Email: `admin@bookify.com`
- Password: `admin123`
- → Redirects to admin dashboard

---

## 📡 API Testing (Postman/cURL)

### Signup
```bash
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "agreedToTerms": true
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Get Current User (Protected)
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB connection failed | Run: `brew services start mongodb-community` |
| Port 5000 already in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Backend won't start | Check `.env` file exists in `backend/` folder |
| Frontend can't connect | Ensure backend is running on port 5000 |
| "Invalid token" error | Clear localStorage and login again |
| CORS errors | Check backend has `app.use(cors())` |

---

## 📂 Quick File Reference

### Key Backend Files
```
backend/
├── index.js                    # Server entry point
├── config/database.js          # MongoDB connection
├── models/User.js              # User schema
├── controllers/
│   ├── authController.js       # Login/Signup logic
│   └── adminController.js      # User management
├── middleware/auth.js          # JWT verification
└── .env                        # Environment variables
```

### Key Frontend Files
```
frontend/
├── src/
│   ├── main.jsx                # Entry with AuthProvider
│   ├── App.jsx                 # Routes
│   ├── context/AuthContext.jsx # Auth state
│   ├── utils/api.js            # Axios config
│   └── pages/
│       ├── LoginPage.jsx       # Login form
│       └── SignupPage.jsx      # Signup form
```

---

## 🎨 Pages & Routes

| Page | URL | Access |
|------|-----|--------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Signup | `/signup` | Public |
| Catalog | `/catalog` | Public |
| Book Details | `/book/:id` | Public |
| My Orders | `/orders` | User/Admin |
| Admin Dashboard | `/admin` | Admin Only |
| Rental Management | `/admin/rentals` | Admin Only |

---

## 🔐 Environment Variables

Create `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/bookify
JWT_SECRET=bookify_secret_key_2025
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

---

## 💻 Useful Commands

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production mode
node createAdmin.js  # Create admin user
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### MongoDB
```bash
# Start
brew services start mongodb-community

# Stop
brew services stop mongodb-community

# Status
brew services list

# Connect with shell
mongosh
```

---

## 🎯 Common Tasks

### Clear User Session
```javascript
// In browser console (F12)
localStorage.clear()
location.reload()
```

### View Stored Token
```javascript
// In browser console
console.log(localStorage.getItem('token'))
console.log(JSON.parse(localStorage.getItem('user')))
```

### Check MongoDB Data
```bash
mongosh
use bookify
db.users.find().pretty()
```

### Update User to Admin
```bash
mongosh
use bookify
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

## ✅ Checklist

Before testing, make sure:
- [ ] MongoDB is running
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 5173
- [ ] `.env` file exists in backend
- [ ] Admin user is created
- [ ] No console errors in browser
- [ ] Network tab shows API calls

---

## 📞 Get Help

1. Check console logs (backend terminal)
2. Check browser console (F12)
3. Read error messages carefully
4. See `INTEGRATION_GUIDE.md` for details
5. See `backend/README.md` for API docs

---

**✨ Your Bookify app is ready to use!** 🎉

