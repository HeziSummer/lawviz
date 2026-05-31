# LawViz 产品设计规格文档（v1.2 定版）

**版本**：v1.2 定版  
**日期**：2026-05-31  
**阶段**：私有/内部 MVP（一期）  
**状态**：审计完成，待开发

> 本文档基于 v1.1 的独立审计，修正了商业模型、安全架构、成本框架的 P0 级问题。

---

## 执行摘要

**产品定位**：律析 LawViz — 律师用 AI 生成案件可视化 HTML 报告的 Web SaaS，私有/内部 MVP 先给自己、可信朋友和团队真实使用，公开商业版后续走**订阅 + 按量计费**的二元模式。

**核心改变**（vs v1.1）：
1. **Tier 定义**：从"服务访问权"改为"**月度订阅套餐**"——用户选一个月度会员（基础/进阶/专业），获得该月积分额度+权益，用完后可单次充值。
2. **计费边界**：公开商业价格只做占位和数据结构准备；私有 MVP 先用内部额度/手动 credits，live public payment 后置，正式价格再用真实成本校准。
3. **安全架构**：同源直渲改为**子域隔离 + sandbox iframe + 用户内容消毒**；OSS 改私读+鉴权代理，防敏感信息泄露。
4. **无权限 gate**：所有案件类型对所有 tier 开放，用**积分消耗量**（而非功能墙）来驱动用户升级。
5. **LLM 输出契约**：生成的动态内容必须是**结构化 JSON Schema**，后端严格校验，确保质量和安全。

---

## 1. 产品定位 & 目标用户

**产品名称**：律析 LawViz  
**用户**：中国独立律师 / 小律所律师  
**核心场景**：谈案准备、办案解释、朋友圈分享

**私有验证策略**：
- 对象：自己、可信朋友、内部团队（信任场景，有反馈意愿）
- 范围：完整产品功能（积分/额度、法宝适配、5 个模板、报告预览、PDF/PNG 导出；公开付费支付后置）
- 时长：~2 个月（灰测期）
- 目标：验证"AI 生成的报告律师爱不爱用"这个核心假设
- **关键**：分享页有**登录限制**（灰测期只允许已登录用户间分享），正式版再开公网

---

## 2. 技术栈 & 关键决策

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS | 桌面版，手机端留给二期小程序 |
| 后端 | Python 3.11 + FastAPI | 单人操盘，选最省力的框架 |
| 数据库 | PostgreSQL 15（阿里云 RDS） | 灰测期间必须支持成本统计字段 |
| AI 网关 | 用户自有 New API 实例 | 调用 GPT 和 Claude Opus 4.8 |
| 法律 DB | 北大法宝 MCP（HTTP 接口） | 进阶版及以上可用 |
| 文件存储 | 阿里云 OSS（私读 + 代理） | HTML 通过自己的域名**鉴权代理**，防敏感泄露 |
| 收款 | 虎皮椒 adapter | 先实现签名/幂等/状态边界；live public payment 等企业/公开运营条件具备后启用 |
| 部署 | 阿里云 ECS（单台 2vCPU 4GB） + Nginx 反代 + PM2 | |
| 内容安全 | 阿里云内容安全 API（可选） | 灰测期可选，正式版**必须**接，AIGC 公网传播前过滤 |

---

## 3. 订阅 + 按量计费模型

### 3.1 月度订阅方案（灰测占位价示例）

**注**：以下数字仅为灰测期示例，**不代表最终定价**。灰测结束时用真实成本反推正式版价格。

| 套餐 | 月费示例 | 月度积分 | 权益 | 适用场景 |
|------|---------|---------|------|---------|
| 🟢 基础版 | 59元/月 | 60积分 | GPT 生成 + 所有案件类型 | 轻度律师、体验用户 |
| 🔵 进阶版 | 119元/月 | 150积分 | GPT / Claude 任选 + 法宝 MCP + 所有案件类型 | 中度律师、多案型 |
| 🟣 专业版 | 188元/月 | 240积分 | GPT / Claude 任选 + 法宝 MCP + 所有案件类型 + **折扣**（可选） | 高频律师、精品服务 |

### 3.2 单次充值方案

