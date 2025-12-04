-- Adicionar política para admins poderem excluir problemas
CREATE POLICY "Admins podem excluir problemas"
ON public.problemas FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));