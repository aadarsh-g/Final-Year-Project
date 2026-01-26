# Google OAuth 2.0 Authentication Flow - Bookify

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE OAUTH AUTHENTICATION FLOW                     │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: User Clicks "Continue with Google"
┌─────────────────┐
│  Login/Signup   │
│      Page       │
│                 │
│  [Continue with │
│     Google]     │ ───► User clicks button
└─────────────────┘
        │
        │ handleGoogleLogin() / handleGoogleSignup()
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Redirect to Google OAuth URL:                                               │
│ https://accounts.google.com/o/oauth2/v2/auth?                              │
│   client_id=YOUR_CLIENT_ID&                                                 │
│   redirect_uri=http://localhost:5173/auth/google/callback&                 │
│   response_type=code&                                                       │
│   scope=openid profile email&                                               │
│   access_type=offline&                                                      │
│   prompt=consent                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE LOGIN PAGE                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │   Sign in with Google                                                │ │
│  │                                                                       │ │
│  │   Email: _____________________                                       │ │
│  │   Password: _____________________                                    │ │
│  │                                                                       │ │
│  │   [Continue]                                                         │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │ User enters credentials and authorizes
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Google redirects back with authorization code:                              │
│ http://localhost:5173/auth/google/callback?code=AUTHORIZATION_CODE         │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GoogleCallback.jsx (Frontend)                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  1. Extract authorization code from URL                              │ │
│  │  2. Exchange code for access token (call to Google)                  │ │
│  │  3. Use access token to get user profile (call to Google)            │ │
│  │  4. Send user data to our backend                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │ POST request with user data
        │ { googleId, email, fullName, avatar }
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend: POST /api/auth/google                           │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  googleAuthController.js:                                            │ │
│  │                                                                       │ │
│  │  1. Check if user exists by googleId                                 │ │
│  │     ├─ Yes? Update lastLogin, return JWT ──────────┐                │ │
│  │     └─ No? Continue to step 2                      │                 │ │
│  │                                                     │                 │ │
│  │  2. Check if user exists by email                  │                 │ │
│  │     ├─ Yes? Link Google account, return JWT ───────┤                │ │
│  │     └─ No? Create new user, return JWT ────────────┤                │ │
│  │                                                     │                 │ │
│  │  3. Generate JWT token ◄────────────────────────────┘                │ │
│  │  4. Return response with token and user data                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │ Response: { token, user: { id, email, role, ... } }
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      GoogleCallback.jsx (Frontend)                          │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  1. Store token in localStorage                                      │ │
│  │  2. Store user data in localStorage                                  │ │
│  │  3. Redirect based on role:                                          │ │
│  │     - Admin → /admin                                                 │ │
│  │     - User → /catalog                                                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
        │
        │
        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER IS LOGGED IN!                                   │
│                                                                              │
│   Admin Users → Admin Dashboard                                             │
│   Regular Users → Book Catalog                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Account Linking Scenarios

### Scenario 1: New Google User
```
User clicks "Continue with Google"
    ↓
Google ID: abc123 (not in database)
Email: john@gmail.com (not in database)
    ↓
CREATE new user:
  - googleId: abc123
  - email: john@gmail.com
  - authProvider: 'google'
  - password: null (not required)
    ↓
Return JWT → User logged in
```

### Scenario 2: Existing Google User
```
User clicks "Continue with Google"
    ↓
Google ID: abc123 (found in database)
    ↓
UPDATE user:
  - lastLogin: now
  - avatar: latest from Google
    ↓
Return JWT → User logged in
```

### Scenario 3: Existing Email/Password User
```
User has account: john@gmail.com (created with password)
User clicks "Continue with Google" with same email
    ↓
Email: john@gmail.com (found in database)
Google ID: abc123 (not in database)
    ↓
LINK accounts:
  - Add googleId: abc123 to existing user
  - Update authProvider: 'google'
  - Keep existing password (still works)
    ↓
Return JWT → User logged in
User can now login with either:
  - Email/password OR
  - Google OAuth
```

