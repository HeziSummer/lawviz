# LawViz Sprint 计划（当前执行版）

> Updated: 2026-05-31
> 配套文件：`docs/2026-05-31-lawviz-design-v1.2-FINAL.md`、`HANDOFF.md`、`docs/2026-05-31-enterprise-deferred-development-boundary.md`

## 总原则

- 当前目标是先交付真实可用的私有/内部 MVP，给自己、可信朋友和团队使用。
- 真实功能不能缺：访问控制、案情对话、结构化追问、方案确认、报告生成、HTML 预览、PDF/PNG 导出、历史记录、律师资料、额度/成本记录、服务适配边界都在产品范围内。
- 后置的是 ICP、公开生产服务器、公开获客、公开付费运营、最终价格/退款/订阅规则、生产级厂商密钥。
- 不做假界面，不做图片玩具，不做只有健康检查的空壳。
- 每个 Sprint 结束必须有可验证交付物。

## Sprint 0：Recon + 基础准备

目标：

- 明确可复用 Agent/HTML/生成链路参考。
- 完成基础设施、ICP、供应商、成本看板准备清单。
- 明确哪些事项阻塞公开商业化，哪些不阻塞私有 MVP 开发。

交付物：

- `docs/what-to-copy.md`
- `docs/infrastructure-checklist.md`
- `docs/icp-and-vendor-startup.md`
- `docs/cost-dashboard-plan.md`
- `backend/sql/cost_dashboard.sql`

状态：

- 文档准备完成。
- ICP、Hupijiao、Aliyun、New API、Pkulaw 等外部事项仍需用户后续处理，但只阻塞公开灰测/公开付费，不阻塞私有 MVP 开发。

## Sprint 1：私有 MVP 基础 + 数据库

目标：

- 前端、后端、数据库能本地运行。
- 建立真实产品后续开发所需的目录、数据模型、路由和配置基础。
- 不是最终产品闭环，但不能写成假界面或临时废弃壳。

任务：

- 后端：FastAPI app、`GET/POST /api/health`、配置、数据库连接、SQLAlchemy models。
- 数据库：PostgreSQL 15 Docker Compose、四张核心表、五个模板 seed。
- 前端：Next.js 14 + TypeScript + Tailwind，建立 `/`、`/auth/login`、`/auth/register`、`/dashboard`、`/generate`、`/generate/result/[genId]`、`/share/[token]` 的可用基础页面。
- 仓库：`.gitignore`、`.env.example`、README。

验收：

- 后端 Python 3.11 可启动。
- `GET /api/health` 和 `POST /api/health` 均返回 200。
- 前端 `npm run dev` 可启动。
- PostgreSQL 15 通过 Docker Compose 启动。
- `users`、`generations`、`transactions`、`templates` 四张表存在。
- 五个模板已 seed：`contract_dispute`、`labor_dispute`、`divorce_family`、`traffic_accident`、`criminal_defense`。
- `SELECT COUNT(*) FROM templates;` 返回 5。
- 无真实生产密钥进入 Git。

## Sprint 2：认证 + 私有访问 + 额度/支付边界

目标：

- 私有 MVP 可控访问。
- 朋友/团队能通过登录或 invite/admin 方式使用。
- 内部额度/手动 credits 可用。
- 支付和订阅的数据结构、签名、幂等边界准备好，但 live public payment 不启用。

任务：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- JWT/session flow
- 用户 profile 和律师名片字段
- Admin/manual credits 或 internal entitlement
- `transactions` 记录额度调整、未来订单、生成消耗
- Hupijiao adapter 边界：签名验证、幂等、禁用/测试模式

验收：

- 注册/登录完整，token 有效。
- 私有访问控制生效。
- 手动额度可发放、消耗、记录。
- 支付 webhook 适配边界可测试，但不激活公开收款。

## Sprint 3：Agent + 生成 Pipeline + 第一个模板

目标：

- 跑通从案情输入到报告导出的真实核心流程。
- 先完成合同纠纷模板端到端，再扩展其他模板。

