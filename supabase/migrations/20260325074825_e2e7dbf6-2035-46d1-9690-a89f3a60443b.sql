
CREATE TABLE public.transportadoras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transportadoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read transportadoras" ON public.transportadoras FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert transportadoras" ON public.transportadoras FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public delete transportadoras" ON public.transportadoras FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.motivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.motivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read motivos" ON public.motivos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert motivos" ON public.motivos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public delete motivos" ON public.motivos FOR DELETE TO anon, authenticated USING (true);
