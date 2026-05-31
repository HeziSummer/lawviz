# LawViz Sprint 0: ICP And Vendor Startup

> Date: 2026-05-31  
> Scope: startup checklist for compliance and third-party vendors.  
> This is not legal advice; use vendor and regulator instructions as the source of truth.

## ICP Filing

LawViz is planned for Aliyun deployment, so ICP should start in Sprint 0.

Official reference: [Alibaba Cloud ICP filing documentation](https://help.aliyun.com/zh/icp-filing/).

### User Needs To Prepare

- Domain ownership.
- Entity/person identity information.
- Mobile number and contact email.
- Server purchase/order information.
- Website/app name and service description.
- Real-name verification materials required by Aliyun.

### Product Description Draft

```text
律析 LawViz 是面向律师的 AI 辅助案件可视化报告工具。用户通过对话输入案件事实，经律师确认方案后生成 HTML、PDF、图片格式的案件呈现材料，用于内部分析、客户沟通和汇报展示。
```

### ICP Checklist

- [ ] Domain purchased.
- [ ] Domain real-name verification complete.
- [ ] ECS or eligible Aliyun resource ready.
- [ ] ICP subject information prepared.
- [ ] Website name confirmed.
- [ ] Service description confirmed.
- [ ] Filing submitted.
- [ ] Filing status recorded in project notes.

### Stop And Ask

Stop and ask the user before:

- Changing website/app name.
- Describing LawViz as a legal advice service.
- Publishing generated reports publicly before filing is complete.
- Adding user-generated public content features.

## Hupijiao Payment

Official references:

- [Hupijiao product page](https://www.xunhupay.com/)
- [Hupijiao developer documentation](https://www.xunhupay.com/doc/api)

### User Needs To Prepare

- Merchant account.
- Payment product/channel selection.
- PID.
- Secret/signing key.
- Callback domain.
- Test payment flow if available.

### Backend Requirements

- `POST /api/webhooks/hupijiao`
- Signature verification before trusting payload fields.
- Idempotency by order/payment id.
- Transaction status transition:

```text
pending -> paid -> credited
pending -> failed
paid -> refunded
```

- Store raw callback metadata for audit, excluding secrets.

### Stop And Ask

Stop and ask the user before:

- Defining final subscription prices.
- Deciding refund policy not already in v1.2.
- Handling payment channels with additional compliance requirements.
- Going live with real payment credentials.

## New API Gateway

LawViz v1.2 assumes a user-owned New API gateway.

### User Needs To Provide

- Base URL.
- API key.
- Available model IDs for GPT and Claude.
- Rate limits if known.
- Cost model if available.

### Backend Requirements

- LLM client abstraction.
- Per-generation token usage tracking.
- Per-generation estimated API cost.
- Model switch history in `generations.model_switches`.

### Stop And Ask

Stop and ask if:

- Model IDs differ from the product copy.
- GPT/Claude availability changes package entitlements.
- Cost model is unknown and pricing decisions depend on it.

## Pkulaw MCP

LawViz v1.2 uses Pkulaw MCP for paid-tier legal database lookup.

### User Needs To Provide

- MCP URL or connection method.
- Auth token/key if required.
- Usage limitations.
- Commercial usage terms if any.

### Backend Requirements

- `pkulaw.search(case_type, conversation_history)` wrapper.
- Store law refs in `generations.law_refs`.
- Include law refs only when available and selected.
- Do not invent legal citations.

### Stop And Ask

Stop and ask if:

- Pkulaw access is unavailable.
- Commercial terms restrict gray-test usage.
- The legal source returned by MCP conflicts with user-provided facts.

## OSS

Official reference: [Alibaba Cloud OSS documentation](https://help.aliyun.com/zh/oss/).

### User Needs To Prepare

- Bucket name.
- Region.
- Access key or RAM role plan.
- Lifecycle policy preference.

### Backend Requirements

- Private-read bucket.
- Server-side render proxy.
- Signed or proxied export downloads.
- No direct public report URLs.

## Vendor Startup Board

| Vendor | Status | Owner | Blocking For |
|---|---|---|---|
| Domain registrar | Not started | User | ICP |
| Aliyun ICP | Not started | User | Public gray-test |
| Aliyun ECS | Not started | User | Production deploy |
| Aliyun RDS | Not started | User | Production persistence |
| Aliyun OSS | Not started | User | Report storage |
| Hupijiao | Not started | User | Paid subscriptions/top-up |
| New API | Not started | User | LLM generation |
| Pkulaw MCP | Not started | User | Paid-tier legal lookup |

Update this table as vendors are activated.
