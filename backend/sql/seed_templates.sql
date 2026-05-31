INSERT INTO templates (
  template_key,
  name,
  category,
  description,
  fields_schema,
  llm_output_schema
) VALUES
(
  'contract_dispute',
  'Contract Dispute',
  'civil',
  'Private MVP starter template for contract performance, breach, termination, damages, and negotiation preparation.',
  '{
    "type": "object",
    "required": ["contract_type", "facts", "claims"],
    "properties": {
      "contract_type": {"type": "string"},
      "facts": {"type": "string"},
      "claims": {"type": "string"},
      "evidence": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb,
  '{
    "type": "object",
    "required": ["case_summary", "legal_analysis", "recommended_actions"],
    "properties": {
      "case_summary": {"type": "string"},
      "legal_analysis": {"type": "array", "items": {"type": "string"}},
      "law_refs": {"type": "array", "items": {"type": "object"}},
      "recommended_actions": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb
),
(
  'labor_dispute',
  'Labor Dispute',
  'labor',
  'Private MVP starter template for employment contracts, wages, social insurance, termination, compensation, and arbitration preparation.',
  '{
    "type": "object",
    "required": ["employment_status", "facts", "claims"],
    "properties": {
      "employment_status": {"type": "string"},
      "facts": {"type": "string"},
      "claims": {"type": "string"},
      "salary_details": {"type": "string"},
      "evidence": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb,
  '{
    "type": "object",
    "required": ["case_summary", "legal_analysis", "recommended_actions"],
    "properties": {
      "case_summary": {"type": "string"},
      "legal_analysis": {"type": "array", "items": {"type": "string"}},
      "law_refs": {"type": "array", "items": {"type": "object"}},
      "recommended_actions": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb
),
(
  'divorce_family',
  'Divorce And Family',
  'family',
  'Private MVP starter template for divorce, child custody, marital property, debts, and family dispute preparation.',
  '{
    "type": "object",
    "required": ["relationship_status", "facts", "claims"],
    "properties": {
      "relationship_status": {"type": "string"},
      "facts": {"type": "string"},
      "claims": {"type": "string"},
      "children": {"type": "string"},
      "property": {"type": "string"},
      "evidence": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb,
  '{
    "type": "object",
    "required": ["case_summary", "legal_analysis", "recommended_actions"],
    "properties": {
      "case_summary": {"type": "string"},
      "legal_analysis": {"type": "array", "items": {"type": "string"}},
      "law_refs": {"type": "array", "items": {"type": "object"}},
      "recommended_actions": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb
),
(
  'traffic_accident',
  'Traffic Accident',
  'tort',
  'Private MVP starter template for accident liability, losses, insurance claims, and litigation preparation.',
  '{
    "type": "object",
    "required": ["accident_summary", "responsibility", "claims"],
    "properties": {
      "accident_summary": {"type": "string"},
      "responsibility": {"type": "string"},
      "claims": {"type": "string"},
      "injuries_or_losses": {"type": "string"},
      "evidence": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb,
  '{
    "type": "object",
    "required": ["case_summary", "legal_analysis", "recommended_actions"],
    "properties": {
      "case_summary": {"type": "string"},
      "legal_analysis": {"type": "array", "items": {"type": "string"}},
      "law_refs": {"type": "array", "items": {"type": "object"}},
      "recommended_actions": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb
),
(
  'criminal_defense',
  'Criminal Defense',
  'criminal',
  'Private MVP starter template for criminal case facts, charge risk, mitigation, evidence issues, and defense points.',
  '{
    "type": "object",
    "required": ["charge_or_issue", "facts", "procedure_stage"],
    "properties": {
      "charge_or_issue": {"type": "string"},
      "facts": {"type": "string"},
      "procedure_stage": {"type": "string"},
      "mitigating_factors": {"type": "string"},
      "evidence": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb,
  '{
    "type": "object",
    "required": ["case_summary", "legal_analysis", "defense_points"],
    "properties": {
      "case_summary": {"type": "string"},
      "legal_analysis": {"type": "array", "items": {"type": "string"}},
      "law_refs": {"type": "array", "items": {"type": "object"}},
      "defense_points": {"type": "array", "items": {"type": "string"}}
    }
  }'::jsonb
)
ON CONFLICT (template_key) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  fields_schema = EXCLUDED.fields_schema,
  llm_output_schema = EXCLUDED.llm_output_schema,
  is_active = true,
  updated_at = now();
