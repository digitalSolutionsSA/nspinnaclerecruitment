// Messages shown to candidates who have been blocked by NS Pinnacle staff.
// Deliberately vague: the reason is staff-only.

export const ACCOUNT_BLOCKED_MSG =
  'This account has been suspended. Please contact NS Pinnacle Recruit if you believe this is a mistake.';

export const REGISTRATION_BLOCKED_MSG =
  'We are unable to accept this registration. Please contact NS Pinnacle Recruit for assistance.';

// Maps the errors raised by the candidates_enforce_block database trigger
// (and Supabase's "user_banned" auth error) to friendly text.
export function friendlyBlockError(message: string): string {
  if (message.includes('IDENTITY_BLOCKED')) return REGISTRATION_BLOCKED_MSG;
  if (message.includes('ACCOUNT_BLOCKED')) return ACCOUNT_BLOCKED_MSG;
  return message;
}
