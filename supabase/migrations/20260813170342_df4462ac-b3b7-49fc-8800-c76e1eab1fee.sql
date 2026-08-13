CREATE TABLE public.shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shipping_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_rates TO authenticated;
GRANT ALL ON public.shipping_rates TO service_role;

ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shipping rates" ON public.shipping_rates
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert shipping rates" ON public.shipping_rates
  FOR INSERT TO authenticated WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can update shipping rates" ON public.shipping_rates
  FOR UPDATE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role)) WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can delete shipping rates" ON public.shipping_rates
  FOR DELETE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE TRIGGER shipping_rates_set_updated_at BEFORE UPDATE ON public.shipping_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.shipping_rates (name_en, name_ar, price, sort_order) VALUES
('Cairo','القاهرة',60,1),
('Giza','الجيزة',60,2),
('Alexandria','الإسكندرية',60,3),
('Qalyubia','القليوبية',60,4),
('Port Said','بورسعيد',60,5),
('Suez','السويس',60,6),
('Damietta','دمياط',60,7),
('Dakahlia','الدقهلية',60,8),
('Sharqia','الشرقية',60,9),
('Gharbia','الغربية',60,10),
('Monufia','المنوفية',60,11),
('Beheira','البحيرة',60,12),
('Kafr El Sheikh','كفر الشيخ',60,13),
('Ismailia','الإسماعيلية',60,14),
('Fayoum','الفيوم',60,15),
('Beni Suef','بني سويف',60,16),
('Minya','المنيا',60,17),
('Asyut','أسيوط',60,18),
('Sohag','سوهاج',60,19),
('Qena','قنا',60,20),
('Luxor','الأقصر',60,21),
('Aswan','أسوان',60,22),
('Red Sea','البحر الأحمر',60,23),
('New Valley','الوادي الجديد',60,24),
('Matrouh','مطروح',60,25),
('North Sinai','شمال سيناء',60,26),
('South Sinai','جنوب سيناء',60,27);