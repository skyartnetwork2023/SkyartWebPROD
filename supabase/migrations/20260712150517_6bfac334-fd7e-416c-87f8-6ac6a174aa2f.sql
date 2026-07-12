
drop policy if exists "newsletter public subscribe" on public.newsletter_subscribers;
create policy "newsletter public subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (
    email is not null
    and length(email) between 5 and 320
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and is_active = true
  );
