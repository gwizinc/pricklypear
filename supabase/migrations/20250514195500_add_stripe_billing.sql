-- Billing-related additions
alter table profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_current_period_end timestamptz,
  add column if not exists subscription_id text;

create table if not exists payments (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  stripe_invoice_id text,
  amount integer,
  status text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists stripe_events (
  id text primary key,
  type text,
  payload jsonb,
  received_at timestamptz default now()
);
