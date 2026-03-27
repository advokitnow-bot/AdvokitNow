// lib/mail.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendFirmRegistrationMail({ to, ownerName, firmName, firmCode }: any) {

    const html = `
    <div style="margin:0; padding:0; background:#f5f6fa; font-family:'Segoe UI', Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" 
        style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden;
        box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background:#2563eb; padding:20px; text-align:center; color:white;">
            <h1 style="margin:0; font-size:26px;">🚀 AdvokitNow</h1>
            <p style="margin:0; opacity:0.9;">Legal Case & Firm Management Simplified</p>
          </td>
        </tr>
  
        <!-- Welcome Title -->
        <tr>
          <td style="padding:25px;">
            <h2 style="color:#111; margin-bottom:10px;">Hello ${ownerName},</h2>
            <p style="font-size:15px; color:#555;">
              🎉 Your firm <b style="color:#2563eb;">${firmName}</b> has been successfully registered
              on <b>AdvokitNow</b>. Welcome to a smarter & organized legal workspace.
            </p>
          </td>
        </tr>
  
        <!-- Code Box -->
        <tr>
          <td style="padding:10px 25px;">
            <p style="color:#555; font-size:15px; margin-bottom:6px;">Your secure referral code is:</p>
  
            <div style="background:#eef4ff; color:#2563eb; font-size:20px; 
              font-weight:bold; letter-spacing:2px; padding:14px; text-align:center;
              border-radius:8px;">
              ${firmCode}
            </div>
  
            <p style="font-size:13px; color:#444; margin-top:10px;">
              🔗 Employees can use this code during registration to join your firm workspace.
            </p>
          </td>
        </tr>
  
        <!-- Confidentiality Notice -->
        <tr>
          <td style="padding:20px 25px;">
            <div style="background:#fff6e5; border-left:4px solid #f59e0b; padding:12px; border-radius:6px;">
              <p style="margin:0; font-size:13px; color:#8a5900;">
                ⚠ <b>Confidential Notice:</b> This referral code grants access to your legal firm's internal workspace. 
                Please share it only with trusted and verified employees. AdvokitNow will not be responsible for unauthorized usage.
              </p>
            </div>
          </td>
        </tr>
  
        <!-- Footer Section -->
        <tr>
          <td style="padding:25px; text-align:center; background:#f8f9fc;">
            <p style="margin:0; font-size:13px; color:#555;">
              Need assistance? Our support team is always available.
            </p>
            <p style="font-size:13px; margin:4px 0 0; color:#555;">
              📧 support@advokitnow.com | 🌐 www.advokitnow.com
            </p>
            <p style="margin-top:12px; font-size:11px; color:#999;">
              © ${new Date().getFullYear()} AdvokitNow — All Rights Reserved
            </p>
          </td>
        </tr>
      </table>
    </div>
    `;
  
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `🎉 Firm Successfully Registered — ${firmName}`,
      html,
    });
  }
  