任务：

- Conversation state machine。
- 案件类型必选 + 初始描述一起提交。
- Agent 最多 5 轮结构化追问。
- 方案文本生成与律师确认。
- LLM adapter：支持配置 New API；无生产 key 时进入明确的 local/private mode 或 fail closed。
- Pkulaw adapter：支持配置；无凭证时禁用且状态明确。
- JSON Schema 校验、失败重试、错误/额度处理。
- Jinja2 HTML 渲染。
- 鉴权 render：`GET /api/render/{gen_id}`。
- PDF/PNG 导出。

停问：

- 5 个案件类型的最终问题框架、必问项、自适应逻辑、法律表达需要用户确认。
- 不得虚构法律引用。

验收：

- 合同纠纷从对话到方案确认再到报告生成可跑通。
- HTML 可预览。
- PDF/PNG 可下载。
- 状态、成本、模型、额度记录入库。

## Sprint 3b：其余 4 个模板

目标：

- 复制已验证工作流到劳动争议、婚姻家事、交通事故、刑事辩护。

任务：

- 每个模板具备问题框架、JSON Schema、HTML 模板、LLM 指导文档。
- 每个模板都跑通生成、预览、导出。

验收：

- 5 个初始案件类型全部可用。
- 每个模板至少有一组仿真案例通过端到端验证。

## Sprint 4：前端完整工作流 UI

目标：

- 私有 MVP 的主要用户界面完整可用。

页面：

- `/`：私有工作台入口，不做空泛营销页。
- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/generate`
- `/generate/result/[genId]`
- `/share/[token]`
- `/settings`

要求：

- 使用 Dawn/Scheme B 视觉方向。
- `/generate` 是核心工作台：案由选择、消息输入、模型切换、结构化追问、方案确认。
- `/generate/result/[genId]` 左侧报告预览，右侧 PDF/PNG/HTML/分享/重新生成操作。
- 分享页在私有验证期必须登录或有访问控制。

验收：

- 路由无 404。
- 主要流程可从登录走到报告导出。
- UI 不展示最终价格承诺，不开放 public checkout。

## Sprint 5：私有部署准备 + 公开灰测前置

目标：

- 私有/内部版本可部署验证。
- 公开灰测、公开获客、正式付费上线的条件单独确认。

任务：

- Docker/部署脚本。
- Nginx/PM2 或等效部署说明。
- 环境变量校验。
- 私有访问地址验证。
- 安全边界验证：render 鉴权、share token、sandbox、输入消毒。
- 支付 adapter 签名/幂等测试，不激活 live public payment。

验收：

- 私有/内部验证版可用。
- 完整流程通过：注册/访问控制 -> 登录 -> 生成 -> 预览 -> PDF/PNG 导出 -> 鉴权分享/查看。
- 成本数据正确记录。
- ICP 未完成时不得进入公开灰测。

## Sprint 6：私有验证数据 + 商业化准备

目标：

- 基于真实使用数据判断报告价值、成本、定价和下一步商业化条件。

任务：

- 每周导出成本 SQL/CSV。
- 收集可信朋友/团队反馈。
- 汇总高成本 case、失败 case、低评分 case。
- 反推未来正式价格、套餐、退款/额度规则。

验收：

- 至少形成连续使用数据。
- 输出成本和反馈总结。
- 正式价格/公开商业规则只在数据足够后再定。

## 里程碑

| 里程碑 | 完成标志 |
|---|---|
| M0 | Recon、基础清单、成本 SQL 完成 |
| M1 | 私有 MVP 基础、本地前后端和 DB 可运行 |
| M2 | 认证、私有访问、手动额度、支付边界完成 |
| M3 | 合同纠纷端到端生成导出完成 |
| M3.5 | 5 个案件模板全部可用 |
| M4 | 前端完整工作流可用 |
| M5 | 私有/内部验证版可用，公开灰测条件另行确认 |
| M6 | 私有验证数据形成，商业化规则准备 |
