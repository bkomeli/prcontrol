
-- Add new columns to activations
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '';
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS sinistro BOOLEAN DEFAULT false;
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS pacotes INTEGER DEFAULT 0;
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS cidade TEXT DEFAULT '';

-- Activity log table
CREATE TABLE public.activation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id UUID REFERENCES public.activations(id) ON DELETE CASCADE NOT NULL,
  acao TEXT NOT NULL,
  detalhes TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read logs" ON public.activation_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert logs" ON public.activation_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Enable realtime for logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activation_logs;
