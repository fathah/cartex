"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Checkbox } from "antd";
import {
  checkEmail,
  login,
  register,
  sendOtp,
  verifyOtp,
} from "@/app/login/actions";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginClient({ logo }: { logo?: string }) {
  const searchParams = useSearchParams();
  const backto = searchParams.get("backto");
  const [step, setStep] = useState<"EMAIL" | "LOGIN" | "OTP" | "SIGNUP">(
    "EMAIL",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpForm] = Form.useForm();
  const router = useRouter();

  // Countdown timer effect
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendOtp = async () => {
    if (resendCountdown > 0) {
      message.warning(
        `Please wait ${resendCountdown} seconds before requesting a new code`,
      );
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(email);
      if (res.success) {
        message.success("New OTP sent to your email");
        setResendCountdown(60); // Start 60-second countdown
        otpForm.resetFields(); // Clear the OTP input field
      } else {
        message.error(res.error || "Failed to send OTP");
      }
    } catch (error) {
      message.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const { exists, error } = await checkEmail(values.email);
      if (error) {
        message.error(error);
        return;
      }

      setEmail(values.email);
      if (exists) {
        setStep("LOGIN");
      } else {
        // New user: Send OTP
        const res = await sendOtp(values.email);
        if (res.success) {
          message.success("OTP sent to your email");
          setResendCountdown(60); // Start 60-second countdown
          setStep("OTP");
        } else {
          message.error(res.error || "Failed to send OTP");
        }
      }
    } catch (error) {
      message.error("Failed to check email");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: { password: string }) => {
    setLoading(true);
    try {
      const res = await login(email, values.password);
      if (res.success) {
        message.success("Logged in successfully");
        if (backto) {
          router.push(backto);
        } else {
          router.push("/");
        }
      } else {
        message.error(res.error || "Login failed");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (values: { otp: string }) => {
    setLoading(true);
    try {
      const res = await verifyOtp(email, values.otp);
      if (res.success) {
        setOtp(values.otp); // Save OTP for register call
        setStep("SIGNUP");
      } else {
        message.error(res.error || "Invalid OTP");
      }
    } catch (error) {
      message.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (values: { password: string }) => {
    setLoading(true);
    try {
      // Pass OTP again for secure registration
      const res = await register(email, values.password, otp);
      if (res.success) {
        message.success("Account created successfully");
        router.push("/");
      } else {
        message.error((res as any).error || "Signup failed");
      }
    } catch (error) {
      message.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FDF8F5]">
      <div className="w-full max-w-md px-10 py-20 bg-white shadow-xl rounded-2xl">
        <div className="text-center mb-8">
          {logo && (
            <div className="fullcenter">
              <img src={logo} className="h-12 mb-10" alt="" />
            </div>
          )}

          <h1 className="text-3xl font-semibold text-amber-900 mb-2">
            {step === "EMAIL" && "Let's Get Started"}
            {step === "LOGIN" && "Welcome Back"}
            {step === "OTP" && "Check your Email"}
            {step === "SIGNUP" && "Create Account"}
          </h1>
          <p className="text-gray-500">
            {step === "EMAIL" && "Enter your email to continue"}
            {step === "LOGIN" && `Hello ${email} 👋`}
            {step === "OTP" && `We sent a code to ${email}`}
            {step === "SIGNUP" && "Set a password to complete your account."}
          </p>
        </div>

        {step === "EMAIL" && (
          <Form onFinish={handleEmailSubmit} layout="vertical" size="large">
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email",
                  type: "email",
                },
              ]}
            >
              <Input placeholder="name@example.com" autoFocus />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#4A3B32] hover:bg-[#2d241e] border-none h-12 text-sm uppercase tracking-widest"
            >
              Continue
            </Button>
          </Form>
        )}

        {step === "LOGIN" && (
          <Form onFinish={handleLogin} layout="vertical" size="large">
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password placeholder="Enter your password" autoFocus />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <span
                className="text-sm text-[#4A3B32] cursor-pointer hover:underline"
                onClick={() => setStep("EMAIL")}
              >
                Change Email
              </span>
              <span className="text-sm text-[#4A3B32] cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#4A3B32] hover:bg-[#2d241e] border-none h-12 text-sm uppercase tracking-widest"
            >
              Log In
            </Button>
          </Form>
        )}

        {step === "OTP" && (
          <Form
            form={otpForm}
            onFinish={handleOtpSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="otp"
              rules={[
                { required: true, message: "Please enter the code" },
                { len: 6, message: "Code to be 6 digits" },
              ]}
            >
              <Input
                placeholder="123456"
                maxLength={6}
                style={{
                  textAlign: "center",
                  letterSpacing: "4px",
                  fontSize: "18px",
                }}
                autoFocus
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <span
                className="text-sm text-[#4A3B32] cursor-pointer hover:underline"
                onClick={() => setStep("EMAIL")}
              >
                Change Email
              </span>
              <span
                className={`text-sm ${resendCountdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-[#4A3B32] cursor-pointer hover:underline"}`}
                onClick={handleResendOtp}
              >
                {resendCountdown > 0
                  ? `Resend in ${resendCountdown}s`
                  : "Resend Code"}
              </span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#4A3B32] hover:bg-[#2d241e] border-none h-12 text-sm uppercase tracking-widest"
            >
              Verify
            </Button>
          </Form>
        )}

        {step === "SIGNUP" && (
          <Form onFinish={handleSignup} layout="vertical" size="large">
            <Form.Item
              label="Set Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Create a password" autoFocus />
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <span
                className="text-sm text-[#4A3B32] cursor-pointer hover:underline"
                onClick={() => setStep("OTP")}
              >
                Back to OTP
              </span>
              <span
                className="text-sm text-[#4A3B32] cursor-pointer hover:underline"
                onClick={() => setStep("EMAIL")}
              >
                Change Email
              </span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-[#4A3B32] hover:bg-[#2d241e] border-none h-12 text-sm uppercase tracking-widest"
            >
              Create Account
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}
