const jwt = require('jsonwebtoken');
const User = require('../config/models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const sendEmail = async (to, subject, htmlContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        port: 587, // Add the port you want to use, typically 587 or 465 for TLS/SSL
        secure: false, // Set to true if using port 465 (SSL)
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to,
        subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

const UserController = {
    register: async (req, res) => {
        try {
            const { name, email, phone, password } = req.body;
            // Basic validation (you may need more robust validation)
            if (!name || !email || !phone || !password) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if the email is already registered in the database
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                return res.status(400).json({ message: 'Email is already registered' });
            }

            const user = new User({ name, email, password, phone });

            const verificationToken = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1d' });
            user.verificationToken = verificationToken;
            await user.save();

            const verificationLink = `${process.env.CLIENT_URL}/verify-user?verificationToken=${verificationToken}`;
            const subject = 'Account Verification';
            const htmlContent = `Click <a href="${verificationLink}">here</a> to verify your account.`;

            await sendEmail(email, subject, htmlContent);

            res.status(200).json({ message: 'User registered. Verification email sent.' });
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            //   const user = await User.findByCredentials(email, password);
            const user = await User.findOne({ email });


            if (!user) {
                return res.status(401).json({ message: 'Invalid login credentials' });
            }

            if (!user.verified) {
                return res.status(401).json({ message: 'User is not verified. Please check your email for verification instructions.' });
            }

            const token = await user.generateAuthToken();
            res.cookie('token', token, {
                maxAge: 12 * 60 * 60 * 1000,
                secure: true, // Set to true in production over HTTPS
                httpOnly: true,
                sameSite: 'none',
            });

            res.send({ user, token });
        } catch (error) {
            console.error(error);
            res.status(400).send(error.message);
        }
    },

    getUserDetails: async (req, res) => {
        try {
            res.send(req.user);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    logout: async (req, res) => {
        try {
            req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
            await req.user.save();
            res.send('Logout successful');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).send('User not found');
            }

            const resetToken = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });
            user.resetToken = resetToken;
            user.resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds
            await user.save();

            const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
            const subject = 'Password Reset';
            const htmlContent = `Click <a href="${resetLink}">here</a> to reset your password.`;

            await sendEmail(email, subject, htmlContent);

            res.send('Password reset link sent to your email');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { resetToken, newPassword } = req.body;
            const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);

            const user = await User.findOne({ _id: decodedToken._id, resetToken });

            if (!user) {
                return res.status(400).send('Invalid or expired reset token');
            }

            user.password = await bcrypt.hash(newPassword, 12);
            user.resetToken = '';
            user.resetTokenExpiry = undefined;
            await user.save();

            res.send('Password reset successful');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    verifyUser: async (req, res) => {
        try {
            const { verificationToken } = req.params;
            const decodedToken = jwt.verify(verificationToken, process.env.JWT_SECRET);

            const user = await User.findOne({ _id: decodedToken._id });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired verification token' });
            }

            if (user.verified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            user.verified = true;

            // Directory paths
            const baseDir = path.join(__dirname, '..', 'userData', `${user._id}`);
            const detectionDir = path.join(baseDir, 'detection');
            const trainingDir = path.join(baseDir, 'training');
            const detectionSubDirs = ['shaper', 'geot', 'geoj', 'image'];
            const trainingSubDirs = ['annotations', 'images', 'labels', 'model', 'data'];

            // Create directories and subdirectories
            await fs.mkdir(baseDir, { recursive: true });
            await fs.mkdir(detectionDir, { recursive: true });
            await fs.mkdir(trainingDir, { recursive: true });

            for (const subDir of detectionSubDirs) {
                await fs.mkdir(path.join(detectionDir, subDir), { recursive: true });
            }

            for (const subDir of trainingSubDirs) {
                await fs.mkdir(path.join(trainingDir, subDir), { recursive: true });
            }

            await user.save();
            res.status(200).json({ message: 'User verification successful' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    checkLoginStatus: async (req, res) => {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');
            const decoded = jwt.verify(token, process.env.JWT_TOKEN);

            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

            if (!user) {
                throw new Error();
            }

            res.send({ isLoggedIn: true, user });
        } catch (error) {
            res.send({ isLoggedIn: false });
        }
    },
};

module.exports = UserController;
