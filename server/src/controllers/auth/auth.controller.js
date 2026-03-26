import crypto from "crypto";
import User from "../../models/User.js";
import generateToken from "../../utils/generateToken.js";
import { sendWelcomeEmail, sendEmailVerification, sendPasswordResetEmail } from "../../services/emailService.js";


/**
 * @route   POST /api/auth/register
 * @desc    Register customer
 * @access  Public
 */
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, accountType, sellerRegistration } = req.body;

    if (!name || !email || !password) {
      return res.status(200).json({
        success: false,
        message: "Required fields missing",
        data: null
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const wantsSeller =
      accountType === "seller" || sellerRegistration === true;
    const requestedRole = wantsSeller ? "seller" : "customer";
    const phoneTrimmed = phone != null && String(phone).trim() ? String(phone).trim() : null;

    const orConditions = [{ email: normalizedEmail }];
    if (phoneTrimmed) {
      orConditions.push({ phone: phoneTrimmed });
    }

    const existingUser = await User.findOne({
      $or: orConditions,
      isDeleted: { $ne: true },
    }).select("+password");

    if (existingUser) {
      if (requestedRole === "seller" && existingUser.role === "customer") {
        const isMatch = await existingUser.matchPassword(password);
        if (!isMatch) {
          return res.status(200).json({
            success: false,
            message:
              "This email is already registered. Sign in with your existing password, or use Forgot password.",
            data: null,
          });
        }
        existingUser.role = "seller";
        if (name) existingUser.name = name;
        existingUser.lastLoginAt = new Date();
        await existingUser.save();
        const token = generateToken({
          id: existingUser._id,
          role: existingUser.role,
        });
        return res.status(200).json({
          success: true,
          message: "Your account is now a supplier. Complete onboarding to get approved.",
          data: {
            token,
            user: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
            },
          },
        });
      }
      if (requestedRole === "seller" && existingUser.role === "seller") {
        return res.status(200).json({
          success: false,
          message: "A supplier account with this email already exists. Please sign in.",
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "User already exists",
        data: null
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phoneTrimmed || undefined,
      password,
      role: requestedRole
    });

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    sendWelcomeEmail(user).catch(() => {});

    const emailToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    sendEmailVerification(user, emailToken).catch(() => {});

    return res.status(200).json({
      success: true,
      message:
        requestedRole === "seller"
          ? "Supplier account created successfully"
          : "Registration successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(200).json({
        success: false,
        message:
          "An account with this email or phone already exists. Try signing in, or use a different email.",
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};


/**
 * @route   POST /api/auth/login
 * @desc    Login customer
 * @access  Public
 */
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({
        success: false,
        message: "Email and password are required",
        data: null
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
        data: null
      });
    }

    if (user.isBlocked || user.isDeleted) {
      return res.status(200).json({
        success: false,
        message: "Account is disabled",
        data: null
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
        data: null
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent",
        data: null,
      });
    }

    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user, token);

    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
        data: null,
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.passwordChangedAt = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: { token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
        data: null,
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
