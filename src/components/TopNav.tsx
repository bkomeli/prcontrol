import { useState } from "react";
import { LayoutDashboard, Siren, History, BarChart3, Settings, Monitor, MapPin, RefreshCw } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "PR Ativas", url: "/pr-ativas", icon: Siren },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Mapa", url: "/mapa", icon: MapPin },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Cadastros", url: "/cadastros", icon: Settings },
  { title: "Painel", url: "/painel", icon: Monitor },
];

export function TopNav() {
  const { refreshData } = useActivations();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success("Dados atualizados!");
    } catch {
      toast.error("Erro ao atualizar dados");
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  return (
    <nav className="h-14 bg-card border-b border-border flex items-center px-6 shrink-0">
      <Link to="/" className="text-base font-bold tracking-tight mr-8 hover:opacity-80 transition-opacity duration-200">
        <span className="text-primary">PR</span>
        <span className="text-foreground"> Control</span>
      </Link>
      <div className="flex items-center gap-1">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
            activeClassName="bg-accent text-primary font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 transition-transform duration-600 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
        <span className="text-xs text-muted-foreground">Pronta Resposta Logística</span>
      </div>
    </nav>
  );
}
