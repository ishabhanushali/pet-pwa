import nodemailer from "nodemailer";

type SendOtpEmailInput = {
  to: string;
  otp: string;
};

export async function sendOtpEmail({
  to,
  otp,
}: SendOtpEmailInput) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser) {
    throw new Error("GMAIL_USER is not configured.");
  }

  if (!gmailAppPassword) {
    throw new Error("GMAIL_APP_PASSWORD is not configured.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: `"Pet PWA" <${gmailUser}>`,
    to,
    subject: "Your Pet PWA Login OTP",

    text: `Your Pet PWA login OTP is ${otp}. It expires in 5 minutes.`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 24px;
        "
      >
        <h2>🐾 Pet PWA</h2>

        <p>Hello,</p>

        <p>Your verification code is:</p>

        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 24px 0;
          "
        >
          ${otp}
        </div>

        <p>This OTP expires in <strong>5 minutes</strong>.</p>

        <p>
          If you did not request this OTP, you can safely ignore this email.
        </p>

        <hr />

        <p style="font-size: 12px;">
          Pet PWA — Secure Email Verification
        </p>
      </div>
    `,
  });
}