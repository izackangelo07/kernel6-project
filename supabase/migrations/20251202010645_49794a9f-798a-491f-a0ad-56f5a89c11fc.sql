-- Criar tabela de problemas/ideias
CREATE TABLE public.problemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  votos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_problemas_categoria ON public.problemas(categoria);
CREATE INDEX idx_problemas_status ON public.problemas(status);
CREATE INDEX idx_problemas_created_at ON public.problemas(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_problemas_updated_at
  BEFORE UPDATE ON public.problemas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.problemas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS públicas (todos podem ler, criar e atualizar)
CREATE POLICY "Qualquer pessoa pode visualizar problemas"
  ON public.problemas
  FOR SELECT
  USING (true);

CREATE POLICY "Qualquer pessoa pode criar problemas"
  ON public.problemas
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode atualizar problemas"
  ON public.problemas
  FOR UPDATE
  USING (true);

-- Inserir dados iniciais de exemplo
INSERT INTO public.problemas (titulo, descricao, categoria, latitude, longitude, status, votos) VALUES
  ('Poste apagado', 'Poste de iluminação apagado há 3 dias na esquina da rua', 'Iluminação pública', -23.5485, -46.6310, 'pendente', 12),
  ('Lixo acumulado', 'Acúmulo de lixo na calçada prejudicando a passagem', 'Limpeza urbana', -23.5520, -46.6350, 'em_analise', 8),
  ('Buraco grande', 'Buraco profundo na pista causando risco para veículos', 'Buraco na rua', -23.5510, -46.6330, 'aprovado', 25),
  ('Mato alto', 'Vegetação alta na praça dificultando uso do espaço', 'Áreas verdes / praças', -23.5495, -46.6365, 'pendente', 5),
  ('Portão quebrado', 'Portão de acesso quebrado comprometendo a segurança', 'Escola / creche', -23.5530, -46.6320, 'em_analise', 15),
  ('Falta iluminação', 'Rua escura sem iluminação adequada', 'Segurança', -23.5515, -46.6355, 'aprovado', 30);