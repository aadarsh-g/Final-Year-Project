# Google OAuth 2.0 Setup Guide for Bookify

This guide will help you set up Google OAuth authentication for your Bookify application.

## Overview

Google OAuth has been integrated into your authentication system. Users can now:
- Sign up with Google
- Log in with Google
- Link existing accounts with Google

## Features Implemented

### Backend Changes
1. **User Model Updates** (`backend/models/User.js`)
   - Added `googleId` field for Google account identification
   - Added `avatar` field for profile pictures
   - Added `authProvider` field ('local' or 'google')
   - Made password optional for Google OAuth users
   - Made terms agreement automatic for OAuth users

2. **Google Auth Controller** (`backend/controllers/googleAuthController.js`)
   - `POST /api/auth/google` - Handle Google authentication
   - Automatic user creation or login
   - Account linking for existing users

### Frontend Changes
1. **Login Page** (`frontend/src/pages/LoginPage.jsx`)
   - Added "Continue with Google" button
   - Handles Google OAuth redirect

2. **Signup Page** (`frontend/src/pages/SignupPage.jsx`)
   - Added "Continue with Google" button
   - Handles Google OAuth redirect

3. **Google Callback Handler** (`frontend/src/pages/GoogleCallback.jsx`)
   - Processes Google OAuth callback
   - Exchanges authorization code for user info
   - Redirects to appropriate page based on role

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Bookify" (or your preferred name)
4. Click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in application name: "Bookify"
   - Add your email address
   - Add authorized domains (for production)
   - Click "Save and Continue"
   - Skip scopes for now (or add email, profile, openid)
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: "Web application"
   - Name: "Bookify Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Add your production URL when ready
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/google/callback`
     - Add production callback URL when ready
   - Click "Create"

5. **Important**: Copy your Client ID and Client Secret

### Step 4: Configure Environment Variables

#### Frontend Configuration

1. Create `.env` file in the `frontend` directory:
```bash
cd frontend
cp .env.example .env
```

2. Add your Google credentials to `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
VITE_API_URL=http://localhost:5001
```

**Important**: Never commit `.env` files to Git! They're already in `.gitignore`.

### Step 5: Test the Integration

1. Start your backend server:
```bash
cd backend
npm start
```

2. Start your frontend server:
```bash
cd frontend
npm run dev
```

3. Open `http://localhost:5173/login`

4. Click "Continue with Google"

5. You should be redirected to Google's login page

6. After authentication, you'll be redirected back to your app

## How It Works

### Authentication Flow

1. **User Clicks "Continue with Google"**
   - Redirects to Google OAuth consent screen
   - URL: `https://accounts.google.com/o/oauth2/v2/auth`

2. **User Authorizes**
   - Google redirects to: `/auth/google/callback?code=AUTHORIZATION_CODE`

3. **Frontend Callback Handler**
   - Exchanges authorization code for access token with Google
   - Fetches user profile from Google
   - Sends user data to backend: `POST /api/auth/google`

4. **Backend Processing**
   - Checks if user exists by `googleId`
   - If not, checks by `email` (to link accounts)
   - Creates new user or updates existing user
   - Returns JWT token

5. **Frontend Completion**
   - Stores token and user data in localStorage
   - Redirects to catalog (user) or admin dashboard (admin)

### Account Linking

If a user:
1. Signs up with email/password
2. Later tries to log in with Google using the same email

The system will:
- Link the Google account to the existing user account
- Update the user's `authProvider` to 'google'
- Add the `googleId` to their profile
- Allow them to log in either way in the future

## API Endpoints

### Google Authentication
```
POST /api/auth/google
Body: {
  googleId: string,
  email: string,
  fullName: string,
  avatar: string
}
Response: {
  success: true,
  message: "Google authentication successful",
  token: "JWT_TOKEN",
  user: { ... }
}
```

## Security Notes

1. **Client Secret Protection**
   - In production, move token exchange to backend
   - Never expose client secret in frontend code
   - Consider using backend proxy for OAuth flow

2. **HTTPS Required**
   - Google OAuth requires HTTPS in production
   - Localhost HTTP is allowed for development

3. **Token Storage**
   - Tokens are stored in localStorage
   - Consider using httpOnly cookies for better security

4. **CORS Configuration**
   - Ensure your backend allows requests from your frontend domain
   - Currently configured to allow all origins (for development)

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that the redirect URI in your code matches exactly what's in Google Console
- Include the protocol (http://)
- No trailing slashes

### "Invalid Client" Error
- Verify your Client ID and Secret are correct
- Check that they're properly set in `.env`
- Restart your frontend server after changing `.env`

### User Not Redirected After Google Login
- Check browser console for errors
- Verify backend is running on port 5001
- Check network tab for failed API calls

### "Access Blocked" Error
- Add the email you're testing with to "Test Users" in Google Console
- Or publish your OAuth consent screen (for production)

## Production Deployment

Before deploying to production:

1. Update redirect URIs in Google Console
2. Add production domain to authorized origins
3. Update `VITE_API_URL` in frontend `.env`
4. Move token exchange to backend for security
5. Enable HTTPS
6. Consider using refresh tokens
7. Publish OAuth consent screen

## Future Enhancements

Consider implementing:
- [ ] Refresh token support
- [ ] One-tap sign-in with Google
- [ ] Remember device functionality
- [ ] Sign in with Google button customization
- [ ] Backend-only OAuth flow (more secure)
- [ ] Social login with other providers (Facebook, GitHub, etc.)

## Testing Users

You can create test accounts in two ways:

1. **Email/Password**: Use the signup form
2. **Google OAuth**: Click "Continue with Google" (must be added as test user in Google Console)

## Support

For issues or questions:
- Check Google OAuth 2.0 documentation
- Review browser console and network logs
- Verify environment variables are set correctly
- Ensure backend is running and accessible

---

**Last Updated**: January 5, 2026
**Version**: 1.0

