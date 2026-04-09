/**
 * Sistema de Plantão automático — escala 12x36 com rotação semanal.
 *
 * Grupos:
 *   A → Dia: ROMEU  | Noite: SIERRA
 *   B → Dia: INDIA  | Noite: KILO
 *
 * Semana A: TER/QUI/SEX → Grupo A  |  SEG/QUA/SAB/DOM → Grupo B
 * Semana B: inverte
 *
 * Turnos: Dia 06:00–18:00  |  Noite 18:00–06:00
 * Marco inicial: semana contendo 2026-04-06 (seg) = SEMANA A
 */

// Monday of the reference SEMANA A week (Brazil timezone)
const BASE_MONDAY = new Date("2026-04-06T00:00:00-03:00");

const GROUP_A = { dia: "ROMEU", noite: "SIERRA" } as const;
const GROUP_B = { dia: "INDIA", noite: "KILO" } as const;

// Days that belong to Group A in SEMANA A (0=Sun … 6=Sat)
// TER(2), QUI(4), SEX(5) → Group A
const GROUP_A_DAYS_WEEK_A = new Set([2, 4, 5]);

export type PlantaoInfo = {
  equipe: string;       // ROMEU | SIERRA | INDIA | KILO
  turno: "DIA" | "NOITE";
  grupo: "A" | "B";
  semana: "A" | "B";
  fimTurno: string;     // "06:00" or "18:00"
};

/**
 * Returns the active shift for a given JS Date (should be in Brazil time).
 * For dates between 00:00 and 06:00, the shift belongs to the previous calendar day.
 */
export function getPlantao(now: Date = new Date()): PlantaoInfo {
  // Convert to Brazil time components
  const brFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const parts = brFormatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = parseInt(get("year"));
  const month = parseInt(get("month")) - 1;
  const day = parseInt(get("day"));
  const hour = parseInt(get("hour"));

  // Build a "logical date" — before 06:00 belongs to previous day
  let logicalDate = new Date(year, month, day);
  if (hour < 6) {
    logicalDate = new Date(logicalDate.getTime() - 86400000);
  }

  const turno: "DIA" | "NOITE" = hour >= 6 && hour < 18 ? "DIA" : "NOITE";
  const fimTurno = turno === "DIA" ? "18:00" : "06:00";

  // Calculate week number relative to base
  const diffMs = logicalDate.getTime() - new Date(2026, 3, 6).getTime(); // April 6 2026 local
  const diffDays = Math.floor(diffMs / 86400000);
  const weekNum = Math.floor(diffDays / 7);
  const isWeekA = weekNum % 2 === 0;
  const semana: "A" | "B" = isWeekA ? "A" : "B";

  // Day of week for the logical date
  const dow = logicalDate.getDay(); // 0=Sun

  const isGroupADay = GROUP_A_DAYS_WEEK_A.has(dow);
  let grupo: "A" | "B";

  if (isWeekA) {
    grupo = isGroupADay ? "A" : "B";
  } else {
    grupo = isGroupADay ? "B" : "A";
  }

  const team = grupo === "A" ? GROUP_A : GROUP_B;
  const equipe = turno === "DIA" ? team.dia : team.noite;

  return { equipe, turno, grupo, semana, fimTurno };
}

/** Short label for display: "ROMEU (até 18:00)" */
export function getPlantaoLabel(now?: Date): string {
  const p = getPlantao(now);
  return `${p.equipe} (até ${p.fimTurno})`;
}
