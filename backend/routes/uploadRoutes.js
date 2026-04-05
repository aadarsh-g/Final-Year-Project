const express = require('express');
const router = express.Router();
const { uploadImage, deleteImage } = require('../controllers/uploadController');

// Upload image
router.post('/image', uploadImage);

// Delete image
router.delete('/image/:publicId', deleteImage);

module.exports = router;
