-- Remove a política permissiva de UPDATE
DROP POLICY IF EXISTS "Qualquer pessoa pode atualizar problemas" ON public.problemas;

-- Criar nova política que permite UPDATE apenas para admins
CREATE POLICY "Apenas admins podem atualizar problemas" 
ON public.problemas 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));