# Fix: "Error 401: invalid_client" - Google OAuth

## Problem
You're seeing: **"The OAuth client was not found. Error 401: invalid_client"**

## Cause
The `frontend/.env` file doesn't exist yet, so the app is using the placeholder value `"YOUR_GOOGLE_CLIENT_ID"` instead of a real Google Client ID.

## Solution: 2 Options

---

## OPTION 1: Quick Test WITHOUT Google (Recommended for Now)

If you want to test your app without setting up Google OAuth right now:

### Just use the regular email/password login!
- Google OAuth is **optional**
- Your regular email/password login/signup still works perfectly
- You can set up Google OAuth later when needed

**To test now:**
1. Go to: http://localhost:5173/signup
2. Use the regular signup form (don't click Google button)
3. Create an account with email/password
4. Login works normally!

---

## OPTION 2: Setup Google OAuth (Takes 10 minutes)

If you want to enable Google login now, follow these steps:

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Bookify" (or anything)
4. Click "Create"
5. Wait for project to be created

### Step 2: Configure OAuth Consent Screen

1. In left sidebar: "APIs & Services" → "OAuth consent screen"
2. Choose: **"External"**
3. Click "Create"
4. Fill in required fields:
   - App name: **Bookify**
   - User support email: **your-email@gmail.com**
   - Developer contact: **your-email@gmail.com**
5. Click "Save and Continue"
6. Skip "Scopes" → Click "Save and Continue"
7. Add Test Users:
   - Click "Add Users"
   - Enter your Gmail: **your-test-email@gmail.com**
   - Click "Add"
8. Click "Save and Continue"
9. Click "Back to Dashboard"

### Step 3: Create OAuth Client ID

1. In left sidebar: "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: **Bookify Web Client**
5. Authorized JavaScript origins:
   - Click "Add URI"
   - Enter: `http://localhost:5173`
6. Authorized redirect URIs:
   - Click "Add URI"
   - Enter: `http://localhost:5173/auth/google/callback`
7. Click "Create"
8. **IMPORTANT**: A popup appears with your credentials

### Step 4: Copy Your Credentials

From the popup, copy:
- **Client ID**: Something like `123456789-abc...xyz.apps.googleusercontent.com`
- **Client Secret**: Something like `GOCSPX-abc123...xyz`

### Step 5: Create .env File

Open your terminal and run:

```bash
cd /Users/aadarshganesh/Desktop/fyp/frontend
nano .env
```

Or create the file manually in VS Code/Cursor.

### Step 6: Add Your Credentials

Paste this into `frontend/.env` (replace with YOUR actual values):

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret_here
VITE_API_URL=http://localhost:5001
```

**Replace:**
- `123456789-abcdefghijklmnop.apps.googleusercontent.com` with your actual Client ID
- `GOCSPX-your_actual_secret_here` with your actual Client Secret

### Step 7: Save and Restart

1. Save the `.env` file
2. Stop your frontend server (Ctrl+C)
3. Start it again:
   ```bash
   npm run dev
   ```

### Step 8: Test It!

1. Go to: http://localhost:5173/login
2. Click "Continue with Google"
3. Should work now! ✅

---

## Troubleshooting

### Still getting "invalid_client"?

**Check 1: Is .env file in the right place?**
```bash
cd /Users/aadarshganesh/Desktop/fyp/frontend
ls -la .env
```
Should show the file. If not, create it!

**Check 2: Did you restart the server?**
The frontend server MUST be restarted after creating/editing `.env` file.

**Check 3: Are the credentials correct?**
Open `.env` and verify:
- Client ID ends with `.apps.googleusercontent.com`
- Client Secret starts with `GOCSPX-`
- No spaces or quotes around the values
- No typos

**Check 4: Is the redirect URI correct in Google Console?**
Must be exactly: `http://localhost:5173/auth/google/callback`
- No trailing slash
- Port must be 5173 (your frontend port)

### "Access blocked: This app's request is invalid"?

You forgot to add yourself as a test user in Google Console.
1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Add your Gmail address
4. Save

### "redirect_uri_mismatch"?

The redirect URI in Google Console doesn't match.
1. Go to Credentials in Google Console
2. Click on your OAuth client
3. Under "Authorized redirect URIs", add:
   `http://localhost:5173/auth/google/callback`
4. Save

---

## What's in .env File?

The `.env` file should look like this:

```env
# These are EXAMPLES - use YOUR actual values!
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz456def789
VITE_API_URL=http://localhost:5001
```

**Important:**
- No quotes needed
- No spaces around `=`
- Keep this file secret (it's already in .gitignore)
- Never commit this to Git

---

## Quick Terminal Commands

**Create .env file:**
```bash
cd /Users/aadarshganesh/Desktop/fyp/frontend
touch .env
```

**Edit .env file (using nano):**
```bash
nano .env
```
Then paste your credentials, press Ctrl+X, Y, Enter to save.

**Or edit in VS Code:**
```bash
code .env
```

**Check if .env exists:**
```bash
ls -la /Users/aadarshganesh/Desktop/fyp/frontend/.env
```

**View .env contents (to verify):**
```bash
cat /Users/aadarshganesh/Desktop/fyp/frontend/.env
```

---

## My Recommendation

**For now:** Use Option 1 (regular email/password login)

**Later:** When you want to deploy or need Google login, follow Option 2

The regular login works great and you can add Google OAuth anytime! 🚀

