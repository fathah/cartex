import { ENV } from "@/constants/envs";
import SettingsDB from "@/db/settings";
import nodemailer from "nodemailer";

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html?: string,
) => {
  try {
    const email = ENV.SMTP_USER;
    const password = ENV.SMTP_PASSWORD;
    const host = ENV.SMTP_HOST;
    const senderName = await SettingsDB.getStoreName();

    if (!email || !password || !host) {
      console.error("Missing SMTP credentials");
      return { success: false, error: "Missing SMTP credentials" };
    }

    const transporter = nodemailer.createTransport({
      host: host,
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: password,
      },
    });

    const info = await transporter.sendMail({
      from: `${senderName} <${email}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};