用户月度积分用完后，可**单次充值**（可能无折扣）。具体金额灰测后定。

### 3.3 升级规则

- **新订阅**：直接购买目标套餐
- **升级**：补**差价** + **积分差额**
  - 示例：基础版用户想升进阶版，支付 `119-59=60元`，积分补到 `150-60=90积分`
  - 支持**月中升级**，该月剩余时间按比例处理

### 3.4 定价框架（待灰测校准）

**灰测占位成本**：
- GPT 基础生成 = **1 积分**（包含追问成本）
- Claude 生成 = **2 积分**（比 GPT 贵）
- 法宝 MCP 调用 = **+1 积分**（可选，单独加费）

**动态调整**：
- **输入超长**（案情 > 2000 字）→ 费用增加
- **追问轮数**：第 1-2 轮免费，第 3-5 轮各 +0.1 积分
- **多服务组合**：Claude + 法宝分别计费，不叠加折扣

**生成前预估**：系统显示"预计消耗 X.XX 积分"，用户确认后才扣；**失败全额退款**。

---

## 4. 生成流程 & 模板架构

### 4.1 生成流程（完全对话式）

```
用户进对话框
  ↓
【第一步】选择案件类型 + 初始描述（一块发出）
  • 案件类型必选（下拉 or 自由输入）
  • 用户输入第一句话前，必须先选案件类型
  • 选完类型 + 输入描述 → 一块发出去
  ↓
【第二步】Agent 结构化交互（<=5 轮）
  • 根据案件类型的框架，动态生成问题（表单 or 选择题）
  • 可随时点"切换模型"（GPT ↔ Claude）
  • 切换后：已回答问题作数，上下文全注入新模型，继续对话
  ↓
【第三步】生成方案（纯文本，格式固定）
  • 聚合：案件类型 + 用户输入 + 追问历史 + 选定模型
  • LLM 生成"案件分析方案"（方案确认的中间层）
  ↓
【第四步】律师确认方案
  • "内容对吗？" → 确认
  ↓
【第五步】生成最终 HTML + PDF/图片
  • LLM 生成动态分析内容（JSON，见 4.3）
  • JSON 校验 → 填充 Jinja2 模板 → 渲染 HTML
  • 并行生成 PDF/图片（分辨率与 HTML 一致）
```

### 4.2 模板开发原则（对话框框架）

**每个案件类型都需要独立设计**，包含：

1. **案件分析**（人机协同设计）：
   - 律师在该案由里最关心哪些信息？
   - 哪些是必问项（用户无论如何都要回答的）？
   - 哪些是 Agent 自适应项（根据上文动态决定要不要问）？

2. **Agent 问题框架**（每个案件类型独立设计）：
   - **写死的必问项**：如合同纠纷必问"合同类型"、"争议金额"
   - **Agent 自适应问题**：根据用户已有回答，Agent 判断是否补问
   - **问题形式**：表单（结构化）or 选择题（快速单选）or 自由文本
   - 用户可对任何问题选"其他"自由描述，内容不完整不阻塞生成

3. **交付物**：
   - Agent 问题框架文档（必问项 + 自适应逻辑）
   - LLM 输出 JSON Schema（见 4.3）
   - HTML 骨架（Jinja2，含占位符）
   - LLM 指导文档（方案格式 + HTML 生成规则 + 分析重点）

**5 个初始案件类型**：合同纠纷、劳动争议、婚姻家事、交通事故、刑事辩护  
**无权限 gate**：所有类型对所有 tier 开放，用积分消耗量驱动升级。

### 4.3 LLM 输出 JSON Schema（核心安全机制）

每个模板定义一个**强制 Schema**。示例（合同纠纷）：

```json
{
  "type": "object",
  "properties": {
    "争议焦点": {
      "type": "array",
      "items": {"type": "string"},
      "maxItems": 5
    },
    "时间轴": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$"},
          "event": {"type": "string"}
        }
      }
    },
    "律师建议": {
      "type": "string",
      "maxLength": 500
    }
  },
  "required": ["争议焦点", "时间轴", "律师建议"]
}
```

