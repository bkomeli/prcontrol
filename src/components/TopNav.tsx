import { LayoutDashboard, Siren, History, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "PR Ativas", url: "/pr-ativas", icon: Siren },
  { title: "Histórico", url: "/historico", icon: History },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Cadastros", url: "/cadastros", icon: Settings },
];

export function TopNav() {
  return (
    <nav className="h-14 bg-card border-b border-border flex items-center px-6 shrink-0">
      <h1 className="text-base font-bold tracking-tight mr-8">
        <span className="text-primary">PR</span>
        <span className="text-foreground"> Control</span>
      </h1>
      <div className="flex items-center gap-1">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
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
