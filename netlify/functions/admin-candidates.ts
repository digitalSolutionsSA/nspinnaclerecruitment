import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers['authorization']?.replace('Bearer ', '');
  const adminSecret = process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024';

  if (token !== adminSecret) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
