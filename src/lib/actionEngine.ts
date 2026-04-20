// Action Engine — selects channels and generates negotiation kit content.
// Deterministic, rules-first. Every output cites the underlying norm.
import { Debt, KitDocumentType, PRODUCT_LABELS, Profile } from "@/types/debt";
import { DiagnoseResult } from "@/lib/diagnose";
import { formatBRL, formatPct } from "@/lib/format";

export interface ChannelRecommendation {
  channel: string;
  rationale: string;
  expectedSlaDays: number;
}

export function recommendChannels(debt: Debt, diag: DiagnoseResult): ChannelRecommendation[] {
  const isFinancialInst = ["cartao_credito_rotativo", "cartao_credito_parcelado", "cheque_especial",
    "credito_pessoal", "consignado_inss", "consignado_publico", "consignado_privado",
    "financiamento_veiculo", "financiamento_imobiliario", "emprestimo_garantia"].includes(debt.product_type);

  const list: ChannelRecommendation[] = [];

  // Step 1: SAC always first
  list.push({
    channel: "SAC do credor",
    rationale: "Decreto 11.034/2022 garante atendimento e protocolo. Primeira tentativa formal.",
    expectedSlaDays: 7,
  });

  // Step 2: Ouvidoria
  list.push({
    channel: "Ouvidoria do credor",
    rationale: "Resolução CMN 4.860/2020 — escalada interna obrigatória após resposta insuficiente do SAC.",
    expectedSlaDays: 10,
  });

  // Step 3: regulator
  if (isFinancialInst) {
    list.push({
      channel: "BCB RDR (Registrato/RDR)",
      rationale: "Resolução BCB 222/2022 — denúncia ao supervisor para instituições financeiras.",
      expectedSlaDays: 30,
    });
  } else {
    list.push({
      channel: "Procon (PAS) + consumidor.gov.br",
      rationale: "Decreto 10.197/2019 — reclamação pública vinculante para fornecedores não-financeiros.",
      expectedSlaDays: 20,
    });
  }

  // Step 4: judicialization fallback
  if (debt.outstanding_balance <= 40 * 1518) { // ~ 40 SM
    list.push({
      channel: "JEC — Juizado Especial Cível",
      rationale: "Causa de até 40 salários-mínimos cabe no JEC sem advogado obrigatório.",
      expectedSlaDays: 60,
    });
  }

  // Special: Lei 14.181 if multiple debts considered elsewhere; here we add note
  if (diag.flag === "red") {
    list.push({
      channel: "CEJUSC / NUDECON — repactuação Lei 14.181/2021",
      rationale: "Quando comprometimento de renda > 30% após mínimo existencial, cabe repactuação coletiva.",
      expectedSlaDays: 45,
    });
  }

  return list;
}

interface KitInputs {
  debt: Debt;
  diag: DiagnoseResult;
  profile: Profile | null;
  channel: string;
}

const STANKKA_FOOTER =
  "\n\n---\nDocumento gerado pela plataforma Stankka (www.stankka.com.br).\nFundamentação: CDC, Lei 14.181/2021, Lei 14.690/2023, Súmula 530/STJ, regulação BACEN.\nEste documento é um modelo informativo e não constitui assessoria jurídica.";

export function generateNegotiationLetter({ debt, diag, profile }: KitInputs): { title: string; content: string } {
  const today = new Date().toLocaleDateString("pt-BR");
  const nome = profile?.full_name || "[Seu nome]";
  const cpf = profile?.cpf || "[Seu CPF]";

  const content = `**Carta de negociação — Stankka**

${today}

Ao ${debt.creditor}
A/C: SAC / Ouvidoria

**Assunto:** Solicitação de revisão contratual e contraproposta de pagamento

Prezados,

Eu, ${nome}, CPF ${cpf}, sou cliente desta instituição e mantenho com vocês o seguinte contrato:

- **Produto:** ${PRODUCT_LABELS[debt.product_type]}
- **Saldo devedor atual:** ${formatBRL(debt.outstanding_balance)}
${debt.contractual_rate_monthly ? `- **Taxa contratual informada:** ${formatPct(debt.contractual_rate_monthly)} a.m.` : ""}
${diag.bacenRate ? `- **Taxa média BACEN para o produto:** ${formatPct(diag.bacenRate)} a.m. (referência pública SGS/Olinda)` : ""}

Conforme análise técnica, ${diag.reason.toLowerCase()}. Com base no Código de Defesa do Consumidor (Art. 6º, III e V) e na Súmula 530 do STJ, solicito formalmente:

1. A revisão da taxa praticada para patamar compatível com a média de mercado divulgada pelo BACEN;
2. O recálculo do saldo devedor com expurgo de eventuais cobranças indevidas (juros remuneratórios abusivos, capitalização não pactuada, tarifas e seguros sem opt-in);
3. Apresentação do CET (Custo Efetivo Total) atualizado e da memória de cálculo, conforme Resolução CMN 3.517/2007.

**Contraproposta inicial:** quitação ou repactuação respeitando o mínimo existencial (Decreto 11.567/2023, R$ 600,00) e o limite de 35% da renda líquida, em até 60 parcelas, conforme faculta a Lei 14.181/2021.

Aguardo retorno em até 7 dias úteis (SAC) ou 10 dias úteis (Ouvidoria), sob pena de escalonamento via BCB (RDR), Procon e demais instâncias cabíveis.

Atenciosamente,

${nome}
CPF: ${cpf}
${profile?.phone ? `Telefone: ${profile.phone}` : ""}
${profile?.uf ? `UF: ${profile.uf}` : ""}${STANKKA_FOOTER}`;

  return { title: "Carta de negociação (SAC → Ouvidoria)", content };
}

