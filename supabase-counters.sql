-- Run once in Supabase Dashboard > SQL Editor to enable the website counters.
create table if not exists public.site_counters (
  name text primary key check (name in ('visitors', 'downloads')),
  value bigint not null default 0 check (value >= 0)
);

insert into public.site_counters (name, value)
values ('visitors', 0), ('downloads', 0)
on conflict (name) do nothing;

alter table public.site_counters enable row level security;
grant select on public.site_counters to anon, authenticated;

drop policy if exists "Counters are readable by visitors" on public.site_counters;
create policy "Counters are readable by visitors"
  on public.site_counters for select
  to anon, authenticated
  using (true);

create or replace function public.increment_site_counter(counter_name text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_value bigint;
begin
  if counter_name not in ('visitors', 'downloads') then
    raise exception 'Invalid counter name';
  end if;

  insert into public.site_counters as counters (name, value)
  values (counter_name, 1)
  on conflict (name) do update set value = counters.value + 1
  returning value into updated_value;

  return updated_value;
end;
$$;

revoke all on function public.increment_site_counter(text) from public;
grant execute on function public.increment_site_counter(text) to anon, authenticated;
