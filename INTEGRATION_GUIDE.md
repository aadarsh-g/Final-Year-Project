# 🚀 How to Connect Frontend and Backend

## Step 1: Start MongoDB

First, make sure MongoDB is running:

**On macOS:**
```bash
# If installed via Homebrew:
brew services start mongodb-community

# Or manually:
mongod --config /usr/local/etc/mongod.conf
```

**On Windows:**
```bash
# Run as administrator:
net start MongoDB
```

**Using MongoDB Atlas (Cloud):**
If you're using MongoDB Atlas, update the `MONGODB_URI` in `backend/.env` with your connection string.

## Step 2: Start the Backend Server

Open a terminal and navigate to the backend folder:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📚 Database: bookify
🚀 Server running on http://localhost:5000
```

## Step 3: Create an Admin User

In a **new terminal**, run the admin creation script:

```bash
cd backend
node createAdmin.js
```

Follow the prompts:
```
Enter admin full name: Admin User
Enter admin email: admin@bookify.com
Enter admin password: admin123
```

## Step 4: Start the Frontend

In **another terminal**, navigate to the frontend folder:

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

## Step 5: Test the Integration

1. **Open your browser** and go to `http://localhost:5173`

2. **Click "Sign Up"** and create a new user account:
   - Full Name: Test User
   - Email: user@test.com
   - Password: password123
   - Confirm Password: password123
   - ✅ Agree to terms

3. **After signup**, you'll be automatically logged in and redirected to the catalog

4. **Test Login** by logging out and logging back in

5. **Test Admin Login**:
   - Email: admin@bookify.com
   - Password: admin123
   - You'll be redirected to the Admin Dashboard

## API Endpoints Available

### Authentication Routes:
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth token)
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Admin Routes (require admin role):
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics

## Testing with Postman/Thunder Client

### 1. Signup:
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

### 2. Login:
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "rememberMe": true
}
```

Copy the `token` from the response.

### 3. Get Current User (Protected Route):
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## Features Implemented

✅ **Authentication Context** - Global state management for user authentication
✅ **Axios API Integration** - Centralized API calls with automatic token handling
✅ **Login & Signup** - Fully functional with backend integration
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Visual feedback during API calls
✅ **Auto-redirect** - Users redirected based on role (admin → dashboard, user → catalog)
✅ **Protected Routes** - Automatic token verification
✅ **Persistent Login** - Token stored in localStorage
✅ **Role-based Access** - Admin and user roles with different permissions

## Troubleshooting

### Backend won't start:
- Check if MongoDB is running
- Check port 5000 is not in use: `lsof -i :5000` (Mac/Linux)
- Check environment variables in `backend/.env`

### Frontend can't connect:
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify the API base URL in `frontend/src/utils/api.js`

### "Network Error":
- Backend might not be running
- Check if `http://localhost:5000` is accessible
- Firewall might be blocking the connection

### "Invalid token" errors:
- Token might have expired
- Logout and login again
- Check JWT_SECRET matches in backend

## Next Steps

You can now:
1. ✅ Create user accounts
2. ✅ Login/Logout
3. ✅ Access protected pages
4. ✅ Admin can access admin dashboard
5. ✅ User data persists in MongoDB

Happy coding! 🎉

