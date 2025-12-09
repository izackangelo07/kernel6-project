import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, X, Check, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

const Registrar = () => {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number; endereco?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const criarProblema = useCriarProblema();
  const [isLargeTablet, setIsLargeTablet] = useState(false);
  const [isMediumTablet, setIsMediumTablet] = useState(false);
  const [isSmallTablet, setIsSmallTablet] = useState(false);
  const [fontSize, setFontSize] = useState("text-sm");
  const [isMobile, setIsMobile] = useState(false);

  // Verificar resolução da tela e dispositivo
  useEffect(() => {
    const checkResolution = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Reset states
      setIsLargeTablet(false);
      setIsMediumTablet(false);
      setIsSmallTablet(false);
      setIsMobile(false);
      
      // Verificar se é mobile (baseado na largura)
      if (width < 768) {
        setIsMobile(true);
        setFontSize("text-sm");
        return;
      }
      
      // Verificar resoluções específicas de tablets
      if (width === 1024 && height === 1366) {
        // iPad Pro 12.9" portrait - +10%
        setIsLargeTablet(true);
        setFontSize("text-lg");
      } else if (width === 820 && height === 1180) {
        // iPad Air 10.9" portrait - padrão
        setIsMediumTablet(true);
        setFontSize("text-base");
      } else if (width === 768 && height === 1024) {
        // iPad Mini 7.9" portrait - +5%
        setIsSmallTablet(true);
        setFontSize("text-sm");
      } else if (width >= 768 && width <= 1024) {
        // Tablet genérico
        setFontSize("text-sm");
      } else {
        // Desktop
        setFontSize("text-base");
      }
    };

    checkResolution();
    window.addEventListener('resize', checkResolution);
    
    return () => window.removeEventListener('resize', checkResolution);
  }, []);

  // Funções para obter as alturas baseadas na resolução
  const getInputHeight = () => {
    if (isLargeTablet) return "h-24"; // 10% maior (iPad Pro)
    if (isMediumTablet) return "h-20"; // padrão (iPad Air)
    if (isSmallTablet) return "h-12"; // 5% maior (iPad Mini)
    if (isMobile) return "h-10"; // mobile
    return "h-12"; // desktop padrão
  };

  const getTextareaHeight = () => {
    if (isLargeTablet) return "min-h-[130px]"; // 10% maior
    if (isMediumTablet) return "min-h-[115px]"; // padrão
    if (isSmallTablet) return "min-h-[105px]"; // 5% maior
    if (isMobile) return "min-h-[80px]"; // mobile
    return "min-h-[100px]"; // desktop
  };

  const getButtonHeight = () => {
    if (isLargeTablet) return "h-24"; // 10% maior
    if (isMediumTablet) return "h-20"; // padrão
    if (isSmallTablet) return "h-12"; // 5% maior
    if (isMobile) return "h-10"; // mobile
    return "h-12"; // desktop
  };

  const getFotoPreviewHeight = () => {
    if (isLargeTablet) return "h-48"; // 10% maior
    if (isMediumTablet) return "h-44"; // padrão
    if (isSmallTablet) return "h-40"; // 5% maior
    if (isMobile) return "h-32"; // mobile
    return "h-40"; // desktop
  };

  const getCardPadding = () => {
    if (isLargeTablet) return "p-4 sm:p-5"; // 10% maior
    if (isMediumTablet) return "p-4 sm:p-5"; // padrão
    if (isSmallTablet) return "p-4 sm:p-5"; // 5% maior
    if (isMobile) return "p-3"; // mobile
    return "p-4 sm:p-6"; // desktop
  };

  const getSpacing = () => {
    if (isLargeTablet) return "space-y-3.5"; // 10% maior
    if (isMediumTablet) return "space-y-3.5"; // padrão
    if (isSmallTablet) return "space-y-3.5"; // 5% maior
    if (isMobile) return "space-y-2.5"; // mobile
    return "space-y-4"; // desktop
  };

  // Efeito para carregar localização e dados salvos
  useEffect(() => {
    // Carregar localização
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

    // Carregar dados do formulário salvos
    const dadosSalvos = sessionStorage.getItem("registroDados");
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        if (dados.categoria) setCategoria(dados.categoria);
        if (dados.titulo) setTitulo(dados.titulo);
        if (dados.descricao) setDescricao(dados.descricao);
        if (dados.fotoPreview) setFotoPreview(dados.fotoPreview);
      } catch (error) {
        console.error("Erro ao carregar dados salvos:", error);
      }
    }
  }, []);

  // Salvar dados no sessionStorage (incluindo foto)
  const salvarDados = () => {
    try {
      const dadosParaSalvar = {
        categoria,
        titulo,
        descricao,
        fotoPreview,
      };
      sessionStorage.setItem("registroDados", JSON.stringify(dadosParaSalvar));
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
  }, [categoria, titulo, descricao, fotoPreview]);

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
      setIsUploading(true);
      let imagem_url: string | null = null;

      // Upload da imagem se existir
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('problemas-images')
          .upload(filePath, foto);

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          toast.error("Erro ao enviar a imagem. Tente novamente.");
          setIsUploading(false);
          return;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('problemas-images')
          .getPublicUrl(filePath);

        imagem_url = publicUrl;
      }

      await criarProblema.mutateAsync({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria,
        latitude: localizacao!.lat,
        longitude: localizacao!.lng,
        imagem_url,
      });

      sessionStorage.removeItem("registroDados");
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
    } finally {
      setIsUploading(false);
    }
  };

  const handleFotoCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    if (window.innerWidth < 768) {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - MAX-W-7XL */}
      <header className="border-b border-border bg-card px-3 sm:px-6 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/ideias")}
            className={`min-h-[40px] ${isMobile ? 'min-h-[36px]' : 'sm:min-h-[44px]'}`}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <h1 className={`font-semibold text-foreground text-center flex-1 truncate ${
            fontSize === "text-sm" ? "text-lg" : "text-xl sm:text-2xl"
          }`}>
            Registrar Problema
          </h1>
          
          {/* Espaçador para alinhamento */}
          <div className="w-12" />
        </div>
      </header>

      {/* Main Content - Container principal mantendo consistência */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Container principal max-w-7xl movido para fora do form */}
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Conteúdo do formulário com padding responsivo */}
            <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-6 md:px-8 py-4">
              
              {/* Conteúdo do formulário com scroll interno */}
              <div className={`flex-1 overflow-y-auto min-h-0 ${getSpacing()} pb-4`}>
                {/* 1. Categoria */}
                <Card className={`${getCardPadding()} border-border`}>
                  <div className={getSpacing()}>
                    <div className="flex items-start justify-between">
                      <Label htmlFor="categoria" className={`font-medium text-foreground ${fontSize}`}>
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
                        className={`${getInputHeight()} ${fontSize} ${categoria ? 'border-green-500' : ''}`}
                      >
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-2 z-50 max-h-60">
                        {categorias.map((cat) => (
                          <SelectItem 
                            key={cat} 
                            value={cat}
                            className={`${fontSize} py-2`}
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
                <Card className={`${getCardPadding()} border-border`}>
                  <div className={getSpacing()}>
                    <div className="flex items-start justify-between">
                      <Label htmlFor="titulo" className={`font-medium text-foreground ${fontSize}`}>
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
                      className={`${getInputHeight()} ${fontSize} ${titulo ? 'border-green-500' : ''}`}
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
                <Card className={`${getCardPadding()} border-border`}>
                  <div className={getSpacing()}>
                    <div className="flex items-start justify-between">
                      <Label htmlFor="descricao" className={`font-medium text-foreground ${fontSize}`}>
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
                      className={`${getTextareaHeight()} ${fontSize} resize-none ${descricao ? 'border-green-500' : ''}`}
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
                <Card className={`${getCardPadding()} border-border`}>
                  <div className={getSpacing()}>
                    <Label className={`font-medium text-foreground ${fontSize}`}>
                      4. Foto (Opcional)
                    </Label>
                    
                    <div className={getSpacing()}>
                      {fotoPreview && (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                          <img 
                            src={fotoPreview} 
                            alt="Preview" 
                            className={`w-full ${getFotoPreviewHeight()} object-cover`}
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
                        size="sm"
                        onClick={handleFotoCapture}
                        className={`w-full ${getButtonHeight()} ${fontSize}`}
                      >
                        {fotoPreview ? (
                          <>
                            <ImageIcon className={`mr-2 ${fontSize === "text-sm" ? "h-3 w-3" : "h-4 w-4"}`} />
                            Alterar Foto
                          </>
                        ) : (
                          <>
                            <Camera className={`mr-2 ${fontSize === "text-sm" ? "h-3 w-3" : "h-4 w-4"}`} />
                            {isMobile ? "Adicionar Foto" : "Adicionar Foto do Problema"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* 5. Localização */}
                <Card className={`${getCardPadding()} border-border`}>
                  <div className={getSpacing()}>
                    <div className="flex items-start justify-between">
                      <Label className={`font-medium text-foreground ${fontSize}`}>
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
                      size="sm"
                      onClick={handleGoToMap}
                      className={`w-full ${getButtonHeight()} ${fontSize} ${
                        localizacao 
                          ? 'border-green-500 bg-green-50 hover:bg-green-100 text-green-700' 
                          : ''
                      }`}
                    >
                      <MapPin className={`mr-2 ${fontSize === "text-sm" ? "h-3 w-3" : "h-4 w-4"} ${
                        localizacao ? 'text-green-600' : ''
                      }`} />
                      <span className="text-center flex-1 truncate">
                        {localizacao 
                          ? "✓ Local Marcado" 
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

                {/* Botão de Envio */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    size={isMobile ? "sm" : "default"}
                    disabled={criarProblema.isPending || isUploading || !categoria || !titulo || !descricao || !localizacao}
                    className={`w-full ${getButtonHeight()} ${fontSize}`}
                  >
                    {(criarProblema.isPending || isUploading) ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className={`${fontSize === "text-sm" ? "h-3 w-3" : "h-4 w-4"} animate-spin`} />
                        {isUploading ? "Enviando foto..." : "Enviando..."}
                      </span>
                    ) : (
                      <>
                        <Check className={`mr-2 ${fontSize === "text-sm" ? "h-3 w-3" : "h-4 w-4"}`} />
                        {isMobile ? "Enviar" : "Enviar Registro"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Registrar;
