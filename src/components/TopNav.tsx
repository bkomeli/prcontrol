import { LayoutDashboard, Siren, History, BarChart3, Settings, Monitor, MapPin } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";

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
      <div className="ml-auto">
        <span className="text-xs text-muted-foreground">Pronta Resposta Logística</span>
      </div>
    </nav>
  );
}
