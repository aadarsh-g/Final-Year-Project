# 📚 Admin Book Management System - Complete Setup Guide

## ✅ What Has Been Created

### Backend Components:

1. **Book Model** (`backend/models/Book.js`)
   - Complete schema with all fields
   - Validation rules
   - Indexes for performance
   - Virtual fields for stock status

2. **Book Controller** (`backend/controllers/bookController.js`)
   - `getAllBooks` - Get books with filters, search, pagination
   - `getBookById` - Get single book details
   - `createBook` - Add new book (Admin only)
   - `updateBook` - Edit book details (Admin only)
   - `deleteBook` - Delete book (Admin only)
   - `updateBookStock` - Manage stock quantities (Admin only)
   - `toggleBookActive` - Enable/disable books (Admin only)
   - `getBookStats` - Get statistics for dashboard (Admin only)

3. **Book Routes** (`backend/routes/bookRoutes.js`)
   - Public routes: GET /api/books, GET /api/books/:id
   - Admin routes: POST, PUT, DELETE, PATCH (protected)

4. **Integration** (`backend/index.js`)
   - Book routes integrated into main app
   - Running on port **5001**

### Frontend Components:

5. **Admin Book Management Page** (`frontend/src/pages/AdminBookManagement.jsx`)
   - Full CRUD interface
   - Search and filter functionality
   - Modal for add/edit operations
   - Responsive table view
   - Stock management
   - Active/inactive toggle

6. **Admin Dashboard Updated** (`frontend/src/pages/AdminDashboard.jsx`)
   - Added "Manage Books" link in sidebar
   - Quick access to book management

7. **App Routing** (`frontend/src/App.jsx`)
   - Route added: `/admin/books`

---

## 🚀 How to Use

### Step 1: Restart Backend (IMPORTANT!)
The backend needs to restart to load the new book routes:

```bash
# In your backend terminal, press Ctrl+C to stop, then:
cd /Users/aadarshganesh/Desktop/fyp/backend
npm run dev
```

**Wait for:**
```
🚀 Server running on http://localhost:5001
✅ MongoDB Connected
```

### Step 2: Login as Admin
1. Go to `http://localhost:5173/login`
2. Login with admin credentials:
   - Email: `admin@bookify.com`
   - Password: `admin123`

### Step 3: Access Book Management
After login, you'll be redirected to `/admin`

Click **"Manage Books"** in the sidebar OR go directly to:
```
http://localhost:5173/admin/books
```

---

## 📖 Features Overview

### 1. Add New Book
- Click **"Add New Book"** button (top right)
- Fill in the form:
  - **Required fields:**
    - Title
    - Author
    - Description
    - Category
    - Language
    - Purchase Price
    - Rental Price/Day
    - Total Stock
    - Available Stock
  - **Optional fields:**
    - ISBN
    - Cover Image URL
    - Publisher
    - Pages
    - Published Date
- Click **"Add Book"**

### 2. Edit Book
- Click **"Edit"** on any book row
- Modify fields
- Click **"Update Book"**

### 3. Delete Book
- Click **"Delete"** on any book row
- Confirm deletion
- **Note:** Books with active rentals cannot be deleted

### 4. Toggle Active/Inactive
- Click **"Activate"** or **"Deactivate"**
- Inactive books won't show in customer catalog

### 5. Search & Filter
- **Search:** Type in search box (searches title, author, description)
- **Category Filter:** Select category from dropdown
- **Status Filter:** Filter by Active/Inactive

### 6. View Stock Status
Each book shows:
- Available / Total stock
- Stock status (In Stock, Low Stock, Out of Stock)
- Color-coded for quick identification

---

## 🗂️ Database Schema

### Book Fields:

```javascript
{
  // Basic Info
  title: String (required, max 200 chars)
  author: String (required)
  isbn: String (unique, optional)
  description: String (required, max 2000 chars)
  coverImage: String (URL, default placeholder)
  
  // Classification
  category: Enum (16 options)
  genre: [String]
  language: String (required, default "English")
  
  // Publishing Info
  publisher: String
  publishedDate: Date
  pages: Number (min 1)
  
  // Pricing
  price: {
    purchase: Number (required, min 0)
    rental: {
      perDay: Number (required, min 0)
    }
  }
  
  // Stock Management
  stock: {
    total: Number (required, min 0)
    available: Number (required, min 0)
    rented: Number (default 0)
  }
  
  // Ratings
  rating: {
    average: Number (0-5, default 0)
    count: Number (default 0)
  }
  
  // Status
  isActive: Boolean (default true)
  isFeatured: Boolean (default false)
  
  // Meta
  tags: [String]
  addedBy: ObjectId (User reference)
  lastUpdatedBy: ObjectId (User reference)
  
  // Timestamps
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

---

## 🔌 API Endpoints

### Public Endpoints:
```
GET /api/books
Query params: search, category, language, minPrice, maxPrice, isActive, sortBy, order, page, limit

