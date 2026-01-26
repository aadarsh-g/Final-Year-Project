# 🔑 How to Get Admin Access

## ❌ The Error:
```
User role 'user' is not authorized to access this route
```

This means you're logged in as a **regular user**, but book management requires **admin role**.

---

## ✅ Solution: Make Your Account Admin

### Option 1: Convert Existing User to Admin (Recommended)

**Step 1: Check what email you used**
- What email did you signup with? (e.g., `test@example.com`)

**Step 2: Run the conversion script**

Open a **NEW terminal** (keep backend running in the other one):

```bash
cd /Users/aadarshganesh/Desktop/fyp/backend
node makeAdmin.js YOUR_EMAIL_HERE
```

**Example:**
```bash
node makeAdmin.js test@example.com
```

**You'll see:**
```
✅ Connected to MongoDB
✅ User updated to admin successfully!
📧 Email: test@example.com
🔑 Role: admin
```

**Step 3: Logout and Login Again**
1. Go to your browser
2. **Logout** (or clear localStorage: F12 → Console → `localStorage.clear()` → Enter)
3. Login again with the same email/password
4. You'll now be redirected to `/admin` 
5. Click "Manage Books" - it will work! ✅

---

### Option 2: Create New Admin Account

If you want a dedicated admin account:

**Step 1: Signup a new account first**
1. Go to `http://localhost:5173/signup`
2. Create account:
   - Name: `Admin User`
   - Email: `admin@bookify.com`
   - Password: `admin123`
   - Confirm password: `admin123`
   - ✓ Agree to terms
3. Click "Create Account"

**Step 2: Convert to admin**
```bash
cd /Users/aadarshganesh/Desktop/fyp/backend
node makeAdmin.js admin@bookify.com
```

**Step 3: Logout and login with new admin account**
- Email: `admin@bookify.com`
- Password: `admin123`

---

## 🎯 Quick Fix (Right Now):

Run this in a new terminal:
```bash
cd /Users/aadarshganesh/Desktop/fyp/backend
node makeAdmin.js YOUR_EMAIL_HERE
```

Replace `YOUR_EMAIL_HERE` with the email you used to signup.

Then:
1. Logout from browser
2. Login again
3. Go to `/admin/books`
4. Try adding a book again!

---

## 🔍 How to Check If You're Admin:

In browser console (F12):
```javascript
localStorage.getItem('user')
```

You should see:
```json
{
  "role": "admin",  ← Should be "admin" not "user"
  "email": "your@email.com"
}
```

---

## 💡 Why This Happens:

- When you signup normally, you get `role: "user"`
- Only `role: "admin"` can access book management
- The `makeAdmin.js` script changes your role in the database
- After login, your new role is stored in the JWT token

---

**TL;DR:** Run `node makeAdmin.js your@email.com` in backend folder, then logout and login again!

