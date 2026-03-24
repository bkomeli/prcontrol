import { useState } from "react";
import { useActivations } from "@/context/ActivationContext";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_LIST, TEAMS } from "@/types/activation";
import type { ActivationStatus, Team } from "@/types/activation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { History, Save } from "lucide-react";
import { toast } from "sonner";

export default function Historico() {
  const { activations, updateActivation } = useActivations();
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ status: ActivationStatus; equipe: Team | ""; responsavel: string }>({
    status: "Aguardando equipe", equipe: "", responsavel: "",
  });

  const startEdit = (a: typeof activations[0]) => {
    setEditId(a.id);
    setEditData({ status: a.status, equipe: a.equipe || "", responsavel: a.responsavel || "" });
  };

  const saveEdit = () => {
    if (!editId) return;
    updateActivation(editId, {
      status: editData.status,
      equipe: editData.equipe as Team || undefined,
      responsavel: editData.responsavel || undefined,
    });
    setEditId(null);
    toast.success("Registro atualizado");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
        <History className="h-6 w-6 text-primary" />
        Histórico
      </h1>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">SM</TableHead>
              <TableHead className="text-xs">Equipe</TableHead>
              <TableHead className="text-xs">Responsável</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Data/Hora</TableHead>
              <TableHead className="text-xs w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum registro
                </TableCell>
              </TableRow>
            ) : (
              activations.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => editId !== a.id && startEdit(a)}
                >
                  <TableCell className="text-sm font-mono font-medium">{a.sm}</TableCell>
                  <TableCell className="text-sm">
                    {editId === a.id ? (
                      <Select value={editData.equipe} onValueChange={(v) => setEditData((p) => ({ ...p, equipe: v as Team }))}>
                        <SelectTrigger className="h-7 text-xs w-28" onClick={(e) => e.stopPropagation()}>
                          <SelectValue placeholder="Equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEAMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      a.equipe || "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {editId === a.id ? (
                      <Input
                        value={editData.responsavel}
                        onChange={(e) => setEditData((p) => ({ ...p, responsavel: e.target.value }))}
                        className="h-7 text-xs w-32"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      a.responsavel || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editId === a.id ? (
                      <Select value={editData.status} onValueChange={(v) => setEditData((p) => ({ ...p, status: v as ActivationStatus }))}>
                        <SelectTrigger className="h-7 text-xs w-36" onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_LIST.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge status={a.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(a.atualizadoEm)}</TableCell>
                  <TableCell>
                    {editId === a.id && (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); saveEdit(); }}
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
