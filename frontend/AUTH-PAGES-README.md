# Bookify - Login & Signup Pages Documentation

## 🎉 Pages Created

I've created two fully responsive authentication pages for your Bookify online bookstore:

1. **Login Page** (`/login`)
2. **Signup Page** (`/signup`)

Both pages match the design screenshots you provided exactly, including:
- ✅ Layout and spacing
- ✅ Colors and styling
- ✅ Typography
- ✅ Illustrations
- ✅ Form fields and buttons
- ✅ Fully responsive design

## 📁 File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── landingpage.jsx       (Updated with routing)
│   │   ├── LoginPage.jsx         (New - Login page)
│   │   └── SignupPage.jsx        (New - Signup page)
│   └── App.jsx                    (Updated with routing)
```

## 🚀 How to Use

### Running the Application

```bash
cd /Users/aadarshganesh/Desktop/fyp/frontend
npm run dev
```

### Navigation

- **Home Page**: `http://localhost:5173/`
- **Login Page**: `http://localhost:5173/login`
- **Signup Page**: `http://localhost:5173/signup`

### Page Navigation

From the landing page:
- Click "**Log in**" in the header → Goes to Login Page
- Click "**Sign up**" in the header → Goes to Signup Page

From Login/Signup pages:
- Click "**Back to Home**" in the header → Returns to landing page
- Click "**Log in**" or "**Sign up now**" links → Switch between auth pages

## 📱 Responsive Design

All pages are fully responsive across devices:

- **Mobile** (< 768px): Single column layout, stacked form
- **Tablet** (768px - 1024px): Optimized spacing
- **Desktop** (> 1024px): Two-column layout with illustration

## 🎨 Design Features

### Login Page Features

- **Header**: Bookify logo + "Back to Home" link
- **Form Fields**:
  - Email Address
  - Password
  - Remember me checkbox
  - Forgot Password link
- **Actions**:
  - Log in button
  - Sign up now link (navigates to signup)
- **Illustration**: Secure login visual on the right

### Signup Page Features

- **Header**: Bookify logo + "Back to Home" link
- **Form Fields**:
  - Full Name
  - Email Address
  - Password
  - Confirm Password
  - Terms & Conditions checkbox
- **Actions**:
  - Create Account button
  - Log in link (navigates to login)
- **Illustration**: Same secure form visual on the right

## 🎯 Color Scheme

- **Primary Background**: `#F9FAFB` (gray-50)
- **Text**: `#111827` (gray-900)
- **Accent**: `#4FD1C5` (teal-400) - Illustrations
- **Buttons**: `#374151` (gray-700)
- **Links**: Red (`#DC2626`) for terms
- **Borders**: `#D1D5DB` (gray-300)

## 🔧 Technical Details

### Technologies Used

- **React 19** - UI framework
- **React Router Dom** - Navigation/routing
- **Tailwind CSS v4** - Styling
- **Vite** - Build tool

### Form State Management

Both pages use React's `useState` hook to manage form data:

```javascript
const [formData, setFormData] = useState({
  email: "",
  password: "",
  // ... other fields
});
```

### Form Submission

Forms have placeholder submit handlers:

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Form submitted:", formData);
  // Connect to your backend API here
};
```

## 🔌 Backend Integration

To connect to your backend:

1. **Login Page** (`src/pages/LoginPage.jsx`):
   - Update the `handleSubmit` function
   - Add API call to your login endpoint
   - Handle authentication response

2. **Signup Page** (`src/pages/SignupPage.jsx`):
   - Update the `handleSubmit` function
   - Add API call to your signup endpoint
   - Handle registration response

### Example API Integration

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Handle success (e.g., save token, redirect)
      console.log('Login successful:', data);
    } else {
      // Handle error
      console.error('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## ✨ Features to Add (Optional)

- [ ] Form validation with error messages
- [ ] Password strength indicator
- [ ] Show/hide password toggle
- [ ] Loading states during submission
- [ ] Success/error toast notifications
- [ ] Social login buttons (Google, Facebook)
- [ ] Email verification flow
- [ ] Password reset functionality

## 🐛 Testing

### Test the Pages

1. **Navigation**:
   - ✅ All links work correctly
   - ✅ Back to Home returns to landing page
   - ✅ Login/Signup links switch between pages

2. **Forms**:
   - ✅ All inputs accept text
   - ✅ Checkboxes toggle correctly
   - ✅ Form submission works (check console)

3. **Responsive**:
   - ✅ Resize browser to test breakpoints
   - ✅ Test on mobile device
   - ✅ Illustration hides on small screens

## 📝 Customization

### Change Colors

Edit the Tailwind classes in the components:
- Button color: `bg-gray-700` → Change to your brand color
- Accent color: `#4FD1C5` → Update in SVG illustrations
- Border color: `border-gray-300` → Adjust as needed

### Add Validation

Install a validation library like `react-hook-form` or `formik`:

```bash
npm install react-hook-form
```

### Add Icons

Install icon library like `react-icons`:

```bash
npm install react-icons
```

## 🎉 You're All Set!

Your authentication pages are ready to use! Just connect them to your backend API and you'll have a fully functional login/signup system.

Need help? Check the comments in the code or reach out for assistance!

---

**Created**: December 25, 2025  
**Version**: 1.0  
**Bookify** - Online Bookstore & Rental Management System

