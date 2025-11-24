import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import communityIllustration from "@/assets/community-illustration.png";
import { HelpCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6">
          {/* Community Illustration */}
          <div className="w-full flex justify-center mb-2 sm:mb-4">
            <img 
              src={communityIllustration} 
              alt="Ilustração da comunidade" 
              className="w-full max-w-lg h-auto object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-foreground leading-tight">
            Conte sua ideia ou problema do bairro
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-center max-w-2xl">
            Participe e ajude a melhorar nossa comunidade.
          </p>

          {/* Buttons */}
          <div className="w-full max-w-lg space-y-3 sm:space-y-4 pt-2 sm:pt-4">
            <Button 
              size="lg" 
              className="w-full min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
              onClick={() => navigate("/registrar")}
            >
              Registrar Problema ou Ideia
            </Button>

            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
              onClick={() => navigate("/ideias")}
            >
              Ver Ideias da Comunidade
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full min-h-[48px] sm:min-h-[56px] text-sm sm:text-base bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
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
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 md:w-[60px] md:h-[60px] rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Como funciona?"
      >
        <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
};

export default Index;
