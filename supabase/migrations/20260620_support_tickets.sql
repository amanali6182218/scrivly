-- Support chatbot ticket table — run once in the Supabase SQL Editor.
-- New table only; does not touch any existing table.

create table if not exists support_tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_id text not null,
  user_id text,
  user_email text,
  issue_type text,
  issue_summary text,
  conversation_history jsonb,
  status text default 'open',
  created_at timestamp default now(),
  resolved_at timestamp
);

-- Safe to re-run if the table already existed with fewer columns.
alter table support_tickets add column if not exists issue_summary text;
alter table support_tickets add column if not exists issue_type text;

-- Locked down by default — only the service-role key (used by the
-- /api/chat route) can read/write. No public policies are defined.
alter table support_tickets enable row level security;
