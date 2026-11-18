const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendInBackground,
} = require("../utils/sendMail");

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const generateAccessToken = (user) => {
  const secret = getAccessSecret();
  if (!secret) {
    throw new Error("JWT Secret is not configured");
  }
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      tokenVersion: user.tokenVersion || 0,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  const secret = getRefreshSecret();
  if (!secret) {
    throw new Error("JWT Secret is not configured");
  }
  return jwt.sign(
    {
      userId: user._id.toString(),
      tokenVersion: user.tokenVersion || 0,
    },
    secret,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    }
  );
};

const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("prime3d_refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  });
};

const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("prime3d_refresh_token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
    path: "/",
  });
};

const saveUserRefreshToken = async (user, refreshToken, req) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const userAgent = req?.headers?.["user-agent"] || "";

  if (!Array.isArray(user.refreshTokens)) {
    user.refreshTokens = [];
  }

  // Prune expired tokens and maintain at most 9 so after pushing it has 10
  const now = new Date();
  user.refreshTokens = user.refreshTokens
    .filter((t) => t.expiresAt && new Date(t.expiresAt) > now)
    .slice(-9);

  user.refreshTokens.push({
    token: refreshToken,
    expiresAt,
    userAgent,
    createdAt: new Date(),
  });

  await user.save();
};

// ==========================================
// REGISTER
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Determine role (protect admin assignment)
    let userRole = "customer";
    const adminEmail = (process.env.ADMIN_EMAIL || "prime3dprintinglab@gmail.com").toLowerCase().trim();
    if (cleanEmail === adminEmail) {
      userRole = "admin";
    } else if (role === "admin" && req.body.adminSecretKey === process.env.JWT_SECRET) {
      userRole = "admin";
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : "",
      password,
      role: userRole,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveUserRefreshToken(user, refreshToken, req);
    setRefreshTokenCookie(res, refreshToken);

    // Send welcome email in background
    sendInBackground(async () => {
      await sendWelcomeEmail(user);
    }, `Welcome email to ${user.email}`);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to Prime 3D Printing Lab.",
      accessToken,
      token: accessToken, // Alias for backward compatibility
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await saveUserRefreshToken(user, refreshToken, req);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      token: accessToken, // Alias for backward compatibility
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// ==========================================
// GET CURRENT USER
// ==========================================
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// ==========================================
// FORGOT PASSWORD (OTP & LINK VIA NODEMAILER)
// ==========================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    // Generate 6-digit numerical OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Generate secure random hex token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordOtp = otp;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 mins expiry
    await user.save();

    // Send email (await to catch real delivery errors instead of false success)
    try {
      await sendPasswordResetEmail(cleanEmail, otp, resetToken, user.name);
    } catch (mailError) {
      console.error(`[EMAIL ERROR] Failed to send password reset email to ${cleanEmail}:`, mailError.message);
      return res.status(502).json({
        success: false,
        message: mailError.message || "Failed to deliver verification email. Please check email service configuration.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset verification code has been sent to your email. Valid for 30 minutes.",
      expiresInMinutes: 30,
      expiresAt: user.resetPasswordExpires,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
      error: error.message,
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, token, newPassword } = req.body || {};

    if (!email || (!otp && !token) || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP or Reset Token, and New Password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user with valid token/otp and non-expired time
    const query = {
      email: cleanEmail,
      resetPasswordExpires: { $gt: Date.now() },
    };

    if (otp) {
      query.resetPasswordOtp = otp.toString().trim();
    } else if (token) {
      query.resetPasswordToken = token.trim();
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code / reset link",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send security alert in background
    sendInBackground(async () => {
      await sendPasswordChangedEmail(user.email, user.name);
    }, `Password changed alert to ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body || {};
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    if (req.file) {
      user.profileImage = `/uploads/users/${req.file.filename}`;
    }

    if (address || city || state || pincode) {
      user.addresses = [
        {
          fullName: name || user.name,
          phone: phone || user.phone,
          address: address || "",
          city: city || "",
          state: state || "",
          pincode: pincode || "",
          isDefault: true,
        },
      ];
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    user.password = newPassword;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.refreshTokens = [];
    await user.save();
    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. All other sessions have been logged out.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

// ==========================================
// REFRESH TOKEN (DUAL TOKEN ARCHITECTURE)
// POST /api/auth/refresh
// ==========================================
exports.refreshToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.prime3d_refresh_token;
    const tokenFromBody = req.body?.refreshToken;
    const incomingToken = tokenFromCookie || tokenFromBody;

    if (!incomingToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incomingToken, getRefreshSecret());
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please sign in again.",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.status !== "active") {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "User account not found or is inactive",
      });
    }

    // Verify tokenVersion to support instant server-side revocation
    if (
      decoded.tokenVersion !== undefined &&
      decoded.tokenVersion !== (user.tokenVersion || 0)
    ) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Session revoked. Please sign in again.",
      });
    }

    if (!Array.isArray(user.refreshTokens)) {
      user.refreshTokens = [];
    }

    // Check if refresh token exists in user's saved tokens
    const tokenRecordIndex = user.refreshTokens.findIndex(
      (t) => t.token === incomingToken
    );

    if (tokenRecordIndex === -1) {
      // Suspected token reuse or revoked session: invalidate all tokens for security!
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      user.refreshTokens = [];
      await user.save();
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid or has already been used. Please log in again.",
      });
    }

    // Issue new 15-minute Access Token
    const newAccessToken = generateAccessToken(user);

    // Refresh Token Rotation: issue a new refresh token and replace old one
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokens.splice(tokenRecordIndex, 1);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers["user-agent"] || "",
      createdAt: new Date(),
    });

    await user.save();
    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      token: newAccessToken, // Backward compatibility alias
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    clearRefreshTokenCookie(res);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
      error: error.message,
    });
  }
};

// ==========================================
// LOGOUT (SERVER-SIDE REVOCATION)
// POST /api/auth/logout
// ==========================================
exports.logout = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.prime3d_refresh_token;
    const tokenFromBody = req.body?.refreshToken;
    const targetToken = tokenFromCookie || tokenFromBody;

    if (targetToken) {
      await User.updateOne(
        { "refreshTokens.token": targetToken },
        { $pull: { refreshTokens: { token: targetToken } } }
      );
    }

    clearRefreshTokenCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    clearRefreshTokenCookie(res);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

