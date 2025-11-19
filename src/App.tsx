import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Registrar from "./pages/Registrar";
import Ideias from "./pages/Ideias";
import ComoFunciona from "./pages/ComoFunciona";
import Mapa from "./pages/Mapa";
import Confirmacao from "./pages/Confirmacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/ideias" element={<Ideias />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
