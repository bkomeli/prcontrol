import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ActivationProvider } from "@/context/ActivationContext";
import Index from "./pages/Index";
import PrAtivas from "./pages/PrAtivas";
import Historico from "./pages/Historico";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ActivationProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <header className="h-12 flex items-center border-b border-border bg-card px-4 shrink-0">
                  <SidebarTrigger />
                  <span className="ml-3 text-sm font-medium text-muted-foreground">Pronta Resposta Logística</span>
                </header>
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/pr-ativas" element={<PrAtivas />} />
                    <Route path="/historico" element={<Historico />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ActivationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
