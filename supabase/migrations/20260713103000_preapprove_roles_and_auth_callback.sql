-- Pre-approve user roles by email before signup completes
create table if not exists public.preapproved_user_roles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create unique index if not exists preapproved_user_roles_email_role_active_uidx
  on public.preapproved_user_roles (lower(email), role)
  where used_at is null;

grant select, insert, delete on public.preapproved_user_roles to authenticated;
grant all on public.preapproved_user_roles to service_role;

alter table public.preapproved_user_roles enable row level security;

create policy "super admins manage preapproved roles"
  on public.preapproved_user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- Update signup trigger to apply pre-approved roles for matching email
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare role_count int;
begin
  insert into public.profiles (id, email, full_name)
  values (
    NEW.id,
    NEW.email,
    coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );

  select count(*) into role_count from public.user_roles;
  if role_count = 0 then
    insert into public.user_roles (user_id, role) values (NEW.id, 'super_admin');
  else
    insert into public.user_roles (user_id, role)
    select NEW.id, p.role
    from public.preapproved_user_roles p
    where lower(p.email) = lower(NEW.email)
      and p.used_at is null
    on conflict (user_id, role) do nothing;
  end if;

  update public.preapproved_user_roles
  set used_at = now()
  where lower(email) = lower(NEW.email)
    and used_at is null;

  return NEW;
end; $$;
