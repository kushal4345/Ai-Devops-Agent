const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a welcome email using Resend
 * Designed with a premium, Amazon-like layout
 */
const sendWelcomeEmail = async (email, username) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Amazon Ember', Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          overflow: hidden;
        }
        .header {
          background-color: #232f3e;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 400;
        }
        .content {
          padding: 30px;
          color: #0f1111;
        }
        .content h2 {
          font-size: 20px;
          margin-top: 0;
        }
        .content p {
          font-size: 15px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          background-color: #ffd814;
          color: #0f1111;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: bold;
          border: 1px solid #fcd200;
        }
        .footer {
          background-color: #f3f3f3;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #555555;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Ai DevOps Agent</h1>
        </div>
        <div class="content">
          <h2>Hello, ${username}!</h2>
          <p>Welcome to Ai DevOps Agent. We're thrilled to have you on board.</p>
          <p>Your account has been successfully created via GitHub. You are now ready to start deploying and managing your applications with the power of AI.</p>
          <p>To get started, click the button below to visit your dashboard:</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Ai DevOps Agent. All rights reserved.</p>
          <p>This email was sent to ${email}. If you did not create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log("📧 Sending welcome email...")
    const { data, error } = await resend.emails.send({


      from: 'Acme <onboarding@resend.dev>',
      to: ["kushalsharm4345@gmail.com"],
      subject: 'Welcome to Ai DevOps Agent',
      html: htmlContent,
    });
    console.log("📧 Resend response received");
    console.log("DATA:", data);
    console.log("ERROR:", error);
    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to trigger Resend:', err);
    return { success: false, error: err.message };
  }
};

const { emailQueue } = require('../workers/emailQueue');

const queueWelcomeEmail = async (email, username) => {
  console.log("📥 Queuing welcome email to Redis...");
  await emailQueue.add('send-welcome-email', { email, username });
};

module.exports = {
  sendWelcomeEmail,
  queueWelcomeEmail
};
