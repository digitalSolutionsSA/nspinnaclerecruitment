import type { Handler } from '@netlify/functions';
import https from 'https';
import http from 'http';

function isAuthorized(event: Parameters<Handler>[0]): boolean {
  const token = event.headers['authorization']?.replace('Bearer ', '');
  const validTokens = [
    process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024',
    process.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024',
  ];
  return !!token && validTokens.includes(token);
}

function fetchBytes(url: string): Promise<{ status: number; contentType: string; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () =>
        resolve({
          status: res.statusCode ?? 0,
          contentType: res.headers['content-type'] ?? '',
          buffer: Buffer.concat(chunks),
        })
      );
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
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

  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    return { statusCode: 403, body: 'Forbidden: only Supabase storage URLs allowed' };
  }

  try {
    const { status, contentType, buffer } = await fetchBytes(url);
    if (status < 200 || status >= 300) {
      return { statusCode: status, body: `Upstream error: ${status}` };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': contentType || 'application/octet-stream' },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: `Proxy error: ${String(err)}` };
  }
};
