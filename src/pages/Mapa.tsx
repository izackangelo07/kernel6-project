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
      <header className="border-b border-border bg-card px-12 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/registrar")}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">
            Marcar Localização
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Map Area */}
      <main className="flex-1 px-12 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <p className="text-2xl text-center text-muted-foreground">
            Toque no mapa para marcar onde está o problema
          </p>

          {/* Interactive Map Placeholder */}
          <div
            onClick={handleMapClick}
            className="relative w-full h-[600px] bg-muted border-4 border-border rounded-xl cursor-crosshair overflow-hidden"
          >
            {/* Map Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-border/30" />
                ))}
              </div>
            </div>

            {/* Center Reference */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl text-muted-foreground/30 font-bold">
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
                <MapPin className="h-16 w-16 text-primary fill-primary drop-shadow-lg" />
              </div>
            )}

            {/* Instructions Overlay */}
            {!selectedLocation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-card/90 border-2 border-border rounded-xl p-8 max-w-md text-center">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-xl text-foreground">
                    Toque em qualquer lugar do mapa para marcar a localização do problema
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button
              variant="outline"
              size="xl"
              onClick={() => setSelectedLocation(null)}
              className="flex-1 border-2"
              disabled={!selectedLocation}
            >
              Limpar Marcação
            </Button>

            <Button
              size="xl"
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedLocation}
            >
              <Check className="mr-3 h-6 w-6" />
              Confirmar Localização
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mapa;
