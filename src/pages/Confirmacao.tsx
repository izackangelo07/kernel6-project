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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 py-8 sm:py-16">
      <div className="max-w-2xl w-full text-center space-y-6 sm:space-y-10">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 text-green-600" />
        </div>

        {/* Success Message */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground px-4">
            Solicitação Enviada!
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground px-4">
            Obrigado por contribuir para melhorar nossa comunidade.
          </p>
        </div>

        {/* Registration Details */}
        {registro && (
          <div className="bg-card border-2 border-border rounded-xl p-4 sm:p-6 md:p-8 text-left space-y-3 sm:space-y-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
              Detalhes do Registro:
            </h2>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base md:text-lg">
              <p className="break-words">
                <span className="font-medium text-foreground">Categoria:</span>{" "}
                <span className="text-muted-foreground">{registro.categoria}</span>
              </p>
              <p className="break-words">
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
        <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-8">
          <Button
            size="xl"
            onClick={() => navigate("/")}
            className="w-full min-h-[56px]"
          >
            <Home className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base md:text-lg">Voltar ao Início</span>
          </Button>

          <Button
            variant="secondary"
            size="xl"
            onClick={() => navigate("/ideias")}
            className="w-full min-h-[56px]"
          >
            <Eye className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base md:text-lg">Ver Todas as Solicitações</span>
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground pt-6 sm:pt-8 px-4">
          Seu registro foi enviado para a equipe responsável. 
          Acompanhe o progresso através do QR Code na tela inicial.
        </p>
      </div>
    </div>
  );
};

export default Confirmacao;
