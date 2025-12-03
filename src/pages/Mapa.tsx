import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Check, X, Lightbulb, Trash2, Construction, Trees, School, Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useProblemas } from "@/hooks/useProblemas";

// Coordenadas base do bairro (centro aproximado)
const CENTER_LAT = -23.5505;
const CENTER_LNG = -46.6333;

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

// Ícone customizado para cada categoria
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
    className: "custom-marker",
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
  className: "new-location-marker",
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

const getCategoriaIcon = (categoria: string) => {
  const iconMap: Record<string, any> = {
    "Iluminação pública": Lightbulb,
    "Limpeza urbana": Trash2,
    "Buraco na rua": Construction,
    "Áreas verdes / praças": Trees,
    "Escola / creche": School,
    "Segurança": Shield,
  };
  return iconMap[categoria] || MapPin;
};

const Mapa = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { data: problemas = [], isLoading } = useProblemas();

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const newLocationMarkerRef = useRef<L.Marker | null>(null);
  const problemMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Inicializa o mapa Leaflet
    const map = L.map(mapContainerRef.current, {
      center: [CENTER_LAT, CENTER_LNG],
      zoom: 16,
      zoomControl: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);


    // Clique no mapa para selecionar nova localização
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });

      if (newLocationMarkerRef.current) {
        map.removeLayer(newLocationMarkerRef.current);
      }

      const marker = L.marker([lat, lng], { icon: newLocationIcon }).addTo(map);
      newLocationMarkerRef.current = marker;

      marker.bindPopup(
        `<div style="padding: 4px 2px; text-align: center; max-width: 220px;">
          <p style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Nova Localização</p>
          <p style="font-size: 11px; color: #4b5563;">Clique em \"Confirmar\" para continuar</p>
        </div>`
      );
      marker.openPopup();

      toast.success("Localização marcada no mapa!");
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Adicionar marcadores dos problemas quando os dados forem carregados
  useEffect(() => {
    if (!mapRef.current || isLoading || problemas.length === 0) return;

    const map = mapRef.current;

    // Limpar marcadores anteriores
    problemMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    problemMarkersRef.current = [];

    // Adicionar novos marcadores
    problemas.forEach((problema) => {
      const marker = L.marker([problema.latitude, problema.longitude], {
        icon: createCustomIcon(problema.categoria),
      }).addTo(map);

      const popupContent = `
        <div style="padding: 4px 2px; max-width: 220px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="background: #00000022; border-radius: 999px; padding: 4px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 12px;">•</span>
            </div>
            <span style="font-weight: 600; font-size: 13px;">${problema.titulo}</span>
          </div>
          <span style="font-size: 11px; color: #4b5563;">${problema.categoria}</span>
          <div style="margin-top: 4px; font-size: 11px; color: #6b7280;">
            <span>Status: ${problema.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("mouseover", function () {
        this.openPopup();
      });
      marker.on("mouseout", function () {
        this.closePopup();
      });

      problemMarkersRef.current.push(marker);
    });
  }, [problemas, isLoading]);

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

            {/* Leaflet Map */}
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-border">
              <div ref={mapContainerRef} className="w-full h-full" />
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
