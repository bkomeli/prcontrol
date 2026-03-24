# Memory: index.md
Updated: now

Dark theme navy/yellow (#ffe600), top navigation, Supabase database for activations.
Status colors: yellow=waiting, blue=dispatched, orange=preservation, purple=sweep, green=finished, red=cancelled.
Primary color is yellow #ffe600 (HSL 50 100% 50%). Background is dark navy 220 25% 8%.
Queue only shows "Aguardando equipe" status.
Activations have `urgente` boolean field. Date filter on all screens (default: today).
Optimistic UI updates for all mutations. Autocomplete on transportador/motivo fields.
Single "Acionar PR" button generates script + copies + saves.
Quick action buttons on PR Ativas and Histórico for status changes.
