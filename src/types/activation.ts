export type ActivationStatus =
  | "Aguardando equipe"
  | "Em deslocamento"
  | "Em preservação"
  | "Em varredura"
  | "Finalizado"
  | "Cancelado";

export const TEAMS = ["MIKE", "ATIVA", "RECOVERY", "FOCUS", "VELOX"] as const;
export type Team = (typeof TEAMS)[number];

export interface Activation {
  id: string;
  sm: string;
  transportador: string;
  cavalo: string;
  carreta: string;
  latLong: string;
  armado: string;
  motivo: string;
  autorizadoPor: string;
  resumo: string;
  status: ActivationStatus;
  equipe?: Team;
  responsavel?: string;
  urgente: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export const STATUS_LIST: ActivationStatus[] = [
  "Aguardando equipe",
  "Em deslocamento",
  "Em preservação",
  "Em varredura",
  "Finalizado",
  "Cancelado",
];
