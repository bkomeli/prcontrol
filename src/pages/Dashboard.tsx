import { useState, useMemo } from "react";
import { useActivations } from "@/context/ActivationContext";
import { DateFilter } from "@/components/DateFilter";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { DateRange } from "react-day-picker";

const COLORS = ["hsl(50,100%,50%)", "hsl(217,91%,60%)", "hsl(25,95%,53%)", "hsl(280,65%,60%)", "hsl(142,71%,45%)", "hsl(0,84%,60%)", "hsl(180,60%,50%)", "hsl(330,70%,55%)"];

export default function Dashboard() {
  const { activations } = useActivations();
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: today, to: today });

  const filtered = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return activations.filter((a) => {
      const d = new Date(a.criadoEm);
      return d >= dayStart && d <= dayEnd;
    });
  }, [activations, dateRange]);

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

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Dashboard
          <span className="text-sm font-normal bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 ml-2">
            {filtered.length} acionamentos
          </span>
        </h1>
        <div className="ml-auto">
          <DateFilter range={dateRange} onChange={setDateRange} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Equipes mais acionadas</h3>
          {byTeam.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byTeam} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Motivos</h3>
          {byMotivo.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={byMotivo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={10}>
                  {byMotivo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Transportadoras</h3>
          {byTransportadora.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byTransportadora}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} angle={-45} textAnchor="end" height={80} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
