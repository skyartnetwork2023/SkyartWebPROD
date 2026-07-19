
alter table public.site_sections drop constraint if exists site_sections_section_check;
alter table public.site_sections add constraint site_sections_section_check
  check (section in ('portfolio','solutions','coverage','faq','packages','services','contact','blog'));

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_subscribers_email_uidx
  on public.newsletter_subscribers (lower(email));

grant select on public.newsletter_subscribers to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;

alter table public.newsletter_subscribers enable row level security;

create policy "newsletter public subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "newsletter admin read"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.can_manage_content(auth.uid()));

create policy "newsletter admin update"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.can_manage_content(auth.uid()))
  with check (public.can_manage_content(auth.uid()));

create policy "newsletter admin delete"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.can_manage_content(auth.uid()));
