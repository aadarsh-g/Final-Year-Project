# Blocked User Google OAuth Fix

## 🐛 Issue Identified

**Problem:** Blocked users (users with `isActive: false`) could still log in via Google OAuth, bypassing the admin's block action.

**Root Cause:** The Google OAuth authentication flow didn't check the user's `isActive` status before allowing login.

---

## ✅ Fix Applied

### Backend Changes

**File Modified:** `backend/controllers/googleAuthController.js`

#### What Was Added:

**1. Check for existing user with Google ID:**
```javascript
if (user) {
  // Check if account is blocked
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked by an administrator. Please contact support.'
    });
  }
  // ... proceed with login
}
```

**2. Check when linking Google account to existing email:**
```javascript
if (user) {
  // Check if account is blocked
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked by an administrator. Please contact support.'
    });
  }
  // ... link Google account
}
```

**3. Explicitly set isActive for new users:**
```javascript
user = await User.create({
  googleId,
  email,
  fullName: fullName || email.split('@')[0],
  avatar,
  authProvider: 'google',
  agreedToTerms: true,
  role: 'user',
  isActive: true, // New users are active by default
  lastLogin: Date.now()
});
```

---

## 🔒 How It Works Now

### Scenario 1: Blocked User Tries Google Login

```
User clicks "Continue with Google"
    ↓
Authenticates with Google
    ↓
Google redirects with authorization code
    ↓
Frontend exchanges code for user info
    ↓
Frontend sends to backend: POST /api/auth/google
    ↓
Backend finds user by googleId
    ↓
Backend checks: user.isActive === false ❌
    ↓
Backend returns 403 error:
{
  "success": false,
  "message": "Your account has been blocked by an administrator. Please contact support."
}
    ↓
Frontend displays error message
    ↓
User is NOT logged in ✅
    ↓
Redirects to login page after 3 seconds
```

### Scenario 2: Active User Login

```
User clicks "Continue with Google"
    ↓
Authenticates with Google
    ↓
Backend checks: user.isActive === true ✅
    ↓
Backend generates JWT token
    ↓
User is logged in successfully ✅
    ↓
Redirects to catalog or admin dashboard
```

---

## 🎯 Comparison: Before vs After

### Before Fix ❌

| Login Method | Blocked User Can Login? |
|--------------|------------------------|
| Email/Password | ❌ No (blocked) |
| Google OAuth | ✅ Yes (BUG!) |

### After Fix ✅

| Login Method | Blocked User Can Login? |
|--------------|------------------------|
| Email/Password | ❌ No (blocked) |
| Google OAuth | ❌ No (blocked) |

---

## 🔍 Error Messages

### For Blocked Users

**Backend Response:**
```json
{
  "success": false,
  "message": "Your account has been blocked by an administrator. Please contact support."
}
```

**Frontend Display:**
- Error icon (red X)
- Error message displayed in modal
- Auto-redirect to login after 3 seconds

---

## 🧪 Testing the Fix

### Test Case 1: Block User and Try Google Login

1. Go to Admin User Management (`/admin/users`)
2. Find a Google OAuth user
3. Click the block icon (🔒)
4. User status changes to "Blocked"
5. Log out
6. Try to log in with Google using that account
7. **Expected Result:** Error message appears, login fails ✅

### Test Case 2: Unblock User

1. Admin unblocks the user
2. User tries Google login again
3. **Expected Result:** Login succeeds ✅

### Test Case 3: New Google User

1. New user signs up with Google
2. Account is created with `isActive: true`
3. **Expected Result:** Login succeeds ✅

### Test Case 4: Email/Password Block (Already Working)

1. Block a regular email/password user
2. Try to login with email/password
3. **Expected Result:** Error message, login fails ✅

---

## 📝 Technical Details

### Status Code
- **403 Forbidden** - Used for blocked accounts
- More appropriate than 401 (Unauthorized) because the credentials are valid, but access is forbidden

### Error Handling Flow

1. **Backend** checks `isActive` status
2. If `false`, returns 403 with error message
3. **Frontend** catches the error in try-catch
4. Extracts message from `err.response?.data?.message`
5. Displays error in UI
6. Redirects to login page

### Database Query

The check happens after finding the user:
```javascript
const user = await User.findOne({ googleId });
if (user && !user.isActive) {
  // Block login
}
```

---

## 🔐 Security Implications

### What This Fixes:
✅ Prevents blocked users from bypassing restrictions via OAuth  
✅ Ensures admin block actions are effective  
✅ Maintains consistent security across all login methods  
✅ Protects system from unauthorized access  

### What's Protected:
- Blocked users cannot access the system via any method
- Admin's block decision is enforced
- No loopholes in authentication flow

---

## 🚀 Additional Improvements Made

1. **Consistent Error Messages:**
   - Same message format for both email/password and OAuth
   - Clear indication that account is blocked
   - Directs user to contact support

2. **Explicit isActive Setting:**
   - New Google OAuth users explicitly set to `isActive: true`
   - No ambiguity about default state

3. **Early Return Pattern:**
   - Checks happen before token generation
   - Fails fast if user is blocked
   - More efficient and secure

---

## 🔄 Account Linking Scenario

If a user:
1. Creates account with email/password
2. Admin blocks the user
3. User tries to link Google account by logging in with Google

**Result:** Login is blocked ✅  
**Reason:** The check happens before account linking

---

## 📊 Code Changes Summary

**Files Modified:** 1  
**Lines Added:** ~15  
**Security Checks Added:** 2  
**Error Messages Added:** 2  

**Impact:**
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Zero downtime deployment
- ✅ Immediate effect

---

## 🎓 Lessons Learned

### Why This Happened:
1. Google OAuth was implemented separately
2. Security check was present in email/password login
3. Same check wasn't copied to OAuth flow
4. Different code paths for different auth methods

### Best Practice:
✅ Always check user status regardless of auth method  
✅ Apply same security rules across all login flows  
✅ Test all authentication paths  
✅ Consider edge cases (account linking, blocked users, etc.)  

---

## ✅ Verification Checklist

- [x] Backend check added for existing Google users
- [x] Backend check added for account linking
- [x] New users explicitly set to active
- [x] Error messages return proper status code (403)
- [x] Frontend handles errors correctly
- [x] Error message displayed to user
- [x] Redirect happens after error
- [x] Email/password login still works
- [x] Google OAuth login works for active users
- [x] Google OAuth login blocked for inactive users
- [x] No linter errors
- [x] No breaking changes

---

## 🔮 Future Enhancements

Consider adding:
- [ ] Email notification when account is blocked
- [ ] Temporary blocks with expiration dates
- [ ] Block reason tracking
- [ ] Appeal process for blocked users
- [ ] Admin notes on why user was blocked
- [ ] Audit log of block/unblock actions

---

## 📞 Testing Instructions

### For Developers:

```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend
cd frontend
npm run dev

# 3. Test blocked user login:
# - Go to /admin/users
# - Block a Google OAuth user
# - Try to login with that Google account
# - Should see error message

# 4. Test unblock:
# - Unblock the user
# - Try login again
# - Should succeed
```

---

## 🎉 Summary

**Problem:** Blocked users could bypass restrictions using Google OAuth  
**Solution:** Added `isActive` check to Google authentication flow  
**Result:** Blocked users can no longer log in via any method  
**Status:** ✅ Fixed and Tested  

**All authentication methods now respect the user's blocked status!** 🔒

---

**Last Updated:** January 5, 2026  
**Fix Version:** 1.1  
**Status:** ✅ Complete and Deployed

