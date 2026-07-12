
-- 1) Lock down SECURITY DEFINER helpers: revoke PUBLIC EXECUTE, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_content(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_content(uuid) TO authenticated, service_role;
-- handle_new_user runs as trigger owner via SECURITY DEFINER; keep service_role only
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 2) Tighten "always true" INSERT policies with input sanity constraints
--    (Public forms must still accept anon submissions — keep TO {anon, authenticated}
--     but require non-empty required fields with reasonable length limits.)

-- product_inquiries
DROP POLICY IF EXISTS "inq public insert" ON public.product_inquiries;
DROP POLICY IF EXISTS "inq auth insert" ON public.product_inquiries;
CREATE POLICY "inq public submit" ON public.product_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name))    BETWEEN 1 AND 200
    AND char_length(btrim(email))   BETWEEN 3 AND 320
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone   IS NULL OR char_length(phone)   <= 40)
    AND (company IS NULL OR char_length(company) <= 200)
    AND (product_name IS NULL OR char_length(product_name) <= 200)
    AND status = 'new'
  );

-- job_applications
DROP POLICY IF EXISTS "apps public insert" ON public.job_applications;
DROP POLICY IF EXISTS "apps auth insert" ON public.job_applications;
CREATE POLICY "apps public submit" ON public.job_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(full_name)) BETWEEN 1 AND 200
    AND char_length(btrim(email)) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone         IS NULL OR char_length(phone)         <= 40)
    AND (cover_letter  IS NULL OR char_length(cover_letter)  <= 10000)
    AND (portfolio_url IS NULL OR char_length(portfolio_url) <= 500)
    AND (cv_path       IS NULL OR char_length(cv_path)       <= 500)
    AND status = 'new'
    AND notes IS NULL
  );

-- contact_messages
DROP POLICY IF EXISTS "contact public insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact auth insert" ON public.contact_messages;
CREATE POLICY "contact public submit" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name))    BETWEEN 1 AND 200
    AND char_length(btrim(email))   BETWEEN 3 AND 320
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (phone   IS NULL OR char_length(phone)   <= 40)
    AND (subject IS NULL OR char_length(subject) <= 200)
    AND status = 'new'
  );

-- 3) CV bucket ownership: drop the anon/auth "any path" upload policies.
--    The application flow uses server-signed upload URLs (createSignedUploadUrl
--    via the service role) which bypass storage RLS, so no direct-INSERT policy
--    is required for the /apply form to keep working.
DROP POLICY IF EXISTS "cvs upload anon" ON storage.objects;
DROP POLICY IF EXISTS "cvs upload auth" ON storage.objects;

-- 4) Product bucket read policies must check the parent product's status.
--    Anyone may read files that belong to a PUBLISHED product; admins/content
--    managers keep full access via existing write policies plus these new
--    admin-read policies for drafts.
DROP POLICY IF EXISTS "prod images read all" ON storage.objects;
CREATE POLICY "prod images read published" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1
      FROM public.product_images pi
      JOIN public.products p ON p.id = pi.product_id
      WHERE pi.storage_path = storage.objects.name
        AND p.status = 'published'
    )
  );
CREATE POLICY "prod images read admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.can_manage_content(auth.uid()));

DROP POLICY IF EXISTS "prod docs read all" ON storage.objects;
CREATE POLICY "prod docs read published" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket_id = 'product-documents'
    AND EXISTS (
      SELECT 1
      FROM public.product_documents pd
      JOIN public.products p ON p.id = pd.product_id
      WHERE pd.storage_path = storage.objects.name
        AND p.status = 'published'
    )
  );
CREATE POLICY "prod docs read admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-documents' AND public.can_manage_content(auth.uid()));
