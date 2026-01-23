import nodemailer from 'nodemailer';

export const sendContactEmail = async (req, res) => {
  const { name, email, message, recipients } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = recipients && recipients.length > 0
      ? recipients.join(',')
      : process.env.EMAIL_FROM;

    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Contact Form Message',
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`,
    });

    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email.' });
  }
};
