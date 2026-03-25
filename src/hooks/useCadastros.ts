import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CadastroItem {
  id: string;
  nome: string;
}

function useCadastroTable(table: "transportadoras" | "motivos") {
  const [items, setItems] = useState<CadastroItem[]>([]);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from(table).select("id, nome").order("nome");
    if (data) setItems(data);
  }, [table]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (nome: string) => {
    const trimmed = nome.trim().toUpperCase();
    if (!trimmed) return;
    await supabase.from(table).insert({ nome: trimmed });
    await fetch();
  }, [table, fetch]);

  const remove = useCallback(async (id: string) => {
    await supabase.from(table).delete().eq("id", id);
    await fetch();
  }, [table, fetch]);

  return { items, add, remove, refresh: fetch };
}

export function useTransportadoras() {
  return useCadastroTable("transportadoras");
}

export function useMotivos() {
  return useCadastroTable("motivos");
}
