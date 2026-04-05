## Plano: Nova Escolta com Múltiplos Veículos

### 1. Banco de Dados (Migration)
- Adicionar coluna `type` na tabela `activations` (default `'acionamento'`)
- Adicionar coluna `origem` na tabela `activations`
- Criar tabela `vehicles` com: `id`, `activation_id` (FK), `sm`, `placa_cavalo`, `placa_carreta`, `destino`, `transportadora`, `status`, `criado_em`
- RLS policies para `vehicles` (mesmo padrão público atual)

### 2. Frontend
- Botão "Nova Escolta" ao lado de "Novo Acionamento" na página principal
- Modal/formulário com:
  - Campos globais: Origem, Lat/Long, Autorizado por
  - Seção dinâmica de veículos com botão "+ Adicionar veículo"
  - Cada veículo: SM*, Placa Cavalo, Placa Carreta, Destino, Transportadora
- Armado = SIM fixo e automático para escoltas
- Validação: cada veículo precisa ter SM preenchido

### 3. Lógica de Salvamento
- Criar 1 registro em `activations` com type='escolta', armado='SIM'
- Criar N registros em `vehicles` vinculados ao activation_id
- Gerar script/clipboard com formato de mensagem da escolta

### 4. Integração
- Exibir escoltas no painel/mapa com indicação visual diferenciada
- Relatórios considerando total de veículos por escolta

### Ordem de execução
1. Migration do banco
2. Componente `NewEscoltaForm`
3. Integração no contexto e páginas existentes
