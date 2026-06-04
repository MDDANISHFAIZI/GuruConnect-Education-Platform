import https from 'https';

export const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[WARNING] RESEND_API_KEY is not defined. Email will not be sent.');
    return { success: false, message: 'API key missing' };
  }

  const payload = JSON.stringify({
    from: 'GuruConnect <onboarding@resend.dev>',
    to,
    subject,
    html
  });

  const options = {
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ success: true, raw: data });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[EMAIL ERROR] Resend request failed:', err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

export const sendVerificationEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="color: #1d4ed8; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Guru<span style="color: #f97316;">Connect</span></h1>
        <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0;">Hyperlocal Tutor Network</p>
      </div>
      
      <div style="padding: 0 10px;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; text-align: center;">Verify Your GuruConnect Account 🚀</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Hello ${name},<br><br>Thank you for signing up on GuruConnect! To complete your registration and secure your account, please enter the following 6-digit verification code:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b; display: inline-block; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="color: #e11d48; font-size: 12px; font-weight: 700; text-align: center; margin-bottom: 24px;">
          ⚠️ This code is only valid for 5 minutes and cannot be reused.
        </p>
        
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 0; text-align: center;">If you did not request this email, please ignore it or contact support.</p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 GuruConnect. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Verify Your GuruConnect Account', html });
};

export const sendForgotPasswordEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
        <h1 style="color: #1d4ed8; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Guru<span style="color: #f97316;">Connect</span></h1>
        <p style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 4px 0 0 0;">Hyperlocal Tutor Network</p>
      </div>
      
      <div style="padding: 0 10px;">
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; text-align: center;">Reset Your GuruConnect Password 🔑</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Hello ${name || 'User'},<br><br>We received a request to reset the password for your GuruConnect account. Please enter the following 6-digit recovery OTP to complete the reset process:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1e293b; display: inline-block; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="color: #e11d48; font-size: 12px; font-weight: 700; text-align: center; margin-bottom: 24px;">
          ⚠️ This code is only valid for 5 minutes and cannot be reused.
        </p>
        
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 0; text-align: center;">If you did not request a password reset, please change your password immediately or contact support.</p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">&copy; 2026 GuruConnect. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Reset Your GuruConnect Password', html });
};
