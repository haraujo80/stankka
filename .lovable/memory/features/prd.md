---
name: PRD v3 features
description: Stankka v3 — diagnosis (free) + R$9,99 action kit per debt + case tracking. Replaces consolidation framing.
type: feature
---
# Stankka v3 — core product

**Layers:**
- Layer 1 (free): Diagnosis. Aggregate debts → benchmark vs BACEN avg rate → flag green/yellow/red → cite regulation.
- Layer 2 (R$ 9,99 per debt, mock paywall in MVP): Action kit. Negotiation letter, consumidor.gov.br, BCB RDR, Procon PAS, contraproposta Lei 14.181/2021, JEC petition draft.
- Layer 3 (out of scope): Tier 2 referral to advogados/NUDECON.

**Key rules:**
- Mínimo existencial = R$ 600 (Decreto 11.567/2023)
- Comprometimento > 30% sinaliza superendividamento (Lei 14.181/2021)
- Consignado INSS teto 1,85% a.m.
- Rotativo cap 100% do principal (Lei 14.690/2023)
- Súmula 530/STJ — taxa > 1,5× média BACEN = abuso

**Routes:**
- `/` Landing (public)
- `/login`, `/onboarding` (auth)
- `/diagnostico` (main dashboard), `/dividas`, `/dividas/nova`, `/dividas/:id/acao`, `/casos`, `/perfil`

**Ingestion:** manual (working), upload (storage only, OCR coming), Open Finance (placeholder).

**DB tables:** profiles, debts, cases, case_documents, case_events, user_consents, bank_connections, bacen_rates (public read).

**Communication:** Never promise "limpa-nome" or guaranteed reduction. Stankka = consumer-protection infrastructure, not law firm/lender.
