create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('portfolio','solutions','coverage','faq')),
  sort_order int not null default 0,
  is_published boolean not null default true,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_sections to anon, authenticated;
grant insert, update, delete on public.site_sections to authenticated;
grant all on public.site_sections to service_role;

alter table public.site_sections enable row level security;

create policy "site_sections public read published"
  on public.site_sections for select
  to anon, authenticated
  using (is_published = true);

create policy "site_sections admin read all"
  on public.site_sections for select
  to authenticated
  using (public.can_manage_content(auth.uid()));

create policy "site_sections admin insert"
  on public.site_sections for insert
  to authenticated
  with check (public.can_manage_content(auth.uid()));

create policy "site_sections admin update"
  on public.site_sections for update
  to authenticated
  using (public.can_manage_content(auth.uid()))
  with check (public.can_manage_content(auth.uid()));

create policy "site_sections admin delete"
  on public.site_sections for delete
  to authenticated
  using (public.can_manage_content(auth.uid()));

create index if not exists site_sections_section_idx on public.site_sections(section, sort_order);

drop trigger if exists site_sections_set_updated_at on public.site_sections;
create trigger site_sections_set_updated_at
  before update on public.site_sections
  for each row execute function public.tg_set_updated_at();