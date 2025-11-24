import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Trash2, Construction, Trees, School, Shield, HelpCircle, MapPin, Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// Dados mockados
const problemasMock = [
  {
    id: 1,
    titulo: "Poste apagado na Rua das Flores",
    categoria: "Iluminação pública",
    status: "Em análise",
    localizacao: "Rua das Flores, próximo à quadra",
    descricao: "Poste sem luz há 3 dias",
    data: "2025-11-15",
  },
  {
    id: 2,
    titulo: "Lixo acumulado na praça central",
    categoria: "Limpeza urbana",
    status: "Pendente",
    localizacao: "Praça Central, próximo ao parquinho",
    descricao: "Muito lixo acumulado nos últimos dias",
    data: "2025-11-16",
  },
  {
    id: 3,
    titulo: "Buraco grande na Rua 12",
    categoria: "Buraco na rua",
    status: "Resolvido",
    localizacao: "Rua 12, em frente ao mercado",
    descricao: "Buraco perigoso para carros e pedestres",
    data: "2025-11-10",
  },
  {
    id: 4,
    titulo: "Mato alto na área verde",
    categoria: "Áreas verdes / praças",
    status: "Em análise",
    localizacao: "Área verde do bairro São José",
    descricao: "Vegetação precisando de poda",
    data: "2025-11-14",
  },
  {
    id: 5,
    titulo: "Portão da escola quebrado",
    categoria: "Escola / creche",
    status: "Pendente",
    localizacao: "EMEF João Silva",
    descricao: "Portão de entrada não fecha direito",
    data: "2025-11-17",
  },
  {
    id: 6,
    titulo: "Falta de iluminação na viela",
    categoria: "Segurança",
    status: "Em análise",
    localizacao: "Viela entre Rua 8 e Rua 9",
    descricao: "Local escuro e inseguro à noite",
    data: "2025-11-13",
  },
];

const getCategoriaIcon = (categoria: string) => {
  const iconMap: Record<string, any> = {
    "Iluminação pública": Lightbulb,
    "Limpeza urbana": Trash2,
    "Buraco na rua": Construction,
    "Áreas verdes / praças": Trees,
    "Escola / creche": School,
    "Segurança": Shield,
    "Outro": HelpCircle,
  };
  return iconMap[categoria] || HelpCircle;
};

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    "Pendente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Em análise": "bg-blue-100 text-blue-800 border-blue-300",
    "Resolvido": "bg-green-100 text-green-800 border-green-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
};

const Ideias = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  const categorias = [
    "Iluminação pública",
    "Limpeza urbana",
    "Buraco na rua",
    "Áreas verdes / praças",
    "Escola / creche",
    "Segurança",
    "Outro",
  ];

  const problemasFiltrados = useMemo(() => {
    return problemasMock.filter((problema) => {
      const matchBusca = problema.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                         problema.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                         problema.localizacao.toLowerCase().includes(busca.toLowerCase());
      
      const matchCategoria = filtroCategoria === "todas" || problema.categoria === filtroCategoria;
      const matchStatus = filtroStatus === "todos" || problema.status === filtroStatus;

      return matchBusca && matchCategoria && matchStatus;
    });
  }, [busca, filtroCategoria, filtroStatus]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-8 md:px-12 py-4 sm:py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="default"
            onClick={() => navigate("/")}
            className="min-h-[44px]"
          >
            <ArrowLeft className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-foreground text-center flex-1">
            Problemas Reportados
          </h1>
          <div className="w-[60px] sm:w-32" />
        </div>
      </header>

      {/* Filters Section */}
      <div className="px-4 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite para buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-12 sm:h-14 pl-10 sm:pl-12 text-base sm:text-lg bg-background border-2 min-h-[48px]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Filtrar por categoria
              </label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="h-12 text-sm sm:text-base bg-background border-2 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 z-50">
                  <SelectItem value="todas" className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                    Todas as categorias
                  </SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Filtrar por status
              </label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-12 text-sm sm:text-base bg-background border-2 min-h-[48px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 z-50">
                  <SelectItem value="todos" className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                    Todos os status
                  </SelectItem>
                  <SelectItem value="Pendente" className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                    Pendente
                  </SelectItem>
                  <SelectItem value="Em análise" className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                    Em análise
                  </SelectItem>
                  <SelectItem value="Resolvido" className="text-sm sm:text-base py-2 sm:py-3 min-h-[44px] cursor-pointer">
                    Resolvido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Counter */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            Mostrando {problemasFiltrados.length} de {problemasMock.length} problemas
          </p>
        </div>
      </div>

      {/* Problems List */}
      <main className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pb-40 sm:pb-36 md:pb-32">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {problemasFiltrados.length === 0 ? (
            <Card className="p-6 sm:p-8 md:p-12 text-center">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground">
                Nenhum problema encontrado com os filtros selecionados.
              </p>
            </Card>
          ) : (
            problemasFiltrados.map((problema) => {
              const IconeCategoria = getCategoriaIcon(problema.categoria);
              
              return (
                <Card key={problema.id} className="p-4 sm:p-6 md:p-8 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                    {/* Left Section - Icon */}
                    <div className="flex-shrink-0 self-start">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconeCategoria className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                      </div>
                    </div>

                    {/* Middle Section - Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground break-words">
                          {problema.titulo}
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground break-words">
                          {problema.descricao}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <Badge variant="outline" className="text-xs sm:text-sm md:text-base py-1 sm:py-1.5 px-2 sm:px-4 border-2">
                          {problema.categoria}
                        </Badge>
                        <Badge className={`text-xs sm:text-sm md:text-base py-1 sm:py-1.5 px-2 sm:px-4 border-2 ${getStatusColor(problema.status)}`}>
                          {problema.status}
                        </Badge>
                      </div>

                      <div className="flex items-center text-sm sm:text-base md:text-lg text-muted-foreground">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="break-words">{problema.localizacao}</span>
                      </div>
                    </div>

                    {/* Right Section - Action Button */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/mapa")}
                        className="border-2 w-full sm:w-auto min-h-[48px]"
                      >
                        <MapPin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">Ver no mapa</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Footer - Fixed Button */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-4 sm:px-8 md:px-12 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <Button
            size="xl"
            onClick={() => navigate("/registrar")}
            className="w-full min-h-[56px]"
          >
            <Plus className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-sm sm:text-base md:text-lg">Registrar Novo Problema</span>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Ideias;
