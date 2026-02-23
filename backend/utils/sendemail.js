// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, htmlMessage }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // or 587 if switching
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            logger: true,
            debug: true,
            connectionTimeout: 10000, // 10 seconds timeout
            greetingTimeout: 10000,   // 10 seconds timeout for server response
        });

        const mailOptions = {
            from: `"AgroTech Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlMessage,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

export {sendEmail};