export function generateConsumidorGov({ debt, diag, profile }: KitInputs) {
  const content = `**Reclamação consumidor.gov.br — Stankka**

**Empresa reclamada:** ${debt.creditor}
**Categoria:** Bancos, Financeiras e Administradoras de Cartão
**Tipo de problema:** Cobrança / contestação de valores e taxas

**Relato do problema:**
Sou cliente da empresa e mantenho contrato de ${PRODUCT_LABELS[debt.product_type]} com saldo devedor de ${formatBRL(debt.outstanding_balance)}. ${diag.reason}.

Solicitei revisão pelo SAC e/ou Ouvidoria sem solução adequada. Fundamento meu pedido em:
${diag.citations.map(c => `- ${c}`).join("\n")}

**Pedido ao fornecedor:**
1. Revisão da taxa contratual para a média de mercado BACEN${diag.bacenRate ? ` (${formatPct(diag.bacenRate)} a.m.)` : ""};
2. Recálculo do saldo devedor;
3. Apresentação do CET e memória de cálculo;
4. Proposta de repactuação respeitando o mínimo existencial (Decreto 11.567/2023).

**Documentos anexos:** contrato, faturas, extratos, protocolos de SAC/Ouvidoria.${STANKKA_FOOTER}`;
  return { title: "Reclamação consumidor.gov.br", content };
}

export function generateBcbRdr({ debt, diag, profile }: KitInputs) {
  const content = `**Reclamação BCB — Registro de Demandas Regulatórias (RDR)**

**Instituição:** ${debt.creditor}
**Tipo de operação:** ${PRODUCT_LABELS[debt.product_type]}
**Valor envolvido:** ${formatBRL(debt.outstanding_balance)}

**Descrição:**
Apresento reclamação contra a instituição supervisionada acima, nos termos da Resolução BCB 222/2022. ${diag.reason}.

**Normas potencialmente violadas:**
${diag.citations.map(c => `- ${c}`).join("\n")}
- Resolução CMN 4.860/2020 (Ouvidoria)
- Resolução CMN 3.517/2007 (CET)

**Histórico de tentativas:**
- Protocolo SAC: [preencher]
- Protocolo Ouvidoria: [preencher]
- Resposta recebida: [insatisfatória / não recebida]

**Pedido:**
Apuração administrativa, eventual aplicação de medidas cautelares e devolução de valores cobrados indevidamente.${STANKKA_FOOTER}`;
  return { title: "Reclamação BCB (RDR)", content };
}

export function generateProcon({ debt, diag, profile }: KitInputs) {
  const content = `**Reclamação Procon — PAS (Procon-${profile?.uf || "PE"})**

**Consumidor:** ${profile?.full_name || "[nome]"}, CPF ${profile?.cpf || "[CPF]"}
**Fornecedor:** ${debt.creditor}
**Objeto:** ${PRODUCT_LABELS[debt.product_type]} — saldo ${formatBRL(debt.outstanding_balance)}

**Fato:**
${diag.reason}. Solicito intermediação do Procon junto ao fornecedor para revisão contratual.

**Fundamentação legal:**
${diag.citations.map(c => `- ${c}`).join("\n")}
- Lei 8.078/1990 (CDC), arts. 6º, 39 e 51

**Pedido:**
1. Audiência de conciliação (PAS);
2. Revisão da taxa para a média BACEN;
3. Recálculo e devolução de valores indevidos em dobro (CDC art. 42);
4. Repactuação Lei 14.181/2021 se houver superendividamento.${STANKKA_FOOTER}`;
  return { title: "Reclamação Procon (PAS)", content };
}

