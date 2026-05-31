CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  lawyer_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  credits DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (credits >= 0),
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  fields_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  qa_system_prompt TEXT,
  llm_output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  html_template_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  case_type TEXT NOT NULL,
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_switches JSONB NOT NULL DEFAULT '[]'::jsonb,
  llm_output JSONB NOT NULL DEFAULT '{}'::jsonb,
  token_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  law_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  api_cost_estimate DECIMAL(12,6) NOT NULL DEFAULT 0 CHECK (api_cost_estimate >= 0),
  credits_cost INTEGER NOT NULL DEFAULT 0 CHECK (credits_cost >= 0),
  model_used TEXT NOT NULL DEFAULT '',
  use_pkulaw BOOLEAN NOT NULL DEFAULT false,
  plan_text TEXT,
  html_oss_key TEXT,
  share_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  credits DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_yuan DECIMAL(12,2),
  subscription_tier TEXT,
  subscription_months INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_order_id TEXT,
  out_trade_no TEXT UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generations_user_id_created_at
  ON generations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generations_template_id
  ON generations(template_id);

CREATE INDEX IF NOT EXISTS idx_generations_share_token
  ON generations(share_token)
  WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_id_created_at
  ON transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_provider_order_id
  ON transactions(provider_order_id)
  WHERE provider_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_templates_active_key
  ON templates(is_active, template_key);
