const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendOTPEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #625d8c;">Verify Your Email</h2>
                    <p>Thank you for registering with Picture Wall Designer. To complete your registration, please use the following OTP:</p>
                    <div style="background-color: #f1e6cb; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #625d8c; margin: 0; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p style="color: #666;">If you didn't request this verification, please ignore this email.</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = {
    sendOTPEmail
}; 