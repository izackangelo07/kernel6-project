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
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 pt-8 sm:pt-16 pb-8">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-4 sm:space-y-8">
          {/* Community Illustration */}
          <div className="w-full flex justify-center">
            <img 
              src={communityIllustration} 
              alt="Ilustração da comunidade" 
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center text-foreground leading-tight px-4">
            Conte sua ideia ou problema do bairro
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground text-center px-4">
            Participe e ajude a melhorar nossa comunidade.
          </p>

          {/* Buttons */}
          <div className="w-full max-w-xl space-y-4 sm:space-y-6 pt-4 px-4">
            <Button 
              size="xl" 
              className="w-full min-h-[56px]"
              onClick={() => navigate("/registrar")}
            >
              Registrar Problema ou Ideia
            </Button>

            <Button 
              variant="secondary" 
              size="xl" 
              className="w-full min-h-[56px]"
              onClick={() => navigate("/ideias")}
            >
              Ver Ideias da Comunidade
            </Button>

            <Button 
              variant="outline" 
              size="xl" 
              className="w-full min-h-[56px] bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
              onClick={() => navigate("/painel-sonhos")}
            >
              <span className="mr-2">🌟</span>
              Painel dos Sonhos do Bairro
            </Button>
          </div>

          {/* Help Link */}
          <button
            onClick={() => navigate("/como-funciona")}
            className="text-primary text-base sm:text-lg underline-offset-4 hover:underline transition-colors mt-4 sm:mt-6"
          >
            Como funciona?
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 sm:px-8 md:px-12 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
          {/* Logo */}
          <div className="order-1 sm:order-1">
            <img 
              src={projectLogo} 
              alt="Logo do projeto" 
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
            />
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-2 sm:space-y-3 order-2 sm:order-2">
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 object-contain"
            />
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Use no seu celular
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
