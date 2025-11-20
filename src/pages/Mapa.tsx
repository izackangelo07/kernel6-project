import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Mapa = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{ x: number; y: number } | null>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSelectedLocation({ x, y });
    toast.success("Localização marcada!");
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      sessionStorage.setItem("localizacaoProblema", JSON.stringify(selectedLocation));
      navigate("/registrar");
    } else {
      toast.error("Por favor, marque um local no mapa");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-8 md:px-12 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="default"
            onClick={() => navigate("/registrar")}
            className="min-h-[44px]"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-foreground text-center flex-1">
            Marcar Localização
          </h1>
          <div className="w-[60px] sm:w-32" />
        </div>
      </header>

      {/* Map Area */}
      <main className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
          <p className="text-base sm:text-xl md:text-2xl text-center text-muted-foreground px-4">
            Toque no mapa para marcar onde está o problema
          </p>

          {/* Interactive Map Placeholder */}
          <div
            onClick={handleMapClick}
            className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-muted border-2 sm:border-4 border-border rounded-xl cursor-crosshair overflow-hidden touch-manipulation"
          >
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-8 sm:grid-cols-12 sm:grid-rows-12 h-full w-full">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-border/30" />
                ))}
              </div>
            </div>

            {/* Center Reference */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-muted-foreground/30 font-bold text-center px-4">
                MAPA DO BAIRRO
              </div>
            </div>

            {/* Selected Location Marker */}
            {selectedLocation && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-full animate-bounce"
                style={{
                  left: `${selectedLocation.x}%`,
                  top: `${selectedLocation.y}%`,
                }}
              >
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary fill-primary drop-shadow-lg" />
              </div>
            )}

            {/* Instructions Overlay */}
            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <div className="bg-card/90 border-2 border-border rounded-xl p-4 sm:p-6 md:p-8 max-w-md text-center">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground">
                    Toque em qualquer lugar do mapa para marcar a localização do problema
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Button
              variant="outline"
              size="xl"
              onClick={() => setSelectedLocation(null)}
              className="flex-1 border-2 min-h-[56px]"
              disabled={!selectedLocation}
            >
              <span className="text-sm sm:text-base md:text-lg">Limpar Marcação</span>
            </Button>

            <Button
              size="xl"
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 min-h-[56px]"
              disabled={!selectedLocation}
            >
              <Check className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base md:text-lg">Confirmar Localização</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mapa;
