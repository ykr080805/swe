// Day 2: Email Dispatch Service
/**
 * Mock email service for sending password reset tokens.
 * In production, this would integrate with AWS SES, SendGrid, or Nodemailer.
 */
const sendResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    // Simulate async email sending
    console.log(`[Email Service] Sending password reset link to ${email}`);
    console.log(`[Email Service] Link: ${resetUrl}`);
    
    return { success: true, message: 'Email dispatched successfully.' };
  } catch (error) {
    console.error('Email dispatch failed:', error);
    return { success: false, message: 'Failed to send email.' };
  }
};

module.exports = { sendResetEmail };
