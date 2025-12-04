import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const signupSchema = z.object({
  nome: z.string().trim().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).max(100),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email: formData.email, password: formData.password });
      } else {
        signupSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const promoteToAdmin = async (userId: string) => {
    const { data, error } = await supabase.rpc("promote_first_admin", {
      _user_id: userId,
    });
    
    if (!error && data) {
      toast.success("Você foi promovido a administrador!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos");
          } else {
            toast.error("Erro ao fazer login");
          }
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.nome);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado");
          } else {
            toast.error("Erro ao criar conta");
          }
        } else {
          // Tentar promover primeiro usuário a admin
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await promoteToAdmin(session.user.id);
          }
          toast.success("Conta criada com sucesso!");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - MAX-W-7XL */}
      <header className="border-b border-border bg-card px-3 sm:px-6 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center">
          <Button
            variant="ghost"
            size={window.innerWidth < 640 ? "sm" : "default"}
            onClick={() => navigate("/")}
            className="min-h-[40px] sm:min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content - Centralizado e responsivo */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-7xl mx-auto flex justify-center">
          <Card className="w-full max-w-md sm:max-w-xl md:max-w-2xl">
            <CardHeader className="text-center space-y-3 sm:space-y-4">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
                {isLogin ? "Entrar" : "Criar Conta"}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                {isLogin
                  ? "Entre com suas credenciais"
                  : "Preencha os dados para criar sua conta"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-base sm:text-lg font-medium">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="pl-12 h-12 sm:h-14 text-base sm:text-lg"
                      />
                    </div>
                    {errors.nome && (
                      <p className="text-sm sm:text-base text-destructive">{errors.nome}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base sm:text-lg font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 sm:h-14 text-base sm:text-lg"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm sm:text-base text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base sm:text-lg font-medium">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12 sm:h-14 text-base sm:text-lg"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm sm:text-base text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
                </Button>
              </form>

              <div className="mt-6 sm:mt-8 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-sm sm:text-base text-primary hover:underline font-medium"
                >
                  {isLogin
                    ? "Não tem conta? Criar uma"
                    : "Já tem conta? Entrar"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
