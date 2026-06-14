-- Run this once in the Supabase SQL editor before using
-- app/api/codes/assign/route.js

-- Track which redeem code was assigned to which Etsy buyer/order
alter table redeem_codes
  add column if not exists reserved_for_email text,
  add column if not exists order_id text,
  add column if not exists reserved_at timestamptz;

-- Fulfillment log for Etsy orders processed by Make.com
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  lemon_squeezy_order_id text unique not null,
  purchase_type text not null,
  plan_name text not null,
  credits_added integer not null,
  amount_paid numeric not null default 0,
  status text not null,
  created_at timestamptz not null default now()
);
