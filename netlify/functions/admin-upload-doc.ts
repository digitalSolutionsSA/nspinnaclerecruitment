import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'candidate-documents';

function isAuthorized(event: Parameters<Handler>[0]): boolean {
  const token = event.headers['authorization']?.replace('Bearer ', '');
  const validTokens = [
    process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024',
    process.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024',
  ];
  return !!token && validTokens.includes(token);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isAuthorized(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body: {
    action?: 'sign' | 'commit';
    candidateId?: string;
    folder?: string;
    filename?: string;
    field?: string;
    url?: string;
    multi?: boolean;
  };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  if (body.action === 'sign') {
    const { candidateId, folder, filename } = body;
    if (!candidateId || !folder || !filename) {
      return { statusCode: 400, body: JSON.stringify({ error: 'candidateId, folder and filename are required' }) };
    }
    const ext = filename.split('.').pop() ?? 'bin';
    const path = `${candidateId}/${folder}/${Date.now()}-admin.${ext}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      return { statusCode: 500, body: JSON.stringify({ error: error?.message ?? 'Failed to create signed URL' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: data.path, token: data.token }),
    };
  }

  if (body.action === 'commit') {
    const { candidateId, field, url, multi } = body;
    if (!candidateId || !field || !url) {
      return { statusCode: 400, body: JSON.stringify({ error: 'candidateId, field and url are required' }) };
    }

    let newValue = url;
    if (multi) {
      const { data: existing, error: fetchError } = await supabase
        .from('candidates')
        .select(field)
        .eq('id', candidateId)
        .single();
      if (fetchError) {
        return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
      }
      const current = (existing as Record<string, string | null>)?.[field];
      newValue = current ? `${current},${url}` : url;
    }

    const { error } = await supabase.from('candidates').update({ [field]: newValue }).eq('id', candidateId);
    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    };
  }

  return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
};
