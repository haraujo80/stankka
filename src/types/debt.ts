export type DebtType = 'cartao_credito' | 'emprestimo_pessoal' | 'cheque_especial' | 'financiamento' | 'consignado' | 'outro';
export type DebtStatus = 'em_dia' | 'atrasada' | 'negativada' | 'renegociada';
export type WorkType = 'clt' | 'autonomo' | 'aposentado' | 'servidor' | 'outro';

export interface Debt {
  id: string;
  creditor: string;
  type: DebtType;
  balance: number;
  installment: number;
  totalInstallments: number;
  paidInstallments: number;
  interestRate: number;
  status: DebtStatus;
  createdAt: string;
}

export interface OnboardingData {
  monthlyIncome: number;
  dependents: number;
  workType: WorkType;
}

export interface Projection {
  debtId: string;
  reductionMin: number;
  reductionMax: number;
  newInstallment: number;
  channel: string;
  legalBasis: string;
  confidence: 'baixo' | 'medio' | 'alto';
}

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  cartao_credito: 'Cartão de Crédito',
  emprestimo_pessoal: 'Empréstimo Pessoal',
  cheque_especial: 'Cheque Especial',
  financiamento: 'Financiamento',
  consignado: 'Consignado',
  outro: 'Outro',
};

export const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  em_dia: 'Em dia',
  atrasada: 'Atrasada',
  negativada: 'Negativada',
  renegociada: 'Renegociada',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  clt: 'CLT',
  autonomo: 'Autônomo',
  aposentado: 'Aposentado',
  servidor: 'Servidor Público',
  outro: 'Outro',
};
