import { useState, useMemo, useCallback } from "react";
import { useActivations } from "@/context/ActivationContext";
import { StatusBadge } from "@/components/StatusBadge";
import { QuickActions } from "@/components/QuickActions";
import { DetailModal } from "@/components/DetailModal";
import { DateFilter } from "@/components/DateFilter";
import { STATUS_LIST, TEAMS } from "@/types/activation";
import type { Activation, ActivationStatus } from "@/types/activation";
import type { DateRange } from "react-day-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { History, Search, AlertTriangle, EyeOff, Eye, CheckSquare, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

function exportCSV(data: Activation[]) {
  const headers = ["SM", "Cavalo", "Carreta", "Transportador", "Motivo", "Status", "Equipe", "Responsável", "Armado", "Urgente", "Criado em"];
  const rows = data.map((a) => [
    a.sm, a.cavalo, a.carreta, a.transportador, a.motivo, a.status,
    a.equipe || "", a.responsavel || "", a.armado, a.urgente ? "Sim" : "Não",
    new Date(a.criadoEm).toLocaleString("pt-BR"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historico_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportXLS(data: Activation[]) {
  const headers = ["SM", "Cavalo", "Carreta", "Transportador", "Motivo", "Status", "Equipe", "Responsável", "Armado", "Urgente", "Criado em"];
  const rows = data.map((a) => [
    a.sm, a.cavalo, a.carreta, a.transportador, a.motivo, a.status,
    a.equipe || "", a.responsavel || "", a.armado, a.urgente ? "Sim" : "Não",
    new Date(a.criadoEm).toLocaleString("pt-BR"),
  ]);
  let table = "<table><tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
  rows.forEach((r) => { table += "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>"; });
  table += "</table>";
  const blob = new Blob(["\uFEFF" + table], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historico_${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Historico() {
  const { activations } = useActivations();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEquipe, setFilterEquipe] = useState<string>("all");
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({ from: today, to: today });
  const [selected, setSelected] = useState<Activation | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const dayStart = dateRange.from ? new Date(dateRange.from) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dateRange.to ? new Date(dateRange.to) : new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return activations.filter((a) => {
      const d = new Date(a.criadoEm);
      if (d < dayStart || d > dayEnd) return false;
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterEquipe !== "all" && a.equipe !== filterEquipe) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          a.sm.toLowerCase().includes(q) ||
          a.cavalo.toLowerCase().includes(q) ||
          a.carreta.toLowerCase().includes(q) ||
          a.transportador.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (hiddenIds.has(a.id)) return false;
      return true;
    });
  }, [activations, search, filterStatus, filterEquipe, dateRange, hiddenIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };

  const hideSelected = () => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      selectedIds.forEach((id) => next.add(id));
      return next;
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const showAll = () => setHiddenIds(new Set());

  const formatTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <History className="h-6 w-6 text-primary" />
        Histórico
      </h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar SM, placa, transportador..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-9 w-44 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterEquipe} onValueChange={setFilterEquipe}>
          <SelectTrigger className="h-9 w-40 text-sm"><SelectValue placeholder="Equipe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas equipes</SelectItem>
            {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <DateFilter range={dateRange} onChange={setDateRange} />

        <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => { exportCSV(filtered); toast.success("CSV exportado!"); }}>
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={() => { exportXLS(filtered); toast.success("XLS exportado!"); }}>
          <Download className="h-3.5 w-3.5" /> XLS
        </Button>

        {hiddenIds.size > 0 && (
          <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={showAll}>
            <Eye className="h-3.5 w-3.5" /> Mostrar ocultos ({hiddenIds.size})
          </Button>
        )}
        <Button variant={selectMode ? "default" : "outline"} size="sm" className="h-9 text-xs gap-1" onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}>
          <EyeOff className="h-3.5 w-3.5" /> Ocultar
        </Button>
      </div>

      {selectMode && (
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={selectAll}>
            <CheckSquare className="h-3 w-3" />
            {selectedIds.size === filtered.length ? "Desmarcar todos" : "Selecionar todos"}
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" className="h-7 text-xs gap-1" onClick={hideSelected}>
              <EyeOff className="h-3 w-3" /> Ocultar selecionados ({selectedIds.size})
            </Button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {selectMode && <TableHead className="text-xs w-8"></TableHead>}
              <TableHead className="text-xs w-8"></TableHead>
              <TableHead className="text-xs">Placa</TableHead>
              <TableHead className="text-xs">Transportadora</TableHead>
              <TableHead className="text-xs">Motivo</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Hora</TableHead>
              <TableHead className="text-xs">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectMode ? 8 : 7} className="text-center text-muted-foreground py-8">Nenhum registro encontrado</TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(a)}>
                  {selectMode && (
                    <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(a.id)} onCheckedChange={() => toggleSelect(a.id)} />
                    </TableCell>
                  )}
                  <TableCell className="px-2">{a.urgente && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}</TableCell>
                  <TableCell className="text-sm font-mono">{a.cavalo}{a.carreta ? ` / ${a.carreta}` : ""}</TableCell>
                  <TableCell className="text-sm">{a.transportador}</TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{a.motivo}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatTime(a.criadoEm)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {a.status !== "Finalizado" && a.status !== "Cancelado" && <QuickActions activation={a} />}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DetailModal activation={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
