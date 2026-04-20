// Stankka v3 — domain types matching the database schema

export type WorkType = 'clt' | 'autonomo' | 'aposentado' | 'servidor' | 'desempregado' | 'outro';

export type DebtProductType =
  | 'cartao_credito_rotativo'
  | 'cartao_credito_parcelado'
  | 'cheque_especial'
  | 'credito_pessoal'
  | 'consignado_inss'
  | 'consignado_publico'
  | 'consignado_privado'
  | 'financiamento_veiculo'
  | 'financiamento_imobiliario'
  | 'emprestimo_garantia'
  | 'cartao_beneficio'
  | 'bnpl'
  | 'fatura_servico'
  | 'outro';

export type DebtSource = 'manual' | 'upload' | 'openfinance';
export type DebtFlag = 'green' | 'yellow' | 'red';
export type CaseStatus = 'aberto' | 'em_analise' | 'resposta_recebida' | 'concluido' | 'escalado' | 'recusado';
export type PaymentStatus = 'pendente' | 'pago' | 'falhou' | 'estornado';
export type KitDocumentType =
  | 'negotiation_letter'
  | 'consumidor_gov'
  | 'bcb_rdr'
  | 'procon'
  | 'contraproposta_14181'
  | 'jec_petition';

export const PRODUCT_LABELS: Record<DebtProductType, string> = {
  cartao_credito_rotativo: 'Cartão de Crédito (rotativo)',
  cartao_credito_parcelado: 'Cartão de Crédito (parcelado)',
  cheque_especial: 'Cheque Especial',
  credito_pessoal: 'Crédito Pessoal',
  consignado_inss: 'Consignado INSS',
  consignado_publico: 'Consignado Público',
  consignado_privado: 'Consignado Privado',
  financiamento_veiculo: 'Financiamento de Veículo',
  financiamento_imobiliario: 'Financiamento Imobiliário',
  emprestimo_garantia: 'Empréstimo com Garantia',
  cartao_beneficio: 'Cartão Benefício',
  bnpl: 'BNPL / Pague Depois',
  fatura_servico: 'Fatura de Serviço',
  outro: 'Outro',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  clt: 'CLT',
  autonomo: 'Autônomo',
  aposentado: 'Aposentado / Pensionista',
  servidor: 'Servidor Público',
  desempregado: 'Desempregado',
  outro: 'Outro',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  resposta_recebida: 'Resposta recebida',
  concluido: 'Concluído',
  escalado: 'Escalado',
  recusado: 'Recusado',
};

export const KIT_DOC_LABELS: Record<KitDocumentType, string> = {
  negotiation_letter: 'Carta de negociação (SAC/Ouvidoria)',
  consumidor_gov: 'Reclamação consumidor.gov.br',
  bcb_rdr: 'Reclamação BCB (RDR)',
  procon: 'Reclamação Procon',
  contraproposta_14181: 'Contraproposta Lei 14.181/2021',
  jec_petition: 'Petição JEC (rascunho)',
};

// MÍNIMO EXISTENCIAL — Decreto 11.567/2023
export const MINIMO_EXISTENCIAL = 600;

export interface Debt {
  id: string;
  user_id: string;
  creditor: string;
  product_type: DebtProductType;
  original_principal: number | null;
  outstanding_balance: number;
  monthly_installment: number | null;
  total_installments: number | null;
  paid_installments: number | null;
  contractual_rate_monthly: number | null;
  cet_monthly: number | null;
  contract_date: string | null;
  default_since: string | null;
  is_negativada: boolean;
  flag: DebtFlag | null;
  flag_reason: string | null;
  source: DebtSource;
  document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  monthly_income: number | null;
  dependents: number | null;
  work_type: WorkType | null;
  uf: string | null;
  onboarding_complete: boolean;
}

export interface BacenRate {
  product_type: DebtProductType;
  rate_monthly: number;
  rate_yearly: number;
  reference_period: string;
}
