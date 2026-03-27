import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Activation, ActivationStatus, Team, ActivationLog } from "@/types/activation";
import { SINISTRO_MOTIVOS } from "@/types/activation";

interface ActivationContextType {
  activations: Activation[];
  loading: boolean;
  addActivation: (data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => void;
  updateStatus: (id: string, status: ActivationStatus) => void;
  assignTeam: (id: string, equipe: Team, responsavel: string, pacotes?: number) => void;
  updateActivation: (id: string, updates: Partial<Activation>) => void;
  addLog: (activationId: string, acao: string, detalhes?: string) => void;
  getLogs: (activationId: string) => Promise<ActivationLog[]>;
  refreshData: () => Promise<void>;
}

const ActivationContext = createContext<ActivationContextType | null>(null);

function mapRow(row: any): Activation {
  return {
    id: row.id,
    sm: row.sm,
    transportador: row.transportador,
    cavalo: row.cavalo,
    carreta: row.carreta,
    latLong: row.lat_long,
    armado: row.armado,
    motivo: row.motivo,
    autorizadoPor: row.autorizado_por,
    resumo: row.resumo,
    status: row.status as ActivationStatus,
    equipe: row.equipe as Team | undefined,
    responsavel: row.responsavel ?? undefined,
    urgente: row.urgente ?? false,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    observacoes: row.observacoes ?? "",
    sinistro: row.sinistro ?? false,
    pacotes: row.pacotes ?? 0,
    cidade: row.cidade ?? "",
  };
}

// Browser notifications
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotification(title: string, body: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/placeholder.svg" });
  }
}

