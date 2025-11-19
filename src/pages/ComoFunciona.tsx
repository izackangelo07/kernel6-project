import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ComoFunciona = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-12">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Voltar
        </Button>

        <h1 className="text-5xl font-bold text-foreground mb-8">
          Como Funciona?
        </h1>

        <div className="space-y-6 text-lg text-muted-foreground">
          <p>
            Este totem permite que você participe ativamente da melhoria do seu bairro.
          </p>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              1. Registrar um Problema ou Ideia
            </h2>
            <p>
              Use o botão "Registrar Problema ou Ideia" para compartilhar suas sugestões 
              ou reportar problemas no bairro.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              2. Ver Ideias da Comunidade
            </h2>
            <p>
              Explore o que outros moradores estão sugerindo e veja as iniciativas 
              em andamento.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              3. Acompanhe pelo Celular
            </h2>
            <p>
              Escaneie o QR Code na tela inicial para acessar a plataforma 
              pelo seu celular e acompanhar o progresso das ideias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComoFunciona;
