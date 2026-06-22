import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body: { email?: string; password?: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'gauteng@nspinnaclerecruit.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Gauteng@ns81';
  const adminSecret = process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024';

  if (body.email === adminEmail && body.password === adminPassword) {
    return {
      statusCode: 200,
      body: JSON.stringify({ token: adminSecret }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Invalid credentials' }),
  };
};
