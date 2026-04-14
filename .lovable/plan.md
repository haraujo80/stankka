

## Stankka — MVP de Consolidação de Dívidas

### Design System
- **Paleta:** Azul-roxo sofisticado — fundo `#0a0b1e`, surfaces `#12143a`/`#1a1d4e`, accent `#7c5cfc`/`#a78bfa`, texto `#e8edf3`
- **Tipografia:** Sora (títulos), Manrope (corpo)
- **Layout:** Dashboard com sidebar colapsável, mobile-first
- **Bordas:** 12px cards, 8px botões. Glassmorphism sutil nos cards

### Páginas e Fluxo

**1. Landing / Login**
- Tela simples com branding Stankka, login por e-mail + senha
- Registro com campos básicos

**2. Onboarding (3 passos)**
- Renda mensal líquida
- Número de dependentes
- Tipo de vínculo (CLT, autônomo, aposentado, servidor)
- Progress bar visual

**3. Ingestão de Dívidas**
- Botão "Conectar via Open Finance" — desabilitado com badge "Em breve"
- Botão "Enviar faturas e extratos" — upload de PDF/JPG/PNG (até 20MB, 20 arquivos)
- Formulário de entrada manual como fallback (credor, tipo, saldo, parcelas, taxa, status)
- Lista de dívidas já adicionadas com opção de editar/excluir

**4. Dashboard de Consolidação (tela principal)**
- **Resumo no topo:** 4 cards — Dívida Total, Nº de Credores, Comprometimento da Renda (% com alerta >30%), Indicador de Mínimo Existencial (R$600)
- **Lista de dívidas:** tabela/cards com credor, tipo, saldo, parcela, taxa, status e badge de redução potencial (ex: "15–35%")
- **Gráficos:** distribuição por tipo de produto, por credor, por status (pie/donut charts)
- **Observações automáticas:** alertas tipo "Taxa acima da média BACEN", "3 dívidas com mesmo credor"

**5. Projeção de Redução**
- Disclaimer obrigatório com checkbox "Li e entendi" antes de ver valores
- Por dívida: faixa de redução do saldo (X%–Y%), redução da parcela, canal recomendado, tese jurídica resumida
- Nível de confiança (baixo/médio/alto) por projeção
- Regras heurísticas: taxa vs média BACEN, Lei 14.690 (rotativo), teto consignado INSS, desconto por negativação

**6. CTA Final**
- Botão "Quero tentar reduzir essa dívida" — leva a tela informativa da Camada 2 (em breve)

### Sidebar
- Navegação: Dashboard, Minhas Dívidas, Adicionar Dívida, Projeções, Perfil
- Colapsável com ícones no modo mini
- Logo Stankka no topo

### Backend (Supabase)
- Tabelas: profiles, debts (modelo de dados do spec), onboarding_data
- RLS por usuário
- Storage bucket para uploads de faturas
- Auth por e-mail/senha

### Dados Mock
- Dívidas de exemplo pré-carregadas para demonstração do dashboard com gráficos e projeções funcionais

