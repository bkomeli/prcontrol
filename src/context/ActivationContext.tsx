import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Activation, ActivationStatus, Team } from "@/types/activation";

interface ActivationContextType {
  activations: Activation[];
  addActivation: (data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => void;
  updateStatus: (id: string, status: ActivationStatus) => void;
  assignTeam: (id: string, equipe: Team, responsavel: string) => void;
  updateActivation: (id: string, updates: Partial<Activation>) => void;
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
  };
}

export function ActivationProvider({ children }: { children: React.ReactNode }) {
  const [activations, setActivations] = useState<Activation[]>([]);

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from("activations")
      .select("*")
      .order("criado_em", { ascending: false });
    if (data) setActivations(data.map(mapRow));
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("activations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "activations" }, () => {
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addActivation = useCallback(async (data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => {
    const now = new Date().toISOString();
    const optimistic: Activation = {
      ...data,
      id: crypto.randomUUID(),
      status: "Aguardando equipe",
      criadoEm: now,
      atualizadoEm: now,
    };
    // Optimistic insert
    setActivations((prev) => [optimistic, ...prev]);

    await supabase.from("activations").insert({
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
    });
  }, []);

  const updateStatus = useCallback(async (id: string, status: ActivationStatus) => {
    setActivations((prev) => prev.map((a) => a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a));
    await supabase.from("activations").update({ status }).eq("id", id);
  }, []);

  const assignTeam = useCallback(async (id: string, equipe: Team, responsavel: string) => {
    setActivations((prev) => prev.map((a) => a.id === id ? { ...a, equipe, responsavel, status: "Em deslocamento" as ActivationStatus, atualizadoEm: new Date().toISOString() } : a));
    await supabase.from("activations").update({
      equipe,
      responsavel,
      status: "Em deslocamento" as string,
    }).eq("id", id);
  }, []);

  const updateActivation = useCallback(async (id: string, updates: Partial<Activation>) => {
    setActivations((prev) => prev.map((a) => a.id === id ? { ...a, ...updates, atualizadoEm: new Date().toISOString() } : a));
    const dbUpdates: Record<string, any> = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.equipe) dbUpdates.equipe = updates.equipe;
    if (updates.responsavel !== undefined) dbUpdates.responsavel = updates.responsavel;
    await supabase.from("activations").update(dbUpdates).eq("id", id);
  }, []);

  return (
    <ActivationContext.Provider value={{ activations, addActivation, updateStatus, assignTeam, updateActivation }}>
      {children}
    </ActivationContext.Provider>
  );
}

export function useActivations() {
  const ctx = useContext(ActivationContext);
  if (!ctx) throw new Error("useActivations must be used within ActivationProvider");
  return ctx;
}
