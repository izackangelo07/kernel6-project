import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, X, Check, AlertCircle, Image as ImageIcon, Save } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const loc = sessionStorage.getItem("localizacaoProblema");
    if (loc) {
      try {
        const parsedLoc = JSON.parse(loc);
        setLocalizacao(parsedLoc);
        sessionStorage.removeItem("localizacaoProblema");
      } catch (error) {
        console.error("Erro ao parsear localização:", error);
      }
    }

    try {
      const dadosSalvos = localStorage.getItem("registroDados");
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        if (dados.categoria) setCategoria(dados.categoria);
        if (dados.titulo) setTitulo(dados.titulo);
        if (dados.descricao) setDescricao(dados.descricao);
      }
    } catch (error) {
      console.error("Erro ao carregar dados salvos:", error);
    }
  }, []);

  // Salvar dados no localStorage
  const salvarDados = () => {
    try {
      const dadosParaSalvar = {
        categoria,
        titulo,
        descricao,
      };
      localStorage.setItem("registroDados", JSON.stringify(dadosParaSalvar));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  };

  // Salvar quando dados mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      salvarDados();
    }, 500);
    return () => clearTimeout(timer);
  }, [categoria, titulo, descricao]);

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

      localStorage.removeItem("registroDados");
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
    
    if (isMobile) {
      input.capture = "environment";
    }
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("A imagem deve ser menor que 5MB");
          return;
        }
        
        setFoto(file);
        
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
    salvarDados();
    navigate("/mapa");
  };

  const limparFormulario = () => {
    if (window.confirm("Deseja limpar todo o formulário?")) {
      localStorage.removeItem("registroDados");
      setCategoria("");
      setTitulo("");
      setDescricao("");
      setFoto(null);
      setFotoPreview(null);
      setLocalizacao(null);
      toast.info("Formulário limpo");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Mais compacto em tablet */}
      <header className={`border-b border-border bg-card px-4 sm:px-6 py-3 ${isTablet ? 'py-2' : 'sm:py-4'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : isTablet ? "sm" : "default"}
            onClick={() => navigate("/ideias")}
            className={`${isTablet ? 'min-h-[36px]' : 'min-h-[40px] sm:min-h-[44px]'}`}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className={`font-semibold text-foreground text-center flex-1 truncate ${
            isTablet ? 'text-lg' : 'text-lg sm:text-xl md:text-2xl'
          }`}>
            Registrar Problema
          </h1>
          
          <Button
            variant="ghost"
            size={isTablet ? "sm" : "default"}
            onClick={limparFormulario}
            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${
              isTablet ? 'min-h-[36px]' : 'min-h-[40px]'
            }`}
            title="Limpar formulário"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Limpar</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Otimizado para tablet sem scroll */}
      <main className={`flex-1 px-4 sm:px-6 py-3 ${
        isTablet ? 'py-2' : 'sm:py-4'
      } overflow-y-auto`}>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          {/* Container principal ajustado para tablet */}
          <div className={`space-y-4 ${
            isTablet ? 'space-y-3' : 'sm:space-y-6'
          }`}>
            
            {/* Indicador de dados salvos */}
            {(categoria || titulo || descricao) && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                <Save className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Dados salvos automaticamente</span>
              </div>
            )}

            {/* 1. Categoria */}
            <Card className={`p-3 sm:p-4 border-border ${
              isTablet ? 'p-3' : ''
            }`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label htmlFor="categoria" className={`font-medium text-foreground ${
                    isTablet ? 'text-sm' : 'text-base sm:text-lg'
                  }`}>
                    1. Tipo de Problema *
                  </Label>
                  {categoria && (
                    <Badge variant="outline" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger 
                    id="categoria" 
                    className={`${
                      isTablet ? 'h-10 text-sm' : 'h-12 sm:h-14 text-sm sm:text-base'
                    } ${categoria ? 'border-green-500' : ''}`}
                  >
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-2 z-50">
                    {categorias.map((cat) => (
                      <SelectItem 
                        key={cat} 
                        value={cat}
                        className={`${
                          isTablet ? 'text-sm py-2' : 'text-sm sm:text-base py-3'
                        }`}
                      >
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {!categoria && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Selecione uma categoria
                  </p>
                )}
              </div>
            </Card>

            {/* 2. Título */}
            <Card className={`p-3 sm:p-4 border-border ${
              isTablet ? 'p-3' : ''
            }`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label htmlFor="titulo" className={`font-medium text-foreground ${
                    isTablet ? 'text-sm' : 'text-base sm:text-lg'
                  }`}>
                    2. Título do Problema *
                  </Label>
                  {titulo && (
                    <Badge variant="outline" className="text-xs">
                      {titulo.length}/100
                    </Badge>
                  )}
                </div>
                
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value.slice(0, 100))}
                  placeholder="Ex: Poste de luz quebrado na esquina"
                  className={`${
                    isTablet ? 'h-10 text-sm' : 'h-12 sm:h-14 text-sm sm:text-base'
                  } ${titulo ? 'border-green-500' : ''}`}
                  maxLength={100}
                />
                
                {titulo.length >= 80 && (
                  <p className="text-xs text-yellow-600">
                    {100 - titulo.length} caracteres restantes
                  </p>
                )}
              </div>
            </Card>

            {/* 3. Descrição */}
            <Card className={`p-3 sm:p-4 border-border ${
              isTablet ? 'p-3' : ''
            }`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label htmlFor="descricao" className={`font-medium text-foreground ${
                    isTablet ? 'text-sm' : 'text-base sm:text-lg'
                  }`}>
                    3. Descrição Detalhada *
                  </Label>
                  {descricao && (
                    <Badge variant="outline" className="text-xs">
                      {descricao.length}/500
                    </Badge>
                  )}
                </div>
                
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
                  placeholder="Descreva com detalhes o problema encontrado..."
                  className={`${
                    isTablet ? 'min-h-[80px] text-sm' : 'min-h-[100px] sm:min-h-[120px] text-sm sm:text-base'
                  } ${descricao ? 'border-green-500' : ''}`}
                  maxLength={500}
                />
                
                {descricao.length >= 400 && (
                  <p className="text-xs text-yellow-600">
                    {500 - descricao.length} caracteres restantes
                  </p>
                )}
              </div>
            </Card>

            {/* 4. Foto (Opcional) */}
            <Card className={`p-3 sm:p-4 border-border ${
              isTablet ? 'p-3' : ''
            }`}>
              <div className="space-y-2">
                <Label className={`font-medium text-foreground ${
                  isTablet ? 'text-sm' : 'text-base sm:text-lg'
                }`}>
                  4. Foto (Opcional)
                </Label>
                
                <div className="space-y-3">
                  {fotoPreview && (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img 
                        src={fotoPreview} 
                        alt="Preview" 
                        className={`w-full ${
                          isTablet ? 'h-32' : 'h-40 sm:h-48'
                        } object-cover`}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveFoto}
                        className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant={fotoPreview ? "outline" : "default"}
                    size={isTablet ? "sm" : "default"}
                    onClick={handleFotoCapture}
                    className="w-full"
                  >
                    {fotoPreview ? (
                      <>
                        <ImageIcon className={`mr-2 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        Alterar Foto
                      </>
                    ) : (
                      <>
                        <Camera className={`mr-2 ${isTablet ? 'h-3 w-3' : 'h-4 w-4'}`} />
                        {isTablet ? "Adicionar Foto" : "Adicionar Foto do Problema"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* 5. Localização */}
            <Card className={`p-3 sm:p-4 border-border ${
              isTablet ? 'p-3' : ''
            }`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <Label className={`font-medium text-foreground ${
                    isTablet ? 'text-sm' : 'text-base sm:text-lg'
                  }`}>
                    5. Localização *
                  </Label>
                  {localizacao && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant={localizacao ? "outline" : "default"}
                  size={isTablet ? "sm" : "default"}
                  onClick={handleGoToMap}
                  className={`w-full ${
                    isTablet ? 'h-10' : 'h-12 sm:h-14'
                  } ${localizacao 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100 text-green-700' 
                    : ''
                  }`}
                >
                  <MapPin className={`mr-2 ${
                    isTablet ? 'h-3 w-3' : 'h-4 w-4'
                  } ${localizacao ? 'text-green-600' : ''}`} />
                  <span className="text-left flex-1 truncate">
                    {localizacao 
                      ? "✓ Local marcada" 
                      : "Marcar no Mapa"
                    }
                  </span>
                </Button>
                
                {localizacao?.endereco && (
                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{localizacao.endereco}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!localizacao && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Marque a localização no mapa
                  </p>
                )}
              </div>
            </Card>

            {/* Status de preenchimento - Mais compacto */}
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium mb-1">Status:</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      categoria ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {categoria ? <Check className="h-3 w-3" /> : "1"}
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      titulo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {titulo ? <Check className="h-3 w-3" /> : "2"}
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      descricao ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {descricao ? <Check className="h-3 w-3" /> : "3"}
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      localizacao ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {localizacao ? <Check className="h-3 w-3" /> : "4"}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-xs font-medium ${
                    categoria && titulo && descricao && localizacao 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {categoria && titulo && descricao && localizacao 
                      ? "Pronto!" 
                      : "Complete"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="pt-3">
              <Button
                type="submit"
                size={isTablet ? "sm" : "default"}
                disabled={criarProblema.isPending || !categoria || !titulo || !descricao || !localizacao}
                className={`w-full ${
                  isTablet ? 'h-10' : 'h-12 sm:h-14'
                }`}
              >
                {criarProblema.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Enviando...
                  </span>
                ) : (
                  <>
                    <Check className={`mr-2 ${
                      isTablet ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'
                    }`} />
                    {isTablet ? "Enviar" : "Enviar Registro"}
                  </>
                )}
              </Button>
              
              <p className={`text-center mt-1 ${
                categoria && titulo && descricao && localizacao 
                  ? 'text-green-600' 
                  : 'text-muted-foreground'
              } ${isTablet ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                {categoria && titulo && descricao && localizacao 
                  ? "✅ Todos os campos preenchidos"
                  : "* Campos obrigatórios"
                }
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Registrar;