export function generateContraproposta({ debt, diag, profile }: KitInputs) {
  const income = profile?.monthly_income ?? 0;
  const maxParcela = Math.max(0, (income - 600) * 0.35);
  const sugestaoMeses = Math.min(60, Math.ceil(debt.outstanding_balance / Math.max(maxParcela, 1)));

  const content = `**Contraproposta de repactuação — Lei 14.181/2021**

**Devedor:** ${profile?.full_name || "[nome]"}
**Credor:** ${debt.creditor}
**Operação:** ${PRODUCT_LABELS[debt.product_type]}
**Saldo devedor declarado pelo credor:** ${formatBRL(debt.outstanding_balance)}

**Capacidade de pagamento (autodeclarada):**
- Renda mensal líquida: ${formatBRL(income)}
- Mínimo existencial preservado: ${formatBRL(600)} (Decreto 11.567/2023)
- Renda disponível pós-mínimo: ${formatBRL(income - 600)}
- Parcela máxima sugerida (35% da renda disponível): ${formatBRL(maxParcela)}

**Proposta:**
1. Revisão do saldo com expurgo de juros acima da média BACEN${diag.bacenRate ? ` (${formatPct(diag.bacenRate)} a.m.)` : ""};
2. Parcelamento em até ${sugestaoMeses} meses (limite legal: 60 meses);
3. Suspensão de cobrança e baixa de eventual negativação durante a repactuação;
4. Inclusão desta dívida em plano coletivo se houver outras dívidas com superendividamento.

**Base legal:** CDC arts. 54-A a 54-G (incluídos pela Lei 14.181/2021); Decreto 11.150/2022.${STANKKA_FOOTER}`;
  return { title: "Contraproposta Lei 14.181/2021", content };
}

export function generateJecPetition({ debt, diag, profile }: KitInputs) {
  const content = `**RASCUNHO — Petição inicial JEC**

⚠️ **Atenção:** este é um rascunho gerado automaticamente para orientação. **Revise com a Defensoria Pública (NUDECON) ou advogado** antes de protocolar.

**Excelentíssimo(a) Juiz(a) de Direito do Juizado Especial Cível**

${profile?.full_name || "[nome]"}, brasileiro(a), CPF ${profile?.cpf || "[CPF]"}, residente em [endereço], vem propor

**AÇÃO REVISIONAL DE CONTRATO C/C REPETIÇÃO DE INDÉBITO**

em face de **${debt.creditor}**, pelos seguintes fundamentos:

**Dos fatos:**
A parte autora mantém com a ré contrato de ${PRODUCT_LABELS[debt.product_type]}, com saldo devedor de ${formatBRL(debt.outstanding_balance)}. ${diag.reason}.

**Do direito:**
${diag.citations.map(c => `- ${c}`).join("\n")}

**Dos pedidos:**
a) Revisão da taxa contratual para a média BACEN;
b) Recálculo do saldo devedor;
c) Devolução em dobro de valores cobrados indevidamente (CDC art. 42, § único);
d) Concessão da gratuidade de justiça e dispensa de advogado (Lei 9.099/95).

Valor da causa: ${formatBRL(debt.outstanding_balance)}.${STANKKA_FOOTER}`;
  return { title: "Petição JEC (rascunho — revisar com Defensoria)", content };
}

export function generateAllKitDocuments(inputs: KitInputs): Array<{ document_type: KitDocumentType; title: string; content: string }> {
  const isFinancialInst = ["cartao_credito_rotativo", "cartao_credito_parcelado", "cheque_especial",
    "credito_pessoal", "consignado_inss", "consignado_publico", "consignado_privado",
    "financiamento_veiculo", "financiamento_imobiliario", "emprestimo_garantia"].includes(inputs.debt.product_type);

  const docs: Array<{ document_type: KitDocumentType; title: string; content: string }> = [];
  const letter = generateNegotiationLetter(inputs);
  docs.push({ document_type: "negotiation_letter", ...letter });

  const cgov = generateConsumidorGov(inputs);
  docs.push({ document_type: "consumidor_gov", ...cgov });

  if (isFinancialInst) {
    const rdr = generateBcbRdr(inputs);
    docs.push({ document_type: "bcb_rdr", ...rdr });
  }

  const procon = generateProcon(inputs);
  docs.push({ document_type: "procon", ...procon });

  const contra = generateContraproposta(inputs);
  docs.push({ document_type: "contraproposta_14181", ...contra });

  const jec = generateJecPetition(inputs);
  docs.push({ document_type: "jec_petition", ...jec });

  return docs;
}
