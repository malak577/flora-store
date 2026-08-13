CREATE TABLE public.products (
  id text PRIMARY KEY,
  brand text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  name_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  usage_en text,
  usage_ar text,
  ingredients_en text,
  ingredients_ar text,
  benefits_en text[] NOT NULL DEFAULT '{}',
  benefits_ar text[] NOT NULL DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  sale_price numeric,
  image text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT 'instant',
  rating numeric,
  review_count integer,
  badge text,
  best_seller boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role)) WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_products_sort ON public.products (sort_order, created_at);

INSERT INTO public.products (id, brand, name_en, name_ar, description_en, description_ar, usage_en, usage_ar, ingredients_en, ingredients_ar, benefits_en, benefits_ar, price, sale_price, image, availability, rating, review_count, badge, best_seller, sort_order) VALUES
('cerave-foaming-cleanser','CeraVe','Foaming Facial Cleanser','غسول رغوي للوجه','Gentle foaming cleanser for normal to oily skin with ceramides and niacinamide.','غسول رغوي لطيف للبشرة العادية إلى الدهنية مع السيراميدات والنياسيناميد.',NULL,NULL,NULL,NULL,ARRAY['Removes excess oil','Restores skin barrier','Non-comedogenic']::text[],ARRAY['يزيل الزيوت الزائدة','يعيد بناء حاجز البشرة','لا يسد المسام']::text[],850,720,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop','instant',4.8,342,NULL,true,0),
('cerave-moisturizing-cream','CeraVe','Moisturizing Cream','كريم مرطب','24-hour hydration for dry to very dry skin.','ترطيب على مدار 24 ساعة للبشرة الجافة إلى الجافة جداً.',NULL,NULL,NULL,NULL,ARRAY['Deep hydration','Ceramides 1, 3, 6-II','Hyaluronic acid']::text[],ARRAY['ترطيب عميق','سيراميدات ١، ٣، ٦','حمض الهيالورونيك']::text[],1200,NULL,'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop','instant',4.9,512,NULL,true,1),
('ordinary-niacinamide','The Ordinary','Niacinamide 10% + Zinc 1%','نياسيناميد ١٠٪ + زنك ١٪','High-strength vitamin & mineral blemish formula.','تركيبة عالية التركيز من الفيتامينات والمعادن لعلاج العيوب.',NULL,NULL,NULL,NULL,ARRAY['Reduces blemishes','Balances sebum','Minimizes pores']::text[],ARRAY['يقلل العيوب','يوازن إفراز الزيوت','يقلص المسام']::text[],520,450,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop','instant',4.7,891,NULL,true,2),
('ordinary-hyaluronic','The Ordinary','Hyaluronic Acid 2% + B5','حمض الهيالورونيك ٢٪ + ب٥','Multi-depth hydration serum.','سيروم ترطيب متعدد المستويات.',NULL,NULL,NULL,NULL,ARRAY['Plumps skin','Deep hydration','Lightweight texture']::text[],ARRAY['يملأ البشرة','ترطيب عميق','قوام خفيف']::text[],480,NULL,'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800&auto=format&fit=crop','preorder',4.6,428,'new',false,3),
('ordinary-retinol','The Ordinary','Retinol 0.5% in Squalane','ريتينول ٠.٥٪ في السكوالين','Anti-aging serum with pure retinol.','سيروم لمكافحة الشيخوخة بالريتينول النقي.',NULL,NULL,NULL,NULL,ARRAY['Reduces fine lines','Smooths texture','Evens tone']::text[],ARRAY['يقلل الخطوط الدقيقة','ينعم الملمس','يوحد اللون']::text[],690,NULL,'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&auto=format&fit=crop','instant',4.8,267,NULL,false,4),
('vichy-mineral-89','Vichy','Minéral 89 Booster','بوستر مينرال ٨٩','Fortifying and plumping daily booster.','بوستر يومي لتقوية وامتلاء البشرة.',NULL,NULL,NULL,NULL,ARRAY['Strengthens barrier','Plumping effect','Volcanic water']::text[],ARRAY['يقوي حاجز البشرة','تأثير ممتلئ','ماء بركاني']::text[],1650,1450,'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&auto=format&fit=crop','instant',4.9,623,NULL,true,5),
('vichy-liftactiv','Vichy','Liftactiv Vitamin C','ليفتاكتيف فيتامين سي','15% pure vitamin C brightening serum.','سيروم تفتيح بفيتامين سي النقي ١٥٪.',NULL,NULL,NULL,NULL,ARRAY['Brightens skin','Antioxidant protection','Firms skin']::text[],ARRAY['يفتح البشرة','حماية مضادة للأكسدة','يشد البشرة']::text[],2100,NULL,'https://images.unsplash.com/photo-1608248511-6c37b9c40b3f?w=800&auto=format&fit=crop','preorder',4.7,189,'new',false,6),
('laroche-effaclar','La Roche-Posay','Effaclar Duo+','إيفاكلار ديو+','Corrective unclogging care for blemish-prone skin.','علاج تصحيحي للبشرة المعرضة للعيوب.',NULL,NULL,NULL,NULL,ARRAY['Reduces blemishes','Unclogs pores','Prevents marks']::text[],ARRAY['يقلل العيوب','يفتح المسام','يمنع الآثار']::text[],980,NULL,'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop','instant',4.6,305,NULL,false,7),
('laroche-anthelios','La Roche-Posay','Anthelios SPF 50+ Sunscreen','أنثيليوس واقي شمس SPF 50+','Ultra-light fluid, invisible finish.','سائل خفيف جداً بلمسة نهائية غير مرئية.',NULL,NULL,NULL,NULL,ARRAY['Very high UVA/UVB protection','Non-greasy','Water resistant']::text[],ARRAY['حماية عالية جداً','غير دهني','مقاوم للماء']::text[],1350,1150,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format&fit=crop','instant',4.9,748,NULL,true,8),
('bioderma-sensibio','Bioderma','Sensibio H2O Micellar Water','ماء ميسيلار سينسيبيو','Gentle cleansing and makeup removing water for sensitive skin.','ماء تنظيف لطيف ومزيل مكياج للبشرة الحساسة.',NULL,NULL,NULL,NULL,ARRAY['Removes makeup','Soothes sensitive skin','No rinse required']::text[],ARRAY['يزيل المكياج','يهدئ البشرة الحساسة','لا يتطلب شطف']::text[],890,NULL,'https://images.unsplash.com/photo-1585652757141-8837d90b72d4?w=800&auto=format&fit=crop','instant',4.8,456,NULL,false,9),
('eucerin-hyaluron','Eucerin','Hyaluron-Filler Day Cream','كريم نهاري هيالورون فيلر','Anti-age filler day care with SPF 15.','كريم نهاري لمكافحة التجاعيد مع SPF 15.',NULL,NULL,NULL,NULL,ARRAY['Fills wrinkles','Long-lasting hydration','SPF 15']::text[],ARRAY['يملأ التجاعيد','ترطيب طويل الأمد','حماية SPF 15']::text[],1800,NULL,'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&auto=format&fit=crop','preorder',4.5,142,'new',false,10),
('avene-thermal','Avène','Thermal Spring Water','ماء الينابيع الحراري','Soothing spray for sensitive and irritated skin.','بخاخ مهدئ للبشرة الحساسة والمتهيجة.',NULL,NULL,NULL,NULL,ARRAY['Soothes irritation','Reduces redness','Sets makeup']::text[],ARRAY['يهدئ التهيج','يقلل الاحمرار','يثبت المكياج']::text[],650,550,'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop','instant',4.7,289,NULL,false,11);