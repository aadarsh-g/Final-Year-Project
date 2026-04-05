const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getDashboardData,
  clearAllData
} = require('../controllers/adminController');
const {
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  updateUserRole
} = require('../controllers/adminUserController');

// Dashboard stats
router.get('/stats', getDashboardStats);
router.get('/dashboard', getDashboardData);

// Clear all data (USE WITH CAUTION)
router.delete('/clear-all-data', clearAllData);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id/details', getUserDetails);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;

