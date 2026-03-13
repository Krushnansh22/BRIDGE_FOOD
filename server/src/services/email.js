import nodemailer from 'nodemailer';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendVerificationEmail(email, token) {
  if (!process.env.EMAIL_USER) return; // Skip in dev if not configured
  const transporter = createTransporter();
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/v1/auth/verify/${token}`;
  await transporter.sendMail({
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your FoodBridge account',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`,
  });
}

export async function sendPasswordResetEmail(email, token) {
  if (!process.env.EMAIL_USER) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your FoodBridge password',
    html: `<p>Your password reset token: <strong>${token}</strong><br>Expires in 1 hour.</p>`,
  });
}

export async function sendNGOApprovalEmail(email, name) {
  if (!process.env.EMAIL_USER) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"FoodBridge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your FoodBridge NGO account is approved!',
    html: `<p>Congratulations ${name}! Your NGO account has been approved. You can now browse and request food donations.</p>`,
  });
}
