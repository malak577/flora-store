CREATE POLICY "Anyone can upload an order receipt"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'order-receipts');

CREATE POLICY "Admins can view order receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-receipts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-receipts' AND public.has_role(auth.uid(), 'admin'));