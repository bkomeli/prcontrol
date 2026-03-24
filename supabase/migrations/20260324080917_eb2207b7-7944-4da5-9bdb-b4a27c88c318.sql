-- Create activations table
CREATE TABLE public.activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  transportador TEXT NOT NULL,
  cavalo TEXT NOT NULL,
  carreta TEXT NOT NULL,
  lat_long TEXT NOT NULL,
  armado TEXT NOT NULL,
  motivo TEXT NOT NULL,
  autorizado_por TEXT NOT NULL,
  resumo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aguardando equipe',
  equipe TEXT,
  responsavel TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activations ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth for now)
CREATE POLICY "Allow public read" ON public.activations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert" ON public.activations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.activations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_activations_atualizado_em
  BEFORE UPDATE ON public.activations
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activations;