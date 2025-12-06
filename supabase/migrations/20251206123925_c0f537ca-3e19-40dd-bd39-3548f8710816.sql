-- Adicionar coluna de imagem à tabela problemas
ALTER TABLE public.problemas ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- Criar bucket para imagens dos problemas
INSERT INTO storage.buckets (id, name, public)
VALUES ('problemas-images', 'problemas-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload público de imagens
CREATE POLICY "Qualquer pessoa pode fazer upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'problemas-images');

-- Política para visualização pública de imagens
CREATE POLICY "Imagens são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'problemas-images');

-- Política para admins excluírem imagens
CREATE POLICY "Admins podem excluir imagens"
ON storage.objects FOR DELETE
USING (bucket_id = 'problemas-images' AND has_role(auth.uid(), 'admin'::app_role));