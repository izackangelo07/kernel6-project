import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useProblemas } from "@/hooks/useProblemas";
import { useResponsive } from "@/hooks/useResponsive";

// Ícone customizado para cada categoria
const createCustomIcon = (categoria: string, isSelected: boolean = false, isMobile: boolean = false) => {
  const colorMap: Record<string, string> = {
    "Iluminação pública": "#eab308",
    "Limpeza urbana": "#22c55e",
    "Buraco na rua": "#f97316",
    "Áreas verdes / praças": "#10b981",
    "Escola / creche": "#3b82f6",
    "Segurança": "#ef4444",
  };

  const color = colorMap[categoria] || "#6b7280";
  const size = isSelected ? (isMobile ? 36 : 44) : (isMobile ? 24 : 32);
  const innerSize = isSelected ? (isMobile ? 12 : 16) : (isMobile ? 8 : 12);
  const borderWidth = isSelected ? 4 : 2;
  const shadow = isSelected ? "0 4px 12px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.2)";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: ${borderWidth}px solid white; 
      box-shadow: ${shadow}; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
    ">
      <div style="width: ${innerSize}px; height: ${innerSize}px; background: white; border-radius: 50%;"></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    </style>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

const MapaDetalhe = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { data: problemas = [], isLoading } = useProblemas();
  const { isMobile } = useResponsive();

  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const focusId = searchParams.get("id");

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: isMobile ? 16 : 17,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, isMobile]);

  // Adicionar marcadores dos problemas
  useEffect(() => {
    if (!mapRef.current || isLoading || problemas.length === 0) return;

    const map = mapRef.current;

    problemas.forEach((problema) => {
      const isSelected = focusId === problema.id;
      
      const marker = L.marker([problema.latitude, problema.longitude], {
        icon: createCustomIcon(problema.categoria, isSelected, isMobile),
        zIndexOffset: isSelected ? 1000 : 0,
      }).addTo(map);

      const popupContent = `
        <div style="padding: 4px 2px; max-width: ${isMobile ? '180px' : '220px'};">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-weight: 600; font-size: ${isMobile ? '12px' : '13px'};">${problema.titulo}</span>
          </div>
          <span style="font-size: ${isMobile ? '10px' : '11px'}; color: #4b5563;">${problema.categoria}</span>
          <div style="margin-top: 4px; font-size: ${isMobile ? '10px' : '11px'}; color: #6b7280;">
            <span>Status: ${problema.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Abrir popup do problema selecionado
      if (isSelected) {
        setTimeout(() => marker.openPopup(), 300);
      }
    });
  }, [problemas, isLoading, focusId, isMobile]);

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Header simples */}
      <header className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="min-h-[40px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Mapa ocupando todo o espaço */}
      <main className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
      </main>
    </div>
  );
};

export default MapaDetalhe;
