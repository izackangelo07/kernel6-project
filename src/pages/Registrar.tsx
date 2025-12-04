import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, X, Check, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useCriarProblema } from "@/hooks/useProblemas";
import { useResponsive } from "@/hooks/useResponsive";

const Registrar = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number; endereco?: string } | null>(null);
  const criarProblema = useCriarProblema();

  // Função para salvar todos os dados no sessionStorage
  const salvarDadosNoStorage = () => {
    const dados = {
      categoria,
      titulo,
      descricao,
      localizacao,
      // Foto não pode ser salva no sessionStorage, então apenas salvamos se tem foto
      temFoto: !!foto,
    };
    sessionStorage.setItem("dadosRegistro", JSON.stringify(dados));
  };

  // Função para restaurar dados do sessionStorage
  const restaurarDadosDoStorage = () => {
    const dadosSalvos = sessionStorage.getItem("dadosRegistro");
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        if (dados.categoria) setCategoria(dados.categoria);
        if (dados.titulo) setTitulo(dados.titulo);
        if (dados.descricao) setDescricao(dados.descricao);
        if (dados.localizacao) setLocalizacao(dados.localizacao);
      } catch (error) {
        console.error("Erro ao restaurar dados:", error);
      }
    }
  };

  // Verificar e restaurar dados ao carregar a página
  useEffect(() => {
    restaurarDadosDoStorage();
    
    // Verificar se há localização específica salva do mapa
    const loc = sessionStorage.getItem("localizacaoProblema");
    if (loc) {
      try {
        const parsedLoc = JSON.parse(loc);
        setLocalizacao(parsedLoc);
        
        // Atualizar dados salvos com a nova localização
        salvarDadosNoStorage();
        
        // Limpar apenas a localização específica do mapa
        sessionStorage.removeItem("localizacaoProblema");
      } catch (error) {
        console.error("Erro ao parsear localização:", error);
      }
    }
  }, []);

  // Salvar dados sempre que eles mudarem
  useEffect(() => {
    salvarDadosNoStorage();
  }, [categoria, titulo, descricao, localizacao]);

  const categorias = [
    "Iluminação pública",
    "Limpeza urbana",
    "Buraco na rua",
    "Áreas verdes / praças",
    "Escola / creche",
    "Segurança",
    "Outro",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const errors: string[] = [];
    
    if (!categoria) errors.push("Selecione uma categoria");
    if (!titulo.trim()) errors.push("Informe um título");
    if (!descricao.trim()) errors.push("Descreva o problema");
    if (!localizacao) errors.push("Marque a localização no mapa");

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      await criarProblema.mutateAsync({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        latitude: localizacao!.lat,
        longitude: localizacao!.lng,
      });

      // Limpar todos os dados após envio bem-sucedido
      sessionStorage.removeItem("dadosRegistro");
      sessionStorage.removeItem("localizacaoProblema");
      
      // Limpar estado local
      setCategoria("");
      setTitulo("");
      setDescricao("");
      setFoto(null);
      setFotoPreview(null);
      setLocalizacao(null);

      toast.success("Problema registrado com sucesso!");
      navigate("/ideias");
    } catch (error) {
      console.error("Erro ao registrar problema:", error);
      toast.error("Erro ao registrar problema. Tente novamente.");
    }
  };

  const handleFotoCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    // Tentar usar câmera em dispositivos móveis
    if (isMobile) {
      input.capture = "environment";
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Validar tamanho da imagem (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("A imagem deve ser menor que 5MB");
          return;
        }
        
        setFoto(file);
        
        // Criar preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setFotoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        toast.success("Foto adicionada!");
      }
    };
    input.click();
  };

  const handleRemoveFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    toast.info("Foto removida");
  };

  const handleGoToMap = () => {
    // Salvar dados atuais ANTES de ir para o mapa
    salvarDadosNoStorage();
    navigate("/mapa");
  };

  // Limpar dados ao sair da página (opcional)
  useEffect(() => {
    return () => {
      // Se quiser manter os dados mesmo se o usuário sair da página,
      // não limpe aqui. Deixe apenas no envio bem-sucedido.
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/ideias")}
            className="min-h-[40px] sm:min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center flex-1 truncate">
            Registrar Problema
          </h1>
          
          {/* Botão para limpar formulário (opcional) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm("Deseja limpar todo o formulário?")) {
                sessionStorage.removeItem("dadosRegistro");
                setCategoria("");
                setTitulo("");
                setDescricao("");
                setFoto(null);
                setFotoPreview(null);
                setLocalizacao(null);
                toast.info("Formulário limpo");
              }
            }}
            className="min-h-[40px] text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Limpar</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Progress Indicator para Desktop/Tablet */}
          {(isTablet || isDesktop) && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${categoria ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {categoria ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <span className={`text-sm ${categoria ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                  Categoria
                </span>
              </div>
              <div className="w-8 h-0.5 bg-muted"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${titulo && descricao ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {titulo && descricao ? <Check className="h-4 w-4" /> : "2"}
                </div>
                <span className={`text-sm ${titulo && descricao ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                  Descrição
                </span>
              </div>
              <div className="w-8 h-0.5 bg-muted"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${localizacao ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {localizacao ? <Check className="h-4 w-4" /> : "3"}
                </div>
                <span className={`text-sm ${localizacao ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                  Localização
                </span>
              </div>
            </div>
          )}

          {/* 1. Categoria */}
          <Card className="p-4 sm:p-6 border-border">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Label htmlFor="categoria" className="text-base sm:text-lg md:text-xl font-medium text-foreground">
                  1. Tipo de Problema
                </Label>
                {categoria && (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    ✓ Selecionado
                  </Badge>
                )}
              </div>
              
              {!categoria && (
                <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Escolha uma categoria para continuar</span>
                </div>
              )}

              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger 
                  id="categoria" 
                  className={`h-12 sm:h-14 text-sm sm:text-base p-3 sm:p-4 ${
                    categoria ? 'border-green-500' : 'border-muted'
                  }`}
                >
                  <SelectValue placeholder="Selecione uma opção..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 z-50 max-h-[300px]">
                  {categorias.map((cat) => (
                    <SelectItem 
                      key={cat} 
                      value={cat}
                      className="text-sm sm:text-base py-3 cursor-pointer hover:bg-accent"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {categoria && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                  <Check className="h-4 w-4" />
                  <span>{categoria}</span>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Título e Descrição */}
          <Card className="p-4 sm:p-6 border-border">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Label htmlFor="titulo" className="text-base sm:text-lg md:text-xl font-medium text-foreground">
                    2. Título do Problema
                  </Label>
                  {titulo && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {titulo.length > 0 ? `${titulo.length}/100` : 'Vazio'}
                    </Badge>
                  )}
                </div>
                
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value.slice(0, 100))}
                  placeholder="Ex: Poste de luz quebrado na esquina"
                  className={`h-12 sm:h-14 text-sm sm:text-base p-3 sm:p-4 ${
                    titulo ? 'border-green-500' : 'border-muted'
                  }`}
                  maxLength={100}
                />
                
                {titulo && titulo.length >= 80 && (
                  <p className="text-xs text-yellow-600">
                    {100 - titulo.length} caracteres restantes
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Label htmlFor="descricao" className="text-base sm:text-lg md:text-xl font-medium text-foreground">
                    3. Descrição Detalhada
                  </Label>
                  {descricao && (
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {descricao.length > 0 ? `${descricao.length}/500` : 'Vazio'}
                    </Badge>
                  )}
                </div>
                
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
                  placeholder="Descreva com detalhes o problema encontrado..."
                  className={`min-h-[120px] sm:min-h-[150px] text-sm sm:text-base p-3 sm:p-4 ${
                    descricao ? 'border-green-500' : 'border-muted'
                  }`}
                  maxLength={500}
                />
                
                {descricao && descricao.length >= 400 && (
                  <p className="text-xs text-yellow-600">
                    {500 - descricao.length} caracteres restantes
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* 3. Foto (Opcional) */}
          <Card className="p-4 sm:p-6 border-border">
            <div className="space-y-3">
              <Label className="text-base sm:text-lg md:text-xl font-medium text-foreground">
                4. Foto (Opcional)
              </Label>
              
              <div className="space-y-4">
                {/* Preview da Foto */}
                {fotoPreview && (
                  <div className="relative rounded-lg overflow-hidden border-2 border-border">
                    <img 
                      src={fotoPreview} 
                      alt="Preview" 
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveFoto}
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant={fotoPreview ? "outline" : "default"}
                  size={isMobile ? "default" : "lg"}
                  onClick={handleFotoCapture}
                  className="w-full"
                >
                  {fotoPreview ? (
                    <>
                      <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Alterar Foto
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      {isMobile ? "Tirar Foto" : "Adicionar Foto do Problema"}
                    </>
                  )}
                </Button>
                
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isMobile ? (
                    "Toque para tirar uma foto com a câmera"
                  ) : (
                    "Adicione uma foto para ajudar na identificação do problema"
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* 4. Localização */}
          <Card className="p-4 sm:p-6 border-border">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Label className="text-base sm:text-lg md:text-xl font-medium text-foreground">
                  5. Localização
                </Label>
                {localizacao && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 text-xs sm:text-sm">
                    ✓ Marcada
                  </Badge>
                )}
              </div>
              
              {!localizacao && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Localização obrigatória</span>
                </div>
              )}

              <Button
                type="button"
                variant={localizacao ? "outline" : "default"}
                size={isMobile ? "default" : "lg"}
                onClick={handleGoToMap}
                className={`w-full h-12 sm:h-14 ${
                  localizacao 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 text-green-700' 
                    : ''
                }`}
              >
                <MapPin className={`mr-2 h-4 w-4 sm:h-5 sm:w-5 ${
                  localizacao ? 'text-green-600' : ''
                }`} />
                <span className="text-left flex-1 truncate">
                  {localizacao 
                    ? (isMobile ? "✓ Local marcado" : "✓ Localização marcada") 
                    : (isMobile ? "Abrir mapa" : "Marcar no Mapa")
                  }
                </span>
              </Button>
              
              {localizacao?.endereco && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Localização selecionada:
                      </p>
                      <p className="text-xs text-muted-foreground break-words mt-1">
                        {localizacao.endereco}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          Lat: {localizacao.lat.toFixed(6)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          Lng: {localizacao.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {!localizacao && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isMobile ? (
                    "Toque para abrir o mapa e marcar a localização exata"
                  ) : (
                    "Clique para abrir o mapa e marcar a localização exata do problema"
                  )}
                </p>
              )}
            </div>
          </Card>

          {/* Dicas para mobile */}
          {isMobile && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Seus dados estão sendo salvos automaticamente.</strong> 
                Você pode ir para o mapa e voltar sem perder as informações.
              </p>
            </div>
          )}

          {/* Botão de Envio */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm pt-4 pb-6 -mx-3 sm:-mx-6 md:-mx-8 px-3 sm:px-6 md:px-8">
            <Button
              type="submit"
              size={isMobile ? "default" : "lg"}
              disabled={criarProblema.isPending || !categoria || !titulo || !descricao || !localizacao}
              className="w-full h-12 sm:h-14"
            >
              {criarProblema.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Enviando...
                </span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {isMobile ? "Enviar Problema" : "Enviar Registro do Problema"}
                </>
              )}
            </Button>
            
            {(isMobile || isTablet) && (
              <p className="text-xs text-center text-muted-foreground mt-2">
                {!categoria || !titulo || !descricao || !localizacao 
                  ? "Preencha todos os campos obrigatórios" 
                  : "Toque para enviar seu registro"}
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default Registrar;
