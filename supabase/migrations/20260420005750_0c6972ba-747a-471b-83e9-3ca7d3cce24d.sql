
-- ============ ENUMS ============
CREATE TYPE public.work_type AS ENUM ('clt', 'autonomo', 'aposentado', 'servidor', 'desempregado', 'outro');
CREATE TYPE public.debt_product_type AS ENUM (
  'cartao_credito_rotativo',
  'cartao_credito_parcelado',
  'cheque_especial',
  'credito_pessoal',
  'consignado_inss',
  'consignado_publico',
  'consignado_privado',
  'financiamento_veiculo',
  'financiamento_imobiliario',
  'emprestimo_garantia',
  'cartao_beneficio',
  'bnpl',
  'fatura_servico',
  'outro'
);
CREATE TYPE public.debt_source AS ENUM ('manual', 'upload', 'openfinance');
CREATE TYPE public.debt_flag AS ENUM ('green', 'yellow', 'red');
CREATE TYPE public.case_status AS ENUM ('aberto', 'em_analise', 'resposta_recebida', 'concluido', 'escalado', 'recusado');
CREATE TYPE public.payment_status AS ENUM ('pendente', 'pago', 'falhou', 'estornado');
CREATE TYPE public.kit_document_type AS ENUM (
  'negotiation_letter',
  'consumidor_gov',
  'bcb_rdr',
  'procon',
  'contraproposta_14181',
  'jec_petition'
);

-- ============ UPDATED_AT TRIGGER FN ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  cpf TEXT,
  phone TEXT,
  monthly_income NUMERIC(12,2),
  dependents INTEGER DEFAULT 0,
  work_type public.work_type,
  uf TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ DEBTS ============
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creditor TEXT NOT NULL,
  product_type public.debt_product_type NOT NULL,
  original_principal NUMERIC(12,2),
  outstanding_balance NUMERIC(12,2) NOT NULL,
  monthly_installment NUMERIC(12,2),
  total_installments INTEGER,
  paid_installments INTEGER,
  contractual_rate_monthly NUMERIC(8,4),
  cet_monthly NUMERIC(8,4),
  contract_date DATE,
  default_since DATE,
  is_negativada BOOLEAN NOT NULL DEFAULT false,
  flag public.debt_flag,
  flag_reason TEXT,
  source public.debt_source NOT NULL DEFAULT 'manual',
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own debts" ON public.debts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own debts" ON public.debts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own debts" ON public.debts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own debts" ON public.debts FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_debts_updated_at BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_debts_user ON public.debts(user_id);

-- ============ CASES ============
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  status public.case_status NOT NULL DEFAULT 'aberto',
  payment_status public.payment_status NOT NULL DEFAULT 'pendente',
  payment_amount NUMERIC(8,2) NOT NULL DEFAULT 9.99,
  paid_at TIMESTAMPTZ,
  recommended_channel TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  outcome_reduction_pct NUMERIC(5,2),
  outcome_charges_reversed NUMERIC(12,2),
  outcome_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cases" ON public.cases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cases" ON public.cases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cases" ON public.cases FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cases_user ON public.cases(user_id);
CREATE INDEX idx_cases_debt ON public.cases(debt_id);

-- ============ CASE DOCUMENTS ============
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type public.kit_document_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own case docs" ON public.case_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own case docs" ON public.case_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own case docs" ON public.case_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own case docs" ON public.case_documents FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_case_docs_case ON public.case_documents(case_id);

-- ============ CASE EVENTS ============
CREATE TABLE public.case_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own case events" ON public.case_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own case events" ON public.case_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own case events" ON public.case_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own case events" ON public.case_events FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_case_events_case ON public.case_events(case_id);

-- ============ USER CONSENTS ============
CREATE TABLE public.user_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own consents" ON public.user_consents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consents" ON public.user_consents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own consents" ON public.user_consents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own consents" ON public.user_consents FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_consents_user ON public.user_consents(user_id);

-- ============ BANK CONNECTIONS ============
CREATE TABLE public.bank_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bank conn" ON public.bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bank conn" ON public.bank_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bank conn" ON public.bank_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bank conn" ON public.bank_connections FOR DELETE USING (auth.uid() = user_id);

-- ============ BACEN RATES (public reference data) ============
CREATE TABLE public.bacen_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_type public.debt_product_type NOT NULL,
  rate_monthly NUMERIC(8,4) NOT NULL,
  rate_yearly NUMERIC(8,4) NOT NULL,
  reference_period TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'BACEN SGS',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bacen_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BACEN rates public read" ON public.bacen_rates FOR SELECT USING (true);

-- Seed BACEN average rates (illustrative, March 2026 reference)
INSERT INTO public.bacen_rates (product_type, rate_monthly, rate_yearly, reference_period) VALUES
  ('cartao_credito_rotativo', 14.5, 437.0, '2026-03'),
  ('cartao_credito_parcelado', 9.2, 187.0, '2026-03'),
  ('cheque_especial', 7.8, 145.0, '2026-03'),
  ('credito_pessoal', 5.4, 88.0, '2026-03'),
  ('consignado_inss', 1.66, 21.8, '2026-03'),
  ('consignado_publico', 1.85, 24.6, '2026-03'),
  ('consignado_privado', 2.45, 33.7, '2026-03'),
  ('financiamento_veiculo', 2.1, 28.3, '2026-03'),
  ('financiamento_imobiliario', 0.95, 12.0, '2026-03'),
  ('emprestimo_garantia', 1.85, 24.6, '2026-03'),
  ('cartao_beneficio', 3.2, 46.0, '2026-03'),
  ('bnpl', 6.5, 113.0, '2026-03'),
  ('fatura_servico', 2.0, 26.8, '2026-03'),
  ('outro', 5.0, 79.6, '2026-03');

-- ============ STORAGE: debt-documents bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('debt-documents', 'debt-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users view own debt docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'debt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own debt docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'debt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own debt docs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'debt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own debt docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'debt-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
