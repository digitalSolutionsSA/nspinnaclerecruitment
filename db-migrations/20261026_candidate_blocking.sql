-- Candidate flag/block
--
-- Admins can block a candidate (e.g. trouble in the USA). Blocking:
--   * sets candidates.is_blocked (the auth ban itself is done by the
--     admin-block-candidate Netlify function via the Supabase Admin API)
--   * adds the candidate's ID number and passport number to blocked_identities,
--     so nobody can register or edit a profile to use them again.
-- The reason is kept in blocked_identities (no RLS policies = service role only)
-- so candidates can never read why they were blocked.

alter table public.candidates
  add column if not exists is_blocked boolean not null default false;

-- "8001 015 009 087" / "8001015009087" / "a123-456" all compare equal.
create or replace function public.normalize_identity(v text)
returns text
language sql
immutable
set search_path = ''
as $$
  select nullif(upper(regexp_replace(coalesce(v, ''), '[^A-Za-z0-9]', '', 'g')), '');
$$;

create table if not exists public.blocked_identities (
  id uuid primary key default gen_random_uuid(),
  -- 'account' rows (value = candidate id) record the reason even when the
  -- candidate entered no ID/passport number.
  kind text not null check (kind in ('account', 'id_number', 'passport')),
  value text not null,
  candidate_id uuid references public.candidates(id) on delete set null,
  reason text,
  created_at timestamptz not null default now(),
  unique (kind, value, candidate_id)
);

create index if not exists blocked_identities_lookup on public.blocked_identities (kind, value);

alter table public.blocked_identities enable row level security;
-- Intentionally no policies: only the service role (admin functions) can read/write.

-- Lets the registration page refuse a blocked ID/passport *before* creating the
-- auth account. Returns only true/false.
create or replace function public.is_identity_blocked(p_id_number text, p_passport_number text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocked_identities b
    where (b.kind = 'id_number' and b.value = public.normalize_identity(p_id_number))
       or (b.kind = 'passport'  and b.value = public.normalize_identity(p_passport_number))
  );
$$;

revoke all on function public.is_identity_blocked(text, text) from public;
grant execute on function public.is_identity_blocked(text, text) to anon, authenticated;

-- Hard guard on the candidates table. Applies to every write coming from a
-- candidate (directly or via insert_candidate_profile); admin writes through the
-- service role and direct SQL are not restricted.
create or replace function public.candidates_enforce_block()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '');
begin
  if v_role = 'service_role' or (v_role = '' and session_user <> 'authenticator') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.is_blocked then
      raise exception 'ACCOUNT_BLOCKED' using errcode = 'P0001';
    end if;
    -- Candidates can't change their own block flag.
    new.is_blocked := old.is_blocked;
  else
    new.is_blocked := false;
  end if;

  -- On update, only re-check when the numbers change, so an existing duplicate
  -- profile isn't locked out of unrelated edits (admins see a "Matches blocked" badge).
  if tg_op = 'UPDATE'
     and new.id_number is not distinct from old.id_number
     and new.passport_number is not distinct from old.passport_number then
    return new;
  end if;

  if public.is_identity_blocked(new.id_number, new.passport_number) then
    raise exception 'IDENTITY_BLOCKED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- Trigger-only; not callable through the API.
revoke all on function public.candidates_enforce_block() from public, anon, authenticated;

drop trigger if exists candidates_enforce_block on public.candidates;
create trigger candidates_enforce_block
  before insert or update on public.candidates
  for each row execute function public.candidates_enforce_block();
