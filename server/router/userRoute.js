const express = require('express');
const UserController = require('../controller/userController');
const authenticationMiddleware = require('../middleware/authenticationMiddleware');

const router = express.Router();

// Registration Route
router.post('/register', UserController.register);

// Login Route
router.post('/login', UserController.login);

// Get User Details Route (requires authentication middleware)
router.get('/user', authenticationMiddleware, UserController.getUserDetails);

// Logout Route (requires authentication middleware)
router.get('/logout', UserController.logoutss);

// Forgot Password Route
router.post('/forgot-password', UserController.forgotPassword);

// Reset Password Route
router.post('/reset-password', UserController.resetPassword);

// Verify User Route
router.get('/verify/:verificationToken', UserController.verifyUser);

// Check Login Status Route
router.get('/check-login-status', UserController.checkLoginStatus);

module.exports = router;
