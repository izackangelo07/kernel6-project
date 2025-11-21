import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import communityIllustration from "@/assets/community-illustration.png";
import { HelpCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-3">
          {/* Community Illustration */}
          <div className="w-full flex justify-center">
            <img 
              src={communityIllustration} 
              alt="Ilustração da comunidade" 
              className="w-full max-w-md h-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-foreground leading-tight px-2">
            Conte sua ideia ou problema do bairro
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center px-2">
            Participe e ajude a melhorar nossa comunidade.
          </p>

          {/* Buttons */}
          <div className="w-full max-w-md space-y-3 pt-2 px-2">
            <Button 
              size="lg" 
              className="w-full h-12 sm:h-14"
              onClick={() => navigate("/registrar")}
            >
              Registrar Problema ou Ideia
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full h-12 sm:h-14"
              onClick={() => navigate("/ideias")}
            >
              Ver Ideias da Comunidade
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
              onClick={() => navigate("/painel-sonhos")}
            >
              <span className="mr-2">🌟</span>
              Painel dos Sonhos do Bairro
            </Button>
          </div>
        </div>
      </main>

      {/* Floating Help Button */}
      <button
        onClick={() => navigate("/como-funciona")}
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Como funciona?"
      >
        <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
};

export default Index;
