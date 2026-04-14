import { Debt, OnboardingData, Projection } from '@/types/debt';

export const mockOnboarding: OnboardingData = {
  monthlyIncome: 4500,
  dependents: 2,
  workType: 'clt',
};

export const mockDebts: Debt[] = [
  {
    id: '1',
    creditor: 'Nubank',
    type: 'cartao_credito',
    balance: 12500,
    installment: 625,
    totalInstallments: 24,
    paidInstallments: 4,
    interestRate: 14.5,
    status: 'atrasada',
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    creditor: 'Itaú',
    type: 'emprestimo_pessoal',
    balance: 8200,
    installment: 456,
    totalInstallments: 24,
    paidInstallments: 6,
    interestRate: 5.9,
    status: 'em_dia',
    createdAt: '2024-03-10',
  },
  {
    id: '3',
    creditor: 'Bradesco',
    type: 'cheque_especial',
    balance: 3400,
    installment: 340,
    totalInstallments: 12,
    paidInstallments: 2,
    interestRate: 12.8,
    status: 'negativada',
    createdAt: '2024-08-20',
  },
  {
    id: '4',
    creditor: 'Santander',
    type: 'cartao_credito',
    balance: 6800,
    installment: 340,
    totalInstallments: 24,
    paidInstallments: 4,
    interestRate: 15.2,
    status: 'atrasada',
    createdAt: '2024-05-01',
  },
  {
    id: '5',
    creditor: 'Caixa',
    type: 'consignado',
    balance: 15000,
    installment: 500,
    totalInstallments: 36,
    paidInstallments: 6,
    interestRate: 2.1,
    status: 'em_dia',
    createdAt: '2024-01-15',
  },
  {
    id: '6',
    creditor: 'Nubank',
    type: 'emprestimo_pessoal',
    balance: 4300,
    installment: 358,
    totalInstallments: 12,
    paidInstallments: 0,
    interestRate: 7.5,
    status: 'negativada',
    createdAt: '2024-09-01',
  },
];

export function getProjection(debt: Debt): Projection {
  let reductionMin = 5;
  let reductionMax = 15;
  let channel = 'Negociação direta';
  let legalBasis = 'CDC Art. 6º';
  let confidence: Projection['confidence'] = 'medio';

  if (debt.status === 'negativada') {
    reductionMin = 30;
    reductionMax = 60;
    channel = 'Mutirão de renegociação / Procon';
    legalBasis = 'Lei 14.181 (Superendividamento)';
    confidence = 'alto';
  } else if (debt.status === 'atrasada') {
    reductionMin = 15;
    reductionMax = 35;
    channel = 'Portal do banco / SAC';
    legalBasis = 'Súmula 530 STJ';
    confidence = 'medio';
  }

  if (debt.type === 'cartao_credito' && debt.interestRate > 8) {
    reductionMin = Math.max(reductionMin, 20);
    reductionMax = Math.max(reductionMax, 40);
    legalBasis = 'Lei 14.690 (teto rotativo)';
  }

  if (debt.type === 'cheque_especial' && debt.interestRate > 8) {
    reductionMin = Math.max(reductionMin, 25);
    reductionMax = Math.max(reductionMax, 50);
    legalBasis = 'Res. CMN 4.765 (teto cheque especial)';
  }

  const avgReduction = (reductionMin + reductionMax) / 2 / 100;
  const newInstallment = debt.installment * (1 - avgReduction);

  return {
    debtId: debt.id,
    reductionMin,
    reductionMax,
    newInstallment: Math.round(newInstallment),
    channel,
    legalBasis,
    confidence,
  };
}
