ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS stock integer,
  ADD COLUMN IF NOT EXISTS size text;