
-- Storage policies for site-images (holds blog docs + images)
CREATE POLICY "site-images read all" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-images');
CREATE POLICY "site-images write cm" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.can_manage_content(auth.uid()));
CREATE POLICY "site-images update cm" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.can_manage_content(auth.uid()));
CREATE POLICY "site-images delete cm" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.can_manage_content(auth.uid()));

-- Allow super admins to delete audit logs
CREATE POLICY "audit_logs delete super" ON public.audit_logs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
