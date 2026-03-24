import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Activation, ActivationStatus, Team } from "@/types/activation";

interface ActivationContextType {
  activations: Activation[];
  addActivation: (data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => void;
  updateStatus: (id: string, status: ActivationStatus) => void;
  assignTeam: (id: string, equipe: Team, responsavel: string) => void;
  updateActivation: (id: string, updates: Partial<Activation>) => void;
}

const ActivationContext = createContext<ActivationContextType | null>(null);

const STORAGE_KEY = "pr-activations";

function loadActivations(): Activation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ActivationProvider({ children }: { children: React.ReactNode }) {
  const [activations, setActivations] = useState<Activation[]>(loadActivations);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activations));
  }, [activations]);

  const addActivation = useCallback((data: Omit<Activation, "id" | "status" | "criadoEm" | "atualizadoEm">) => {
    const now = new Date().toISOString();
    const newActivation: Activation = {
      ...data,
      id: crypto.randomUUID(),
      status: "Aguardando equipe",
      criadoEm: now,
      atualizadoEm: now,
    };
    setActivations((prev) => [newActivation, ...prev]);
  }, []);

  const updateStatus = useCallback((id: string, status: ActivationStatus) => {
    setActivations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status, atualizadoEm: new Date().toISOString() } : a
      )
    );
  }, []);

  const assignTeam = useCallback((id: string, equipe: Team, responsavel: string) => {
    setActivations((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, equipe, responsavel, status: "Em deslocamento" as ActivationStatus, atualizadoEm: new Date().toISOString() }
          : a
      )
    );
  }, []);

  const updateActivation = useCallback((id: string, updates: Partial<Activation>) => {
    setActivations((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...updates, atualizadoEm: new Date().toISOString() } : a
      )
    );
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
