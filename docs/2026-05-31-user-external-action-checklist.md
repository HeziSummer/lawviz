# LawViz User External Action Checklist

> Date: 2026-05-31  
> Owner: User  
> Purpose: external vendor, compliance, and credential preparation before public gray-test and production deployment.

## Do First

1. Decide and purchase domain names.
   - Main app domain, for example `lawviz.cn` or another final brand domain.
   - Render/share subdomain, for example `render.<domain>` or `share.<domain>`.
   - Keep the domain under the same entity/person that will file ICP.

2. Complete Aliyun account real-name verification.
   - Use the subject that will appear in ICP filing.
   - Keep the registered phone and email available for verification.

3. Choose one Aliyun region for initial deployment.
   - ECS, RDS, and OSS should stay in the same region where possible.
   - Record the selected region name for the project.

4. Buy or prepare Aliyun ECS.
   - Recommended initial size: 2 vCPU / 4 GB RAM.
   - Linux server.
   - Keep the server eligible for ICP filing if Aliyun requires it.

5. Create Aliyun RDS PostgreSQL.
   - PostgreSQL 15 preferred.
   - Same region and VPC as ECS.
   - Do not expose the database publicly unless there is a clear operational reason.

6. Create Aliyun OSS bucket.
   - Private-read only.
   - Same region as ECS/RDS if possible.
   - Do not enable public-read report URLs.

7. Start ICP filing immediately after domain and eligible Aliyun resource are ready.
   - Product description should avoid describing LawViz as a legal consultation or legal opinion platform.
   - Suggested description:

```text
律析 LawViz 是面向律师的 AI 辅助案件可视化报告工具。用户通过对话输入案件事实，经律师确认方案后生成 HTML、PDF、图片格式的案件呈现材料，用于内部分析、客户沟通和汇报展示。
```

## Vendor Access To Prepare

1. Hupijiao payment account.
   - Register merchant account.
   - Confirm available channels.
   - Prepare callback domain after domain/DNS is ready.
   - Later provide `PID` and signing secret through a secure handoff method, not chat.

2. New API gateway.
   - Confirm base URL.
   - Confirm available GPT and Claude model IDs.
   - Confirm rate limits and cost model if available.
   - Later provide API key through a secure handoff method, not chat.

3. Pkulaw MCP.
   - Confirm MCP URL or connection method.
   - Confirm auth method.
   - Confirm usage limits and commercial or gray-test restrictions.
   - Later provide token/key through a secure handoff method, not chat.

4. SSL certificate and DNS.
   - DNS can be configured after domains are purchased.
   - SSL should cover main app domain and render/share domain.
   - Final records will depend on the ECS public IP or load balancer plan.

## Send Me These Non-Secret Details

- Chosen domain and subdomains.
- Aliyun region.
- ECS public IP after purchase.
- RDS PostgreSQL version and whether it is in the same VPC as ECS.
- OSS bucket name and region.
- ICP filing status and filing number when available.
- Hupijiao merchant registration status, without secret values.
- New API base URL and available model ID list, without API key.
- Pkulaw MCP connection type and usage limits, without token/key.

## Do Not Send In Chat

Do not paste these into chat:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEW_API_KEY`
- `PKULAW_MCP_TOKEN`
- `ALIYUN_ACCESS_KEY_ID`
- `ALIYUN_ACCESS_KEY_SECRET`
- `HUPIJIAO_SECRET`
- Any password, private key, or one-time verification code.

Use a secure credential handoff method later for real secrets.

## Gates

- Public gray-test is blocked until ICP progress and domain/SSL plan are acceptable.
- Production deploy is blocked until ECS, RDS, OSS, and required secrets are available.
- Paid subscription/top-up is blocked until Hupijiao test callback and signature verification pass.
- LLM generation is blocked until New API base URL, model IDs, and key are available.
- Paid-tier legal lookup is blocked until Pkulaw MCP access and usage terms are confirmed.

