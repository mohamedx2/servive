import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: `"Le Gardien de l'Héritage" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

export const templates = {
    heartbeatReminder: (name: string) => ({
        subject: "⚠️ Heartbeat Required - Le Gardien de l'Héritage",
        html: `<h1>Hello ${name},</h1><p>We haven't detected your heartbeat for a while. Please log in to confirm your status within the grace period to avoid triggering the legacy transmission.</p>`,
    }),
    transmissionTriggered: (name: string) => ({
        subject: "📢 Legacy Transmission Triggered",
        html: `<h1>Final Notice</h1><p>The legacy transmission for ${name} has been triggered. Your designated heirs will be notified shortly.</p>`,
    }),
    heirNotification: (userName: string, accessLink: string) => ({
        subject: `🔐 Legacy Access: Document from ${userName}`,
        html: `<h1>Hello,</h1><p>${userName} has entrusted you with a digital legacy. You can access the encrypted content here: <a href="${accessLink}">${accessLink}</a></p>`,
    }),
};
