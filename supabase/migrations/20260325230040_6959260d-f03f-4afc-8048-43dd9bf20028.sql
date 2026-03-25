CREATE TABLE public.equipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_em timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL
);

ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read equipes" ON public.equipes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert equipes" ON public.equipes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public delete equipes" ON public.equipes FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.equipes (nome) VALUES ('MIKE'), ('ATIVA'), ('RECOVERY'), ('FOCUS'), ('VELOX');

ALTER PUBLICATION supabase_realtime ADD TABLE public.equipes;