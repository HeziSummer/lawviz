-- LawViz gray-test cost dashboard queries
-- Run with a read-only database user where possible.

-- 1. Daily generation cost by model and subscription tier.
SELECT
  DATE(g.created_at) AS date,
  g.model_used,
  u.subscription_tier,
  COUNT(*) AS generation_count,
  AVG(CAST(g.token_usage->>'input_tokens' AS INT)) AS avg_input_tokens,
  AVG(CAST(g.token_usage->>'output_tokens' AS INT)) AS avg_output_tokens,
  SUM(CAST(g.token_usage->>'input_tokens' AS INT)) AS total_input_tokens,
  SUM(CAST(g.token_usage->>'output_tokens' AS INT)) AS total_output_tokens,
  AVG(g.api_cost_estimate) AS avg_cost_yuan,
  SUM(g.api_cost_estimate) AS total_cost_yuan,
  AVG(g.credits_cost) AS avg_credits_cost,
  SUM(g.credits_cost) AS total_credits_cost,
  SUM(CASE WHEN g.use_pkulaw THEN 1 ELSE 0 END) AS pkulaw_count
FROM generations g
JOIN users u ON u.id = g.user_id
WHERE g.status = 'done'
GROUP BY DATE(g.created_at), g.model_used, u.subscription_tier
ORDER BY date DESC, g.model_used, u.subscription_tier;

-- 2. Cost by case type.
SELECT
  g.case_type,
  g.model_used,
  COUNT(*) AS generation_count,
  AVG(g.api_cost_estimate) AS avg_cost_yuan,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY g.api_cost_estimate) AS p50_cost_yuan,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY g.api_cost_estimate) AS p95_cost_yuan,
  AVG(g.credits_cost) AS avg_credits_cost,
  SUM(CASE WHEN g.use_pkulaw THEN 1 ELSE 0 END) AS pkulaw_count
FROM generations g
WHERE g.status = 'done'
GROUP BY g.case_type, g.model_used
ORDER BY avg_cost_yuan DESC;

-- 3. High-cost cases for review.
SELECT
  g.id,
  g.user_id,
  g.case_type,
  g.model_used,
  g.use_pkulaw,
  g.token_usage,
  g.api_cost_estimate,
  g.credits_cost,
  g.created_at,
  g.completed_at
FROM generations g
WHERE g.status = 'done'
  AND (
    g.api_cost_estimate >= 5
    OR CAST(g.token_usage->>'output_tokens' AS INT) >= 5000
  )
ORDER BY g.api_cost_estimate DESC, g.created_at DESC;

-- 4. Failed generations and refunds.
SELECT
  g.id AS generation_id,
  g.user_id,
  g.case_type,
  g.model_used,
  g.status,
  g.api_cost_estimate,
  g.credits_cost,
  g.created_at,
  t.id AS refund_transaction_id,
  t.credits AS refunded_credits,
  t.amount_yuan AS refunded_amount_yuan,
  t.created_at AS refund_created_at
FROM generations g
LEFT JOIN transactions t
  ON t.user_id = g.user_id
 AND t.type = 'refund'
 AND t.created_at >= g.created_at
WHERE g.status = 'failed'
ORDER BY g.created_at DESC;

-- 5. Subscription credit usage.
SELECT
  u.subscription_tier,
  COUNT(DISTINCT u.id) AS user_count,
  SUM(CASE WHEN t.type = 'deduct' THEN ABS(t.credits) ELSE 0 END) AS credits_consumed,
  SUM(CASE WHEN t.type = 'refund' THEN t.credits ELSE 0 END) AS credits_refunded,
  SUM(CASE WHEN t.type IN ('subscribe', 'topup') THEN t.credits ELSE 0 END) AS credits_purchased_or_granted
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
GROUP BY u.subscription_tier
ORDER BY u.subscription_tier;
