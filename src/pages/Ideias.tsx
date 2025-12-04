import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Trash2, Construction, Trees, School, Shield, HelpCircle, MapPin, Plus, Search, Pencil, Filter, X } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useProblemas, useAtualizarProblema, useExcluirProblema, Problema } from "@/hooks/useProblemas";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useResponsive } from "@/hooks/useResponsive";

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

const Ideias = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [showFilters, setShowFilters] = useState(false);
  
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

  const problemasFiltrados = useMemo(() => {
    return problemas.filter((problema) => {
      const matchBusca = problema.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                         problema.descricao.toLowerCase().includes(busca.toLowerCase());
      
      const matchCategoria = filtroCategoria === "todas" || problema.categoria === filtroCategoria;
      const matchStatus = filtroStatus === "todos" || problema.status === filtroStatus;

      return matchBusca && matchCategoria && matchStatus;
    });
  }, [busca, filtroCategoria, filtroStatus, problemas]);

  const handleEdit = (problema: Problema) => {
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

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    
    try {
      await excluirProblema.mutateAsync(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
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
    if (isMobile || isTablet) {
      setShowFilters(false);
    }
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar problemas..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 pr-10 py-4"
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Categoria</Label>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>{getStatusLabel(status)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters and clear button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap gap-2">
          {filtroCategoria !== "todas" && (
            <Badge variant="secondary" className="text-xs">
              {filtroCategoria}
            </Badge>
          )}
          {filtroStatus !== "todos" && (
            <Badge variant="secondary" className="text-xs">
              {getStatusLabel(filtroStatus)}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs h-8"
        >
          Limpar filtros
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/")}
            className="min-h-[40px] sm:min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center flex-1 truncate">
            Problemas Reportados
          </h1>
          
          {/* Botão de filtros para mobile/tablet */}
          {(isMobile || isTablet) ? (
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[40px]"
                >
                  <Filter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2">Filtros</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-80">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filtrar Problemas</SheetTitle>
                </SheetHeader>
                <FilterContent />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
        <div className="max-w-7xl mx-auto h-full flex flex-col gap-4 sm:gap-6">
          {/* 🔍 Barra de Pesquisa e Filtros (Desktop) */}
          {isDesktop && (
            <Card className="p-4 sm:p-6 border-border">
              <FilterContent />
            </Card>
          )}

          {/* 📊 Contador de Resultados e Filtros Ativos */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{problemasFiltrados.length}</span> de{" "}
                <span className="font-semibold text-foreground">{problemas.length}</span> problemas
              </p>
              
              {/* Filtros ativos (mobile/tablet) */}
              {(isMobile || isTablet) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filtroCategoria !== "todas" && (
                    <Badge variant="secondary" className="text-xs">
                      {filtroCategoria}
                    </Badge>
                  )}
                  {filtroStatus !== "todos" && (
                    <Badge variant="secondary" className="text-xs">
                      {getStatusLabel(filtroStatus)}
                    </Badge>
                  )}
                  {(filtroCategoria !== "todas" || filtroStatus !== "todos") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs h-6 px-2"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Botão de filtros (mobile/tablet) visível apenas quando há filtros ativos */}
            {(isMobile || isTablet) && (filtroCategoria !== "todas" || filtroStatus !== "todos" || busca) && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-3 w-3 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filtrar Problemas</SheetTitle>
                  </SheetHeader>
                  <FilterContent />
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* 📋 Lista de Problemas */}
          <div className="space-y-4 sm:space-y-6">
            {isLoading ? (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                  Carregando problemas...
                </p>
              </Card>
            ) : problemasFiltrados.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                    Nenhum problema encontrado
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="mt-2"
                  >
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
                    className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => !isDesktop && handleViewOnMap(problema)}
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      {/* Ícone da Categoria */}
                      <div className="flex-shrink-0 self-start">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <IconeCategoria className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <h3 className="text-lg sm:text-xl font-semibold text-foreground break-words pr-2">
                              {problema.titulo}
                            </h3>
                            <Badge className={`text-xs sm:text-sm py-1 px-3 ${getStatusColor(problema.status)}`}>
                              {getStatusLabel(problema.status)}
                            </Badge>
                          </div>
                          <p className="text-sm sm:text-base text-muted-foreground break-words line-clamp-2">
                            {problema.descricao}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs sm:text-sm">
                            {problema.categoria}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            • {new Date(problema.data_criacao).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Botões de Ação (sempre visíveis para admin, condicionais para usuários) */}
                        <div className={`flex flex-wrap gap-2 pt-2 ${isMobile ? 'justify-between' : ''}`}>
                          <Button
                            variant="outline"
                            size={isMobile ? "sm" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOnMap(problema);
                            }}
                            className="flex-1 sm:flex-none min-w-[120px]"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Ver no mapa
                          </Button>
                          
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size={isMobile ? "sm" : "default"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(problema);
                                }}
                                className="flex-1 sm:flex-none min-w-[120px] text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size={isMobile ? "sm" : "default"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(problema.id);
                                }}
                                className="flex-1 sm:flex-none min-w-[120px] text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* 📝 Dica para mobile */}
          {isMobile && problemasFiltrados.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                💡 <strong>Toque em um problema</strong> para ver sua localização no mapa
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Botão Fixo */}
      <footer className="sticky bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={() => navigate("/registrar")}
            className="w-full min-h-[48px] sm:min-h-[56px]"
          >
            <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Registrar Novo Problema</span>
          </Button>
        </div>
      </footer>

      {/* ✏️ Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] mx-2' : 'max-w-lg'}`}>
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
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                rows={3}
                placeholder="Descreva o problema com detalhes"
              />
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
        <DialogContent className={`${isMobile ? 'max-w-[95vw] mx-2' : 'max-w-md'}`}>
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
