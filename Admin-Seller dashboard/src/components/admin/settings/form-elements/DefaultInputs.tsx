"use client";
import React, { useState } from "react";
import ComponentCard from "../../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import { EyeCloseIcon, EyeIcon } from "../../../../icons";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";

export default function DefaultInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("⚠️ Please enter both old and new passwords");
      return;
    }

    try {
      setLoading(true);
      
      const token = getToken();

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/change-password`,
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("✅ Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(`❌ ${res.data.message}`);
      }
    } catch (err: any) {
      console.error("Change password error:", err);
      toast.error("❌ Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Change Password">
      <div className="space-y-6">
        <div>
          <Label>Enter Old Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your old password"
              defaultValue={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label>Enter New Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              defaultValue={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? "Changing..." : "Change"}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ComponentCard>
  );
}