## Database User Model

```javascript
{
  _id: ObjectId,
  fullName: "John Doe",
  email: "john@gmail.com",
  password: "hashed_password" or null,  // null for Google-only users
  
  // Google OAuth fields
  googleId: "123456789",                 // Google account ID
  avatar: "https://google.com/...",      // Profile picture URL
  authProvider: "google" or "local",     // How they signed up
  
  role: "user" or "admin",
  isActive: true,
  agreedToTerms: true,
  lastLogin: Date,
  createdAt: Date
}
```

## Frontend Components

### 1. LoginPage.jsx / SignupPage.jsx
- Displays "Continue with Google" button
- Button onClick triggers redirect to Google
- Uses Google's official logo and styling

### 2. GoogleCallback.jsx
- Handles redirect from Google
- Shows loading spinner while processing
- Shows error message if authentication fails
- Auto-redirects on success or failure

### 3. App.jsx
- New route: `/auth/google/callback`
- Renders GoogleCallback component

## Backend Components

### 1. User Model (backend/models/User.js)
- Added fields: `googleId`, `avatar`, `authProvider`
- Made `password` optional (only required for local auth)
- Made `agreedToTerms` optional (auto-true for OAuth)

### 2. Google Auth Controller (backend/controllers/googleAuthController.js)
- `googleAuth()` - Main authentication handler
- Handles user creation, login, account linking
- Returns JWT token

### 3. Auth Routes (backend/routes/authRoutes.js)
- `POST /api/auth/google` - Google authentication endpoint

## Security Features

✅ JWT tokens for session management
✅ Password hashing (bcrypt) for local auth
✅ Google OAuth 2.0 standard protocol
✅ User data validation
✅ Account linking prevention of duplicates
✅ Automatic user creation/update
✅ Role-based access control

## Environment Variables

### Frontend (.env)
```
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
VITE_API_URL=http://localhost:5001
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/bookify
JWT_SECRET=your_jwt_secret
PORT=5001
```

## API Endpoints

### Google Authentication
```http
POST /api/auth/google
Content-Type: application/json

Request Body:
{
  "googleId": "123456789",
  "email": "john@gmail.com",
  "fullName": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/..."
}

Response (Success):
{
  "success": true,
  "message": "Google authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "avatar": "https://...",
    "role": "user",
    "authProvider": "google",
    "createdAt": "2026-01-05T10:30:00Z"
  }
}
```

## Google OAuth Configuration

### Required in Google Cloud Console:

**Authorized JavaScript origins:**
- `http://localhost:5173` (development)
- `https://yourdomain.com` (production)

**Authorized redirect URIs:**
- `http://localhost:5173/auth/google/callback` (development)
- `https://yourdomain.com/auth/google/callback` (production)

**OAuth consent screen:**
- Application name: Bookify
- User support email: your-email@example.com
- Scopes: email, profile, openid

## Testing Checklist

- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized origins and redirect URIs
- [ ] Copy Client ID and Secret to frontend/.env
- [ ] Restart frontend server
- [ ] Test login with Google
- [ ] Test signup with Google
- [ ] Test account linking (existing email)
- [ ] Verify user created in MongoDB
- [ ] Verify JWT token stored
- [ ] Verify redirect works (catalog for user, admin for admin)
- [ ] Test regular email/password login still works

## Next Steps / Enhancements

1. **Backend Token Exchange** - Move OAuth token exchange to backend for security
2. **Refresh Tokens** - Implement refresh token flow
3. **One-Tap Sign In** - Use Google's One Tap for faster login
4. **Profile Pictures** - Display Google avatar in user profile
5. **Additional Providers** - Add Facebook, GitHub, Apple sign in
6. **Account Settings** - Allow users to unlink Google account
7. **Email Verification** - Verify non-Google emails

---

**Status**: ✅ Fully Implemented and Ready to Use!

