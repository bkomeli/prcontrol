import { useState, useMemo, useEffect } from "react";
import { useActivations } from "@/context/ActivationContext";
import { useDateFilter } from "@/context/DateFilterContext";
import { useEquipes, useTransportadoras, useMotivos } from "@/hooks/useCadastros";
import { DateFilter } from "@/components/DateFilter";
import { STATUS_LIST } from "@/types/activation";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart3, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getPlantaoLabel } from "@/utils/plantao";

const COLORS = ["hsl(50,100%,50%)", "hsl(217,91%,60%)", "hsl(25,95%,53%)", "hsl(280,65%,60%)", "hsl(142,71%,45%)", "hsl(0,84%,60%)", "hsl(180,60%,50%)", "hsl(330,70%,55%)"];

function CustomTooltip({ active, payload, label, metricLabel }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-1">{payload[0]?.payload?.name || label}</p>
      <p className="text-sm text-primary font-semibold">{metricLabel}: {payload[0]?.value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { activations } = useActivations();
  const { dateRange, setDateRange } = useDateFilter();
  const { items: equipes } = useEquipes();
  const { items: transportadoras } = useTransportadoras();
  const { items: motivos } = useMotivos();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEquipe, setFilterEquipe] = useState<string>("all");
  const [filterCidade, setFilterCidade] = useState("");
  const [filterMotivo, setFilterMotivo] = useState<string>("all");
  const [filterTransportadora, setFilterTransportadora] = useState<string>("all");
  const [plantaoLabel, setPlantaoLabel] = useState(getPlantaoLabel());

  // Update plantão label every minute
  useEffect(() => {
    const interval = setInterval(() => setPlantaoLabel(getPlantaoLabel()), 60000);
    return () => clearInterval(interval);
  }, []);
  // Base filtered (respects date + filters) — EXCLUDES Cancelado from all metrics
  const filtered = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return activations.filter((a) => {
      const d = new Date(a.criadoEm);
      if (d < dayStart || d > dayEnd) return false;
      if (a.status === "Cancelado") return false; // EXCLUDE cancelled
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterEquipe !== "all" && a.equipe !== filterEquipe) return false;
      if (filterMotivo !== "all" && a.motivo !== filterMotivo) return false;
      if (filterTransportadora !== "all" && a.transportador !== filterTransportadora) return false;
      if (filterCidade && !(a.cidade || "").toLowerCase().includes(filterCidade.toLowerCase())) return false;
      return true;
    });
  }, [activations, dateRange, filterStatus, filterEquipe, filterMotivo, filterTransportadora, filterCidade]);



  const byTeam = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => { const k = a.equipe || "Sem equipe"; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byMotivo = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => { map[a.motivo] = (map[a.motivo] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byTransportadora = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => { map[a.transportador] = (map[a.transportador] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const byCidade = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((a) => { const k = a.cidade || "Sem cidade"; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);




  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Dashboard
          <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 ml-2">
            {filtered.length} acionamentos
          </span>
        </h1>
        <div className="ml-auto flex items-center gap-2 bg-accent/50 rounded-lg px-3 py-1.5">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Plantão: <strong>{plantaoLabel}</strong></span>
        </div>
      </div>

      {/* Filters row — period + city side by side */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <DateFilter range={dateRange} onChange={setDateRange} />
        <Input
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
          placeholder="Filtrar cidade..."
          className="h-8 w-36 text-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-40 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            {STATUS_LIST.filter((s) => s !== "Cancelado").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEquipe} onValueChange={setFilterEquipe}>
          <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Equipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas equipes</SelectItem>
            {equipes.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMotivo} onValueChange={setFilterMotivo}>
          <SelectTrigger className="h-8 w-44 text-sm"><SelectValue placeholder="Motivo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos motivos</SelectItem>
            {motivos.map((m) => <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterTransportadora} onValueChange={setFilterTransportadora}>
          <SelectTrigger className="h-8 w-44 text-sm"><SelectValue placeholder="Transportadora" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas transportadoras</SelectItem>
            {transportadoras.map((t) => <SelectItem key={t.id} value={t.nome}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 transition-shadow duration-200 hover:shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">Equipes mais acionadas</h3>
          {byTeam.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma PR encontrada para os filtros selecionados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byTeam} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                <Tooltip content={<CustomTooltip metricLabel="Acionamentos" />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 transition-shadow duration-200 hover:shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">Motivos</h3>
          {byMotivo.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma PR encontrada para os filtros selecionados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byMotivo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10} animationDuration={600}>
                  {byMotivo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip metricLabel="Ocorrências" />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 transition-shadow duration-200 hover:shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">PRs por Cidade</h3>
          {byCidade.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma PR encontrada para os filtros selecionados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byCidade.slice(0, 15)}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<CustomTooltip metricLabel="PRs" />} />
                <Bar dataKey="value" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 transition-shadow duration-200 hover:shadow-lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">Transportadoras</h3>
          {byTransportadora.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Nenhuma PR encontrada para os filtros selecionados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byTransportadora}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<CustomTooltip metricLabel="PRs" />} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

      </div>
    </div>
  );
}
