-- device_fingerprint and signup_ip were referenced throughout the codebase
-- (app/api/auth/signup, check-fingerprint, check-ip, referral track-signup)
-- but were never actually added to the profiles table. The signup route's
-- UPDATE silently no-ops without these columns (no error checking), and any
-- SELECT that names them explicitly fails outright — which is why the
-- referral anti-abuse check returned "Profile not found" for valid users.

alter table profiles
  add column if not exists device_fingerprint text,
  add column if not exists signup_ip text;

create index if not exists idx_profiles_device_fingerprint on profiles(device_fingerprint);
create index if not exists idx_profiles_signup_ip on profiles(signup_ip);