export function ActivationProvider({ children }: { children: React.ReactNode }) {
  const [activations, setActivations] = useState<Activation[]>([]);
  const [loading, setLoading] = useState(true);
  const prevCountRef = useRef(0);

  useEffect(() => { requestNotificationPermission(); }, []);

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from("activations")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(5000);
    if (data) {
      const mapped = data.map(mapRow);
      setActivations((prev) => {
        // Notify on new activations
        if (prevCountRef.current > 0 && mapped.length > prevCountRef.current) {
          const newest = mapped[0];
          sendNotification("Nova PR Acionada", `Placa: ${newest.cavalo} — ${newest.motivo}`);
        }
        prevCountRef.current = mapped.length;
        return mapped;
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel("activations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "activations" }, (payload) => {
        // Notify on status changes
        if (payload.eventType === "UPDATE" && payload.old && payload.new) {
          const oldStatus = (payload.old as any).status;
          const newStatus = (payload.new as any).status;
          if (oldStatus !== newStatus) {
            sendNotification("Status Alterado", `${(payload.new as any).cavalo}: ${oldStatus} → ${newStatus}`);
          }
        }
        fetchAll();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addLog = useCallback(async (activationId: string, acao: string, detalhes = "") => {
    await supabase.from("activation_logs").insert({
      activation_id: activationId,
      acao,
      detalhes,
    } as any);
  }, []);

  const getLogs = useCallback(async (activationId: string): Promise<ActivationLog[]> => {
    const { data } = await supabase
      .from("activation_logs")
      .select("*")
      .eq("activation_id", activationId)
      .order("criado_em", { ascending: false }) as any;
    return (data || []) as ActivationLog[];
  }, []);

  const addActivation = useCallback(async (data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => {
    const now = new Date().toISOString();
    const sinistro = data.sinistro || SINISTRO_MOTIVOS.has(data.motivo.toUpperCase());
    const optimistic: Activation = {
      ...data,
      id: crypto.randomUUID(),
      status: "Aguardando equipe",
      criadoEm: now,
      atualizadoEm: now,
      sinistro,
    };
    setActivations((prev) => [optimistic, ...prev]);

    const { data: inserted } = await supabase.from("activations").insert({
      sm: data.sm,
      transportador: data.transportador,
      cavalo: data.cavalo,
      carreta: data.carreta,
      lat_long: data.latLong,
      armado: data.armado,
      motivo: data.motivo,
      autorizado_por: data.autorizadoPor,
      resumo: data.resumo,
      urgente: data.urgente,
      observacoes: data.observacoes || "",
      sinistro,
      pacotes: data.pacotes || 0,
      cidade: data.cidade || "",
    } as any).select().single();

    if (inserted) {
      addLog((inserted as any).id, "PR Criada", `SM: ${data.sm} | Placa: ${data.cavalo}`);
    }
  }, [addLog]);

  const updateStatus = useCallback(async (id: string, status: ActivationStatus) => {
    const prev = activations.find((a) => a.id === id);
    setActivations((p) => p.map((a) => a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a));
    await supabase.from("activations").update({ status } as any).eq("id", id);
    addLog(id, "Status alterado", `${prev?.status || "?"} → ${status}`);
  }, [activations, addLog]);

  const assignTeam = useCallback(async (id: string, equipe: Team, responsavel: string, pacotes?: number) => {
    const updates: any = {
      equipe,
      responsavel,
      status: "Em deslocamento",
    };
    if (pacotes !== undefined) updates.pacotes = pacotes;
    setActivations((p) => p.map((a) => a.id === id ? { ...a, equipe, responsavel, pacotes: pacotes ?? a.pacotes, status: "Em deslocamento" as ActivationStatus, atualizadoEm: new Date().toISOString() } : a));
    await supabase.from("activations").update(updates).eq("id", id);
    addLog(id, "Equipe designada", `Equipe: ${equipe} | Responsável: ${responsavel}${pacotes ? ` | Pacotes: ${pacotes}` : ""}`);
  }, [addLog]);

  const updateActivation = useCallback(async (id: string, updates: Partial<Activation>) => {
    const prev = activations.find((a) => a.id === id);
    setActivations((p) => p.map((a) => a.id === id ? { ...a, ...updates, atualizadoEm: new Date().toISOString() } : a));
    const dbUpdates: Record<string, any> = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.equipe !== undefined) dbUpdates.equipe = updates.equipe;
    if (updates.responsavel !== undefined) dbUpdates.responsavel = updates.responsavel;
    if (updates.sm !== undefined) dbUpdates.sm = updates.sm;
    if (updates.transportador !== undefined) dbUpdates.transportador = updates.transportador;
    if (updates.cavalo !== undefined) dbUpdates.cavalo = updates.cavalo;
    if (updates.carreta !== undefined) dbUpdates.carreta = updates.carreta;
    if (updates.latLong !== undefined) dbUpdates.lat_long = updates.latLong;
    if (updates.armado !== undefined) dbUpdates.armado = updates.armado;
    if (updates.motivo !== undefined) dbUpdates.motivo = updates.motivo;
    if (updates.autorizadoPor !== undefined) dbUpdates.autorizado_por = updates.autorizadoPor;
    if (updates.resumo !== undefined) dbUpdates.resumo = updates.resumo;
    if (updates.observacoes !== undefined) dbUpdates.observacoes = updates.observacoes;
    if (updates.sinistro !== undefined) dbUpdates.sinistro = updates.sinistro;
    if (updates.pacotes !== undefined) dbUpdates.pacotes = updates.pacotes;
    if (updates.cidade !== undefined) dbUpdates.cidade = updates.cidade;
    await supabase.from("activations").update(dbUpdates as any).eq("id", id);

    // Build log details
    const changes: string[] = [];
    Object.keys(updates).forEach((key) => {
      const oldVal = (prev as any)?.[key];
      const newVal = (updates as any)[key];
      if (oldVal !== newVal) changes.push(`${key}: ${oldVal ?? "—"} → ${newVal}`);
    });
    if (changes.length > 0) addLog(id, "Edição", changes.join(" | "));
  }, [activations, addLog]);

  return (
    <ActivationContext.Provider value={{ activations, loading, addActivation, updateStatus, assignTeam, updateActivation, addLog, getLogs }}>
      {children}
    </ActivationContext.Provider>
  );
}

export function useActivations() {
  const ctx = useContext(ActivationContext);
  if (!ctx) throw new Error("useActivations must be used within ActivationProvider");
  return ctx;
}
