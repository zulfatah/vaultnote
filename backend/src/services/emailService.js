const { transporter } = require('../config/mailer');

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your VaultNote email',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Verify your VaultNote email:</p><p><a href=\"${verifyUrl}\">${verifyUrl}</a></p>`,
  });
}

module.exports = { sendVerificationEmail };
