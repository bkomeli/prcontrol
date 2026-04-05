
-- Add type and origem columns to activations
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'acionamento';
ALTER TABLE public.activations ADD COLUMN IF NOT EXISTS origem text DEFAULT '';

-- Create vehicles table
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activation_id uuid NOT NULL REFERENCES public.activations(id) ON DELETE CASCADE,
  sm text NOT NULL,
  placa_cavalo text DEFAULT '',
  placa_carreta text DEFAULT '',
  destino text DEFAULT '',
  transportadora text DEFAULT '',
  status text DEFAULT 'Ativo',
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicles
CREATE POLICY "Allow public read vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Allow public insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update vehicles" ON public.vehicles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete vehicles" ON public.vehicles FOR DELETE USING (true);

-- Enable realtime for vehicles
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
