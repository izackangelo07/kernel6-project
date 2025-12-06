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
  imagem_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NovoProblema {
  titulo: string;
  descricao: string;
  categoria: string;
  latitude: number;
  longitude: number;
  imagem_url?: string | null;
}

export interface AtualizarProblema {
  id: string;
  titulo?: string;
  descricao?: string;
  categoria?: string;
  status?: string;
  imagem_url?: string | null;
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

// Hook para atualizar um problema
export const useAtualizarProblema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AtualizarProblema) => {
      const { data, error } = await supabase
        .from("problemas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar problema:", error);
        throw error;
      }

      return data as Problema;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemas"] });
      toast.success("Problema atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar problema:", error);
      toast.error("Erro ao atualizar problema. Tente novamente.");
    },
  });
};

// Hook para excluir um problema
export const useExcluirProblema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("problemas")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir problema:", error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemas"] });
      toast.success("Problema excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir problema:", error);
      toast.error("Erro ao excluir problema. Tente novamente.");
    },
  });
};
