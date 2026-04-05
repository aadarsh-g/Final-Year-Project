import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

function AdminBookManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    coverImage: "",
    category: "Fiction",
    genre: [],
    language: "English",
    publisher: "",
    publishedDate: "",
    pages: "",
    price: {
      purchase: "",
      rental: {
        perDay: ""
      }
    },
    stock: {
      total: "",
      available: ""
    },
    tags: []
  });

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Science Fiction",
    "Fantasy",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Technology",
    "Children",
    "Young Adult",
    "Poetry",
    "Other"
  ];

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/books", {
        params: {
          search: searchTerm || undefined,
          category: filterCategory || undefined,
          isActive: filterStatus || undefined
        }
      });
      console.log('Books response:', response.data);
      console.log('Number of books:', response.data.books?.length);
      setBooks(response.data.books || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      console.error("Error details:", error.response?.data);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterCategory, filterStatus]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const keys = name.split(".");
      setFormData(prev => {
        const updated = { ...prev };
        let current = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return updated;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post('http://localhost:5001/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Open add modal
  const handleAddBook = () => {
    setModalMode("add");
    setImageFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      author: "",
      isbn: "",
      description: "",
      coverImage: "",
      category: "Fiction",
      genre: [],
      language: "English",
      publisher: "",
      publishedDate: "",
      pages: "",
      price: {
        purchase: "",
        rental: { perDay: "" }
      },
      stock: {
        total: "",
        available: ""
      },
      tags: []
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleEditBook = (book) => {
    setModalMode("edit");
    setSelectedBook(book);
    setImageFile(null);
    setImagePreview(book.coverImage || "");
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      description: book.description,
      coverImage: book.coverImage,
      category: book.category,
      genre: book.genre || [],
      language: book.language,
      publisher: book.publisher || "",
      publishedDate: book.publishedDate ? book.publishedDate.split('T')[0] : "",
      pages: book.pages || "",
      price: {
        purchase: book.price.purchase,
        rental: { perDay: book.price.rental.perDay }
      },
      stock: {
        total: book.stock.total,
        available: book.stock.available
      },
      tags: book.tags || []
    });
    setShowModal(true);
  };

  // Submit form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Upload image if new file is selected
      let imageUrl = formData.coverImage;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      const dataToSubmit = {
        ...formData,
        coverImage: imageUrl
      };

      if (modalMode === "add") {
        await axios.post("http://localhost:5001/api/books", dataToSubmit);
        alert("Book added successfully!");
      } else {
        await axios.put(`http://localhost:5001/api/books/${selectedBook._id}`, dataToSubmit);
        alert("Book updated successfully!");
      }
      
      setShowModal(false);
      setImageFile(null);
      setImagePreview("");
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      alert(error.response?.data?.message || "Failed to save book");
    }
  };

  // Delete book
  const handleDeleteBook = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    
    try {
      await axios.delete(`http://localhost:5001/api/books/${id}`);
      alert("Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  // Toggle active status
  const handleToggleActive = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/books/${id}/toggle-active`, {});
      fetchBooks();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to update book status");
    }
  };

  return (
    <AdminLayout 
      title="Book Management" 
      subtitle="Manage your bookstore inventory"
    >
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAddBook}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filters */}
      <div>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No books found. Add your first book!
                      </td>
                    </tr>
                  ) : (
                    books.map((book) => (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={book.coverImage}
                              alt={book.title}
                              className="h-16 w-12 object-cover rounded"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs. {book.price.purchase}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{book.stock.available} / {book.stock.total}</div>
                          <div className={`text-xs ${book.stock.available === 0 ? 'text-red-600' : book.stock.available <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {book.stockStatus}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {book.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditBook(book)}
                            className="text-teal-600 hover:text-teal-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(book._id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {book.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === "add" ? "Add New Book" : "Edit Book"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image *</label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-40 w-auto object-cover rounded border shadow-sm"
                    />
                  </div>
                )}
                
                {/* File Input */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an image (JPG, PNG, WEBP, GIF - Max 5MB)
                </p>
              </div>

              {/* Category & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language *</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Publisher & Pages */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Published Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
                <input
                  type="date"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price.purchase"
                    value={formData.price.purchase}
                    onChange={handleInputChange}
                    required
                    min="1000"
                    step="1"
                    placeholder="Min. Rs. 1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rental Price/Day (Rs.) *</label>
                  <input
                    type="number"
                    name="price.rental.perDay"
                    value={formData.price.rental.perDay}
                    onChange={handleInputChange}
                    required
                    min="50"
                    step="1"
                    placeholder="Min. Rs. 50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock *</label>
                  <input
                    type="number"
                    name="stock.total"
                    value={formData.stock.total}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Stock *</label>
                  <input
                    type="number"
                    name="stock.available"
                    value={formData.stock.available}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {uploadingImage ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    modalMode === "add" ? "Add Book" : "Update Book"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBookManagement;

