// 📁 services/notificationService.js
import Notification from '../models/Notification.js'
import { sendEmail } from './sendemail.js';

const sendNotification = async ({ userId, title, message, type = 'general', read = false, email }) => {
  try {
    // 1. Save in DB
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      read,
      createdAt: new Date()
    });

    await notification.save();
    console.log(`📩 Notification saved for user ${userId}: ${title}`);

    // 2. Optional email
    if (email) {
      const htmlMessage = `
        <div style="font-family: Arial, sans-serif;">
          <h2>${title}</h2>
          <p>${message}</p>
          <hr style="margin-top:20px;"/>
          <p style="font-size: 12px; color: gray;">This is an automated message from AgroTech.</p>
        </div>
      `;

      await sendEmail({
        email,
        subject: `AgroTech Notification - ${title}`,
        htmlMessage
      });
    }
  } catch (err) {
    console.error('❌ Error in sendNotification:', err.message);
  }
};

export {sendNotification}