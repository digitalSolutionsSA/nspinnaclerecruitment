import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ~100 years — Supabase has no "forever" ban, so this is effectively permanent.
const PERMANENT_BAN = '876000h';

function isAuthorized(event: Parameters<Handler>[0]): boolean {
  const token = event.headers['authorization']?.replace('Bearer ', '');
  const validTokens = [
    process.env.ADMIN_SECRET ?? 'ns-admin-secret-2024',
    process.env.VITE_ADMIN_TOKEN ?? 'ns-admin-secret-2024',
  ];
  return !!token && validTokens.includes(token);
}

// Must match public.normalize_identity() in the database.
function normalizeIdentity(v: string | null | undefined): string | null {
  const n = (v ?? '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return n || null;
}

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!isAuthorized(event)) {
    return json(401, { error: 'Unauthorized' });
  }

  let body: { candidateId?: string; action?: string; reason?: string };
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { candidateId, action } = body;
  const reason = (body.reason ?? '').trim();
  if (!candidateId || (action !== 'block' && action !== 'unblock')) {
    return json(400, { error: 'candidateId and action ("block" or "unblock") are required' });
  }
  if (action === 'block' && !reason) {
    return json(400, { error: 'A reason is required to block a candidate' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  );

  const { data: candidate, error: fetchError } = await supabase
    .from('candidates')
    .select('id, id_number, passport_number')
    .eq('id', candidateId)
    .single();
  if (fetchError || !candidate) {
    return json(404, { error: fetchError?.message ?? 'Candidate not found' });
  }

  // Ban/unban the login first: if this fails, nothing else changes.
  const { error: banError } = await supabase.auth.admin.updateUserById(candidateId, {
    ban_duration: action === 'block' ? PERMANENT_BAN : 'none',
  });
  // A candidate row without a matching auth user can still be blocked by ID/passport.
  if (banError && banError.status !== 404) {
    return json(500, { error: 'Could not update login access: ' + banError.message });
  }

  const { error: clearError } = await supabase.from('blocked_identities').delete().eq('candidate_id', candidateId);
  if (clearError) {
    return json(500, { error: clearError.message });
  }

  let blockedAt: string | null = null;
  if (action === 'block') {
    const rows = [
      { kind: 'account', value: candidateId },
      { kind: 'id_number', value: normalizeIdentity(candidate.id_number) },
      { kind: 'passport', value: normalizeIdentity(candidate.passport_number) },
    ]
      .filter((r): r is { kind: string; value: string } => !!r.value)
      .map(r => ({ ...r, candidate_id: candidateId, reason }));

    const { data: inserted, error: insertError } = await supabase
      .from('blocked_identities')
      .insert(rows)
      .select('created_at');
    if (insertError) {
      return json(500, { error: insertError.message });
    }
    blockedAt = inserted?.[0]?.created_at ?? null;
  }

  const { error: updateError } = await supabase
    .from('candidates')
    .update({ is_blocked: action === 'block' })
    .eq('id', candidateId);
  if (updateError) {
    return json(500, { error: updateError.message });
  }

  return json(200, {
    ok: true,
    is_blocked: action === 'block',
    blocked_reason: action === 'block' ? reason : null,
    blocked_at: action === 'block' ? (blockedAt ?? new Date().toISOString()) : null,
  });
};
