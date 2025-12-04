-- Função para promover primeiro usuário a admin (só funciona se não houver admins)
CREATE OR REPLACE FUNCTION public.promote_first_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Verificar se já existe algum admin
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    -- Atualizar role do usuário para admin
    UPDATE public.user_roles SET role = 'admin' WHERE user_id = _user_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;