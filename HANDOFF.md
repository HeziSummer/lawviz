# LawViz 接手文档
> 给下一个 session 的 Claude Code 读

---

## 当前进度（2026-05-31）

- ✓ Opus 4.8 独立审计完成（发现 P0×4、P1×9、P2×6）
- ✓ 设计 v1.2 定稿（含所有 P0/P1 修复 + 两个建议功能）
- ✓ Sprint 规划最终版完成
- ✓ 交互流程 review 完成（发现并修正 3 个严重错位）
- ⏳ 待开发：Sprint 0 GitHub Recon

## 你的任务（下一 session）

**直接开始 Sprint 0**：GitHub Recon，横向评估 5-8 个开源 Agent 框架，产出 `docs/what-to-copy.md`。

搜索关键词：
```
structured form + AI followup generation
intake skill agent open source
conversational form agent
legal document generation agent
```

重点看：OpenDesign 系列（intake/verifier/prompt 结构）+ 其他发现的项目。  
评分维度：简洁性 / 稳定性 / 可抄程度 / HTML 输出质量。

---

## 真相来源文件（按优先级）

| 文件 | 说明 |
|------|------|
| `docs/2026-05-31-lawviz-design-v1.2-FINAL.md` | **设计规格定版（唯一真相来源）** |
| `docs/2026-05-31-lawviz-sprint-plan-FINAL.md` | **Sprint 规划定版** |
| `docs/lawviz-design-spec-b.html` | 前端 UI 设计规范（Web UI 专用，不适用于生成的 HTML 报告） |
| `docs/scheme-b-dawn.html` | 落地页风格样例 |
| `docs/2026-05-31-lawviz-design.md` | 原始 v1.0（已过时，仅参考） |

---

## 产品一句话

律析 LawViz — 律师用 AI 对话生成案件可视化报告（HTML + PDF + 图片），积分制月度订阅付费。

---

## 关键决策（不要重新讨论）

**技术栈**：
- 前端：Next.js 14 + TypeScript + Tailwind CSS
- 后端：Python 3.11 + FastAPI
- 数据库：PostgreSQL 15（阿里云 RDS）
- AI 网关：用户自有 New API 实例（GPT-5.5 + Claude Opus 4.8）
- 法律数据库：北大法宝 MCP（HTTP）
- 文件存储：阿里云 OSS（**私读** + 鉴权代理，不是公开读）
- 收款：虎皮椒
- PDF/图片生成：Playwright 无头浏览器（按需渲染）
- 部署：阿里云 ECS 2vCPU/4GB + Nginx + PM2

**商业模式**：
- 月度订阅（基础/进阶/专业，价格灰测占位，不是最终定价）
- 用完可单次充值
- 升级 = 补差价 + 积分差额

**生成流程**（完全对话式，重要！）：
1. 用户进对话框 → 选案件类型（下拉，必选）+ 输第一句话 → 一块发出
2. Agent 发结构化问题（表单/选择题），≤5 轮，用户可略
3. 对话中可随时切换模型（GPT ↔ Claude），已有上下文全注入新模型
4. Agent 生成**方案文本**（纯文本，格式固定）
5. 律师确认方案
6. 生成 HTML → 并行出 PDF + 图片（Playwright）

**输出核心**（重要！）：
- **主要**：下载 PDF / 下载图片（律师打印、发邮件、插 Word 用）
- **次要**：分享微信链接

**模型介绍原则**：
- 客观介绍各模型是什么、擅长什么
- 不做主观比较
- 律师自己选，对话过程中随时可切换

**安全架构**（不能退回旧方案）：
- OSS 私读 + `/api/render/{gen_id}` 鉴权代理
- 子域隔离 + sandbox iframe
- 用户输入白名单消毒

**灰测期**：
- 分享页需要登录（不是完全公开）
- 所有价格用占位数字，灰测后反推正式定价
- ICP 备案从 Sprint 0 立即启动

---

## 需要产品负责人参与的环节

1. **Sprint 3a-5 / 3b：每个案件类型的 Agent 问题框架设计**
   - 5 个案件类型各需 1-2 小时人机协同设计
   - 产出：必问项 + 自适应逻辑 + 问题形式
   - **开发者不能独立完成，没有法律业务判断能力**

2. **Sprint 4：模型介绍弹窗文案**
   - GPT-5.5 和 Claude Opus 4.8 的产品介绍文案
   - 弹窗视觉设计方向

---

## 5 个初始案件类型

合同纠纷 / 劳动争议 / 婚姻家事 / 交通事故 / 刑事辩护

所有类型对所有订阅等级开放（无权限 gate，用积分消耗量驱动升级）。

---

## API 端点（见设计文档 §9）

```
POST /api/auth/register · POST /api/auth/login · GET /api/auth/me
GET  /api/users/profile · PATCH /api/users/profile
GET  /api/subscriptions/plans · POST /api/subscriptions/subscribe
POST /api/subscriptions/upgrade · POST /api/webhooks/hupijiao

POST /api/generate/start           {case_type, model, use_pkulaw, initial_message}
POST /api/generate/{id}/message    {content, model?}
POST /api/generate/{id}/confirm
GET  /api/generate/{id}/status
GET  /api/generate/{id}/export     ?format=pdf|png
PATCH /api/generate/{id}/html
GET  /api/generate/history
GET  /api/render/{id}              [权限校验]
GET  /api/share/{token}            [灰测期需登录]
```

---

## Sprint 总览

| Sprint | 内容 | 里程碑 |
|--------|------|--------|
| 0（第1-4天） | GitHub Recon + 基础设施采购 + ICP 备案启动 | what-to-copy.md |
| 1（第5-7天） | 脚手架 + 数据库 | 本地环境跑通 |
| 2（第8-11天） | 认证 + 订阅 + 虎皮椒支付 | 支付链路完整 |
| 3a（第12-17天） | Agent + Pipeline + 法宝/New API/OSS + PDF 导出 + 合同纠纷模板 | 合同纠纷端到端可用 |
| 3b（第17-19天） | 剩余 4 个模板（需产品负责人参与） | 5 个模板全量可用 |
| 4（第20-23天） | 前端（对话框 + 结果页 + 分享 + 设置） | 前端完成 |
| 5（第24-26天） | 部署 + 合规 + 灰测发布 | 灰测上线 |
| 6（灰测期） | 成本数据分析 + 定价 | 费用表冻结 |

---

## 前端页面清单

- `/`：落地页
- `/auth/login` · `/auth/register`
- `/dashboard`：仪表盘（积分 + 历史 + 新建）
- `/generate`：**对话框主页面**（案件类型选择 + AI 对话 + 方案确认）
- `/generate/result/[genId]`：结果页（下载 PDF/图片/HTML + 分享）
- `/share/[token]`：分享页（灰测期需登录）
- `/settings`：个人设置（律师名片信息）
- `/credits`：订阅 + 充值

---

## 核心原则

1. **能抄就抄**：Sprint 0 Recon 先于一切代码
2. **PDF/图片是主功能**：不是附加功能，结果页首位按钮
3. **对话式交互**：没有固定表单，Agent 动态发结构化问题
4. **方案确认是质量关**：生成 HTML 前必须有律师确认方案这一步
5. **设计文档是真相来源**：有疑问看 v1.2-FINAL.md，不要靠假设
