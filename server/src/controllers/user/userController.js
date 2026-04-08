
import User from "../../models/User.js";

export const getMyProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};


export const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    if (!name && !phone && !avatar) {
      return res.status(200).json({
        success: false,
        message: "Nothing to update",
        data: null
      });
    }

    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (avatar) req.user.avatar = avatar;

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar
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

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(200).json({
        success: false,
        message: "currentPassword, newPassword and confirmPassword are required",
        data: null,
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(200).json({
        success: false,
        message: "New password must be at least 6 characters",
        data: null,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        success: false,
        message: "New password and confirm password do not match",
        data: null,
      });
    }

    const userWithPassword = await User.findById(req.user._id).select("+password");
    if (!userWithPassword || !userWithPassword.password) {
      return res.status(200).json({
        success: false,
        message: "Password change is unavailable for this account",
        data: null,
      });
    }

    const isMatch = await userWithPassword.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: "Current password is incorrect",
        data: null,
      });
    }

    userWithPassword.password = newPassword;
    userWithPassword.passwordChangedAt = new Date();
    await userWithPassword.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
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