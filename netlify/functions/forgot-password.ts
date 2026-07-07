import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? 'NS Pinnacle Recruit <noreply@nspinnacle.co.za>';

function siteUrl(event: Parameters<Handler>[0]): string {
  const origin = event.headers['origin'] || event.headers['Origin'];
  if (origin) return origin;
  const host = event.headers['host'] || event.headers['Host'];
  return `https://${host}`;
}

export const handler: Handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: { email?: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const email = body.email?.trim().toLowerCase();
  // Always return a generic success message, even if the email doesn't
  // exist or something fails — avoids leaking which emails are registered.
  const genericResponse = {
    statusCode: 200,
    body: JSON.stringify({ ok: true, message: 'If that email is registered, a reset link has been sent.' }),
  };

  if (!email) return genericResponse;

  let actionLink: string;
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );

    const redirectTo = `${siteUrl(event)}/reset-password`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });

    if (error || !data?.properties?.action_link) {
      console.error('generateLink error:', error?.message);
      return genericResponse;
    }

    actionLink = data.properties.action_link;
  } catch (err) {
    console.error('forgot-password: failed to generate reset link:', err);
    return genericResponse;
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
    <div style="background:#1a4b8c;padding:28px 32px">
      <h1 style="margin:0;color:#fff;font-size:22px">NS Pinnacle Recruit</h1>
      <p style="margin:6px 0 0;color:#c8d8f0;font-size:14px">Password Reset Request</p>
    </div>
    <div style="padding:32px">
      <p style="font-size:15px;color:#333;margin:0 0 16px">Hi,</p>
      <p style="font-size:15px;color:#333;margin:0 0 24px">
        We received a request to reset the password for your NS Pinnacle Recruit candidate profile. Click the button below to choose a new password.
      </p>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${actionLink}" style="display:inline-block;background:#1a4b8c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;font-size:15px">Reset Your Password</a>
      </div>
      <p style="font-size:13px;color:#888;margin:0 0 8px">
        This link will expire shortly for security reasons. If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size:12px;color:#aaa;margin:0">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${actionLink}" style="color:#1a4b8c;word-break:break-all">${actionLink}</a>
      </p>
    </div>
    <div style="background:#f0f4f8;padding:16px 32px;font-size:12px;color:#888;text-align:center">
      NS Pinnacle Recruit · <a href="mailto:gauteng@nspinnaclerecruit.com" style="color:#1a4b8c">gauteng@nspinnaclerecruit.com</a>
    </div>
  </div>
</body>
</html>`;

  const { error: sendError } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Reset your NS Pinnacle Recruit password',
    html,
  });

  if (sendError) {
    console.error('Resend password-reset email error:', sendError);
  }

  return genericResponse;
};
