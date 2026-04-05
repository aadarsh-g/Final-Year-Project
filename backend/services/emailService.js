const nodemailer = require('nodemailer');

/**
 * Email Service using Nodemailer
 * 
 * Configuration: Set these environment variables in your .env file:
 * - EMAIL_HOST (e.g., smtp.gmail.com)
 * - EMAIL_PORT (e.g., 587 for TLS or 465 for SSL)
 * - EMAIL_USER (your email address)
 * - EMAIL_PASS (your email password or app-specific password)
 * - EMAIL_FROM (sender name and email)
 * 
 * For Gmail: Use App Password (not your regular password)
 * Enable 2-Factor Authentication → Generate App Password
 */

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} fullName - User's full name
 * @param {string} otp - 6-digit OTP code
 */
exports.sendVerificationOTP = async (to, fullName, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `${otp} is your Bookify verification code`,
      replyTo: process.env.EMAIL_USER,
      headers: {
        'X-Mailer': 'Bookify App',
        'X-Priority': '1',
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #4FD1C5 0%, #14B8A6 100%);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content h2 {
              color: #333333;
              margin-bottom: 20px;
            }
            .otp-code {
              display: inline-block;
              background-color: #f0f9ff;
              border: 2px dashed #4FD1C5;
              border-radius: 8px;
              padding: 20px 40px;
              margin: 30px 0;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #1F2937;
            }
            .info {
              color: #666666;
              font-size: 14px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .warning {
              background-color: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 15px;
              margin: 20px 0;
              text-align: left;
              font-size: 14px;
              color: #92400E;
            }
            .footer {
              background-color: #f9fafb;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              background-color: #4FD1C5;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 30px;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>📚 Bookify</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${fullName}!</h2>
              <p class="info">
                Thank you for signing up with Bookify. To complete your registration, 
                please verify your email address using the OTP code below:
              </p>
              <div class="otp-code">${otp}</div>
              <p class="info">
                Enter this code on the verification page to activate your account.
              </p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for <strong>10 minutes</strong> only</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              <p class="info">
                Having trouble? Contact our support team at 
                <a href="mailto:support@bookify.com" style="color: #4FD1C5;">support@bookify.com</a>
              </p>
            </div>
            <div class="footer">
              <p>
                © ${new Date().getFullYear()} Bookify. All rights reserved.<br>
                This is an automated email. Please do not reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Fallback plain text version
      text: `
Welcome to Bookify, ${fullName}!

Your verification code is: ${otp}

This code is valid for 10 minutes. Please enter it on the verification page to activate your account.

Do not share this code with anyone.
If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} Bookify
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send welcome email after successful verification
 * @param {string} to - Recipient email address
 * @param {string} fullName - User's full name
 */
exports.sendWelcomeEmail = async (to, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to Bookify! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4FD1C5 0%, #14B8A6 100%); color: #ffffff; padding: 40px; text-align: center; }
            .content { padding: 40px 30px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; background-color: #4FD1C5; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🎉 Welcome to Bookify!</h1>
            </div>
            <div class="content">
              <h2>Hi ${fullName},</h2>
              <p>Your account has been successfully verified! You're all set to explore our amazing collection of books.</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalog" class="button">Start Browsing Books</a>
              </p>
              <p>Happy reading! 📚</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bookify. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Bookify, ${fullName}! Your account has been successfully verified. Start browsing books at ${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalog`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error - welcome email is not critical
    return { success: false, error: error.message };
  }
};

/**
 * Send rental return reminder email (1 day before due date)
 * @param {string} to - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} bookTitle - Title of the rented book
 * @param {string} rentalNumber - Rental reference number
 * @param {Date} dueDate - The due date
 */
exports.sendRentalReminderEmail = async (to, fullName, bookTitle, rentalNumber, dueDate) => {
  try {
    const transporter = createTransporter();
    const formattedDate = new Date(dueDate).toLocaleDateString('en-NP', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⏰ Reminder: Return "${bookTitle}" by tomorrow — Bookify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #fff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; }
            .body { padding: 36px 30px; }
            .alert-box { background: #FEF3C7; border-left: 5px solid #F59E0B; border-radius: 4px; padding: 18px 20px; margin: 20px 0; }
            .alert-box p { margin: 0; font-size: 15px; color: #92400E; }
            .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .info-table td { padding: 10px 14px; border: 1px solid #E5E7EB; font-size: 14px; }
            .info-table td:first-child { background: #F9FAFB; font-weight: bold; color: #374151; width: 40%; }
            .btn { display: inline-block; background: #4FD1C5; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .footer { background: #F9FAFB; padding: 18px; text-align: center; color: #6B7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Bookify — Return Reminder</h1>
            </div>
            <div class="body">
              <p style="font-size:16px;">Hi <strong>${fullName}</strong>,</p>
              <div class="alert-box">
                <p>⏰ <strong>Your book rental is due <u>tomorrow</u>.</strong> Please return it on time to avoid a late fine.</p>
              </div>
              <table class="info-table">
                <tr><td>Book Title</td><td>${bookTitle}</td></tr>
                <tr><td>Rental #</td><td>${rentalNumber}</td></tr>
                <tr><td>Return By</td><td><strong>${formattedDate}</strong></td></tr>
                <tr><td>Late Fine</td><td><strong style="color:#DC2626;">₹100/day</strong> charged for every overdue day</td></tr>
              </table>
              <p style="font-size:14px;color:#4B5563;">Please return the book to your nearest Bookify drop-off point or contact us for assistance.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/orders" class="btn">View My Rentals</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bookify. All rights reserved.<br>This is an automated reminder — please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${fullName},\n\nThis is a reminder that your rental of "${bookTitle}" (Rental #${rentalNumber}) is due tomorrow — ${formattedDate}.\n\nPlease return it on time. A fine of ₹100/day will be charged for every overdue day.\n\n— Bookify`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Rental reminder sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send rental reminder to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send overdue fine notification email
 * @param {string} to - Recipient email
 * @param {string} fullName - User's full name
 * @param {string} bookTitle - Title of the rented book
 * @param {string} rentalNumber - Rental reference number
 * @param {Date} dueDate - The due date
 * @param {number} overdueDays - Number of days overdue
 */
exports.sendOverdueFineEmail = async (to, fullName, bookTitle, rentalNumber, dueDate, overdueDays, fineAmount = 100, finePerDay = 100) => {
  try {
    const transporter = createTransporter();
    const formattedDate = new Date(dueDate).toLocaleDateString('en-NP', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🚨 Overdue Fine Applied — Rental #${rentalNumber} — Bookify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #fff; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 26px; }
            .body { padding: 36px 30px; }
            .alert-box { background: #FEE2E2; border-left: 5px solid #DC2626; border-radius: 4px; padding: 18px 20px; margin: 20px 0; }
            .alert-box p { margin: 0; font-size: 15px; color: #991B1B; }
            .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .info-table td { padding: 10px 14px; border: 1px solid #E5E7EB; font-size: 14px; }
            .info-table td:first-child { background: #F9FAFB; font-weight: bold; color: #374151; width: 40%; }
            .fine-note { background: #FFF7ED; border-left: 4px solid #F97316; border-radius: 4px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #7C3409; }
            .btn { display: inline-block; background: #4FD1C5; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .footer { background: #F9FAFB; padding: 18px; text-align: center; color: #6B7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Bookify — Overdue Fine Notice</h1>
            </div>
            <div class="body">
              <p style="font-size:16px;">Hi <strong>${fullName}</strong>,</p>
              <div class="alert-box">
                <p>⚠️ Your rental of <strong>"${bookTitle}"</strong> is <strong>${overdueDays} day(s) overdue</strong>. A fine has been applied to your account.</p>
              </div>
              <table class="info-table">
                <tr><td>Book Title</td><td>${bookTitle}</td></tr>
                <tr><td>Rental #</td><td>${rentalNumber}</td></tr>
                <tr><td>Due Date</td><td>${formattedDate}</td></tr>
                <tr><td>Days Overdue</td><td style="color:#DC2626;font-weight:bold;">${overdueDays} day(s)</td></tr>
                <tr><td>Fine Rate</td><td>₹${finePerDay} per day</td></tr>
                <tr><td>Total Fine</td><td><strong style="color:#DC2626;font-size:16px;">₹${fineAmount}</strong> (₹${finePerDay} × ${overdueDays} day(s))</td></tr>
              </table>
              <div class="fine-note">📌 The fine increases by <strong>₹${finePerDay} every day</strong> until the book is returned. Return it as soon as possible to limit the fine.</div>
              <p style="font-size:14px;color:#4B5563;margin-top:16px;">Please return the book and pay the fine through your dashboard.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/orders" class="btn">Pay Fine Now</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Bookify. All rights reserved.<br>This is an automated notice — please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${fullName},\n\nYour rental of "${bookTitle}" (Rental #${rentalNumber}) is ${overdueDays} day(s) overdue (due: ${formattedDate}).\n\nFine: ₹${finePerDay}/day × ${overdueDays} day(s) = ₹${fineAmount}.\nThe fine grows by ₹${finePerDay} each day — please return the book soon.\n\nPay the fine via your Bookify dashboard.\n\n— Bookify`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Overdue fine email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send overdue fine email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send a combined order-update email showing BOTH order status AND payment status.
 * Used whenever either status changes — always gives the customer the full picture.
 *
 * @param {string} to              - Recipient email
 * @param {string} fullName        - Customer name
 * @param {string} orderNumber     - Order reference
 * @param {string} orderStatus     - Current order status
 * @param {string} paymentStatus   - Current payment status
 * @param {number} totalAmount     - Order total (NPR)
 * @param {string} paymentMethod   - Payment method
 * @param {string} [trackingNumber]- Optional tracking number (shown when status = shipped)
 * @param {string} [trigger]       - 'order' | 'payment'  (determines headline copy)
 */
/**
 * Send order-placed confirmation email (purchase & rental)
 * @param {string}   to            - Customer email
 * @param {string}   fullName      - Customer name
 * @param {string}   orderNumber   - Order reference
 * @param {Array}    items         - Array of { title, author, type, quantity, rentalDuration, rentalStartDate, rentalEndDate, subtotal }
 * @param {number}   totalAmount   - Grand total (NPR)
 * @param {string}   paymentMethod - e.g. 'cash_on_delivery' | 'khalti'
 * @param {string}   paymentStatus - 'pending' | 'completed'
 */
exports.sendOrderPlacedEmail = async (to, fullName, orderNumber, items, totalAmount, paymentMethod, paymentStatus) => {
  try {
    const transporter = createTransporter();

    const methodLabel = (paymentMethod || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const isPaid = paymentStatus === 'completed';

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    const hasRental = items.some(item => item.type === 'rental');

    const itemRows = items.map(item => {
      const typeTag = item.type === 'rental'
        ? `Rental · ${item.rentalDuration || '?'} days (${fmtDate(item.rentalStartDate)} – ${fmtDate(item.rentalEndDate)})`
        : `Purchase × ${item.quantity || 1}`;
      return `
        <tr>
          <td style="padding:10px 14px; border:1px solid #E5E7EB;">
            <strong>${item.title || 'Book'}</strong><br>
            <span style="color:#6B7280; font-size:12px;">${item.author || ''}</span>
          </td>
          <td style="padding:10px 14px; border:1px solid #E5E7EB; font-size:13px; color:#374151;">${typeTag}</td>
          <td style="padding:10px 14px; border:1px solid #E5E7EB; font-weight:600; text-align:right;">Rs. ${Number(item.subtotal || 0).toFixed(2)}</td>
        </tr>`;
    }).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎉 Order Confirmed — #${orderNumber} — Bookify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
            .wrap { max-width: 620px; margin: 24px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
            .hdr  { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); padding: 36px 30px; text-align: center; }
            .hdr h1 { margin: 0; color: #fff; font-size: 26px; }
            .hdr p  { margin: 8px 0 0; color: #a7f3d0; font-size: 13px; }
            .body { padding: 36px 30px; }
            .hi   { font-size: 16px; color: #111827; margin: 0 0 6px; }
            .sub  { font-size: 14px; color: #6B7280; margin: 0 0 24px; }
            table.items { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px; }
            table.items th { background: #F9FAFB; padding: 10px 14px; border: 1px solid #E5E7EB; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; }
            .totals { background: #F9FAFB; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px; }
            .totals .row { display: flex; justify-content: space-between; font-size: 14px; color: #374151; margin-bottom: 6px; }
            .totals .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; color: #111827; border-top: 1px solid #D1FAE5; padding-top: 10px; margin-top: 4px; }
            .badge { display: inline-block; padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; }
            .badge-paid    { background: #D1FAE5; color: #065f46; }
            .badge-pending { background: #FEF3C7; color: #92400E; }
            .btn  { display: inline-block; background: #10b981; color: #fff !important; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; }
            .ftr  { background: #F9FAFB; padding: 18px 24px; text-align: center; color: #9CA3AF; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hdr">
              <h1>🎉 Order Placed!</h1>
              <p>Thank you for your order. We're getting it ready for you.</p>
            </div>
            <div class="body">
              <p class="hi">Hi <strong>${fullName}</strong>,</p>
              <p class="sub">Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>

              <table class="items">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Type / Details</th>
                    <th style="text-align:right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <div class="totals">
                <div class="row"><span>Total Amount</span><strong>Rs. ${Number(totalAmount).toFixed(2)}</strong></div>
                <div class="row">
                  <span>Payment Method</span>
                  <span>${methodLabel}</span>
                </div>
                <div class="row">
                  <span>Payment Status</span>
                  <span class="badge ${isPaid ? 'badge-paid' : 'badge-pending'}">${isPaid ? '✅ Paid' : '⏳ Pending'}</span>
                </div>
              </div>

              ${hasRental ? `
              <div style="background:#FFFBEB; border-left:4px solid #F59E0B; border-radius:6px; padding:14px 16px; margin-bottom:20px;">
                <p style="margin:0; font-size:13px; color:#92400E;">
                  ⚠️ <strong>Late Return Fine:</strong> A fine of <strong>Rs. 100 per day</strong> will be charged for every day past the return date. Please return the book on time to avoid extra charges.
                </p>
              </div>` : ''}

              <p style="font-size:14px; color:#6B7280; margin-bottom:24px;">
                You can track your order status anytime from your orders page.
                ${!isPaid ? 'For Cash on Delivery orders, payment is collected at the time of delivery.' : ''}
              </p>

              <div style="text-align:center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="btn">View My Orders</a>
              </div>
            </div>
            <div class="ftr">
              © ${new Date().getFullYear()} Bookify — This is an automated confirmation, please do not reply.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${fullName},\n\nYour Bookify order #${orderNumber} has been placed!\n\nItems:\n${items.map(i => `- ${i.title} (${i.type === 'rental' ? `Rental ${i.rentalDuration} days` : `Purchase x${i.quantity}`}) — Rs. ${Number(i.subtotal).toFixed(2)}`).join('\n')}\n\nTotal: Rs. ${Number(totalAmount).toFixed(2)}\nPayment: ${methodLabel} — ${isPaid ? 'Paid' : 'Pending'}\n${hasRental ? '\n⚠️ Late Return Fine: Rs. 100/day will be charged for every day past the return date. Please return on time.\n' : ''}\nView orders: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders\n\n— Bookify`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order placed email sent to ${to} [${orderNumber}]: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send order placed email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

exports.sendOrderUpdateEmail = async (
  to, fullName, orderNumber,
  orderStatus, paymentStatus,
  totalAmount, paymentMethod,
  trackingNumber, trigger = 'order'
) => {
  try {
    const transporter = createTransporter();

    /* ── Order status meta ── */
    const ORDER_META = {
      pending:    { label: 'Pending',    color: '#D97706', bg: '#FEF3C7', icon: '🕐',
                    message: 'Your order has been received and is awaiting processing.' },
      confirmed:  { label: 'Confirmed',  color: '#2563EB', bg: '#EFF6FF', icon: '✅',
                    message: 'Great news! Your order has been confirmed and will be processed shortly.' },
      processing: { label: 'Processing', color: '#7C3AED', bg: '#F5F3FF', icon: '⚙️',
                    message: 'Your order is currently being prepared by our team.' },
      shipped:    { label: 'Shipped',    color: '#1D4ED8', bg: '#EFF6FF', icon: '🚚',
                    message: trackingNumber
                      ? `Your order is on its way! Tracking: <strong>${trackingNumber}</strong>`
                      : 'Your order has been shipped and is on its way!' },
      delivered:  { label: 'Delivered',  color: '#059669', bg: '#ECFDF5', icon: '📦',
                    message: 'Your order has been delivered. Enjoy your books! 🎉' },
      cancelled:  { label: 'Cancelled',  color: '#DC2626', bg: '#FEF2F2', icon: '❌',
                    message: 'Your order has been cancelled. Contact support if this was unexpected.' },
    };

    /* ── Payment status meta ── */
    const PAYMENT_META = {
      pending:   { label: 'Pending',   color: '#D97706', bg: '#FEF3C7', icon: '⏳',
                   message: 'Awaiting payment.' },
      completed: { label: 'Paid ✓',    color: '#059669', bg: '#ECFDF5', icon: '✅',
                   message: 'Payment received and confirmed.' },
      failed:    { label: 'Failed',    color: '#DC2626', bg: '#FEF2F2', icon: '❌',
                   message: 'Payment could not be processed. Please try again.' },
      refunded:  { label: 'Refunded',  color: '#7C3AED', bg: '#F5F3FF', icon: '↩️',
                   message: 'Refund processed (allow 3–5 business days).' },
    };

    const oMeta = ORDER_META[orderStatus]   || { label: orderStatus,   color: '#6B7280', bg: '#F9FAFB', icon: '📋', message: `Order status: ${orderStatus}` };
    const pMeta = PAYMENT_META[paymentStatus] || { label: paymentStatus, color: '#6B7280', bg: '#F9FAFB', icon: '💳', message: `Payment status: ${paymentStatus}` };

    const methodLabel = (paymentMethod || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const headline = trigger === 'payment'
      ? `💳 Payment status updated for your order`
      : `📦 Your order status has been updated`;

    const subjectIcon = trigger === 'payment' ? pMeta.icon : oMeta.icon;
    const subjectLabel = trigger === 'payment'
      ? `Payment ${pMeta.label} — Order #${orderNumber}`
      : `Order ${oMeta.label} — #${orderNumber}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Bookify" <${process.env.EMAIL_USER}>`,
      to,
      subject: `${subjectIcon} ${subjectLabel} — Bookify`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 0; }
            .wrap { max-width: 620px; margin: 24px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
            /* header */
            .hdr { background: linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%); padding: 36px 30px; text-align: center; }
            .hdr h1 { margin: 0; color: #fff; font-size: 24px; letter-spacing: 0.5px; }
            .hdr p  { margin: 8px 0 0; color: #bfdbfe; font-size: 13px; }
            /* body */
            .body { padding: 36px 30px; }
            .hi   { font-size: 16px; color: #111827; margin: 0 0 20px; }
            /* status row */
            .status-row { display: flex; gap: 16px; margin: 0 0 28px; }
            .status-card { flex: 1; border-radius: 10px; padding: 16px; text-align: center; border: 1px solid; }
            .status-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px; }
            .status-card .value { font-size: 17px; font-weight: 800; }
            .status-card .icon  { font-size: 22px; margin-bottom: 4px; }
            /* changed badge */
            .changed-badge { display:inline-block; font-size:10px; background:#fff; border-radius:4px; padding:2px 6px; margin-top:4px; font-weight:700; }
            /* message */
            .msg-box { border-radius: 8px; padding: 14px 18px; margin: 0 0 24px; font-size: 14px; line-height: 1.6; }
            /* info table */
            table.info { width: 100%; border-collapse: collapse; font-size: 14px; }
            table.info td { padding: 9px 14px; border: 1px solid #E5E7EB; }
            table.info td:first-child { background: #F9FAFB; font-weight: 600; color: #374151; width: 38%; }
            /* cta */
            .cta { text-align: center; margin-top: 28px; }
            .btn { display: inline-block; background: #2563EB; color: #fff !important; text-decoration: none; padding: 13px 34px; border-radius: 8px; font-weight: 700; font-size: 15px; }
            /* footer */
            .ftr { background: #F9FAFB; padding: 18px 24px; text-align: center; color: #9CA3AF; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="hdr">
              <h1>📚 Bookify</h1>
              <p>${headline}</p>
            </div>
            <div class="body">
              <p class="hi">Hi <strong>${fullName}</strong>,</p>

              <!-- dual status cards -->
              <div class="status-row">
                <!-- Order Status Card -->
                <div class="status-card" style="background:${oMeta.bg}; border-color:${oMeta.color}; color:${oMeta.color};">
                  <div class="label" style="color:${oMeta.color};">Order Status</div>
                  <div class="icon">${oMeta.icon}</div>
                  <div class="value">${oMeta.label}</div>
                  ${trigger === 'order' ? `<div class="changed-badge" style="color:${oMeta.color}; border:1px solid ${oMeta.color};">Updated</div>` : ''}
                </div>
                <!-- Payment Status Card -->
                <div class="status-card" style="background:${pMeta.bg}; border-color:${pMeta.color}; color:${pMeta.color};">
                  <div class="label" style="color:${pMeta.color};">Payment Status</div>
                  <div class="icon">${pMeta.icon}</div>
                  <div class="value">${pMeta.label}</div>
                  ${trigger === 'payment' ? `<div class="changed-badge" style="color:${pMeta.color}; border:1px solid ${pMeta.color};">Updated</div>` : ''}
                </div>
              </div>

              <!-- contextual message for the changed status -->
              <div class="msg-box" style="background:${trigger === 'payment' ? pMeta.bg : oMeta.bg}; border-left: 4px solid ${trigger === 'payment' ? pMeta.color : oMeta.color}; color:#374151;">
                ${trigger === 'payment' ? pMeta.message : oMeta.message}
              </div>

              <!-- order detail table -->
              <table class="info">
                <tr><td>Order Number</td><td><strong>${orderNumber}</strong></td></tr>
                <tr><td>Order Status</td><td><strong style="color:${oMeta.color};">${oMeta.label}</strong></td></tr>
                <tr><td>Payment Status</td><td><strong style="color:${pMeta.color};">${pMeta.label}</strong></td></tr>
                <tr><td>Payment Method</td><td>${methodLabel}</td></tr>
                <tr><td>Total Amount</td><td><strong>Rs. ${Number(totalAmount).toFixed(2)}</strong></td></tr>
                ${trackingNumber ? `<tr><td>Tracking #</td><td><strong>${trackingNumber}</strong></td></tr>` : ''}
              </table>

              <div class="cta">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" class="btn">View My Orders</a>
              </div>
            </div>
            <div class="ftr">
              © ${new Date().getFullYear()} Bookify — This is an automated notification, please do not reply.
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hi ${fullName},\n\nOrder #${orderNumber} update:\n\nOrder Status:   ${oMeta.label}\nPayment Status: ${pMeta.label}\nPayment Method: ${methodLabel}\nTotal:          Rs. ${Number(totalAmount).toFixed(2)}\n\n${trigger === 'payment' ? pMeta.message : oMeta.message}\n\nView your orders: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders\n\n— Bookify`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order update email sent to ${to} [order:${orderStatus} payment:${paymentStatus}]: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send order update email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};


/**
 * Test email configuration
 */
exports.testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = exports;
