import SettingsDB from "@/db/settings";

export const otpMailTemplate = async (otp: string) => {
  const storeName = await SettingsDB.getStoreName();
  const storeLogo = await SettingsDB.getStoreLogo();
  let titleComponent = `
    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">${storeName}</h1>`;

  if (storeLogo && storeLogo.length > 10) {
    titleComponent = `<img src="${storeLogo}" alt="${storeName}" style="max-width: 150px;  border-radius: 5px;">`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr><td style="padding: 20px; text-align: center; background-color: #fbfbfb; border-radius: 12px 12px 0 0; margin-bottom: 20px;">
                    ${titleComponent}</td></tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #666666;">
                                Please use the verification code below to complete your registration:
                            </p>
                            
                            <!-- OTP Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center" style="padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                                        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; ">
                                            ${otp}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 20px; color: #999999; text-align: center;">
                                This code will expire in <strong style="color: #666666;">10 minutes</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <div style="padding: 16px; background-color: #f8f9fa; border-left: 4px solid #667eea; border-radius: 4px;">
                                <p style="margin: 0; font-size: 13px; line-height: 18px; color: #666666;">
                                    <strong style="color: #1a1a1a;">Security tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 13px; line-height: 18px; color: #999999; text-align: center;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Email Footer -->
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999;">
                                © ${new Date().getFullYear()} ${storeName}. All rights reserved.
                            </p>
                            <p style="margin: 0; font-size: 10px; line-height: 18px; color: #1a1a1a;">
                                Powered by <a href="https://ziqx.cc">Cartex</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
