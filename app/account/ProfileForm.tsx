"use client";

import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { User, Mail, Phone, Save } from "lucide-react";
import { updateProfile } from "@/actions/user";

interface ProfileFormProps {
  user: {
    id: string;
    email: string | null;
    fullname: string | null;
    phone: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const result = await updateProfile({
        fullname: values.fullname,
        phone: values.phone,
      });

      if (result.success) {
        message.success("Profile updated successfully");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        message.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      message.error("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (user.fullname) {
      const parts = user.fullname.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.fullname.substring(0, 2).toUpperCase();
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-400 overflow-hidden mb-10">
      {/* Profile Header */}
      <div className="bg-linear-to-r from-[#4A3B32] to-[#6D5D52] p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/30">
            {getInitials()}
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold mb-1">
              {user.fullname || (
                <span className="text-white/80 italic">No name</span>
              )}
            </h2>
            <p className="text-white/80 text-sm">
              {user.email || user.phone || "No contact info"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Personal Information
        </h3>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            fullname: user.fullname || "",
            email: user.email || "",
            phone: user.phone || "",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  Full Name
                </span>
              }
              name="fullname"
              rules={[
                { required: true, message: "Please enter your full name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                prefix={<User size={16} className="text-gray-400" />}
                placeholder="Enter your full name"
                size="large"
                className="rounded-md"
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  Email Address
                </span>
              }
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<Mail size={16} className="text-gray-400" />}
                placeholder="your.email@example.com"
                size="large"
                className="rounded-md"
                disabled
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              label={
                <span className="text-sm font-medium text-gray-700">
                  Phone Number
                </span>
              }
              name="phone"
              rules={[
                {
                  pattern: /^[0-9+\s-()]*$/,
                  message: "Please enter a valid phone number",
                },
              ]}
            >
              <Input
                prefix={<Phone size={16} className="text-gray-400" />}
                placeholder="+971 50 123 4567"
                size="large"
                className="rounded-md"
              />
            </Form.Item>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 mt-8 pt-6">
            <Button
              type="default"
              size="large"
              onClick={() => form.resetFields()}
              className="px-6"
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<Save size={16} />}
              className="bg-[#4A3B32] hover:bg-[#2d241e] border-none px-6"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
