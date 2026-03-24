

## Plan: Refactor PR Control Dashboard

### Overview
Six changes: dark theme with navy/yellow, top navigation bar, queue filter fix, search/filters on history, and database integration.

### 1. Dark Theme (navy + yellow #ffe600)

**Files:** `src/index.css`, `tailwind.config.ts`

- Rewrite `:root` CSS variables for dark mode: background `220 25% 8%`, card `220 25% 12%`, foreground white, primary yellow `50 100% 50%` (#ffe600), sidebar dark navy `220 25% 6%`
- Keep status colors as-is
- Primary foreground becomes dark (for contrast on yellow buttons)

### 2. Replace Sidebar with Top Navigation Bar

**Files:** `src/App.tsx`, `src/components/TopNav.tsx` (new), delete `src/components/AppSidebar.tsx`

- Remove `SidebarProvider`, `AppSidebar`, `SidebarTrigger` from App.tsx
- Create `TopNav.tsx`: horizontal nav bar with logo + nav items using icons + labels
- Icons: `LayoutDashboard` → Dashboard, `Siren` or `Radio` → PR Ativas, `History` → Historico
- Use `NavLink` for active state highlighting with yellow accent
- Layout becomes simple: TopNav on top, main content below

### 3. Queue Shows Only "Aguardando equipe"

**File:** `src/components/ActivationQueue.tsx`

- Change filter from `status !== "Finalizado" && status !== "Cancelado"` to `status === "Aguardando equipe"`
- Once team is assigned (status changes to "Em deslocamento") or cancelled, card disappears from queue

### 4. Search & Filters on Historico

**File:** `src/pages/Historico.tsx`

- Add search input (searches SM, placa/cavalo/carreta, transportador)
- Add filter dropdowns: status, equipe
- Filter the `activations` array before rendering

### 5. Database Integration (Supabase via Lovable Cloud)

- Create `activations` table with all fields from the `Activation` type
- Enable RLS with public read/write (no auth for now)
- Update `ActivationContext.tsx` to use Supabase queries instead of localStorage
- Use `@supabase/supabase-js` with real-time subscription for live updates

### Technical Details

**Database schema:**
```sql
CREATE TABLE activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sm TEXT NOT NULL,
  transportador TEXT NOT NULL,
  cavalo TEXT NOT NULL,
  carreta TEXT NOT NULL,
  lat_long TEXT NOT NULL,
  armado TEXT NOT NULL,
  motivo TEXT NOT NULL,
  autorizado_por TEXT NOT NULL,
  resumo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Aguardando equipe',
  equipe TEXT,
  responsavel TEXT,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);
```

**Execution order:** Theme & nav first (visual), then queue fix, then filters, then database last.

