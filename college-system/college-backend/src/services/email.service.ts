import nodemailer from 'nodemailer'

// ─── Transporter (created once) ───────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// ─── Send OTP Email ───────────────────────────────────────────────────────────

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@college.pk'

  await transporter.sendMail({
    from,
    to,
    subject: 'College Portal — Backup Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f1923; border-radius: 12px; color: #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #d4a843; letter-spacing: 0.5px;">College Portal</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Backup Verification</p>
        </div>

        <div style="background: #1a2634; border: 1px solid rgba(212, 168, 67, 0.2); border-radius: 8px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #d1d5db;">
            Your verification code is:
          </p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #d4a843; font-family: monospace; padding: 12px; background: #0f1923; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
            This code expires in <strong style="color: #d1d5db;">10 minutes</strong>.
          </p>
        </div>

        <p style="margin: 24px 0 0; font-size: 11px; color: #4b5563; text-align: center;">
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