**后端校验流程**：
1. LLM 输出 → 尝试 JSON 解析
2. 通过 JSON Schema validation 严格校验
3. **失败**：重试生成（最多 3 次），仍失败 → 返回错误 + 全额退款
4. **通过**：填充进 Jinja2 模板

---

## 5. 费用模型框架 & 灰测成本验证

### 5.1 灰测期数据收集清单

每次生成记录：
- 案件类型 + 细分案由
- 输入字数 + 追问轮数
- 使用的模型（GPT / Claude）+ 订阅等级
- 是否调用法宝、调用几次
- LLM token 消耗 + 生成耗时
- 实际成本（API 计费、MCP 计费）
- **用户反馈评分**（灰测内置打分）

**关键字段存库**（见数据模型 §8）：
- `token_usage.input_tokens` / `.output_tokens`
- `api_cost_estimate`（该次生成的估算成本）
- 生成时长（start_time, end_time）

### 5.2 灰测期成本看板（核心功能，灰测数据反推定价的前提）

**目标**：让你（单人操盘）能轻松查看和导出成本数据，灰测结束时能迅速反推定价。

**形式**（选一个）：
- **A（推荐，最简单）**：SQL 查询脚本 + CSV 导出
  ```sql
  SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS generation_count,
    AVG(CAST(token_usage->>'input_tokens' AS INT)) AS avg_input_tokens,
    AVG(CAST(token_usage->>'output_tokens' AS INT)) AS avg_output_tokens,
    AVG(api_cost_estimate) AS avg_cost_yuan,
    model_used,
    subscription_tier,
    SUM(CASE WHEN use_pkulaw THEN 1 ELSE 0 END) AS pkulaw_count
  FROM generations
  WHERE status = 'done'
  GROUP BY DATE(created_at), model_used, subscription_tier
  ORDER BY date DESC;
  ```
  灰测期每周跑一次，导出 CSV，用 Excel/Google Sheet 分析。

- **B（如果有前端时间）**：Admin-only 页面（`/admin/analytics`）
  - 日期范围选择 + 图表展示
  - 按模型、订阅等级、法宝使用率分类
  - 一键导出 CSV

**关键数据点**（灰测报告必须有的）：
- 总生成数、总 token 消耗
- 按模型分布（GPT% vs Claude%）
- 按订阅等级分布
- 法宝调用率及平均成本
- 平均生成耗时
- 高成本 case（>500 tokens）频率

### 5.3 冻结费用表的时间点

**灰测结束时**：
1. 导出全量成本数据（§5.2）
2. 计算各类型平均成本、P50/P95
3. 反推定价（基础价 × 利润率 + 浮动费）
4. 冻结费用表
5. 正式版上线前最后确认

---

## 6. 结果页架构 & 安全隔离

### 6.1 架构：子域隔离 + Sandbox

```
律师浏览器 (yourdomain.com, 有 JWT token)
  ↓
"查看结果"按钮 → iframe src="render.yourdomain.com/view/{gen_id}"
                         (完全不同子域)
  ↓
render.yourdomain.com 校验权限后返回 HTML
  ↓
iframe 加 sandbox 属性，XSS 即使发生也隔离
```

**同时**：
- **用户输入消毒**：表单数据存库前用白名单过滤
- **HTML 编辑限制**：只有 class="editable" 的文本节点可编辑
- **编辑后上传**：PATCH 时再次消毒后存 OSS

### 6.2 OSS 改私读 + 鉴权代理

**新方案**：
- OSS Bucket 改为**私读**（禁止直接公网访问）
- 后端新增端点：`GET /api/render/{gen_id}` 校验权限后返回 HTML
- 前端：iframe src="/api/render/{gen_id}"（同源）
- 分享页：校验 share_token 有效性后才展示

**收益**：敏感案情不会裸奔在 OSS 上，分享权控制更严密。

### 6.3 结果页功能

**左侧预览（70%）**：支持 inline 编辑

**右侧操作面板（30%）**：
- 积分消耗说明
- 使用模型标注
- "下载 HTML" / "复制分享链接" / "截图下载" / "重新生成"
- 进阶版/专业版：展开法宝引用清单

---

## 7. 前端页面框架

