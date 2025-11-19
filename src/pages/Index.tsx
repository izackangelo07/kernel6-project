import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import communityIllustration from "@/assets/community-illustration.png";
import projectLogo from "@/assets/project-logo.png";
import qrCode from "@/assets/qr-code.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-12 pt-16 pb-8">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-8">
          {/* Community Illustration */}
          <div className="w-full flex justify-center">
            <img 
              src={communityIllustration} 
              alt="Ilustração da comunidade" 
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-5xl font-semibold text-center text-foreground leading-tight">
            Conte sua ideia ou problema do bairro
          </h1>

          {/* Subtitle */}
          <p className="text-2xl text-muted-foreground text-center">
            Participe e ajude a melhorar nossa comunidade.
          </p>

          {/* Buttons */}
          <div className="w-full max-w-xl space-y-6 pt-4">
            <Button 
              size="xl" 
              className="w-full"
              onClick={() => navigate("/registrar")}
            >
              Registrar Problema ou Ideia
            </Button>

            <Button 
              variant="secondary" 
              size="xl" 
              className="w-full"
              onClick={() => navigate("/ideias")}
            >
              Ver Ideias da Comunidade
            </Button>
          </div>

          {/* Help Link */}
          <button
            onClick={() => navigate("/como-funciona")}
            className="text-primary text-lg underline-offset-4 hover:underline transition-colors mt-6"
          >
            Como funciona?
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-12 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div>
            <img 
              src={projectLogo} 
              alt="Logo do projeto" 
              className="h-28 w-auto object-contain"
            />
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-3">
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="h-40 w-40 object-contain"
            />
            <p className="text-sm text-muted-foreground text-center">
              Use no seu celular
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
