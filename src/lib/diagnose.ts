// Diagnostic engine — flags debts vs BACEN average rate and applies legal rules.
import { Debt, DebtFlag, DebtProductType, BacenRate, MINIMO_EXISTENCIAL } from "@/types/debt";

export interface DiagnoseResult {
  flag: DebtFlag;
  reason: string;
  bacenRate: number | null;
  multiple: number | null; // contractual / bacen
  citations: string[];
}

const PRODUCT_CEILINGS: Partial<Record<DebtProductType, { rate: number; basis: string }>> = {
  consignado_inss: { rate: 1.85, basis: "Resolução INSS — teto 1,85% a.m. para consignado INSS" },
};

export function diagnoseDebt(debt: Debt, rates: BacenRate[]): DiagnoseResult {
  const bacen = rates.find(r => r.product_type === debt.product_type);
  const bacenRate = bacen?.rate_monthly ?? null;
  const contractual = debt.contractual_rate_monthly;
  const citations: string[] = ["CDC Art. 6º (informação adequada)", "Súmula 530/STJ (revisão de juros)"];

  // Hard ceilings
  const ceiling = PRODUCT_CEILINGS[debt.product_type];
  if (ceiling && contractual && contractual > ceiling.rate) {
    citations.push(ceiling.basis);
    return {
      flag: "red",
      reason: `Taxa ${contractual.toFixed(2)}% a.m. acima do teto regulatório de ${ceiling.rate}% a.m.`,
      bacenRate,
      multiple: bacenRate ? contractual / bacenRate : null,
      citations,
    };
  }

  // Lei 14.690/2023 — rotativo capped at 100% of principal
  if (debt.product_type === "cartao_credito_rotativo" && debt.original_principal && debt.outstanding_balance > debt.original_principal * 2) {
    citations.push("Lei 14.690/2023 + Res. CMN 5.112/2023 — encargos do rotativo limitados a 100% do principal");
    return {
      flag: "red",
      reason: "Saldo em rotativo ultrapassa 2× o principal — Lei 14.690/2023",
      bacenRate,
      multiple: bacenRate && contractual ? contractual / bacenRate : null,
      citations,
    };
  }

  if (!contractual || !bacenRate) {
    return {
      flag: "yellow",
      reason: "Taxa contratual não informada — incluir para diagnóstico completo",
      bacenRate,
      multiple: null,
      citations,
    };
  }

  const multiple = contractual / bacenRate;

  if (multiple >= 1.5) {
    citations.push("Súmula 530/STJ — taxa acima de 1,5× a média de mercado configura abuso");
    return {
      flag: "red",
      reason: `Taxa ${multiple.toFixed(1)}× acima da média BACEN (${bacenRate.toFixed(2)}% a.m.)`,
      bacenRate,
      multiple,
      citations,
    };
  }

  if (multiple > 1.0) {
    return {
      flag: "yellow",
      reason: `Taxa ${(multiple * 100 - 100).toFixed(0)}% acima da média BACEN`,
      bacenRate,
      multiple,
      citations,
    };
  }

  return {
    flag: "green",
    reason: "Taxa dentro da média de mercado",
    bacenRate,
    multiple,
    citations,
  };
}

export function calcComprometimento(debts: Debt[], monthlyIncome: number) {
  const totalInstallments = debts.reduce((s, d) => s + (d.monthly_installment ?? 0), 0);
  const totalDebt = debts.reduce((s, d) => s + d.outstanding_balance, 0);
  const pct = monthlyIncome > 0 ? (totalInstallments / monthlyIncome) * 100 : 0;
  const incomeAfterDebts = monthlyIncome - totalInstallments;
  const respectsMinimoExistencial = incomeAfterDebts >= MINIMO_EXISTENCIAL;
  return { totalInstallments, totalDebt, pct, incomeAfterDebts, respectsMinimoExistencial };
}
