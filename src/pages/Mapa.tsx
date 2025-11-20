import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Check, X, Lightbulb, Trash2, Construction, Trees, School, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Problemas mockados com coordenadas no mapa
const problemasMapa = [
  { id: 1, titulo: "Poste apagado", categoria: "Iluminação pública", x: 25, y: 30, icon: Lightbulb },
  { id: 2, titulo: "Lixo acumulado", categoria: "Limpeza urbana", x: 65, y: 45, icon: Trash2 },
  { id: 3, titulo: "Buraco grande", categoria: "Buraco na rua", x: 50, y: 60, icon: Construction },
  { id: 4, titulo: "Mato alto", categoria: "Áreas verdes / praças", x: 80, y: 25, icon: Trees },
  { id: 5, titulo: "Portão quebrado", categoria: "Escola / creche", x: 40, y: 75, icon: School },
  { id: 6, titulo: "Falta iluminação", categoria: "Segurança", x: 70, y: 70, icon: Shield },
];

const getCategoriaColor = (categoria: string) => {
  const colorMap: Record<string, string> = {
    "Iluminação pública": "bg-yellow-500",
    "Limpeza urbana": "bg-green-500",
    "Buraco na rua": "bg-orange-500",
    "Áreas verdes / praças": "bg-emerald-500",
    "Escola / creche": "bg-blue-500",
    "Segurança": "bg-red-500",
  };
  return colorMap[categoria] || "bg-gray-500";
};

const Mapa = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{ x: number; y: number } | null>(null);
  const [hoveredProblema, setHoveredProblema] = useState<number | null>(null);

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
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
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
            Mapa do Bairro
          </h1>
          <div className="w-[60px] sm:w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
          
          {/* Map Area - Left Side */}
          <div className="flex-1 flex flex-col gap-4">
            <p className="text-sm sm:text-base md:text-lg text-center text-muted-foreground">
              Toque no mapa para marcar onde está o problema
            </p>

            {/* Interactive Map */}
            <div
              onClick={handleMapClick}
              className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-green-50 to-blue-50 border-2 sm:border-4 border-border rounded-xl cursor-crosshair overflow-hidden touch-manipulation shadow-lg"
            >
              {/* Street Grid Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 grid-rows-8 sm:grid-cols-12 sm:grid-rows-12 h-full w-full">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border border-gray-400" />
                  ))}
                </div>
              </div>

              {/* Street Names Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-4 text-xs sm:text-sm font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                  Rua das Flores
                </div>
                <div className="absolute top-[50%] left-4 text-xs sm:text-sm font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                  Rua 12
                </div>
                <div className="absolute top-[75%] left-4 text-xs sm:text-sm font-semibold text-gray-600 bg-white/80 px-2 py-1 rounded">
                  Avenida Principal
                </div>
              </div>

              {/* Existing Problem Markers */}
              {problemasMapa.map((problema) => {
                const Icon = problema.icon;
                const isHovered = hoveredProblema === problema.id;
                
                return (
                  <div
                    key={problema.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    style={{
                      left: `${problema.x}%`,
                      top: `${problema.y}%`,
                    }}
                    onMouseEnter={() => setHoveredProblema(problema.id)}
                    onMouseLeave={() => setHoveredProblema(null)}
                  >
                    {/* Problem Marker */}
                    <div className={`${getCategoriaColor(problema.categoria)} rounded-full p-2 sm:p-3 shadow-lg border-2 border-white transition-transform ${isHovered ? 'scale-125' : 'scale-100'}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-card border-2 border-border rounded-lg p-2 sm:p-3 shadow-xl whitespace-nowrap z-20">
                        <p className="text-xs sm:text-sm font-semibold text-foreground">{problema.titulo}</p>
                        <p className="text-xs text-muted-foreground">{problema.categoria}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* New Location Marker */}
              {selectedLocation && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-full animate-bounce pointer-events-none"
                  style={{
                    left: `${selectedLocation.x}%`,
                    top: `${selectedLocation.y}%`,
                  }}
                >
                  <MapPin className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary fill-primary drop-shadow-lg" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setSelectedLocation(null)}
                className="flex-1 border-2 min-h-[52px]"
                disabled={!selectedLocation}
              >
                <X className="mr-2 h-5 w-5" />
                <span className="text-sm sm:text-base">Cancelar</span>
              </Button>

              <Button
                size="lg"
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700 min-h-[52px]"
                disabled={!selectedLocation}
              >
                <Check className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-sm sm:text-base">Confirmar Localização</span>
              </Button>
            </div>
          </div>

          {/* Side Panel - Right Side */}
          <div className="lg:w-80 xl:w-96 space-y-4 sm:space-y-6">
            {/* Legend Card */}
            <Card className="p-4 sm:p-6 bg-card">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-4">
                Legenda de Categorias
              </h2>
              <div className="space-y-3">
                {[
                  { categoria: "Iluminação pública", icon: Lightbulb },
                  { categoria: "Limpeza urbana", icon: Trash2 },
                  { categoria: "Buraco na rua", icon: Construction },
                  { categoria: "Áreas verdes / praças", icon: Trees },
                  { categoria: "Escola / creche", icon: School },
                  { categoria: "Segurança", icon: Shield },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.categoria} className="flex items-center gap-3">
                      <div className={`${getCategoriaColor(item.categoria)} rounded-full p-2 flex-shrink-0`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground">{item.categoria}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Problems List Card */}
            <Card className="p-4 sm:p-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground">
                  Problemas no Mapa
                </h2>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {problemasMapa.length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {problemasMapa.map((problema) => {
                  const Icon = problema.icon;
                  return (
                    <div
                      key={problema.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredProblema(problema.id)}
                      onMouseLeave={() => setHoveredProblema(null)}
                    >
                      <div className={`${getCategoriaColor(problema.categoria)} rounded-full p-2 flex-shrink-0`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {problema.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {problema.categoria}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ideias")}
                className="w-full mt-4 min-h-[44px]"
              >
                Ver Todos os Problemas
              </Button>
            </Card>

            {/* Instructions Card */}
            <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20">
              <p className="text-xs sm:text-sm text-center text-muted-foreground leading-relaxed">
                <MapPin className="h-4 w-4 inline-block mr-1 text-primary" />
                Toque no mapa para marcar sua localização. Os pontos coloridos mostram problemas já reportados.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mapa;
