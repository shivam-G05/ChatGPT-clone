const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const crypto = require('crypto');
const userModel=require('../models/user');
const sendEmail=require('../services/sendEmail');
const authController=require('../controller/authController');

router.post('/register',authController.registerUser);
router.post("/login", authController.loginUser)
router.get('/verify',authController.verifyUser);
router.get("/me", async (req, res) => {
  try {
    
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; 

    // 3️⃣ Find user by ID
    const user = await userModel.findById(userId).select("fullName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Send data to frontend
    res.status(200).json({
      fullName: `${user.fullName.firstName} ${user.fullName.lastName}`,
      email: user.email,
      success:true
      
    });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await userModel.findOne({ email });
    if (!user) {
      // security: respond the same even if user not found
      return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
    }

    const resetToken = user.getResetToken();
    await user.save({ validateBeforeSave: false });

    // Link that user will click -> frontend page
    const resetURL = `${process.env.BASE_URL}/reset-password/${resetToken}`;

    const html = `
      <p>You requested a password reset</p>
      <p>Click this link to reset your password (valid for 10 minutes):</p>
      <a href="${resetURL}">${resetURL}</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password reset token',
      html
    });

    return res.status(200).json({ message: 'If that email exists, a reset link was sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = password; // pre-save hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