**设计规范**：`docs/lawviz-design-spec-b.html`（仅适用于律析 Web UI，不适用于律师生成的案件报告 HTML）

### 7.1 落地页（`/`）
- Hero + 三步流程 + 5 个案件类型预览 + 订阅套餐对比

### 7.2 首次登录引导（注册后立即触发）

注册完成后，**进入仪表盘前**强制弹出个人资料页，让律师填写：
- 头像
- 姓名
- 律所名称
- 微信号
- 手机号
- 个人简介

全部填完才能进仪表盘（可以跳过但提示"不填无法在报告上显示你的名片"）。这是营销软件的标配行为，不突兀。

### 7.3 仪表盘（`/dashboard`，需登录）
- 当前订阅等级 + 本月剩余积分 + 升级/续费/充值按钮
- "新建可视化"大按钮 → 进对话框
- 历史列表（最近 10 条）：案件类型、时间、状态、"查看"/"分享"

### 7.4 对话框页（`/generate`，需登录）

**这是核心交互页面**，取代原来的"选模板 + 填表"两个步骤。

**输入区布局**：
- 消息输入框（主体）
- 案件类型下拉（必选，默认空，用户输入第一句话前必须先选）
- 发送按钮（案件类型未选时置灰）

**对话框顶部工具栏**：
- 当前使用模型标签（"GPT-5.5" or "Claude Opus 4.8"）
- "切换模型"按钮 → 弹出模型介绍弹窗

**模型介绍弹窗**（漂亮的卡片式设计）：
- GPT-5.5：OpenAI 最新模型，快速、覆盖广
- Claude Opus 4.8：Anthropic 旗舰模型，在复杂推理和长文本分析上表现突出
- 客观介绍，不做主观比较，律师自己选
- 切换后：**已有上下文全注入新模型**，对话继续，不重置

**对话流程**：
1. 用户选案件类型 + 输第一句话 → 发出
2. Agent 发出结构化问题（表单 / 选择题形式）
3. 用户填写或选"其他"自由描述（内容不完整不阻塞）
4. 重复 2-3，最多 5 轮
5. Agent 生成**方案文本**（见下）

**方案确认区**：
- 方案以纯文本展示在对话框里（格式固定，内容可变）
- 底部两个按钮："确认，生成报告" / "有问题，继续修改"
- 点确认 → 进入生成

### 7.5 结果页（`/generate/result/[genId]`，需登录）

**左侧预览（70%）**：
- HTML 报告渲染
- 支持 inline 编辑（点击可编辑文字区域，失焦自动保存）

**右侧操作面板（30%）**：
- 积分消耗说明 + 剩余积分
- 使用模型标注
- **"下载 PDF"**（核心功能，与 HTML 分辨率一致）
- **"下载图片"**（PNG，与 HTML 分辨率一致）
- "下载 HTML"
- "复制分享链接"
- "重新生成"（扣新的积分）
- 进阶/专业版：展开法宝引用清单

**PDF / 图片生成说明**：
- 用户点击"下载 PDF"或"下载图片"时，后端用无头浏览器（Playwright）截取 HTML 渲染结果
- 分辨率与 HTML 页面一致
- 律师可下载后自由使用：打印给客户、插入 Word、发邮件、微信直接发文件

### 7.6 分享页（`/share/[token]`，**灰测期需登录**）

- 灰测期：分享页需已登录（低风险）；正式版开放公网
- 展示 HTML（通过 `/api/render/{gen_id}` 同源代理）
- 顶部横幅："由律析 LawViz 生成 · 立即试用"

**律师个人品牌植入（获客飞轮）**：
- 报告右下角自动印上律师信息：头像 + 姓名 + 律所 + 微信二维码
- 来源：个人设置（见 7.7）
- 如未填，显示"由律析 LawViz 生成"
- 律师分享的是**自己的名片**，不是 LawViz 的广告 → 主动传播动力

### 7.7 个人设置页（`/settings`，需登录）

- 头像、姓名、律所、微信号、手机号、个人简介
- 分享设置：微信二维码（上传 or 自动生成）、电话显示开关
- UI 简洁，1 个标签页

---

## 8. 数据模型

