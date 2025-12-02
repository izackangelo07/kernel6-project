import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Problema {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  status: string;
  votos: number;
  created_at: string;
  updated_at: string;
}

export interface NovoProblema {
  titulo: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
}

// Hook para buscar todos os problemas
export const useProblemas = () => {
  return useQuery({
    queryKey: ["problemas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("problemas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar problemas:", error);
        throw error;
      }

      return data as Problema[];
    },
  });
};

// Hook para criar um novo problema
export const useCriarProblema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (novoProblema: NovoProblema) => {
      const { data, error } = await supabase
        .from("problemas")
        .insert([novoProblema])
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar problema:", error);
        throw error;
      }

      return data as Problema;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemas"] });
      toast.success("Problema registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar problema:", error);
      toast.error("Erro ao registrar problema. Tente novamente.");
    },
  });
};

// Hook para atualizar votos de um problema
export const useAtualizarVotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, votos }: { id: string; votos: number }) => {
      const { data, error } = await supabase
        .from("problemas")
        .update({ votos })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar votos:", error);
        throw error;
      }

      return data as Problema;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemas"] });
    },
  });
};
