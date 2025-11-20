import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Registrar = () => {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const categorias = [
    "Iluminação pública",
    "Limpeza urbana",
    "Buraco na rua",
    "Áreas verdes / praças",
    "Escola / creche",
    "Segurança",
    "Outro",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoria) {
      toast.error("Por favor, selecione uma categoria");
      return;
    }
    
    if (!descricao.trim()) {
      toast.error("Por favor, descreva o problema");
      return;
    }

    // Store form data temporarily (in a real app, this would go to a database)
    sessionStorage.setItem("registroProblema", JSON.stringify({
      categoria,
      descricao,
      foto: foto?.name || null,
      timestamp: new Date().toISOString()
    }));

    navigate("/confirmacao");
  };

  const handleFotoCapture = () => {
    // In a real implementation, this would open the device camera
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFoto(file);
        toast.success("Foto adicionada com sucesso!");
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-8 md:px-12 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="default"
            onClick={() => navigate("/")}
            className="min-h-[44px]"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-foreground text-center flex-1">
            Registrar Problema
          </h1>
          <div className="w-[60px] sm:w-32" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Form Content */}
      <main className="px-4 sm:px-8 md:px-12 py-6 sm:py-12">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 sm:space-y-10">
          {/* Category Selection */}
          <div className="space-y-3 sm:space-y-4">
            <Label htmlFor="categoria" className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Qual é o tipo de problema?
            </Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger 
                id="categoria" 
                className="h-14 sm:h-16 text-base sm:text-lg md:text-xl bg-card border-2 min-h-[56px]"
              >
                <SelectValue placeholder="Selecione uma categoria..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-2 z-50">
                {categorias.map((cat) => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className="text-base sm:text-lg md:text-xl py-3 sm:py-4 cursor-pointer hover:bg-accent min-h-[44px]"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-3 sm:space-y-4">
            <Label htmlFor="descricao" className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Descreva o problema
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Poste apagado perto da quadra..."
              className="min-h-[150px] sm:min-h-[200px] text-base sm:text-lg md:text-xl p-4 sm:p-6 bg-card border-2 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Adicionar Foto (opcional)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="xl"
              onClick={handleFotoCapture}
              className="w-full border-2 min-h-[56px]"
            >
              <Camera className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base md:text-lg truncate">
                {foto ? `Foto: ${foto.name}` : "Tirar foto agora"}
              </span>
            </Button>
          </div>

          {/* Location Selection */}
          <div className="space-y-3 sm:space-y-4">
            <Label className="text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Onde fica o problema?
            </Label>
            <Button
              type="button"
              variant="outline"
              size="xl"
              onClick={() => navigate("/mapa")}
              className="w-full border-2 min-h-[56px]"
            >
              <MapPin className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base md:text-lg">Marcar no mapa</span>
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="xl"
            className="w-full mt-8 sm:mt-12 bg-green-600 hover:bg-green-700 text-white min-h-[56px] text-base sm:text-lg"
          >
            Enviar Solicitação
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Registrar;
