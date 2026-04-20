## Stankka — MVP v3 (Diagnóstico + Plano de Ação)

### Posicionamento
Diagnóstico gratuito + plano de ação a R$ 9,99 por dívida. Não é "limpa-nome", não é banco, não é escritório de advocacia. Infraestrutura de defesa do consumidor.

### Páginas
- `/` Landing pública
- `/login` Email/senha + Google
- `/onboarding` 4 passos: renda, dependentes, vínculo, UF
- `/diagnostico` Dashboard com métricas (dívida total, comprometimento, mínimo existencial), lista com flags green/yellow/red por dívida e citações legais
- `/dividas` Listagem com flags
- `/dividas/nova` 3 abas: Manual (funcional), Upload (storage), Open Finance ("Em breve")
- `/dividas/:id/acao` Plano de ação: canais recomendados em ordem, paywall mock R$ 9,99 (Pix simulado), kit de 5–6 documentos gerados (carta, consumidor.gov, BCB RDR, Procon, contraproposta 14.181, JEC), tracking de status
- `/casos` Lista de casos pagos com status
- `/perfil` Edição de dados + sliders renda/dependentes

### Action Engine
Determinístico, regras-primeiro. Por dívida: SAC → Ouvidoria → BCB RDR (se inst. financeira) ou Procon (se não) → JEC (≤40 SM) → CEJUSC/Lei 14.181 (se red flag).

### Diagnóstico
- Compara taxa contratual vs média BACEN (seed 2026-03)
- Tetos especiais: consignado INSS 1,85%, rotativo cap 100% principal (Lei 14.690)
- Cita CDC, Súmula 530/STJ, regulação BACEN

### Banco
- profiles, debts, cases, case_documents, case_events, user_consents, bank_connections, bacen_rates
- Storage bucket privado debt-documents
- RLS por user_id em tudo
- Trigger auto-cria profile ao signup

### Tema
- Branco default, dark via next-themes
- Tokens HSL semânticos (--success, --warning, --destructive)
- Classes utilitárias: .gradient-primary, .gradient-text, .flag-{green,yellow,red}
