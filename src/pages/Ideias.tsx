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
      <header className="border-b border-border bg-card px-12 py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">
            Problemas Reportados
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Filters Section */}
      <div className="px-12 py-8 border-b border-border bg-card/50">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Digite para buscar um problema..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="h-14 pl-12 text-lg bg-background border-2"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Filtrar por categoria
              </label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="h-12 text-base bg-background border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-2">
                  <SelectItem value="todas" className="text-base py-3">
                    Todas as categorias
                  </SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-base py-3">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Filtrar por status
              </label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="h-12 text-base bg-background border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-2">
                  <SelectItem value="todos" className="text-base py-3">
                    Todos os status
                  </SelectItem>
                  <SelectItem value="Pendente" className="text-base py-3">
                    Pendente
                  </SelectItem>
                  <SelectItem value="Em análise" className="text-base py-3">
                    Em análise
                  </SelectItem>
                  <SelectItem value="Resolvido" className="text-base py-3">
                    Resolvido
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Counter */}
          <p className="text-sm text-muted-foreground">
            Mostrando {problemasFiltrados.length} de {problemasMock.length} problemas
          </p>
        </div>
      </div>

      {/* Problems List */}
      <main className="px-12 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {problemasFiltrados.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-2xl text-muted-foreground">
                Nenhum problema encontrado com os filtros selecionados.
              </p>
            </Card>
          ) : (
            problemasFiltrados.map((problema) => {
              const IconeCategoria = getCategoriaIcon(problema.categoria);
              
              return (
                <Card key={problema.id} className="p-8 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-6">
                    {/* Left Section - Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconeCategoria className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    {/* Middle Section - Content */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                          {problema.titulo}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {problema.descricao}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Badge variant="outline" className="text-base py-1.5 px-4 border-2">
                          {problema.categoria}
                        </Badge>
                        <Badge className={`text-base py-1.5 px-4 border-2 ${getStatusColor(problema.status)}`}>
                          {problema.status}
                        </Badge>
                      </div>

                      <div className="flex items-center text-lg text-muted-foreground">
                        <MapPin className="h-5 w-5 mr-2" />
                        {problema.localizacao}
                      </div>
                    </div>

                    {/* Right Section - Action Button */}
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate("/mapa")}
                        className="border-2"
                      >
                        <MapPin className="mr-2 h-5 w-5" />
                        Ver no mapa
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
      <footer className="sticky bottom-0 border-t border-border bg-card px-12 py-6">
        <div className="max-w-6xl mx-auto">
          <Button
            size="xl"
            onClick={() => navigate("/registrar")}
            className="w-full"
          >
            <Plus className="mr-3 h-6 w-6" />
            Registrar Novo Problema
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Ideias;