GET /api/books/:id
```

### Admin Endpoints (require JWT token):
```
POST /api/books
Body: book data

PUT /api/books/:id
Body: updated book data

DELETE /api/books/:id

PATCH /api/books/:id/stock
Body: { total, available }

PATCH /api/books/:id/toggle-active

GET /api/books/admin/stats
```

---

## 🧪 Testing the System

### Test 1: Add a Book
1. Go to `/admin/books`
2. Click "Add New Book"
3. Fill in:
   ```
   Title: The Great Gatsby
   Author: F. Scott Fitzgerald
   Description: A classic American novel...
   Category: Fiction
   Language: English
   Purchase Price: 15.99
   Rental Price/Day: 2.99
   Total Stock: 10
   Available Stock: 10
   ```
4. Click "Add Book"
5. ✅ Should see success message and book in table

### Test 2: Edit a Book
1. Click "Edit" on the book you just added
2. Change Purchase Price to `12.99`
3. Click "Update Book"
4. ✅ Should see updated price in table

### Test 3: Update Stock
1. Click "Edit" on any book
2. Change Available Stock to `5`
3. Click "Update Book"
4. ✅ Should see "Low Stock" status

### Test 4: Toggle Active Status
1. Click "Deactivate" on any book
2. ✅ Status badge should change to red "Inactive"
3. Click "Activate"
4. ✅ Status badge should change to green "Active"

### Test 5: Delete a Book
1. Click "Delete" on a book
2. Confirm deletion
3. ✅ Book should disappear from list

### Test 6: Search & Filter
1. Type book title in search box
2. ✅ Should filter results
3. Select a category from dropdown
4. ✅ Should show only books in that category

---

## 📊 Book Categories

The system supports 16 categories:
- Fiction
- Non-Fiction
- Mystery
- Thriller
- Romance
- Science Fiction
- Fantasy
- Biography
- History
- Self-Help
- Business
- Technology
- Children
- Young Adult
- Poetry
- Other

---

## 🎨 UI Features

### Table View:
- Book cover thumbnail
- Title & Author
- Category badge
- Price display
- Stock status with color coding
- Active/Inactive status badge
- Quick action buttons

### Modal Form:
- Clean, organized fields
- Validation
- Scrollable for mobile
- Cancel/Submit buttons
- Dynamic title (Add/Edit)

### Filters:
- Real-time search
- Category dropdown
- Status filter
- Responsive layout

---

## 🔒 Security

- All admin routes protected by JWT authentication
- Role-based access (only admins can manage books)
- Input validation on backend
- ISBN uniqueness check
- Stock validation (available ≤ total)
- Cannot delete books with active rentals

---

## 🐛 Troubleshooting

### "Network Error" when adding/editing books
**Solution:** Make sure backend is running on port 5001
```bash
cd backend
npm run dev
```

### "401 Unauthorized"
**Solution:** Login as admin first. Token expires after 7 days.

### "Book not appearing in table"
**Solution:** Check filters - it might be filtered out by category/status

### "Cannot delete book"
**Solution:** Book has active rentals. Wait for returns or mark as inactive instead.

---

## 📝 Sample Book Data for Testing

```json
{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "isbn": "978-0-06-112008-4",
  "description": "A gripping tale of racial injustice and childhood innocence in the Deep South.",
  "coverImage": "https://covers.openlibrary.org/b/id/8228691-L.jpg",
  "category": "Fiction",
  "language": "English",
  "publisher": "J. B. Lippincott & Co.",
  "pages": 324,
  "price": {
    "purchase": 18.99,
    "rental": {
      "perDay": 3.99
    }
  },
  "stock": {
    "total": 15,
    "available": 15
  }
}
```

---

## 🎉 Success!

Your Admin Book Management System is now complete and functional!

**Features included:**
- ✅ Add new books
- ✅ Edit existing books
- ✅ Delete books
- ✅ View all books
- ✅ Manage stock
- ✅ Update prices
- ✅ Cover images (URL-based)
- ✅ Categorize books
- ✅ Enable/disable books
- ✅ Search functionality
- ✅ Filter by category & status
- ✅ Responsive design
- ✅ Database storage

**Next Steps:**
1. Restart backend
2. Login as admin
3. Go to `/admin/books`
4. Start managing books!

Happy book managing! 📚🎉

