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

export async function sendPasswordResetEmail(to: string, otp: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@college.pk'

  await transporter.sendMail({
    from,
    to,
    subject: 'College Portal — Password Reset Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1C1917; border-radius: 12px; color: #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #D4A843; letter-spacing: 0.5px;">College Portal</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Password Reset</p>
        </div>
        <div style="background: #292524; border: 1px solid rgba(180,83,9,0.25); border-radius: 8px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #d1d5db;">
            Use this code to reset your password:
          </p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #D4A843; font-family: monospace; padding: 12px; background: #1C1917; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
            Expires in <strong style="color: #d1d5db;">10 minutes</strong>. Do not share this code.
          </p>
        </div>
        <p style="margin: 24px 0 0; font-size: 11px; color: #4b5563; text-align: center;">
          If you did not request a password reset, please contact the system administrator immediately.
        </p>
      </div>
    `,
  })
}

export async function sendRecoveryEmailVerification(to: string, otp: string): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@college.pk'

  await transporter.sendMail({
    from,
    to,
    subject: 'College Portal — Verify Recovery Email',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1C1917; border-radius: 12px; color: #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 20px; color: #D4A843; letter-spacing: 0.5px;">College Portal</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">Recovery Email Setup</p>
        </div>
        <div style="background: #292524; border: 1px solid rgba(212,168,67,0.20); border-radius: 8px; padding: 24px; text-align: center;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #d1d5db;">
            Verify this address as your recovery email:
          </p>
          <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #D4A843; font-family: monospace; padding: 12px; background: #1C1917; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
            Expires in <strong style="color: #d1d5db;">10 minutes</strong>.
          </p>
        </div>
        <p style="margin: 24px 0 0; font-size: 11px; color: #4b5563; text-align: center;">
          If you did not initiate this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

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

export async function sendStaffWelcomeEmail(opts: {
  to: string;
  firstName: string;
  lastName: string;
  staffCode: string;
  loginEmail: string;
  temporaryPassword: string;
  portalUrl?: string;
}): Promise<void> {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@college.pk'
  const portal = opts.portalUrl ?? process.env.PORTAL_URL ?? 'http://localhost:3000'

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: 'Welcome to the College Portal — Your Login Credentials',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#1C1917;border-radius:12px;color:#e5e7eb;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="margin:0;font-size:22px;color:#D4A843;letter-spacing:0.5px;">College Portal</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Welcome</p>
        </div>

        <p style="font-size:15px;color:#d1d5db;margin-bottom:20px;">
          Hello <strong style="color:#f3f4f6;">${opts.firstName} ${opts.lastName}</strong>,
        </p>
        <p style="font-size:14px;color:#d1d5db;margin-bottom:24px;">
          Your staff account has been created. Use the credentials below to log in to the portal.
        </p>

        <div style="background:#292524;border:1px solid rgba(212,168,67,0.25);border-radius:10px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:8px 12px;color:#9ca3af;width:40%;">Staff Code</td>
              <td style="padding:8px 12px;color:#f3f4f6;font-family:monospace;font-weight:600;">${opts.staffCode}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.06);">
              <td style="padding:8px 12px;color:#9ca3af;">Login Email</td>
              <td style="padding:8px 12px;color:#f3f4f6;font-family:monospace;font-weight:600;">${opts.loginEmail}</td>
            </tr>
            <tr style="border-top:1px solid rgba(255,255,255,0.06);">
              <td style="padding:8px 12px;color:#9ca3af;">Password</td>
              <td style="padding:8px 12px;color:#D4A843;font-family:monospace;font-weight:700;font-size:18px;letter-spacing:2px;">${opts.temporaryPassword}</td>
            </tr>
          </table>
        </div>

        <div style="text-align:center;margin-bottom:24px;">
          <a href="${portal}/login" style="display:inline-block;padding:12px 28px;background:#D4A843;color:#1C1917;font-weight:700;border-radius:8px;text-decoration:none;font-size:14px;">
            Go to Portal →
          </a>
        </div>

        <p style="font-size:12px;color:#6b7280;text-align:center;">
          Please change your password after your first login.<br/>
          If you did not expect this email, contact your administrator.
        </p>
      </div>
    `,
  })
}
