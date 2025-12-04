import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import communityIllustration from "@/assets/community-illustration.png";
import { HelpCircle, LogIn, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with auth buttons - Responsivo */}
      <header className="border-b border-border bg-card px-3 sm:px-6 md:px-8 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[40%]">
            {user && profile && (
              <span className="truncate">Olá, {profile.nome}</span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                disabled={isLoading}
              >
                <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Ocupa toda altura restante */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4 sm:space-y-5 md:space-y-6">
            
            {/* Community Illustration - Responsivo */}
            <div className="w-full flex justify-center px-2 sm:px-4">
              <img 
                src={communityIllustration} 
                alt="Ilustração da comunidade" 
                className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] h-auto object-contain"
              />
            </div>

            {/* Title - Responsivo */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-foreground leading-tight px-2">
              Conte sua ideia ou problema do bairro
            </h1>

            {/* Subtitle - Responsivo */}
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center max-w-md sm:max-w-lg px-2">
              Participe e ajude a melhorar nossa comunidade.
            </p>

            {/* Buttons - Responsivo e ocupa toda largura disponível */}
            <div className="w-full space-y-3 sm:space-y-4 pt-2 sm:pt-4 px-2 sm:px-0">
              <Button 
                size="lg" 
                className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg"
                onClick={() => navigate("/registrar")}
              >
                Registrar Problema ou Ideia
              </Button>

              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg"
                onClick={() => navigate("/ideias")}
              >
                Ver Ideias da Comunidade
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200"
                onClick={() => navigate("/painel-sonhos")}
              >
                <span className="mr-2">🌟</span>
                Painel dos Sonhos do Bairro
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Help Button - Responsivo */}
      <button
        onClick={() => navigate("/como-funciona")}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        aria-label="Como funciona?"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
      </button>
    </div>
  );
};

export default Index;
