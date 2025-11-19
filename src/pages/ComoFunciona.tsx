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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-12 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
          <h1 className="text-3xl font-semibold text-foreground">
            Como Funciona o Totem?
          </h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-12 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Introduction */}
          <Card className="p-10 bg-primary/5 border-2 border-primary/20">
            <p className="text-2xl text-center text-foreground leading-relaxed">
              Este totem ajuda você a registrar problemas do bairro de forma rápida e fácil. 
              <span className="font-semibold text-primary"> Cada contribuição fortalece nossa comunidade.</span>
            </p>
          </Card>

          {/* Step by Step Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-foreground">
              Passo a Passo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {passos.map((passo) => {
                const IconComponent = passo.icon;
                
                return (
                  <Card key={passo.numero} className="p-8 hover:shadow-lg transition-shadow">
                    <div className="space-y-6">
                      {/* Icon and Number */}
                      <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl ${passo.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-10 w-10" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-muted-foreground mb-1">
                            Passo {passo.numero}
                          </div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {passo.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {passo.descricao}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Importance Section */}
          <Card className="p-10 bg-secondary/10 border-2 border-secondary/20">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                Por que sua participação é importante?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Quando moradores participam, a comunidade cresce. 
                Seu registro ajuda a priorizar ações e dá voz a quem vive o território.
              </p>
            </div>
          </Card>

          {/* Call to Action */}
          <div className="pt-8">
            <Button
              size="xl"
              onClick={() => navigate("/")}
              className="w-full"
            >
              <Home className="mr-3 h-6 w-6" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComoFunciona;
