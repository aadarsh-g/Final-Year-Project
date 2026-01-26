# 🎨 Illustration Update Guide - Login & Signup Pages

## ✅ Changes Made

I've updated both the **Login** and **Signup** pages to use actual image files instead of inline SVG placeholders!

## 📁 Where to Add Your Illustrations

Place your illustration images in this folder:

```
frontend/public/images/auth/
├── login-illustration.png      ← Login page illustration
└── signup-illustration.png     ← Signup page illustration
```

### Full Path:
```
/Users/aadarshganesh/Desktop/fyp/frontend/public/images/auth/
```

## 🖼️ Image Requirements

### Login Page Illustration
- **Path**: `/images/auth/login-illustration.png`
- **Size**: 600x500px recommended (or larger)
- **Format**: PNG, JPG, SVG, or WebP
- **Content**: Person with secure login interface (browser, lock icon, form fields)
- **Style**: Clean, modern, with teal/turquoise accents

### Signup Page Illustration  
- **Path**: `/images/auth/signup-illustration.png`
- **Size**: 600x500px recommended (or larger)
- **Format**: PNG, JPG, SVG, or WebP
- **Content**: Person with secure signup interface (browser, lock icon, form fields)
- **Style**: Clean, modern, with teal/turquoise accents

## 🎯 What Happens Now

### If Images Exist:
✅ Pages will display your custom illustrations  
✅ Images will have a nice drop shadow  
✅ Teal circular background will show behind

### If Images Don't Exist Yet:
✅ Pages will display a fallback SVG illustration  
✅ Everything still looks good  
✅ No broken images or errors

## 🌐 Where to Get Illustrations

### Free Illustration Resources:

1. **Undraw** (Best Match!)
   - https://undraw.co/illustrations
   - Search: "login", "security", "authentication"
   - Customizable colors (use teal: #4FD1C5)

2. **Storyset by Freepik**
   - https://storyset.com/
   - Search: "login", "password", "secure"
   - Multiple styles available

3. **DrawKit**
   - https://www.drawkit.com/
   - Search: "authentication"

4. **Humaaans**
   - https://www.humaaans.com/
   - Mix and match characters

5. **Icons8 Illustrations**
   - https://icons8.com/illustrations
   - Search: "login form"

## 💡 Pro Tips

1. **Use the same image for both pages** if you prefer simplicity
2. **Compress images** before adding (use TinyPNG.com)
3. **PNG format** recommended for best quality with transparency
4. **Max file size**: Keep under 500KB for fast loading

## 🚀 How to Add Images

### Option 1: Using Finder (Mac)
1. Open Finder
2. Navigate to: `Desktop/fyp/frontend/public/images/auth/`
3. Drag and drop your images
4. Rename to `login-illustration.png` and `signup-illustration.png`
5. Refresh your browser!

### Option 2: Using Terminal
```bash
# From your Desktop
cd /Users/aadarshganesh/Desktop/fyp/frontend/public/images/auth/

# Copy your image (example)
cp ~/Downloads/my-login-image.png login-illustration.png
cp ~/Downloads/my-signup-image.png signup-illustration.png
```

### Option 3: Download from Undraw
1. Visit: https://undraw.co/search
2. Search: "login" or "authentication"
3. Choose a style you like
4. Change color to: `#4FD1C5` (teal)
5. Download as PNG
6. Place in `/public/images/auth/` folder

## 📝 File Naming Options

The pages will accept any of these formats:
- `login-illustration.png` (recommended)
- `login-illustration.jpg`
- `login-illustration.svg`
- `login-illustration.webp`

Same for signup:
- `signup-illustration.png` (recommended)
- `signup-illustration.jpg`
- `signup-illustration.svg`
- `signup-illustration.webp`

## ✨ Visual Style Guide

Your illustrations should have:
- **Colors**: Teal (#4FD1C5), Gray, White, Black
- **Elements**: Person, Browser window, Lock icon, Form fields
- **Style**: Modern, minimal, flat design
- **Mood**: Professional, secure, friendly

## 🎨 Example Search Terms

When looking for illustrations, try:
- "secure login illustration"
- "authentication graphic"
- "password security illustration"
- "user registration illustration"
- "online security illustration"
- "web form illustration"

## 🔄 Testing Your Changes

1. Add your images to `/public/images/auth/`
2. Make sure they're named correctly
3. Refresh your browser (Ctrl+R or Cmd+R)
4. Visit:
   - `http://localhost:5173/login`
   - `http://localhost:5173/signup`
5. Your illustrations should appear!

## 📱 Responsive Behavior

- **Desktop (> 1024px)**: Illustrations visible on the right
- **Tablet/Mobile (< 1024px)**: Illustrations hidden, form takes full width

## ✅ Current Status

- ✅ Folder created: `/public/images/auth/`
- ✅ Both pages updated to use images
- ✅ Fallback SVG in place
- ⏳ Waiting for your illustration images

---

**Need Help?** Just add your images to the auth folder and they'll automatically appear on your pages! 🎉

