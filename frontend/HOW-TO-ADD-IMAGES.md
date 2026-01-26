# How to Add Images to Your Bookify Landing Page

## 📁 Image Folder Structure

I've created the following folders for your images:

```
frontend/
├── public/
│   └── images/
│       ├── hero/           ← Hero and welcome section images
│       │   ├── hero-reading.jpg       (Boy reading book - main hero)
│       │   └── welcome-books.jpg      (Books stack - welcome section)
│       └── books/          ← Book cover images
│           ├── it-ends-with-us.jpg
│           ├── great-gatsby.jpg
│           ├── fault-in-our-stars.jpg
│           └── harry-potter.jpg
```

## 🎯 Where to Place Your Images

### Step 1: Find Your Images
Download or prepare the following images:

1. **Hero Section Image** (1200x800px recommended)
   - A photo of someone reading a book
   - Save as: `/public/images/hero/hero-reading.jpg`

2. **Welcome Section Image** (600x600px recommended)
   - A photo of stacked books or a cozy reading corner
   - Save as: `/public/images/hero/welcome-books.jpg`

3. **Book Covers** (400x600px recommended, 2:3 ratio)
   - It Ends With Us cover → `/public/images/books/it-ends-with-us.jpg`
   - The Great Gatsby cover → `/public/images/books/great-gatsby.jpg`
   - The Fault In Our Stars cover → `/public/images/books/fault-in-our-stars.jpg`
   - Harry Potter cover → `/public/images/books/harry-potter.jpg`

### Step 2: Copy Images to Folders

**Using File Explorer/Finder:**
1. Navigate to: `frontend/public/images/`
2. Open the `hero/` folder and paste your hero images
3. Open the `books/` folder and paste your book cover images

**Using Terminal:**
```bash
# From your project root
cp path/to/your/hero-image.jpg frontend/public/images/hero/hero-reading.jpg
cp path/to/your/books-image.jpg frontend/public/images/hero/welcome-books.jpg
cp path/to/book1.jpg frontend/public/images/books/it-ends-with-us.jpg
# ... and so on
```

## 🎨 Supported Image Formats

- `.jpg` / `.jpeg` (recommended for photos)
- `.png` (recommended for logos with transparency)
- `.webp` (modern format, best compression)
- `.svg` (for icons and logos)

## ⚙️ How It Works

The landing page is already configured to:
- ✅ Try to load images from the paths above
- ✅ Show colored placeholder backgrounds if images don't exist yet
- ✅ Automatically handle errors gracefully
- ✅ Maintain proper aspect ratios

## 🔍 Where to Find Free Book Cover Images

1. **Google Books API** - https://books.google.com/
2. **Open Library** - https://openlibrary.org/
3. **Goodreads** (for reference)
4. **Amazon** (for reference)

> **Note:** Make sure you have the right to use any images you download!

## 🖼️ Where to Find Free Stock Photos

For hero and welcome section images:
- **Unsplash** - https://unsplash.com/s/photos/reading-book
- **Pexels** - https://pexels.com/search/books/
- **Pixabay** - https://pixabay.com/images/search/reading/

## 🚀 After Adding Images

1. Save your images to the correct folders
2. Refresh your browser (Ctrl+R or Cmd+R)
3. Images should appear automatically!

## 🎯 Current Status

The landing page will show:
- **If image exists:** Your actual image
- **If image missing:** Nice colored placeholder background

So you can add images one by one, and the page will work perfectly either way!

## 💡 Tips

1. **Optimize images** - Compress them before adding to reduce load times
2. **Use consistent naming** - Follow the naming convention above
3. **Keep aspect ratios** - Book covers should be 2:3 ratio
4. **Test responsiveness** - Check images on mobile and desktop

---

Need help? The images are automatically configured in:
- `src/pages/landingpage.jsx`

