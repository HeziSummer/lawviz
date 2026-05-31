# LawViz 长程开发控制计划

> Updated: 2026-05-31
> 上位文件：`docs/2026-05-31-lawviz-design-v1.2-FINAL.md`、`docs/2026-05-31-lawviz-sprint-plan-FINAL.md`、`HANDOFF.md`

## 1. 总控原则

1. v1.2 设计定稿是产品事实来源；旧文档只能参考，不能覆盖 v1.2 和当前私有 MVP 边界。
2. 当前目标是先做真实可用的私有/内部 MVP，供自己、可信朋友和团队使用。不能把产品缩成假界面、图片展示或只有 health check 的空壳。
3. ICP、生产服务器、公开获客、正式付费运营、最终价格/退款/订阅规则后置；这些事项不阻塞真实产品功能开发。
4. 主代理负责理解、拆解、分派、集成和验收；子代理只承担边界清楚的探索、实现或验证任务。
5. 子代理写代码必须有明确文件所有权，且不得回滚他人改动。
6. 金钱、安全、权限、状态机、数据库迁移不做无门槛并行。
7. 需求不确定时停止开发并询问用户，不靠猜测推进。

## 2. 铁律

### 产品铁律

- 生成流程必须是完整对话式：案件类型必选 + 初始描述一起发送，Agent 最多 5 轮结构化追问，输出方案文本，律师确认后再生成 HTML/PDF/PNG。
- PDF 和 PNG 是主输出动作；分享链接是次要动作。
- 所有案件类型对所有订阅/使用等级开放，不设置案件类型权限墙。
- 私有 MVP 必须保留真实产品闭环：访问控制、案情收集、方案确认、报告生成、预览、导出、历史、成本/用量记录。
- 公开商业价格全部是后置决策，必须由真实使用成本和反馈反推。

### 安全铁律

- 不得返回 OSS 公读或未鉴权直出 HTML 的方案。
- OSS 必须私读；HTML 通过 `GET /api/render/{gen_id}` 鉴权代理返回。
- 生成 HTML 必须使用 sandbox iframe 隔离。
- 用户输入入库前要消毒，编辑后的 HTML 保存前也要消毒。
- LLM 动态输出必须 JSON Schema 严格校验；失败最多重试 3 次，仍失败则返回错误并按规则处理额度/退款。
- 私有验证期分享页必须登录或具备明确访问控制。

### 流程铁律

- 每个 Sprint 开头先收敛验收标准，尾部必须跑验证。
- 子代理产物必须由主代理验收后才能合并。
- 任何 P0/P1 安全问题出现时，停止并行开发，先修安全边界。

## 3. 停问规则

遇到以下情况必须停下来问用户：

- 5 个案件类型的 Agent 问题框架、必问项、自适应逻辑、问题形式未确认。
- GPT/Claude 等模型介绍文案需要定稿。
- 最终价格、正式套餐、折扣、充值金额、退款、订阅升级规则需要决定。
- 是否开放公网分享、是否接入内容安全 API、是否提前进入正式合规项不明确。
- 需要生产密钥、OSS bucket 权限、支付 secret、New API key、Pkulaw token。
- Pkulaw 接口限制、费用或套餐权益不清。
- 新发现方案与 v1.2 定稿或当前私有 MVP 边界冲突。
- ICP 未完成但准备公网灰测或公开付费运营。

## 4. 子代理分工

| 阶段 | 推荐链路 | 可并行 | 串行门槛 |
|---|---|---|---|
| Sprint 0 Recon | explorer -> planner -> architect -> doc-updater | 开源 Agent 调研、基础设施清单、成本 SQL 草案 | `what-to-copy.md` 未定前不写 Agent 核心 |
| Sprint 1 私有 MVP 基础 + DB | planner -> architect -> worker -> tdd-guide -> database-reviewer -> python/typescript reviewer | 前端基础、后端基础、DB schema/seed、仓库卫生 | DB 表结构、目录结构、环境变量命名先收敛 |
| Sprint 2 认证 + 私有访问 + 额度 | architect -> tdd-guide -> worker -> security-reviewer -> reviewers -> e2e-runner | 认证 API、访问控制、dashboard、手动额度 | JWT 权限、额度入账、访问边界必须安全审查 |
| Sprint 3a Agent + Pipeline | planner -> architect -> tdd-guide -> worker -> database-reviewer -> security-reviewer -> python-reviewer -> e2e-runner | LLM adapter、Pkulaw adapter、storage adapter、模板初稿 | generation 状态机单线推进 |
| Sprint 3b 其余模板 | planner -> worker x4 -> tdd-guide -> reviewer -> e2e-runner -> doc-updater | 4 个案件模板可并行 | 先锁定合同纠纷端到端流程 |
| Sprint 4 前端 UI | architect -> worker -> tdd-guide -> typescript-reviewer -> security-reviewer -> e2e-runner | 非核心页面可并行 | `/generate`、`/result` 依赖后端契约 |
| Sprint 5 私有部署准备 | planner -> architect -> worker -> security-reviewer -> database-reviewer -> e2e-runner -> doc-updater | Nginx、PM2、隐私协议、环境文档 | 生产密钥、OSS 私读、支付回调、备份策略串行 |
| Sprint 6 私有验证数据 | explorer -> database-reviewer -> worker -> doc-updater -> planner | SQL、CSV、反馈整理 | 正式定价表必须等真实使用数据 |

## 5. 禁止并行区

- 多个 worker 同时改 `generations.status` 状态机。
- 多个 worker 同时改 webhook 验签、额度入账、退款逻辑。
- OSS 权限、render 代理、share token、iframe sandbox 分头无契约修改。
- LLM JSON Schema、模板渲染器、HTML 消毒器同时无契约改。
- DB schema 与业务 API 在无字段契约状态下并行推进。
- 部署配置与生产环境变量多人并行改。

## 6. 验收门

### M0 Gate

- `docs/what-to-copy.md` 已产出。
- 基础设施采购清单完成。
- ICP/供应商启动项已列出；未完成不阻塞私有 MVP 开发，但阻塞公开灰测和公开付费运营。
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
- 支付 webhook 有签名验证和幂等策略；未到公开付费阶段不得激活 live payment。

### 成本 Gate

- `generations` 必须记录 `token_usage`、`api_cost_estimate`、`credits_cost`、`model_used`、`model_switches`、`use_pkulaw`。
- 生成失败的额度/退款策略必须可测试。
- 私有验证周报 SQL 可导出 CSV。

## 7. 每轮开发收尾

1. 检查 `git status --short --branch`。
2. 运行与改动相关的最小验证。
3. 涉及 UI 时，启动前端并做浏览器检查。
4. 涉及后端时，运行健康检查和相关 API 测试。
5. 涉及 DB 时，验证 schema 和 seed。
6. 更新相关文档。
7. 提交并推送，说明提交号和验证结果。
