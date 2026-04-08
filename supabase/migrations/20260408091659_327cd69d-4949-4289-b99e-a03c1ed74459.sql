
DROP POLICY "System can create invoices" ON public.invoices;
CREATE POLICY "Hosts and travelers can create invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    traveler_id = auth.uid() 
    OR host_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );
