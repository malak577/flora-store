CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX brands_name_en_key ON public.brands (lower(name_en));

GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert brands" ON public.brands FOR INSERT TO authenticated WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can update brands" ON public.brands FOR UPDATE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role)) WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
CREATE POLICY "Admins can delete brands" ON public.brands FOR DELETE TO authenticated USING (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE TRIGGER brands_set_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.brands (name_en, name_ar)
SELECT DISTINCT trim(brand), trim(brand) FROM public.products WHERE trim(coalesce(brand,'')) <> ''
ON CONFLICT DO NOTHING;

ALTER TABLE public.products ADD COLUMN brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

UPDATE public.products p SET brand_id = b.id FROM public.brands b WHERE lower(trim(p.brand)) = lower(b.name_en);

CREATE INDEX products_brand_id_idx ON public.products (brand_id);