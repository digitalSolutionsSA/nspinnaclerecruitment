import type { Handler } from '@netlify/functions';

function isAuthorized(event: Parameters<Handler>[0]): boolean {
  const token = event.headers['authorization']?.replace('Bearer ', '');
  const validTokens = [
    process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024',
    process.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024',
  ];
  return !!token && validTokens.includes(token);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isAuthorized(event)) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const url = event.queryStringParameters?.url;
  if (!url) {
    return { statusCode: 400, body: 'Missing url parameter' };
  }

  // Only allow fetching from our Supabase storage bucket
  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    return { statusCode: 403, body: 'Forbidden: only Supabase storage URLs allowed' };
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: res.status, body: `Upstream error: ${res.status} ${res.statusText}` };
    }

    const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': contentType },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: `Proxy error: ${String(err)}` };
  }
};
