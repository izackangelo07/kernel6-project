import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Trash2, Construction, Trees, School, Shield, HelpCircle, MapPin, Plus, Search, Pencil, X, Calendar, Tag, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProblemas, useAtualizarProblema, useExcluirProblema, Problema } from "@/hooks/useProblemas";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    "pendente": "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300",
    "em_analise": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300",
    "aprovado": "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300",
    "rejeitado": "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
};

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    "pendente": "Pendente",
    "em_analise": "Em análise",
    "aprovado": "Aprovado",
    "rejeitado": "Rejeitado",
  };
  return labelMap[status] || status;
};

const categorias = [
  "Iluminação pública",
  "Limpeza urbana",
  "Buraco na rua",
  "Áreas verdes / praças",
  "Escola / creche",
  "Segurança",
  "Outro",
];

const statusOptions = ["pendente", "em_analise", "aprovado", "rejeitado"];

// Função para obter endereço via Nominatim
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "pt-BR",
        },
      }
    );
    const data = await response.json();
    return data.display_name || "Endereço não encontrado";
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return "Endereço não disponível";
  }
};

const Ideias = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  
  const { data: problemas = [], isLoading } = useProblemas();
  const atualizarProblema = useAtualizarProblema();
  const excluirProblema = useExcluirProblema();
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProblema, setEditingProblema] = useState<Problema | null>(null);
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    categoria: "",
    status: "",
  });

  // Delete confirmation state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProblema, setSelectedProblema] = useState<Problema | null>(null);
  const [endereco, setEndereco] = useState<string>("");
  const [loadingEndereco, setLoadingEndereco] = useState(false);

  const problemasFiltrados = useMemo(() => {
    return problemas.filter((problema) => {
      const matchBusca = problema.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                         problema.descricao.toLowerCase().includes(busca.toLowerCase());
      
      const matchCategoria = filtroCategoria === "todas" || problema.categoria === filtroCategoria;
      const matchStatus = filtroStatus === "todos" || problema.status === filtroStatus;

      return matchBusca && matchCategoria && matchStatus;
    });
  }, [busca, filtroCategoria, filtroStatus, problemas]);

  // Buscar endereço quando abrir modal de detalhes
  useEffect(() => {
    if (selectedProblema && detailModalOpen) {
      setLoadingEndereco(true);
      setEndereco("");
      reverseGeocode(selectedProblema.latitude, selectedProblema.longitude)
        .then((addr) => setEndereco(addr))
        .finally(() => setLoadingEndereco(false));
    }
  }, [selectedProblema, detailModalOpen]);

  const handleCardClick = (problema: Problema) => {
    setSelectedProblema(problema);
    setDetailModalOpen(true);
  };

  const handleEdit = (problema: Problema, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProblema(problema);
    setEditForm({
      titulo: problema.titulo,
      descricao: problema.descricao,
      categoria: problema.categoria,
      status: problema.status,
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProblema) return;
    
    try {
      await atualizarProblema.mutateAsync({
        id: editingProblema.id,
        ...editForm,
      });
      setEditModalOpen(false);
      setEditingProblema(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await excluirProblema.mutateAsync(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
      setDetailModalOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleViewOnMap = (problema: Problema) => {
    navigate(`/mapa?lat=${problema.latitude}&lng=${problema.longitude}&id=${problema.id}`);
  };

  const clearFilters = () => {
    setBusca("");
    setFiltroCategoria("todas");
    setFiltroStatus("todos");
  };

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="min-h-[40px]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center flex-1 truncate">
            Problemas Reportados
          </h1>
          
          <div className="w-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-3 sm:gap-4">
          {/* 🔍 Barra de Pesquisa e Filtros */}
          <Card className="p-3 sm:p-4 md:p-6 border-border flex-shrink-0">
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar problemas..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 pr-10 py-2 sm:py-3 text-sm sm:text-base h-10 sm:h-12"
                />
                {busca && (
                  <button
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active filters */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{problemasFiltrados.length}</span> de{" "}
                  <span className="font-semibold text-foreground">{problemas.length}</span> problemas
                </p>
                {(filtroCategoria !== "todas" || filtroStatus !== "todos" || busca) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-7 px-2"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* 📋 Lista de Problemas com scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3 sm:space-y-4 pb-2">
            {isLoading ? (
              <Card className="p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Carregando problemas...
                </p>
              </Card>
            ) : problemasFiltrados.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Nenhum problema encontrado
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              </Card>
            ) : (
              problemasFiltrados.map((problema) => {
                const IconeCategoria = getCategoriaIcon(problema.categoria);
                
                return (
                  <Card 
                    key={problema.id} 
                    className="p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCardClick(problema)}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Ícone da Categoria */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconeCategoria className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground truncate pr-2">
                            {problema.titulo}
                          </h3>
                          <Badge className={`text-xs py-0.5 px-2 self-start ${getStatusColor(problema.status)}`}>
                            {getStatusLabel(problema.status)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {problema.descricao}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {problema.categoria}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(problema.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer - Botão Fixo */}
      <footer className="border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <Button
            size="lg"
            onClick={() => navigate("/registrar")}
            className="w-full h-11 sm:h-12 md:h-14"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Registrar Novo Problema</span>
          </Button>
        </div>
      </footer>

      {/* 👁️ Modal de Detalhes do Problema */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl pr-8">
              {selectedProblema?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProblema && (
            <div className="space-y-4 py-2">
              {/* Status e Categoria */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getStatusColor(selectedProblema.status)}`}>
                  {getStatusLabel(selectedProblema.status)}
                </Badge>
                <Badge variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {selectedProblema.categoria}
                </Badge>
              </div>

              {/* Foto */}
              {selectedProblema.imagem_url && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={selectedProblema.imagem_url} 
                    alt="Foto do problema" 
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                </div>
              )}

              {/* Descrição */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">
                  {selectedProblema.descricao}
                </p>
              </div>

              {/* Data */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Registrado em {new Date(selectedProblema.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </Label>
                {loadingEndereco ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Buscando endereço...</p>
                ) : (
                  <p className="text-sm text-foreground">{endereco}</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="default"
                  onClick={() => handleViewOnMap(selectedProblema)}
                  className="w-full"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Ver no Mapa
                </Button>
                
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleEdit(selectedProblema);
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleDeleteClick(selectedProblema.id);
                      }}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✏️ Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Problema</DialogTitle>
            <DialogDescription>
              Atualize as informações do problema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-titulo">Título</Label>
              <Input
                id="edit-titulo"
                value={editForm.titulo}
                onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                className="min-h-[44px]"
                placeholder="Digite o título do problema"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Textarea
                id="edit-descricao"
                value={editForm.descricao}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value.slice(0, 1000) })}
                rows={4}
                placeholder="Descreva o problema com detalhes"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {editForm.descricao.length}/1000
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={editForm.categoria} onValueChange={(v) => setEditForm({ ...editForm, categoria: v })}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={atualizarProblema.isPending} className="flex-1">
              {atualizarProblema.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Tem certeza que deseja excluir este problema?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={excluirProblema.isPending}
              className="flex-1"
            >
              {excluirProblema.isPending ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ideias;
