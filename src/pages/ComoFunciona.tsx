import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, TabletSmartphone, Map, CheckCircle, Home } from "lucide-react";
import { Card } from "@/components/ui/card";

const ComoFunciona = () => {
  const navigate = useNavigate();

  const passos = [
    {
      numero: 1,
      titulo: "Identifique o problema",
      descricao: "Veja algo que precisa melhorar? Iluminação, buraco, lixo, praça, escola… qualquer ponto do bairro.",
      icon: Search,
      color: "text-blue-600 bg-blue-100",
    },
    {
      numero: 2,
      titulo: "Registre no Totem",
      descricao: "Toque em 'Registrar Problema', descreva o que aconteceu e adicione uma foto se quiser.",
      icon: TabletSmartphone,
      color: "text-purple-600 bg-purple-100",
    },
    {
      numero: 3,
      titulo: "Marque no mapa",
      descricao: "Mostre onde está o problema usando o mapa interativo ou escolha a localização aproximada.",
      icon: Map,
      color: "text-orange-600 bg-orange-100",
    },
    {
      numero: 4,
      titulo: "Envie e pronto!",
      descricao: "Sua solicitação será registrada e ajudará a melhorar o bairro.",
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 sm:px-8 md:px-12 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
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
            Como Funciona o Totem?
          </h1>
          <div className="w-[60px] sm:w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* Introduction */}
          <Card className="p-6 sm:p-8 md:p-10 bg-primary/5 border-2 border-primary/20">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center text-foreground leading-relaxed">
              Este totem ajuda você a registrar problemas do bairro de forma rápida e fácil. 
              <span className="font-semibold text-primary"> Cada contribuição fortalece nossa comunidade.</span>
            </p>
          </Card>

          {/* Step by Step Section */}
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground">
              Passo a Passo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {passos.map((passo) => {
                const IconComponent = passo.icon;
                
                return (
                  <Card key={passo.numero} className="p-4 sm:p-6 md:p-8 hover:shadow-lg transition-shadow">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Icon and Number */}
                      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl ${passo.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">
                            Passo {passo.numero}
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground break-words">
                            {passo.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                        {passo.descricao}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Importance Section */}
          <Card className="p-6 sm:p-8 md:p-10 bg-secondary/10 border-2 border-secondary/20">
            <div className="space-y-3 sm:space-y-4 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Por que sua participação é importante?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-2">
                Quando moradores participam, a comunidade cresce. 
                Seu registro ajuda a priorizar ações e dá voz a quem vive o território.
              </p>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="pt-6 sm:pt-8">
            <Button
              size="xl"
              onClick={() => navigate("/")}
              className="w-full min-h-[56px]"
            >
              <Home className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base md:text-lg">Voltar ao Início</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComoFunciona;
