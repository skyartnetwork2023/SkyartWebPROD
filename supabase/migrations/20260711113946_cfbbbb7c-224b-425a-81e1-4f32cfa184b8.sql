
-- product-images: content managers manage, anyone can read (we sign URLs client-side)
CREATE POLICY "prod images read all" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "prod images write cm" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.can_manage_content(auth.uid()));
CREATE POLICY "prod images update cm" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.can_manage_content(auth.uid()));
CREATE POLICY "prod images delete cm" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.can_manage_content(auth.uid()));

CREATE POLICY "prod docs read all" ON storage.objects FOR SELECT USING (bucket_id = 'product-documents');
CREATE POLICY "prod docs write cm" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-documents' AND public.can_manage_content(auth.uid()));
CREATE POLICY "prod docs update cm" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-documents' AND public.can_manage_content(auth.uid()));
CREATE POLICY "prod docs delete cm" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-documents' AND public.can_manage_content(auth.uid()));

-- CVs: applicants upload (anon+auth), only admins can read
CREATE POLICY "cvs upload anon" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "cvs upload auth" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "cvs admin read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND public.is_admin(auth.uid()));
CREATE POLICY "cvs admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cvs' AND public.is_admin(auth.uid()));
