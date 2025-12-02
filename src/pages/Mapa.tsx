import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Check, X, Lightbulb, Trash2, Construction, Trees, School, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordenadas base do bairro (centro aproximado)
const CENTER_LAT = -23.5505;
const CENTER_LNG = -46.6333;

// Problemas mockados com coordenadas reais (lat, lng)
const problemasMapa = [
  { id: 1, titulo: "Poste apagado", categoria: "Iluminação pública", lat: -23.5485, lng: -46.6310, icon: Lightbulb },
  { id: 2, titulo: "Lixo acumulado", categoria: "Limpeza urbana", lat: -23.5520, lng: -46.6350, icon: Trash2 },
  { id: 3, titulo: "Buraco grande", categoria: "Buraco na rua", lat: -23.5510, lng: -46.6330, icon: Construction },
  { id: 4, titulo: "Mato alto", categoria: "Áreas verdes / praças", lat: -23.5495, lng: -46.6365, icon: Trees },
  { id: 5, titulo: "Portão quebrado", categoria: "Escola / creche", lat: -23.5530, lng: -46.6320, icon: School },
  { id: 6, titulo: "Falta iluminação", categoria: "Segurança", lat: -23.5515, lng: -46.6355, icon: Shield },
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

// Criar ícones customizados para cada categoria
const createCustomIcon = (categoria: string) => {
  const colorMap: Record<string, string> = {
    "Iluminação pública": "#eab308",
    "Limpeza urbana": "#22c55e",
    "Buraco na rua": "#f97316",
    "Áreas verdes / praças": "#10b981",
    "Escola / creche": "#3b82f6",
    "Segurança": "#ef4444",
  };
  
  const color = colorMap[categoria] || "#6b7280";
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Ícone para nova localização
const newLocationIcon = L.divIcon({
  className: 'new-location-marker',
  html: `<div style="color: hsl(var(--primary)); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Componente para capturar cliques no mapa
function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const Mapa = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hoveredProblema, setHoveredProblema] = useState<number | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    toast.success("Localização marcada no mapa!");
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
              Clique no mapa para marcar onde está o problema
            </p>

            {/* React Leaflet Map */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-border">
              <MapContainer
                center={[CENTER_LAT, CENTER_LNG]}
                zoom={16}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marcadores dos problemas existentes */}
                {problemasMapa.map((problema) => {
                  const Icon = problema.icon;
                  return (
                    <Marker
                      key={problema.id}
                      position={[problema.lat, problema.lng]}
                      icon={createCustomIcon(problema.categoria)}
                      eventHandlers={{
                        mouseover: () => setHoveredProblema(problema.id),
                        mouseout: () => setHoveredProblema(null),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`${getCategoriaColor(problema.categoria)} rounded-full p-1.5`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-semibold text-sm">{problema.titulo}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{problema.categoria}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Marcador da nova localização */}
                {selectedLocation && (
                  <Marker
                    position={[selectedLocation.lat, selectedLocation.lng]}
                    icon={newLocationIcon}
                  >
                    <Popup>
                      <div className="p-2 text-center">
                        <p className="font-semibold text-sm">Nova Localização</p>
                        <p className="text-xs text-muted-foreground">Clique em "Confirmar" para continuar</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Componente para capturar cliques */}
                <LocationMarker onLocationSelect={handleLocationSelect} />
              </MapContainer>
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
                Clique no mapa para marcar sua localização. Os pontos coloridos mostram problemas já reportados.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mapa;