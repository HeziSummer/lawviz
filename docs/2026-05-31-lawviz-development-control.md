# LawViz 长程开发控制计划

> 本文件用于约束长程开发、子代理分工、验收门和停问规则。  
> 上位文件：`docs/2026-05-31-lawviz-design-v1.2-FINAL.md`、`docs/2026-05-31-lawviz-sprint-plan-FINAL.md`、`HANDOFF.md`。

## 1. 总控原则

1. v1.2 设计定稿是唯一真相来源。旧文档只能参考，不能覆盖 v1.2。
2. Sprint 0 先于代码。未完成 GitHub Recon、基础设施清单、ICP 启动和成本 SQL 草案前，不进入 Agent 骨架实现。
3. 主代理负责理解、拆解、分派、集成和验收；子代理只承担边界清晰的探索、实现或验证任务。
4. 子代理写代码时必须有明确文件所有权，且不得回滚他人改动。
5. 金钱、安全、权限、状态机、数据库迁移不做无门槛并行。
6. 需求不确定时停止开发并询问用户，不靠猜测推进。

## 2. 铁律

### 产品铁律

- 生成流程必须是完全对话式：案件类型必选 + 初始描述一起发送，Agent 最多 5 轮结构化追问，输出方案文本，律师确认后再生成 HTML/PDF/PNG。
- PDF 和 PNG 是主输出动作；分享链接是次要动作。
- 所有案件类型对所有订阅等级开放，不设置案件类型权限墙。
- 灰测价格全部是占位价，正式价格必须由灰测成本数据反推。

### 安全铁律

- 不得退回 OSS 公读或未鉴权直出 HTML 的方案。
- OSS 必须私读，HTML 通过 `GET /api/render/{gen_id}` 鉴权代理返回。
- 生成 HTML 必须使用 sandbox iframe 隔离。
- 用户输入入库前要消毒，编辑后的 HTML 保存前也要消毒。
- LLM 动态输出必须 JSON Schema 严格校验；失败最多重试 3 次，仍失败则返回错误并全额退款。
- 灰测期分享页必须登录。

### 流程铁律

- 每个 Sprint 开头先收敛验收标准，尾部必须跑验证。
- 子代理产物必须由主代理验收后才能合并。
- 任何 P0/P1 安全问题出现时，停止并行开发，先修安全边界。

## 3. 停问规则

遇到以下情况必须停下来问用户：

- 5 个案件类型的 Agent 问题框架、必问项、自适应逻辑、问题形式未确认。
- GPT-5.5 / Claude Opus 4.8 模型介绍文案需要定稿。
- 最终价格、正式套餐、折扣、充值金额需要决定。
- 支付、积分、退款、订阅升级规则与文档冲突。
- 是否开放公网分享、是否接入内容安全 API、是否提前进入正式合规项不明确。
- 需要生产密钥、OSS bucket 权限、支付 secret、New API key。
- 法宝 MCP 接口限制、费用或套餐权益不清。
- 新发现方案与 v1.2 定稿冲突。
- ICP 未完成但准备公网灰测。

## 4. 子代理分工

| 阶段 | 推荐链路 | 可并行 | 串行门槛 |
|---|---|---|---|
| Sprint 0 Recon | explorer -> planner -> architect -> doc-updater | 开源 Agent 调研、基础设施清单、成本 SQL 草案 | `what-to-copy.md` 未定前不写 Agent 骨架 |
| Sprint 1 初始化 + DB | planner -> architect -> worker -> tdd-guide -> database-reviewer -> python/typescript reviewer | 前端脚手架、后端脚手架、DB schema 草案 | DB 表结构、目录结构、环境变量命名先收敛 |
| Sprint 2 认证 + 支付 | architect -> tdd-guide -> worker -> security-reviewer -> reviewers -> e2e-runner | 认证 API、订阅 plans API、登录页 | webhook、积分入账、JWT 权限必须安全审查 |
| Sprint 3a Agent + Pipeline | planner -> architect -> tdd-guide -> worker -> database-reviewer -> security-reviewer -> python-reviewer -> e2e-runner | New API、pkulaw、OSS wrapper、模板初稿 | generation 状态机单线推进 |
| Sprint 3b 其余模板 | planner -> worker x4 -> tdd-guide -> reviewer -> e2e-runner -> doc-updater | 4 个案件模板 | 先锁定合同纠纷端到端流程 |
| Sprint 4 前端 UI | architect -> worker -> tdd-guide -> typescript-reviewer -> security-reviewer -> e2e-runner | 非核心页面可并行 | `/generate`、`/result` 依赖后端契约 |
| Sprint 5 部署灰测 | planner -> architect -> worker -> security-reviewer -> database-reviewer -> e2e-runner -> doc-updater | Nginx、PM2、隐私协议、环境文档 | 生产密钥、OSS 私读、支付回调、备份策略串行 |
| Sprint 6 灰测数据 | explorer -> database-reviewer -> worker -> doc-updater -> planner | SQL、CSV、反馈整理 | 定价表必须等 60 天数据 |

