import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Check, X, Lightbulb, Trash2, Construction, Trees, School, Shield, Search, Locate } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useProblemas } from "@/hooks/useProblemas";
import { debounce } from "lodash";
import { useResponsive } from "@/hooks/useResponsive";

// Coordenadas de Recife
const RECIFE_LAT = -8.0301;
const RECIFE_LNG = -34.9120;

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
const createCustomIcon = (categoria: string, isMobile: boolean = false) => {
  const colorMap: Record<string, string> = {
    "Iluminação pública": "#eab308",
    "Limpeza urbana": "#22c55e",
    "Buraco na rua": "#f97316",
    "Áreas verdes / praças": "#10b981",
    "Escola / creche": "#3b82f6",
    "Segurança": "#ef4444",
  };

  const color = colorMap[categoria] || "#6b7280";
  const size = isMobile ? 24 : 32;
  const innerSize = isMobile ? 8 : 12;

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
      <div style="width: ${innerSize}px; height: ${innerSize}px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
};

// Ícone para nova localização
const createNewLocationIcon = (isMobile: boolean = false) => {
  const size = isMobile ? 32 : 40;
  
  return L.divIcon({
    className: "new-location-marker",
    html: `<div style="color: hsl(var(--primary)); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  });
};

// Função para fazer reverse geocoding usando Nominatim
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'pt-BR',
          'User-Agent': 'SuaAplicacao/1.0'
        }
      }
    );
    const data = await response.json();
    
    if (data.display_name) {
      const parts = data.display_name.split(',');
      return parts.slice(0, 3).join(',').trim();
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Erro no geocoding:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Função para buscar autocomplete usando Nominatim
const searchAddress = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&viewbox=-35.2,-8.2,-34.6,-7.9&bounded=1&countrycodes=br&accept-language=pt-BR`,
      {
        headers: {
          'User-Agent': 'SuaAplicacao/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Falha na busca');
    
    const data: SearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.error("Erro no autocomplete:", error);
    return [];
  }
};

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

const Mapa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const { data: problemas = [], isLoading } = useProblemas();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Estados para a barra de pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const newLocationMarkerRef = useRef<L.Marker | null>(null);
  const problemMarkersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // Pegar parâmetros de URL
  const focusLat = searchParams.get('lat');
  const focusLng = searchParams.get('lng');
  const focusId = searchParams.get('id');

  // Função debounced para busca
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const results = await searchAddress(query);
      setSearchResults(results);
      setIsSearching(false);
      setShowResults(true);
    }, 300),
    []
  );

  // Efeito para buscar quando a query mudar
  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  // Função para localizar usuário
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 16);
            toast.success("Localização encontrada!");
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          toast.error("Não foi possível obter sua localização");
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo navegador");
    }
  };

  // Função para lidar com seleção de um resultado
  const handleSelectResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    if (mapRef.current) {
      const zoomLevel = isMobile ? 16 : 17;
      mapRef.current.setView([lat, lng], zoomLevel);
      
      if (searchMarkerRef.current) {
        mapRef.current.removeLayer(searchMarkerRef.current);
      }
      
      if (newLocationMarkerRef.current) {
        mapRef.current.removeLayer(newLocationMarkerRef.current);
        newLocationMarkerRef.current = null;
        setSelectedLocation(null);
        setAddress("");
      }
      
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'search-marker',
          html: `<div style="background-color: #3b82f6; width: ${isMobile ? '20px' : '24px'}; height: ${isMobile ? '20px' : '24px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
          iconSize: isMobile ? [20, 20] : [24, 24],
          iconAnchor: isMobile ? [10, 10] : [12, 12],
        })
      }).addTo(mapRef.current);
      
      searchMarkerRef.current = marker;
      
      setLoadingAddress(true);
      const enderecoCompleto = await reverseGeocode(lat, lng);
      setAddress(enderecoCompleto);
      setSelectedLocation({ lat, lng });
      setLoadingAddress(false);
      
      const popupContent = `
        <div style="padding: ${isMobile ? '6px' : '8px'}; max-width: ${isMobile ? '200px' : '250px'};">
          <p style="font-weight: 600; font-size: ${isMobile ? '12px' : '14px'}; margin-bottom: 4px; color: #3b82f6;">
            📍 Localização Encontrada
          </p>
          <p style="font-size: ${isMobile ? '11px' : '12px'}; color: #4b5563; margin-bottom: 4px;">
            ${result.display_name.split(',')[0]}
          </p>
          <p style="font-size: ${isMobile ? '10px' : '11px'}; color: #9ca3af;">
            Clique em "Confirmar" para usar este local
          </p>
        </div>
      `;
      
      marker.bindPopup(popupContent).openPopup();
      
      setSearchQuery(result.display_name);
      setSearchResults([]);
      setShowResults(false);
      
      toast.success("Localização encontrada e selecionada!");
    }
  };

  // Função para limpar a busca
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    
    if (searchMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
  };

  // Efeito inicial do mapa
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const initialLat = focusLat ? parseFloat(focusLat) : RECIFE_LAT;
    const initialLng = focusLng ? parseFloat(focusLng) : RECIFE_LNG;
    const initialZoom = focusLat && focusLng ? (isMobile ? 15 : 16) : (isMobile ? 13 : 14);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
      dragging: !isMobile,
      tap: isMobile,
      touchZoom: isMobile,
      scrollWheelZoom: !isMobile,
    });

    mapRef.current = map;

    // Adicionar controles de zoom customizados
    L.control.zoom({
      position: isMobile ? 'bottomright' : 'topright'
    }).addTo(map);

    // Adicionar camada do mapa
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      minZoom: 10,
    }).addTo(map);

    // Clique no mapa para selecionar nova localização
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
      setLoadingAddress(true);

      if (searchMarkerRef.current) {
        map.removeLayer(searchMarkerRef.current);
        searchMarkerRef.current = null;
      }

      if (newLocationMarkerRef.current) {
        map.removeLayer(newLocationMarkerRef.current);
      }

      const marker = L.marker([lat, lng], { 
        icon: createNewLocationIcon(isMobile) 
      }).addTo(map);
      
      newLocationMarkerRef.current = marker;

      const endereco = await reverseGeocode(lat, lng);
      setAddress(endereco);
      setLoadingAddress(false);

      marker.bindPopup(
        `<div style="padding: 4px 2px; text-align: center; max-width: ${isMobile ? '180px' : '250px'};">
          <p style="font-weight: 600; font-size: ${isMobile ? '12px' : '13px'}; margin-bottom: 4px;">📍 Nova Localização</p>
          <p style="font-size: ${isMobile ? '10px' : '11px'}; color: #4b5563; margin-bottom: 4px; word-wrap: break-word;">${endereco}</p>
          <p style="font-size: ${isMobile ? '9px' : '10px'}; color: #9ca3af;">Clique em "Confirmar" para continuar</p>
        </div>`
      );
      
      if (isDesktop) {
        marker.openPopup();
      }

      toast.success("Localização marcada no mapa!");
    };

    map.on("click", handleMapClick);

    // Adicionar botão de localização customizado
    const locateControl = L.control({ position: 'topleft' });
    locateControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = `
        <a href="#" title="Minha Localização" style="display: flex; align-items: center; justify-content: center; width: ${isMobile ? '36px' : '44px'}; height: ${isMobile ? '36px' : '44px'}; background: white; border-radius: 4px; border: 2px solid rgba(0,0,0,0.2);">
          <svg width="${isMobile ? '20' : '24'}" height="${isMobile ? '20' : '24'}" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
            <path d="M12 22c-3.04 0-5.5-2.46-5.5-5.5S8.96 11 12 11s5.5 2.46 5.5 5.5S15.04 22 12 22z"/>
            <path d="M12 8V3M8 12H3M12 16v5M16 12h5"/>
          </svg>
        </a>
      `;
      
      L.DomEvent.on(div, 'click', function(e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        locateUser();
      });
      
      return div;
    };
    locateControl.addTo(map);

    return () => {
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, [focusLat, focusLng, isMobile]);

  // Adicionar marcadores dos problemas
  useEffect(() => {
    if (!mapRef.current || isLoading || problemas.length === 0) return;

    const map = mapRef.current;

    problemMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    problemMarkersRef.current = [];

    problemas.forEach((problema) => {
      const marker = L.marker([problema.latitude, problema.longitude], {
        icon: createCustomIcon(problema.categoria, isMobile),
      }).addTo(map);

      const popupContent = `
        <div style="padding: 4px 2px; max-width: ${isMobile ? '180px' : '220px'};">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <div style="background: #00000022; border-radius: 999px; padding: 3px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: ${isMobile ? '10px' : '12px'};">•</span>
            </div>
            <span style="font-weight: 600; font-size: ${isMobile ? '12px' : '13px'};">${problema.titulo}</span>
          </div>
          <span style="font-size: ${isMobile ? '10px' : '11px'}; color: #4b5563;">${problema.categoria}</span>
          <div style="margin-top: 4px; font-size: ${isMobile ? '10px' : '11px'}; color: #6b7280;">
            <span>Status: ${problema.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (focusId && problema.id === focusId) {
        marker.openPopup();
      }

      if (!isMobile) {
        marker.on("mouseover", function () {
          this.openPopup();
        });
        marker.on("mouseout", function () {
          if (focusId !== problema.id) {
            this.closePopup();
          }
        });
      }

      marker.on("click", function () {
        if (isMobile) {
          this.openPopup();
        }
      });

      problemMarkersRef.current.push(marker);
    });
  }, [problemas, isLoading, focusId, isMobile]);

  const handleConfirm = () => {
    if (selectedLocation) {
      sessionStorage.setItem("localizacaoProblema", JSON.stringify({
        ...selectedLocation,
        endereco: address
      }));
      navigate("/registrar");
    } else {
      toast.error("Por favor, marque um local no mapa");
    }
  };

  const handleCancel = () => {
    if (newLocationMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(newLocationMarkerRef.current);
      newLocationMarkerRef.current = null;
    }
    
    if (searchMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
    
    setSelectedLocation(null);
    setAddress("");
  };

  // Efeito para fechar resultados quando clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Legenda de categorias
  const LegendContent = () => (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">
        📍 Legenda do Mapa
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className={`${getCategoriaColor(item.categoria)} rounded-full p-2`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">{item.categoria}</span>
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t">
        <p className="text-sm font-medium text-foreground mb-2">Como usar:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Toque/clique no mapa para marcar um local</li>
          <li>• Use a busca para encontrar endereços</li>
          <li>• Confirme a localização quando estiver pronto</li>
          {isMobile && (
            <li>• Use os botões no mapa para navegar</li>
          )}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate(-1)}
            className="min-h-[40px] sm:min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center flex-1 truncate">
            Mapa
          </h1>
          
          {/* Espaçador para alinhamento */}
          <div className="w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-4 sm:gap-6">
          {/* 🌍 Container do Mapa */}
          <div className="relative w-full rounded-lg overflow-hidden shadow-lg border border-border">
            <div 
              ref={mapContainerRef} 
              className={`w-full ${
                isMobile ? 'h-[55vh]' : 
                isTablet ? 'h-[60vh]' : 
                'h-[65vh]'
              }`}
            />
          </div>

          {/* 🔍 Barra de Pesquisa ABAIXO DO MAPA */}
          <div className="search-container relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isMobile ? "Buscar endereço..." : "Digite um endereço para buscar..."}
                className="w-full pl-10 pr-10 py-4 rounded-lg border border-border text-sm"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Dropdown de resultados */}
            {showResults && (searchResults.length > 0 || isSearching) && (
              <div 
                className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                ) : (
                  searchResults.map((result, index) => (
                    <button
                      key={`${result.lat}-${result.lon}-${index}`}
                      className="w-full text-left p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {result.display_name.split(',')[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.display_name.split(',').slice(1, 3).join(',').trim()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 📍 Info da Localização Selecionada */}
          {selectedLocation && (
            <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Localização selecionada
                      </p>
                      {loadingAddress ? (
                        <p className="text-xs text-muted-foreground mt-1">Buscando endereço...</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1 break-words">{address}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      Latitude: {selectedLocation.lat.toFixed(6)}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      Longitude: {selectedLocation.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 🟦 Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              onClick={handleCancel}
              className="flex-1 border-2 min-h-[48px] sm:min-h-[52px]"
              disabled={!selectedLocation}
            >
              <X className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Cancelar
            </Button>

            <Button
              size={isMobile ? "default" : "lg"}
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 min-h-[48px] sm:min-h-[52px]"
              disabled={!selectedLocation}
            >
              <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Confirmar Localização
            </Button>
          </div>

          {/* 🟪 LEGENDA/ajuda fixa no final da tela */}
          <Card className="p-4 sm:p-6 bg-card border-border mt-2">
            <LegendContent />
          </Card>

          {/* Dicas para mobile */}
          {isMobile && !selectedLocation && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                💡 <strong>Dica:</strong> Toque no mapa para marcar um local ou use a busca acima.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mapa;
