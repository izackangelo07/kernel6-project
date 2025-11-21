import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Trees, Palette, School, Bike, Sparkles, Filter } from "lucide-react";

type Categoria = "areas-verdes" | "arte-cultura" | "escola" | "mobilidade" | "futurista" | "todos";

interface Ideia {
  id: number;
  titulo: string;
  categoria: Categoria;
  resumo: string;
  descricaoIA: string;
  autor: string;
  serie: string;
  cor: string;
}

const mockIdeias: Ideia[] = [
  {
    id: 1,
    titulo: "Parque com Brinquedos Solares",
    categoria: "areas-verdes",
    resumo: "Um parque onde os brinquedos funcionam com energia solar",
    descricaoIA: "Imagine um parque moderno com balanços, gangorras e carrosséis que captam energia do sol durante o dia. À noite, eles iluminam com luzes LED coloridas, tornando o parque mágico e sustentável!",
    autor: "Maria Silva",
    serie: "5º ano",
    cor: "bg-green-50 border-green-200"
  },
  {
    id: 2,
    titulo: "Mural Colaborativo da Comunidade",
    categoria: "arte-cultura",
    resumo: "Um grande muro onde todos podem pintar suas histórias",
    descricaoIA: "Um espaço urbano transformado em galeria a céu aberto! Cada semana, uma nova seção do muro é aberta para que moradores expressem sua criatividade, contando histórias do bairro através de cores e formas.",
    autor: "João Pedro",
    serie: "6º ano",
    cor: "bg-purple-50 border-purple-200"
  },
  {
    id: 3,
    titulo: "Biblioteca Viva ao Ar Livre",
    categoria: "escola",
    resumo: "Estantes de livros nas praças para todos pegarem",
    descricaoIA: "Pequenas casinhas de madeira coloridas espalhadas pelas praças, cheias de livros gratuitos. Você pega um livro, lê, e pode devolver ou trocar por outro. Conhecimento livre e acessível para todos!",
    autor: "Ana Costa",
    serie: "7º ano",
    cor: "bg-blue-50 border-blue-200"
  },
  {
    id: 4,
    titulo: "Ciclovia com Pista de LED",
    categoria: "mobilidade",
    resumo: "Ciclovias que brilham à noite para maior segurança",
    descricaoIA: "Uma ciclovia moderna com faixas de LED embutidas no chão que acendem ao detectar movimento. Além de linda, ela torna o pedal noturno muito mais seguro e incentiva o uso de bicicletas!",
    autor: "Carlos Santos",
    serie: "8º ano",
    cor: "bg-orange-50 border-orange-200"
  },
  {
    id: 5,
    titulo: "Horta Comunitária Vertical",
    categoria: "areas-verdes",
    resumo: "Hortas nas paredes dos prédios para todos cuidarem",
    descricaoIA: "Estruturas verticais com plantas, ervas e vegetais instaladas em muros e paredes. Cada morador pode adotar uma seção, cuidar e colher. Além de embelezar, traz alimentos frescos e promove união!",
    autor: "Beatriz Lima",
    serie: "5º ano",
    cor: "bg-green-50 border-green-200"
  },
  {
    id: 6,
    titulo: "Teatro de Rua Itinerante",
    categoria: "arte-cultura",
    resumo: "Palco móvel que se monta em diferentes pontos do bairro",
    descricaoIA: "Um palco modular e colorido que pode ser montado em praças e ruas. Toda semana, apresentações de teatro, música e dança levam cultura e alegria para diferentes cantos do bairro!",
    autor: "Pedro Oliveira",
    serie: "6º ano",
    cor: "bg-purple-50 border-purple-200"
  },
  {
    id: 7,
    titulo: "Ponto de Ônibus Inteligente",
    categoria: "mobilidade",
    resumo: "Paradas com painéis mostrando horários em tempo real",
    descricaoIA: "Pontos de ônibus modernos com telas digitais que mostram quando o próximo ônibus vai chegar, têm carregadores USB, Wi-Fi grátis e cobertura solar. Esperar fica mais confortável e informativo!",
    autor: "Lucas Ferreira",
    serie: "7º ano",
    cor: "bg-orange-50 border-orange-200"
  },
  {
    id: 8,
    titulo: "Escola com Jardim no Teto",
    categoria: "escola",
    resumo: "Transformar o teto da escola em um jardim verde",
    descricaoIA: "O teto da escola vira um oásis verde com plantas, flores e pequenas árvores. Os alunos podem ter aulas ao ar livre, estudar biologia na prática e ainda ajudar a resfriar o prédio naturalmente!",
    autor: "Sofia Rodrigues",
    serie: "8º ano",
    cor: "bg-blue-50 border-blue-200"
  },
  {
    id: 9,
    titulo: "Parque com Realidade Aumentada",
    categoria: "futurista",
    resumo: "App que mostra animais virtuais no parque real",
    descricaoIA: "Usando o celular, crianças veem dinossauros, dragões e outros seres fantásticos 'passeando' pelo parque. É como um museu interativo ao ar livre, mesclando natureza real com magia digital!",
    autor: "Gabriel Alves",
    serie: "6º ano",
    cor: "bg-pink-50 border-pink-200"
  },
  {
    id: 10,
    titulo: "Fonte de Água Dançante Musical",
    categoria: "futurista",
    resumo: "Chafariz que dança conforme a música da praça",
    descricaoIA: "Uma fonte central na praça que sincroniza jatos d'água com música ambiente. À noite, luzes coloridas transformam o espetáculo em show aquático que reúne famílias e amigos!",
    autor: "Júlia Martins",
    serie: "5º ano",
    cor: "bg-pink-50 border-pink-200"
  }
];

