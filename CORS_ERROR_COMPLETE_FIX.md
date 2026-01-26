# 🚨 CORS ERROR - COMPLETE FIX GUIDE

## ❌ The Problem

You're getting this error:
```
Access to XMLHttpRequest at 'http://localhost:5000/api/auth/signup' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

## 🔍 Root Cause

**The backend server is NOT running!** The CORS error appears because:
1. Frontend tries to connect to `http://localhost:5001`
2. Backend is not responding (server is down)
3. Browser shows CORS error instead of "connection refused"

## ✅ COMPLETE FIX (Follow These Steps)

### Step 1: Check if MongoDB is Running

Open Terminal and run:
```bash
pgrep -x mongod
```

**If you see a number:** MongoDB is running ✅
**If you see nothing:** MongoDB is NOT running ❌

### Step 2: Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Windows (as Administrator)
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Verify it started:**
```bash
brew services list
# Look for mongodb-community: started
```

### Step 3: Start the Backend Server

Open a **NEW TERMINAL** and run:

```bash
cd /Users/aadarshganesh/Desktop/fyp/backend
npm run dev
```

**You MUST see this output:**
```
✅ MongoDB Connected: localhost
📚 Database: bookify
🚀 Server running on http://localhost:5000
```

**If you see an error about MongoDB connection:**
- MongoDB is not running - go back to Step 2
- Wrong connection string in `.env` file

### Step 4: Test Backend is Working

In another terminal or browser:
```bash
curl http://localhost:5000
```

**Expected output:**
```json
{
  "success": true,
  "message": "🚀 Bookify Backend API is running!",
  "version": "1.0.0"
}
```

### Step 5: Keep Backend Running & Test Frontend

1. **Leave backend running** (don't close that terminal!)
2. Open browser: `http://localhost:5173/signup`
3. Fill the form and click "Create Account"
4. ✅ Should work now!

---

## 🎯 Quick Checklist

Before testing, ensure:
- [ ] MongoDB is running (`brew services list`)
- [ ] Backend terminal shows "Server running on http://localhost:5000"
- [ ] Backend terminal shows "MongoDB Connected"
- [ ] No red errors in backend terminal
- [ ] Frontend is running on port 5173
- [ ] Browser network tab shows request to localhost:5000

---

## 🔧 Alternative: Use Startup Script

I've created a script that does everything automatically:

```bash
cd /Users/aadarshganesh/Desktop/fyp/backend
chmod +x startup.sh
./startup.sh
```

This script will:
1. Check if MongoDB is running
2. Start MongoDB if needed
3. Install dependencies if needed
4. Create .env file if missing
5. Start the backend server

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
**Cause:** MongoDB is not running
**Fix:** `brew services start mongodb-community`

### "Port 5000 already in use"
**Cause:** Another process is using port 5000
**Fix:** 
```bash
lsof -ti:5000 | xargs kill -9
```

### "Cannot find module 'xyz'"
**Cause:** Missing dependencies
**Fix:**
```bash
cd backend
npm install
```

### Still getting CORS error after backend is running
**Cause:** Browser cached the error
**Fix:** 
1. Stop backend (Ctrl+C)
2. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Restart backend
4. Refresh page

---

## 📊 How to Verify Everything is Working

### Terminal 1: MongoDB
```bash
brew services list
# Should show: mongodb-community started
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
# Should show: 
# ✅ MongoDB Connected
# 🚀 Server running on http://localhost:5000
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
# Should show:
# Local: http://localhost:5173
```

### Browser Console (F12)
- No CORS errors
- Network tab shows successful requests (status 200 or 201)
- Signup/Login works

---

## 💡 Pro Tips

1. **Keep terminals visible** so you can see errors immediately
2. **Check backend terminal first** when something doesn't work
3. **MongoDB must start before backend**
4. **Don't close backend terminal** while testing frontend

---

## 🎉 Success Indicators

When everything is working:
- ✅ MongoDB: "successfully started"
- ✅ Backend: "MongoDB Connected" + "Server running"
- ✅ Frontend: Loads without errors
- ✅ Browser: No CORS errors in console
- ✅ Signup/Login: Works and redirects correctly

---

**The issue is NOT with your code - it's with the server not running!**

