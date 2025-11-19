import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, Eye } from "lucide-react";
import { useEffect, useState } from "react";

const Confirmacao = () => {
  const navigate = useNavigate();
  const [registro, setRegistro] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("registroProblema");
    if (data) {
      setRegistro(JSON.parse(data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-12 py-16">
      <div className="max-w-2xl w-full text-center space-y-10">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="h-32 w-32 text-green-600" />
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground">
            Solicitação Enviada!
          </h1>
          <p className="text-2xl text-muted-foreground">
            Obrigado por contribuir para melhorar nossa comunidade.
          </p>
        </div>

        {/* Registration Details */}
        {registro && (
          <div className="bg-card border-2 border-border rounded-xl p-8 text-left space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Detalhes do Registro:
            </h2>
            <div className="space-y-3 text-lg">
              <p>
                <span className="font-medium text-foreground">Categoria:</span>{" "}
                <span className="text-muted-foreground">{registro.categoria}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">Descrição:</span>{" "}
                <span className="text-muted-foreground">{registro.descricao}</span>
              </p>
              {registro.foto && (
                <p>
                  <span className="font-medium text-foreground">Foto:</span>{" "}
                  <span className="text-muted-foreground">Anexada</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-6 pt-8">
          <Button
            size="xl"
            onClick={() => navigate("/")}
            className="w-full"
          >
            <Home className="mr-3 h-6 w-6" />
            Voltar ao Início
          </Button>

          <Button
            variant="secondary"
            size="xl"
            onClick={() => navigate("/ideias")}
            className="w-full"
          >
            <Eye className="mr-3 h-6 w-6" />
            Ver Todas as Solicitações
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-lg text-muted-foreground pt-8">
          Seu registro foi enviado para a equipe responsável. 
          Acompanhe o progresso através do QR Code na tela inicial.
        </p>
      </div>
    </div>
  );
};

export default Confirmacao;
