# LawViz Sprint 0: Cost Dashboard Plan

> Date: 2026-05-31  
> Goal: gray-test cost visibility with the smallest reliable implementation.

## Decision

Use **SQL + CSV export** for gray-test. Do not build an admin analytics UI until the core product flow is stable.

This matches v1.2 option A: simple SQL queries run weekly, exported to CSV and analyzed in a spreadsheet.

## Data Required

`generations` must record:

- `created_at`
- `completed_at`
- `status`
- `case_type`
- `model_used`
- `model_switches`
- `use_pkulaw`
- `token_usage`
- `api_cost_estimate`
- `credits_cost`
- `user_id`

`users` must record:

- `subscription_tier`

`transactions` must record:

- credit deductions
- refunds
- subscriptions
- topups
- payment amounts

## Weekly Questions

Run the cost queries once per week during gray-test:

- How many reports were generated?
- What was the GPT vs Claude split?
- What was the Pkulaw usage rate?
- Average input/output tokens?
- Average API cost?
- Average credits charged?
- Which case types cost more?
- Which cases failed and required refunds?
- Are package credits too generous or too restrictive?

## CSV Exports

Recommended exports:

1. `daily_generation_costs.csv`
2. `case_type_costs.csv`
3. `high_cost_cases.csv`
4. `refunds.csv`
5. `subscription_credit_usage.csv`

SQL lives in:

```text
backend/sql/cost_dashboard.sql
```

## Cost Review Workflow

1. Run SQL queries against production read replica or safe read-only connection.
2. Export CSV files.
3. Save weekly snapshot outside the repo.
4. Review high-cost cases.
5. Adjust internal credit estimates only after enough data exists.
6. Freeze final pricing after the gray-test period, not before.

## Stop And Ask

Stop and ask the user before:

- Changing subscription prices.
- Changing credit amounts.
- Adding discounts.
- Defining official final package economics.
- Removing a model or Pkulaw from a tier.

## Future Admin UI

Only build `/admin/analytics` after MVP flow is stable. If built later, include:

- Date range filter.
- Model filter.
- Subscription tier filter.
- Case type filter.
- CSV export button.
- High-cost case table.
- Refund/failure table.

Do not expose admin analytics to normal users.
