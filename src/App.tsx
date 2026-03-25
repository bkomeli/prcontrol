import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNav } from "@/components/TopNav";
import { ActivationProvider } from "@/context/ActivationContext";
import Index from "./pages/Index";
import PrAtivas from "./pages/PrAtivas";
import Historico from "./pages/Historico";
import Dashboard from "./pages/Dashboard";
import Cadastros from "./pages/Cadastros";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ActivationProvider>
          <div className="min-h-screen flex flex-col w-full">
            <TopNav />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pr-ativas" element={<PrAtivas />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/relatorios" element={<Dashboard />} />
                <Route path="/cadastros" element={<Cadastros />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </ActivationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
