import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Email Google Bapak
      pass: process.env.EMAIL_PASS, // App Password Google
    },
  });

  await transporter.sendMail({
    from: `"JITU DIGITAL" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};