## 5. 禁止并行区

- 多个 worker 同时改 `generations.status` 状态机。
- 多个 worker 同时改 webhook 验签、积分入账、退款逻辑。
- OSS 权限、render 代理、share token、iframe sandbox 分头改。
- LLM JSON Schema、模板渲染器、HTML 消毒器同时改。
- DB schema 与业务 API 在无契约状态下并行推进。
- 部署配置与生产环境变量多人并行改。

## 6. 验收门

### M0 Gate

- `docs/what-to-copy.md` 已产出。
- 基础设施采购清单完成。
- ICP 备案已启动或明确阻塞原因。
- 虎皮椒注册启动。
- 成本看板 SQL/CSV 草案完成。

### M1 Gate

- 后端可启动，`/api/health` 返回 200。
- 前端可启动，`npm run dev` 可访问。
- PostgreSQL 15 本地可用。
- 四张表已建：`users`、`generations`、`transactions`、`templates`。
- 5 个模板 seed 完成，`SELECT COUNT(*) FROM templates;` 返回 5。
- `.gitignore`、`.env.example`、本地启动说明齐全。

### 安全 Gate

- OSS 私读和 `/api/render/{gen_id}` 权限模型已定义。
- HTML sandbox iframe 策略已定义。
- 输入消毒和 HTML 编辑消毒策略已定义。
- 支付 webhook 有签名验证和幂等策略。

### 成本 Gate

- `generations` 必须记录 `token_usage`、`api_cost_estimate`、`credits_cost`、`model_used`、`model_switches`、`use_pkulaw`。
- 生成失败的退款策略必须可测试。
- 灰测周报 SQL 可导出 CSV。

## 7. Sprint 0 执行计划

1. 开源 Agent 横向调研。
   - 搜索 5-8 个项目。
   - 评分维度：简洁性、稳定性、可抄程度、HTML 输出质量。
   - 产物：`docs/what-to-copy.md`。
2. 基础设施清单。
   - 域名 2 个、ECS 2C4G、RDS PostgreSQL、OSS、SSL。
   - 标明需要用户采购或授权的项目。
3. ICP 和虎皮椒启动项。
   - 列出用户需要提供的信息，不替用户猜。
4. 成本看板原型。
   - SQL 查询脚本。
   - CSV 导出方案。

## 8. Sprint 1 准入条件

只有 M0 Gate 达成后，才进入 Sprint 1。进入 Sprint 1 前，先确认：

- 使用 Python 3.11，而不是系统默认 Python 3.13 或 WindowsApps stub。
- Node 24 与目标 Node 20 的差异是否接受；生产按 Node 20。
- 路由应使用动态目录：`frontend/app/generate/result/[genId]/page.tsx`、`frontend/app/share/[token]/page.tsx`。
- 健康检查以 `/api/health` 为准，可同时支持 GET 和 POST 避免联调误差。

## 9. 每轮开发收尾

每轮结束必须做：

1. 检查 `git status --short --branch`。
2. 运行与改动相关的最小验证。
3. 如涉及 UI，启动前端并做浏览器检查。
4. 如涉及后端，运行健康检查和相关 API 测试。
5. 如涉及 DB，验证迁移和 seed。
6. 更新相关文档。
7. 提交并推送，说明提交号和验证结果。