**users**：id, phone, password_hash, credits, subscription_tier, subscription_end_date, **lawyer_profile** (JSONB: {name, firm, avatar_url, wechat_qr_code_url, phone_display, signature}), created_at, last_login

**generations**：id, user_id, case_type (str), model_used (str, 最终确认用的模型), model_switches (JSONB: 记录切换历史), use_pkulaw, conversation_history (JSONB: [{role, content, type}]), plan_text (TEXT: 方案纯文本), llm_output (JSONB: 结构化内容), token_usage (JSONB: {input_tokens, output_tokens}), api_cost_estimate (DECIMAL), status (draft|qa|plan|confirmed|generating|done|failed), html_oss_key, law_refs, credits_cost, share_token, created_at, completed_at

**transactions**：id, user_id, type (subscribe|topup|deduct|refund), credits, amount_yuan, subscription_tier, subscription_months, status, created_at

**templates**：id, name, description, fields_schema (JSONB), qa_system_prompt, llm_output_schema (JSONB), html_template_path, is_active, created_at

---

## 9. API 设计概览

### 认证 & 订阅

```
POST /api/auth/{register,login}
GET  /api/auth/me
GET  /api/subscriptions/plans
POST /api/subscriptions/subscribe
POST /api/subscriptions/upgrade
POST /api/webhooks/hupijiao [签名验证]
```

### 个人设置（新增）

```
GET  /api/users/profile  [需认证]
     → {name, firm, avatar_url, wechat_qr_code_url, phone_display, signature}

PATCH /api/users/profile  [需认证]
     {name, firm, avatar_url, wechat_qr_code_url, phone_display, signature}
     → {success}
```

### 生成流程

```
POST /api/generate/start
     {case_type, model (gpt|claude), use_pkulaw, initial_message}
     → {gen_id, first_question (结构化)}

POST /api/generate/{gen_id}/message
     {content, model?}           ← model 可选，切换时传新模型
     → {type: "question"|"plan", content, round?}

POST /api/generate/{gen_id}/confirm
     {} → {gen_id, status: "generating"}

GET  /api/generate/{gen_id}/status
     → {status, html_url?, credits_cost?, error?}

PATCH /api/generate/{gen_id}/html
     {html} → {success}

GET  /api/generate/history [分页]

GET  /api/generate/{gen_id}/export
     {format: "pdf"|"png"} → 文件流（Playwright 渲染）
```

### HTML 代理（新增关键）

```
GET /api/render/{gen_id}  [权限校验：own user || valid share_token]
     → 返回 HTML，用于 iframe 或直接 div 渲染
```

### 公开分享（灰测期需登录）

```
GET /api/share/{share_token}  [灰测期：用户需已登录]
     → {template_name, tier, html_url, created_at}
```

---

## 10. 合规 & 灰测路线

### 10.1 灰测必须做

- **ICP 备案**（从 Sprint 0 即刻启动）
- **生成内容标注**
- **隐私 + 用户协议**
- **灰测反馈机制**（内置打分）
- **成本看板/导出脚本**

### 10.2 正式版再补

- **生成式 AI 备案**
- **内容安全 API 接入**
- **发票能力**
- **微信支付/登录**

---

## 11. Sprint 分解（修订版）

| Sprint | 重点 | 里程碑 |
|--------|------|--------|
| 0 | GitHub Recon + Agent 选型 + 基础设施采购 + ICP 备案启动 | what-to-copy.md + 成本看板原型 |
| 1 | 项目初始化 + 数据库 + 本地环境 | 本地环境完成 |
| 2 | 用户系统 + 私有访问 + 额度/支付边界 | 私有访问和内部额度可用，支付适配边界完成 |
| 3a | Agent + 生成 Pipeline + 法宝/New API/OSS 集成 + **1 个模板端到端** | 合同纠纷可用 |
| 3b | 剩余 4 个模板开发 | 5 个模板全量可用 |
| 4 | 前端 6 个页面 | 前端完成 + UI/UX 质量审查 |
| 5 | 私有部署准备 + 公开灰测前置 | 私有/内部验证版可用，公开灰测条件另行确认 |
| 6 | 成本分析 + 定价 | 费用表冻结 |

---

**文档定版完毕。等待开发者接收。**
