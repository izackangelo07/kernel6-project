import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Trash2, Construction, Trees, School, Shield, HelpCircle, MapPin, Plus, Search, Pencil, X, Calendar, Tag, Image as ImageIcon, Camera, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

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

// Função para formatar o endereço (mostrar apenas rua, bairro e cidade)
const formatAddress = (fullAddress: string) => {
  if (!fullAddress || fullAddress === "Endereço não encontrado" || fullAddress === "Endereço não disponível") {
    return "Endereço não disponível";
  }
  
  try {
    // Divide o endereço por vírgulas
    const parts = fullAddress.split(',');
    
    // Pega os primeiros 3 elementos (normalmente: rua, bairro, cidade)
    if (parts.length >= 3) {
      // Pega rua, bairro e cidade (ignora estado, CEP, país, etc.)
      const [street, neighborhood, city] = parts.slice(0, 3);
      return `${street.trim()}, ${neighborhood.trim()}, ${city.trim()}`;
    } else if (parts.length === 2) {
      // Se tiver apenas 2 partes (pode ser rua, bairro+cidade)
      const [street, city] = parts;
      return `${street.trim()}, ${city.trim()}`;
    } else {
      // Se tiver apenas 1 parte, retorna ela mesma
      return fullAddress;
    }
  } catch (error) {
    console.error("Erro ao formatar endereço:", error);
    return "Endereço não disponível";
  }
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
    latitude: 0,
    longitude: 0,
    imagem_url: null as string | null,
  });
  const [editFoto, setEditFoto] = useState<File | null>(null);
  const [editFotoPreview, setEditFotoPreview] = useState<string | null>(null);
  const [editEndereco, setEditEndereco] = useState("");
  const [loadingEditEndereco, setLoadingEditEndereco] = useState(false);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

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
      latitude: problema.latitude,
      longitude: problema.longitude,
      imagem_url: problema.imagem_url,
    });
    setEditFoto(null);
    setEditFotoPreview(problema.imagem_url);
    setLoadingEditEndereco(true);
    reverseGeocode(problema.latitude, problema.longitude)
      .then((addr) => setEditEndereco(addr))
      .finally(() => setLoadingEditEndereco(false));
    setEditModalOpen(true);
  };

  const handleEditFotoCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("A imagem deve ser menor que 5MB");
          return;
        }
        
        setEditFoto(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setEditFotoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        toast.success("Foto selecionada!");
      }
    };
    input.click();
  };

  const handleRemoveEditFoto = () => {
    setEditFoto(null);
    setEditFotoPreview(null);
    setEditForm({ ...editForm, imagem_url: null });
    toast.info("Foto removida");
  };

  const handleEditLocation = () => {
    // Salvar dados do formulário de edição no sessionStorage
    sessionStorage.setItem("editProblemaData", JSON.stringify({
      ...editForm,
      id: editingProblema?.id,
      fotoPreview: editFotoPreview,
    }));
    sessionStorage.setItem("editReturnTo", "/ideias");
    navigate("/mapa?mode=edit");
  };

  // Carregar localização retornada do mapa (modo edição)
  useEffect(() => {
    const editLocation = sessionStorage.getItem("editProblemaLocation");
    const editData = sessionStorage.getItem("editProblemaData");
    
    if (editLocation && editData) {
      try {
        const location = JSON.parse(editLocation);
        const data = JSON.parse(editData);
        
        setEditForm({
          titulo: data.titulo || "",
          descricao: data.descricao || "",
          categoria: data.categoria || "",
          status: data.status || "",
          latitude: location.lat,
          longitude: location.lng,
          imagem_url: data.imagem_url,
        });
        setEditFotoPreview(data.fotoPreview);
        setEditEndereco(location.endereco || "");
        
        // Buscar o problema original para continuar editando
        const problema = problemas.find(p => p.id === data.id);
        if (problema) {
          setEditingProblema(problema);
          setEditModalOpen(true);
        }
        
        sessionStorage.removeItem("editProblemaLocation");
        sessionStorage.removeItem("editProblemaData");
        sessionStorage.removeItem("editReturnTo");
      } catch (error) {
        console.error("Erro ao carregar dados de edição:", error);
      }
    }
  }, [problemas]);

  const handleSaveEdit = async () => {
    if (!editingProblema) return;
    
    try {
      setIsUploadingEdit(true);
      let imagem_url = editForm.imagem_url;

      // Upload da nova imagem se existir
      if (editFoto) {
        const fileExt = editFoto.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('problemas-images')
          .upload(filePath, editFoto);

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast.error("Erro ao enviar a imagem. Tente novamente.");
          setIsUploadingEdit(false);
          return;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('problemas-images')
          .getPublicUrl(filePath);

        imagem_url = publicUrl;
      }

      await atualizarProblema.mutateAsync({
        id: editingProblema.id,
        titulo: editForm.titulo,
        descricao: editForm.descricao,
        categoria: editForm.categoria,
        status: editForm.status,
        latitude: editForm.latitude,
        longitude: editForm.longitude,
        imagem_url,
      });
      setEditModalOpen(false);
      setEditingProblema(null);
      setEditFoto(null);
      setEditFotoPreview(null);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsUploadingEdit(false);
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
    navigate(`/mapa-detalhe?lat=${problema.latitude}&lng=${problema.longitude}&id=${problema.id}`);
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
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl md:w-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl pr-8 break-words">
              {selectedProblema?.titulo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProblema && (
            <div className="space-y-4 py-2 px-4 sm:px-6">
              {/* Status e Categoria */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getStatusColor(selectedProblema.status)}`}>
                  {getStatusLabel(selectedProblema.status)}
                </Badge>
                <Badge variant="outline" className="truncate max-w-full">
                  <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{selectedProblema.categoria}</span>
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
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-all md:break-words overflow-wrap-anywhere">
                  {selectedProblema.descricao}
                </p>
              </div>

              {/* Data */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">
                  Registrado em {new Date(selectedProblema.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">Localização</span>
                </Label>
                {loadingEndereco ? (
                  <p className="text-sm text-muted-foreground animate-pulse break-words">Buscando endereço...</p>
                ) : (
                  <p className="text-sm text-foreground break-all md:break-words overflow-wrap-anywhere">
                    {formatAddress(endereco)}
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-2 pt-2 pb-4">
                <Button
                  variant="default"
                  onClick={() => handleViewOnMap(selectedProblema)}
                  className="w-full truncate"
                >
                  <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Ver no Mapa</span>
                </Button>
                
                {isAdmin && (
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleEdit(selectedProblema);
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 truncate"
                    >
                      <Pencil className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleDeleteClick(selectedProblema.id);
                      }}
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 truncate"
                    >
                      <Trash2 className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Excluir</span>
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
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl md:w-auto">
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
            
            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto</Label>
              {editFotoPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={editFotoPreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveEditFoto}
                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Sem foto</p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditFotoCapture}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                {editFotoPreview ? "Trocar Foto" : "Adicionar Foto"}
              </Button>
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Localização
              </Label>
              {loadingEditEndereco ? (
                <p className="text-sm text-muted-foreground animate-pulse">Buscando endereço...</p>
              ) : (
                <p className="text-sm text-foreground break-words">
                  {formatAddress(editEndereco) || "Endereço não disponível"}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleEditLocation}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Alterar Localização no Mapa
              </Button>
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
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1" disabled={isUploadingEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={atualizarProblema.isPending || isUploadingEdit} className="flex-1">
              {isUploadingEdit || atualizarProblema.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🗑️ Modal de Confirmação de Exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-2xl md:w-auto">
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
