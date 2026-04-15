-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  monthly_income NUMERIC DEFAULT 0,
  dependents INTEGER DEFAULT 0,
  work_type TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creditor TEXT NOT NULL,
  type TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  installment NUMERIC NOT NULL DEFAULT 0,
  total_installments INTEGER,
  paid_installments INTEGER DEFAULT 0,
  interest_rate NUMERIC,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bank_connections table
CREATE TABLE public.bank_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT,
  status TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_consents table
CREATE TABLE public.user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  consent_type TEXT NOT NULL,
  agreed BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own debts" ON public.debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts" ON public.debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" ON public.debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" ON public.debts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bank connections" ON public.bank_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
