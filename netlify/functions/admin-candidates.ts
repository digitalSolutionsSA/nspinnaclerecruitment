import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers['authorization']?.replace('Bearer ', '');
  const validTokens = [
    process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024',
    process.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024',
  ];

  if (!token || !validTokens.includes(token)) {
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

  // Block reasons live in blocked_identities (service-role only), not on the candidate row.
  const { data: blocks, error: blocksError } = await supabase
    .from('blocked_identities')
    .select('candidate_id, reason, created_at');

  if (blocksError) {
    return { statusCode: 500, body: JSON.stringify({ error: blocksError.message }) };
  }

  const blockByCandidate = new Map<string, { reason: string | null; created_at: string }>();
  for (const b of blocks ?? []) {
    if (b.candidate_id && !blockByCandidate.has(b.candidate_id)) blockByCandidate.set(b.candidate_id, b);
  }

  const result = (data ?? []).map(c => {
    const block = blockByCandidate.get(c.id);
    return { ...c, blocked_reason: block?.reason ?? null, blocked_at: block?.created_at ?? null };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  };
};
