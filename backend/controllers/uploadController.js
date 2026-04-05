const { upload, uploadToCloudinary, cloudinary } = require('../config/cloudinary');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Public (you can add auth later)
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        `book-${Date.now()}`
      );

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message,
      });
    }
  },
];

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Public (you can add auth later)
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message,
    });
  }
};
