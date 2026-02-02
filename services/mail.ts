import nodemailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        const email = process.env.SMTP_USER;
        const password = process.env.SMTP_PASSWORD;
        const host = process.env.SMTP_HOST;

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
            from: email, // sender address
            to,
            subject,
            text,
            html: html || text, // fallback to text if html is not provided
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
}