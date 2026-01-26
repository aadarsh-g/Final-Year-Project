# Quick Start: Google OAuth for Bookify

## ✅ What's Been Done

Your Bookify app now supports Google OAuth authentication! Here's what was implemented:

### Backend Changes ✓
- Updated User model to support Google accounts
- Created Google OAuth controller (`/api/auth/google`)
- Added authentication routes for Google login

### Frontend Changes ✓
- Added "Continue with Google" button to Login page
- Added "Continue with Google" button to Signup page
- Created Google callback handler page
- Integrated OAuth flow

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Google OAuth Credentials

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure consent screen if prompted:
   - User Type: External
   - App name: Bookify
   - Your email
   - Save and continue through the steps

6. Create OAuth Client:
   - Application type: **Web application**
   - Name: Bookify Web
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173/auth/google/callback`
   - Click Create

7. **Copy your Client ID and Client Secret**

### Step 2: Configure Frontend

Create a `.env` file in the `frontend` folder:

```bash
cd frontend
touch .env
```

Add these lines to `frontend/.env` (replace with your actual credentials):

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
VITE_API_URL=http://localhost:5001
```

### Step 3: Restart Frontend

```bash
# Stop the frontend server (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 4: Test It!

1. Open http://localhost:5173/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected to the catalog!

## 📁 Files Modified/Created

### Backend
- ✅ `backend/models/User.js` - Added Google OAuth fields
- ✅ `backend/controllers/googleAuthController.js` - New
- ✅ `backend/routes/authRoutes.js` - Added Google routes

### Frontend
- ✅ `frontend/src/pages/LoginPage.jsx` - Added Google button
- ✅ `frontend/src/pages/SignupPage.jsx` - Added Google button
- ✅ `frontend/src/pages/GoogleCallback.jsx` - New
- ✅ `frontend/src/App.jsx` - Added callback route
- ✅ `frontend/.env.example` - New

## 🔧 Testing Without Google Setup

If you want to test without setting up Google OAuth yet:

1. The regular email/password login still works
2. The Google buttons will redirect to Google but won't work until you add credentials
3. Add your credentials to `.env` whenever you're ready

## 🎯 What Users Can Do Now

1. **Sign up with Google** - Click "Continue with Google" on signup page
2. **Login with Google** - Click "Continue with Google" on login page
3. **Link accounts** - If they signed up with email and later use Google with same email, accounts are linked
4. **Regular auth still works** - Email/password signup and login work as before

## 🔐 Security Notes

- Google tokens are exchanged on the frontend (for simplicity)
- User data is verified before creating/updating accounts
- JWT tokens are still used for session management
- Passwords remain optional for Google users

## 🐛 Troubleshooting

### "redirect_uri_mismatch" error
➜ Make sure the redirect URI in Google Console exactly matches:
`http://localhost:5173/auth/google/callback`

### Google button doesn't work
➜ Check that you've:
1. Created the `.env` file in the `frontend` folder
2. Added your actual Client ID and Secret
3. Restarted the frontend server

### "Invalid client" error
➜ Double-check your Client ID and Secret in `.env`

### Can't access Google Console
➜ You need a Google account and may need to accept developer terms

## 📝 Environment Variables Checklist

Make sure your `frontend/.env` has:
- [ ] `VITE_GOOGLE_CLIENT_ID` (from Google Console)
- [ ] `VITE_GOOGLE_CLIENT_SECRET` (from Google Console)
- [ ] `VITE_API_URL=http://localhost:5001`

## 🎨 UI Features

The Google buttons include:
- ✅ Google's official logo and colors
- ✅ "Or continue with" divider
- ✅ Disabled state during loading
- ✅ Hover effects
- ✅ Responsive design

## 💡 Tips

1. **Test users**: In Google Console, add your email as a test user while the app is in development
2. **Multiple accounts**: You can test with different Google accounts
3. **Account switching**: Logging out and back in with different Google accounts works
4. **Role-based redirect**: Admins go to `/admin`, users go to `/catalog`

## Need More Help?

Check the detailed guide: `GOOGLE_OAUTH_SETUP.md`

---

**Ready to test?** Just add your Google credentials to `frontend/.env` and restart the server!