const categorias = [
  { id: "todos" as Categoria, nome: "📌 Todos", icon: Filter },
  { id: "areas-verdes" as Categoria, nome: "🌳 Áreas Verdes", icon: Trees },
  { id: "arte-cultura" as Categoria, nome: "🎨 Arte & Cultura", icon: Palette },
  { id: "escola" as Categoria, nome: "🏫 Escola Melhorada", icon: School },
  { id: "mobilidade" as Categoria, nome: "🚲 Mobilidade & Transporte", icon: Bike },
  { id: "futurista" as Categoria, nome: "🌟 Ideias Futuristas", icon: Sparkles }
];

const PainelSonhos = () => {
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState<Categoria>("todos");
  const [ideiaAberta, setIdeiaAberta] = useState<Ideia | null>(null);

  const ideasFiltradas = filtroAtivo === "todos" 
    ? mockIdeias 
    : mockIdeias.filter(ideia => ideia.categoria === filtroAtivo);

  const getIconeCategoria = (categoria: Categoria) => {
    const cat = categorias.find(c => c.id === categoria);
    const Icon = cat?.icon || Sparkles;
    return <Icon className="w-6 h-6 sm:w-8 sm:h-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-10 left-10 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-yellow-200 opacity-20 blur-2xl"></div>
      <div className="absolute top-40 right-20 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-blue-200 opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-40 right-1/3 w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-pink-200 opacity-20 blur-2xl"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        {/* Cabeçalho */}
        <div className="mb-6 sm:mb-8 md:mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 sm:mb-6 hover:bg-white/50 min-h-[44px] px-3 sm:px-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Voltar</span>
          </Button>

          <div className="text-center space-y-2 sm:space-y-3 bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl md:text-4xl">🌟</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Painel dos Sonhos do Bairro
              </h1>
              <span className="text-2xl sm:text-3xl md:text-4xl">🎈</span>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja os futuros imaginados pelos alunos
            </p>
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {categorias.map((categoria) => {
              const Icon = categoria.icon;
              return (
                <Button
                  key={categoria.id}
                  variant={filtroAtivo === categoria.id ? "default" : "outline"}
                  onClick={() => setFiltroAtivo(categoria.id)}
                  className={`
                    min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 md:px-6 
                    text-xs sm:text-sm md:text-base
                    rounded-full transition-all duration-300
                    ${filtroAtivo === categoria.id 
                      ? 'shadow-lg scale-105' 
                      : 'hover:scale-105 bg-white/80 hover:bg-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  {categoria.nome}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Mosaico de Ideias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          {ideasFiltradas.map((ideia) => (
            <Card
              key={ideia.id}
              className={`
                ${ideia.cor} border-2 transition-all duration-300 
                hover:scale-105 hover:shadow-2xl cursor-pointer
                overflow-hidden
              `}
              onClick={() => setIdeiaAberta(ideia)}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base sm:text-lg md:text-xl mb-2 leading-tight break-words">
                      {ideia.titulo}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {ideia.serie}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ideia.autor}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-shrink-0 bg-white/80 rounded-full p-2 sm:p-3">
                    {getIconeCategoria(ideia.categoria)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2">
                  {ideia.resumo}
                </CardDescription>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdeiaAberta(ideia);
                  }}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Ver Visualização
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rodapé */}
        <div className="text-center space-y-3 sm:space-y-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/ideias")}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 bg-white hover:bg-gray-50"
            >
              ✨ Adicionar Nova Ideia
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/como-funciona")}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 hover:bg-white/50"
            >
              ❓ Como funciona
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={!!ideiaAberta} onOpenChange={() => setIdeiaAberta(null)}>
        <DialogContent className="max-w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
          {ideiaAberta && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 sm:p-4">
                    {getIconeCategoria(ideiaAberta.categoria)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl mb-2 leading-tight">
                      {ideiaAberta.titulo}
                    </DialogTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {ideiaAberta.serie}
                      </Badge>
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        Por: {ideiaAberta.autor}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 sm:space-y-6">
                {/* Mockup Visual */}
                <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border-2 border-dashed border-purple-300">
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
                    {getIconeCategoria(ideiaAberta.categoria)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    [Visualização Conceitual Gerada por IA]
                  </p>
                  <p className="text-sm sm:text-base md:text-lg font-medium mt-2 sm:mt-3 text-purple-700">
                    {ideiaAberta.titulo}
                  </p>
                </div>

                {/* Descrição da IA */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-200">
                  <DialogDescription className="text-sm sm:text-base md:text-lg leading-relaxed text-foreground">
                    <span className="font-semibold text-purple-600 block mb-2 sm:mb-3 text-base sm:text-lg">
                      🤖 Aqui está como sua ideia poderia ganhar vida no bairro:
                    </span>
                    {ideiaAberta.descricaoIA}
                  </DialogDescription>
                </div>

                {/* Botão de voltar */}
                <Button
                  onClick={() => setIdeiaAberta(null)}
                  className="w-full min-h-[48px] sm:min-h-[56px] text-base sm:text-lg"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Voltar ao Painel
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PainelSonhos;
