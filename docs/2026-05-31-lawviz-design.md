# LawViz 产品设计规格文档

**版本**：v1.0  
**日期**：2026-05-31  
**阶段**：第一期（Web SaaS）  
**状态**：待实现

---

## 1. 产品概述

LawViz 是面向中国律师的 AI 案件可视化 SaaS 工具。律师通过结构化表单输入案件信息，AI 追问遗漏细节，最终生成一份自包含的 HTML 可视化页面。页面可在浏览器预览、下载、截图分享至朋友圈，或通过公开链接发送给当事人。

第一期目标：Web SaaS，5 个案件类型模板，两个 AI 层级（GPT-5.5 基础/标准，Claude Opus 4.8 + 北大法宝 MCP 专业），积分制付费（虎皮椒收款）。

**核心开发原则：能抄的绝不自己写。**
- Agent 设计（结构化提问、intake 流程、verifier）：直接移植 OpenDesign 的 skill 体系，见 Sprint 0 recon 产出
- HTML 模板：直接复用 OpenDesign 现有 DESIGN.md 设计系统，仅新建1个 legal-specific DESIGN.md
- 所有 prompt / system_prompt 字段：从 OpenDesign skill 文件抄取并做法律场景适配，不自行设计
- 自研部分仅限：Web 包装层（auth/credits/OSS/支付）+ 法律字段定义 + 北大法宝 MCP 接入

---

## 2. 目标用户与核心场景

**用户**：中国独立律师 / 小律所律师，非技术用户，主要使用微信办公。

**核心场景（按优先级）**：
1. **谈案准备**：见客户前生成可视化方案，展示服务质量，建立信赖感。此阶段律师掌握信息少，对内容准确性要求低，是最优切入口。
2. **办案中解释**：庭审前、谈判前向当事人解释法律流程、权利义务、时间节点。
3. **朋友圈分享**：生成简洁、精美的法律科普卡片，用于个人品牌传播（获客引擎）。

**非目标场景（第一期不做）**：案件管理、文件存储、客户看板（第二期）。

---

## 3. 功能范围

### 3.1 第一期包含

- 用户注册/登录（手机号+密码）
- 积分查询与充值（虎皮椒）
- 5 个案件类型模板选择
- 结构化表单填写（必填项 + 可选项）
- AI 追问流程（最多 3 轮，GPT-5.5 驱动）
- HTML 可视化生成（异步，轮询结果）
- 生成结果预览（iframe 内嵌）
- inline 文字编辑（点击文字直接修改）
- 导出：下载 HTML / 一键截图 / 复制公开分享链接
- 历史记录列表（当前用户的所有生成）
- 积分自动扣除（生成成功后扣）

### 3.2 第一期不包含

- 微信登录、微信支付（需主体资质）
- 案件文件上传与管理
- 客户看板（第二期）
- 团队/多用户功能
- 模板自定义
- 批量生成

---

## 4. 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | Next.js 14（App Router，TypeScript） | React 框架，Claude 生成质量高 |
| 后端 | Python 3.11 + FastAPI | AI 调用逻辑天然契合 |
| 数据库 | PostgreSQL 15（阿里云 RDS） | 结构化数据 + JSONB 支持 |
| ORM | SQLAlchemy 2.0 + Alembic | 模型定义 + 数据库迁移 |
| 文件存储 | 阿里云 OSS | 存储生成的 HTML 文件，公开读 |
| AI 网关 | 用户自有 New API 实例 | 统一接入 GPT-5.5 / Claude Opus 4.8 |
| 法律数据库 | 北大法宝 MCP（HTTP 接口） | 仅专业层调用 |
| 收款 | 虎皮椒（hupijiao.com） | 个人开发者，无需营业执照 |
| 部署 | 阿里云 ECS（单台，Nginx 反代） | 前端构建产物 + FastAPI 后端同机 |
| 进程管理 | PM2 或 systemd | 管理 FastAPI 进程 |
| HTTPS | 阿里云免费 SSL + Nginx | 必须，虎皮椒 webhook 需要 HTTPS |

---

## 5. 项目目录结构

```
lawviz/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # 落地页
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── generate/
│   │   │   ├── page.tsx                  # 选模板
│   │   │   ├── [templateId]/page.tsx     # 填表+追问+生成
│   │   │   └── result/[genId]/page.tsx   # 预览+导出
│   │   └── share/[token]/page.tsx        # 公开分享（无需登录）
│   ├── components/
│   │   ├── ui/                           # shadcn/ui 基础组件
│   │   ├── AuthGuard.tsx
│   │   ├── CreditBalance.tsx
│   │   ├── TemplateCard.tsx
│   │   ├── DynamicForm.tsx               # ⚠️ 逻辑抄自 OpenDesign intake skill 的问卷结构，非自研
│   │   ├── QAChat.tsx                    # ⚠️ 追问流程抄自 OpenDesign 的 AI Q&A 模式
│   │   ├── HTMLPreview.tsx
│   │   └── ExportPanel.tsx
│   ├── lib/
│   │   ├── api.ts                        # axios 封装
│   │   ├── auth.ts                       # JWT 管理
│   │   └── utils.ts
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── main.py                           # FastAPI 入口，CORS 配置
│   ├── config.py                         # pydantic-settings 环境变量
│   ├── database.py                       # SQLAlchemy engine + session
│   ├── models/
│   │   ├── user.py
│   │   ├── generation.py
│   │   ├── transaction.py
│   │   └── template.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── generation.py
│   │   ├── credits.py
│   │   └── template.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── templates.py
│   │   ├── generate.py
│   │   ├── credits.py
│   │   └── webhooks.py
│   ├── services/
│   │   ├── llm.py                        # New API 调用
│   │   ├── pkulaw.py                     # 北大法宝 MCP
│   │   ├── oss.py                        # 阿里云 OSS
│   │   ├── generation.py                 # 生成主流程
│   │   └── credits.py                    # 积分逻辑
│   ├── templates_data/
│   │   ├── contract_dispute.json
│   │   ├── labor_dispute.json
│   │   ├── divorce_family.json
│   │   ├── traffic_accident.json
│   │   └── criminal_defense.json
│   ├── migrations/                       # Alembic
│   ├── requirements.txt
│   └── .env.example
│
├── deploy/
│   ├── nginx.conf
│   └── setup.sh
└── README.md
```

---

## 6. 数据库模型（完整 SQL）

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    credits DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 模板表（后端初始化，不通过前端管理）
CREATE TABLE templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    fields_schema JSONB NOT NULL,
    system_prompt TEXT NOT NULL,
    qa_system_prompt TEXT NOT NULL,
    min_tier INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 生成记录表
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id VARCHAR(50) NOT NULL REFERENCES templates(id),
    tier INTEGER NOT NULL,
    -- tier: 1=基础(GPT-5.5) 2=标准(GPT-5.5) 3=专业(Opus+法宝)
    input_data JSONB NOT NULL,
    qa_history JSONB NOT NULL DEFAULT '[]',
    -- qa_history: [{q: "AI问题", a: "用户回答"}]
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- status: draft|qa|qa_done|generating|done|failed
    model_used VARCHAR(100),
    html_oss_key VARCHAR(500),
    html_public_url VARCHAR(500),
    law_refs JSONB,
    -- law_refs: {laws: [{title, content, source}], cases: [{title, summary, court}]}
    credits_cost DECIMAL(10, 2),
    share_token VARCHAR(32) UNIQUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_share_token ON generations(share_token);

-- 积分交易记录表
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    -- type: purchase|deduct|refund
    credits DECIMAL(10, 2) NOT NULL,
    -- 正数=充入，负数=扣除
    amount_yuan DECIMAL(10, 2),
    pack_id VARCHAR(50),
    payment_platform VARCHAR(20),
    -- payment_platform: hupijiao
    payment_order_id VARCHAR(100),
    generation_id UUID REFERENCES generations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- status: pending|success|failed
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE UNIQUE INDEX idx_transactions_payment_order
    ON transactions(payment_order_id) WHERE payment_order_id IS NOT NULL;
```

---

## 7. 积分包与层级成本配置

```python
# backend/config.py 中硬编码

CREDIT_PACKS = {
    "starter":  {"credits": 5,  "price_yuan": 39,  "name": "尝鲜包"},
    "standard": {"credits": 20, "price_yuan": 148, "name": "标准包"},
    "pro":      {"credits": 50, "price_yuan": 349, "name": "专业包"},
}

GENERATION_COSTS = {
    1: 1.0,   # 基础层（GPT-5.5）
    2: 2.0,   # 标准层（GPT-5.5，更精细 prompt）
    3: 4.0,   # 专业层（Claude Opus 4.8 + 北大法宝）
}

MODELS = {
    1: "gpt-5.5",
    2: "gpt-5.5",
    3: "claude-opus-4-8",
}
```

---

## 8. API 端点规格

**前缀**：`/api`  
**认证**：JWT Bearer Token（`Authorization: Bearer <token>`）  
**格式**：`application/json`

### 8.1 认证

```
POST /api/auth/register
  Body:    { phone: string, password: string }
  200:     { user_id: string, token: string, credits: number }
  409:     { detail: "手机号已注册" }

POST /api/auth/login
  Body:    { phone: string, password: string }
  200:     { user_id: string, token: string, credits: number }
  401:     { detail: "手机号或密码错误" }

GET /api/auth/me  [需认证]
  200:     { user_id, phone, credits, created_at }
```

### 8.2 模板

```
GET /api/templates
  200: [{ id, name, description, min_tier, fields_count }]

GET /api/templates/{template_id}
  200: { id, name, description, min_tier, fields: [FieldDefinition] }
  404: { detail: "模板不存在" }
```

### 8.3 生成流程

```
POST /api/generate/start  [需认证]
  Body: { template_id: string, tier: 1|2|3, input_data: {key: value} }
  逻辑:
    1. 校验 template 存在且 tier >= template.min_tier
    2. 校验用户积分 >= GENERATION_COSTS[tier]（预检查，不扣）
    3. 校验所有 required 字段已填写
    4. 创建 generation（status=draft）
  200: { gen_id: string }
  400: { detail: "积分不足" | "缺少必填字段: [...]" }

POST /api/generate/{gen_id}/qa  [需认证]
  Body: { answer: string }
  逻辑:
    1. 校验 gen_id 属于当前用户，status in [draft, qa]
    2. 将 answer 追加到 qa_history（对应上一轮 AI 的问题）
    3. 调用 AI 追问（见第 9 节），使用 gpt-5.5（所有层级追问均用 GPT）
    4. 若 AI 返回 READY 或已达 3 轮：status=qa_done
    5. 若 AI 返回问题：status=qa
  200（有新问题）: { status: "question", question: string, round: number }
  200（准备好）:   { status: "ready" }

POST /api/generate/{gen_id}/submit  [需认证]
  Body: {}
  逻辑:
    1. 校验 status in [draft, qa_done]
    2. 再次校验积分
    3. status=generating
    4. 启动 BackgroundTask: run_generation(gen_id)
  200: { gen_id: string, status: "generating" }

GET /api/generate/{gen_id}/status  [需认证]
  前端每 2 秒轮询
  200: {
    status: "generating"|"done"|"failed",
    html_public_url?: string,
    share_token?: string,
    law_refs_count?: number,
    credits_cost?: number,
    error?: string
  }

PATCH /api/generate/{gen_id}/html  [需认证]
  Body: { html: string }
  逻辑: 将新 HTML 上传至 OSS，覆盖原 key（URL 不变）
  200: { success: true }

GET /api/generate/history  [需认证]
  Query: page=1, page_size=20
  200: {
    total: number,
    items: [{ gen_id, template_name, tier, status, credits_cost,
              html_public_url, share_token, created_at }]
  }
```

### 8.4 积分

```
GET  /api/credits/balance  [需认证]
  200: { credits: number }

GET  /api/credits/packs
  200: [{ pack_id, name, credits, price_yuan }]

POST /api/credits/purchase  [需认证]
  Body: { pack_id: string }
  逻辑:
    1. 查找 CREDIT_PACKS[pack_id]
    2. 创建 transaction（status=pending）
    3. 调用虎皮椒 API 创建订单（out_trade_no=transaction.id）
  200: { pay_url: string, order_id: string }
  400: { detail: "无效的积分包" }
```

### 8.5 Webhook（虎皮椒回调）

```
POST /api/webhooks/hupijiao  [无 Bearer，有签名验证]
  逻辑:
    1. 验证虎皮椒 HMAC-MD5 签名
    2. 通过 out_trade_no 查找 transaction
    3. 校验 status==pending（防重复到账）
    4. 校验金额匹配
    5. 数据库事务：
       transaction.status = success
       users.credits += pack.credits
  Response body: "success"（纯文本，虎皮椒要求）
```

### 8.6 公开分享

```
GET /api/share/{share_token}  [无需认证]
  200: { template_name, tier, html_public_url, created_at }
  404: { detail: "链接无效" }
```

---

## 9. 核心生成流程（伪代码级）

### 9.1 AI 追问（services/generation.py: run_qa_round）

```python
async def run_qa_round(generation: Generation, user_answer: str) -> dict:
    # 所有层级追问均使用 gpt-5.5，不额外收费
    messages = [
        {"role": "system", "content": template.qa_system_prompt},
        {"role": "user", "content": f"案件信息：{json.dumps(generation.input_data)}"},
    ]
    # 追加历史 QA 轮次
    for qa in generation.qa_history:
        messages.append({"role": "assistant", "content": qa["q"]})
        messages.append({"role": "user",      "content": qa["a"]})
    if user_answer:
        messages.append({"role": "user", "content": user_answer})

    response = await llm.chat(model="gpt-5.5", messages=messages,
                              max_tokens=200, temperature=0.3)
    if response.strip() == "READY" or len(generation.qa_history) >= 3:
        return {"status": "ready"}
    return {"status": "question", "question": response.strip()}
```

### 9.2 HTML 生成主流程（services/generation.py: run_generation）

```python
async def run_generation(gen_id: str, db: Session):
    generation = get_generation(gen_id, db)
    template   = get_template(generation.template_id, db)

    try:
        # Step 1: 北大法宝检索（仅 tier=3）
        law_refs = None
        if generation.tier == 3:
            law_refs = await pkulaw.search(template.id, generation.input_data)
            generation.law_refs = law_refs
            db.commit()

        # Step 2: 构建 Prompt
        qa_summary  = format_qa_history(generation.qa_history)
        law_section = format_law_refs(law_refs) if law_refs else ""
        prompt = build_generation_prompt(template, generation.input_data,
                                         qa_summary, law_section,
                                         generation.tier)

        # Step 3: 调用 AI 生成 HTML
        model = MODELS[generation.tier]
        html  = await llm.chat(model=model,
                               messages=[{"role": "user", "content": prompt}],
                               max_tokens=8000, temperature=0.4)
        generation.model_used = model

        # Step 4: 上传 OSS
        oss_key = f"generations/{generation.user_id}/{gen_id}.html"
        url     = await oss.upload_html(oss_key, html)

        # Step 5: 扣积分（数据库事务 + SELECT FOR UPDATE）
        await credits.deduct(generation.user_id, GENERATION_COSTS[generation.tier],
                             gen_id, db)

        # Step 6: 更新记录
        generation.html_oss_key   = oss_key
        generation.html_public_url = url
        generation.credits_cost   = GENERATION_COSTS[generation.tier]
        generation.share_token    = secrets.token_hex(16)
        generation.status         = "done"
        generation.completed_at   = datetime.utcnow()
        db.commit()

    except Exception as e:
        generation.status        = "failed"
        generation.error_message = str(e)
        db.commit()
```

### 9.3 北大法宝检索（services/pkulaw.py: search）

```python
async def search(case_type: str, input_data: dict) -> dict:
    """
    成本估算：每次任务约 30-50 计费单位（95元/1000次）
    控制策略：return_num=5 限制法条数，dianxing=True 只查权威案例
    """
    query = build_search_query(case_type, input_data)

    laws  = await call_mcp("law_vector_search", {
        "query": query, "return_num": 5,
        "fatiao_filter": {"sxx": "现行有效"}
    })
    cases = await call_mcp("case_vector_search", {
        "query": query, "dianxing": True
    })

    return {
        "laws":  extract_law_summaries(laws,  max_items=5),
        "cases": extract_case_summaries(cases, max_items=3),
    }
```

### 9.4 生成 Prompt 模板

```python
def build_generation_prompt(template, input_data, qa_summary, law_section, tier):
    output_type = input_data.get("output_type", "谈案展示")
    style_note = {
        "谈案展示（客户版·简洁）":  "简洁清晰，突出律师专业度，不暴露策略细节",
        "办案解释（详细版）":       "详细全面，包含完整流程、时间节点、各方权利义务",
        "朋友圈分享（极简版）":     "极简、视觉冲击强，1-2个核心信息，适合截图传播",
    }.get(output_type, "专业清晰")

    return f"""{template.system_prompt}

案件基本信息：
{json.dumps(input_data, ensure_ascii=False, indent=2)}

{f"律师补充信息：\n{qa_summary}" if qa_summary else ""}
{f"\n相关法律依据（请在适当位置引用，标注来源）：\n{law_section}" if law_section else ""}

输出风格：{style_note}

HTML 输出要求：
- 完整的自包含 HTML 文件，内联全部 CSS 和 JS，无任何外部依赖
- 所有可供律师修改的文字节点添加 class="editable"
- 页面结构：标题区、当事人信息、案情概述、关键时间轴、争议焦点、律师建议/策略
- 适合 1280px 宽度屏幕，同时适合截图分享（朋友圈）
- 中文界面，专业法律风格，配色沉稳
{"- 在引用法条处标注来源（法规名称+条款号）" if tier == 3 else ""}
- 仅输出 HTML 代码，不要任何 markdown 格式或解释文字
"""
```

---

## 10. 模板系统（5个模板完整字段定义）

### 10.1 合同纠纷（contract_dispute）

```json
{
  "id": "contract_dispute",
  "name": "合同纠纷",
  "description": "适用于买卖、服务、租赁、借款等各类合同违约争议",
  "min_tier": 1,
  "fields": [
    {"key": "plaintiff",           "label": "原告/申请人",   "type": "text",     "required": true,  "placeholder": "如：张三 或 XX科技有限公司"},
    {"key": "defendant",           "label": "被告/被申请人", "type": "text",     "required": true},
    {"key": "contract_type",       "label": "合同类型",      "type": "select",   "required": true,
     "options": ["买卖合同","服务合同","租赁合同","借款合同","建设工程合同","技术合同","其他"]},
    {"key": "dispute_amount",      "label": "争议金额（元）","type": "number",   "required": false},
    {"key": "breach_description",  "label": "违约行为描述",  "type": "textarea", "required": true,
     "placeholder": "简述对方违约行为，如：拒不交货、拖欠货款等"},
    {"key": "key_dates",           "label": "关键时间节点",  "type": "textarea", "required": true,
     "placeholder": "每行一个，格式：YYYY-MM-DD 事件名\n示例：2025-03-01 签订合同"},
    {"key": "claims",              "label": "诉讼请求",      "type": "textarea", "required": true},
    {"key": "case_stage",          "label": "案件阶段",      "type": "select",   "required": true,
     "options": ["前期谈案","发律师函阶段","仲裁申请中","一审诉讼中","二审中","执行阶段"]},
    {"key": "output_type",         "label": "输出用途",      "type": "select",   "required": true,
     "options": ["谈案展示（客户版·简洁）","办案解释（详细版）","朋友圈分享（极简版）"]},
    {"key": "lawyer_notes",        "label": "律师策略备注（内部，不展示给客户）", "type": "textarea", "required": false}
  ],
  "qa_system_prompt": "你是专业法律信息收集助手。根据合同纠纷案件的已知信息，判断是否还有遗漏的关键信息（如担保条款、管辖约定、对方可能的抗辩等）。如有则只提一个最关键的问题（中文，简洁），如已充分则仅回复：READY"
}
```

### 10.2 劳动争议（labor_dispute）

```json
{
  "id": "labor_dispute",
  "name": "劳动争议",
  "description": "适用于违法解除、欠薪、工伤赔偿、竞业限制等",
  "min_tier": 1,
  "fields": [
    {"key": "worker_name",    "label": "劳动者姓名",        "type": "text",     "required": true},
    {"key": "employer_name",  "label": "用人单位名称",      "type": "text",     "required": true},
    {"key": "dispute_type",   "label": "争议类型",          "type": "select",   "required": true,
     "options": ["违法解除劳动合同","拖欠工资/奖金","工伤赔偿","未签书面合同双倍工资","竞业限制纠纷","其他"]},
    {"key": "work_period",    "label": "工作起止时间",      "type": "text",     "required": true,
     "placeholder": "如：2022-03-01 至 2025-04-30"},
    {"key": "monthly_salary", "label": "月工资（元）",      "type": "number",   "required": false},
    {"key": "dispute_amount", "label": "主张金额（元）",    "type": "number",   "required": false},
    {"key": "key_facts",      "label": "关键事实",          "type": "textarea", "required": true,
     "placeholder": "如：用人单位以"工作失误"为由于2025-04-15单方解除劳动合同，未提前30日通知"},
    {"key": "claims",         "label": "仲裁/诉讼请求",    "type": "textarea", "required": true},
    {"key": "case_stage",     "label": "案件阶段",          "type": "select",   "required": true,
     "options": ["前期谈案","劳动仲裁申请中","一审诉讼中","二审中"]},
    {"key": "output_type",    "label": "输出用途",          "type": "select",   "required": true,
     "options": ["谈案展示（客户版·简洁）","办案解释（详细版）","朋友圈分享（极简版）"]},
    {"key": "lawyer_notes",   "label": "律师策略备注（内部）", "type": "textarea", "required": false}
  ],
  "qa_system_prompt": "你是专业法律信息收集助手。根据劳动争议案件的已知信息，判断是否还有遗漏的关键信息（如仲裁时效、工资证明情况、解除通知书等）。如有则只提一个最关键的问题，如已充分则仅回复：READY"
}
```

### 10.3 婚姻家事（divorce_family）

```json
{
  "id": "divorce_family",
  "name": "婚姻家事",
  "description": "适用于离婚诉讼、财产分割、子女抚养、赡养等",
  "min_tier": 1,
  "fields": [
    {"key": "client_role",       "label": "委托人身份",        "type": "select",   "required": true,
     "options": ["原告（起诉方）","被告（应诉方）"]},
    {"key": "marriage_date",     "label": "结婚日期",          "type": "text",     "required": false,
     "placeholder": "如：2015-08-20"},
    {"key": "separation_date",   "label": "分居/感情破裂时间", "type": "text",     "required": false,
     "placeholder": "如：2024年初双方开始分居"},
    {"key": "children_info",     "label": "子女情况",          "type": "textarea", "required": false,
     "placeholder": "如：一子，现年8岁，目前随母亲生活"},
    {"key": "property_overview", "label": "主要财产概况",      "type": "textarea", "required": false,
     "placeholder": "如：共同房产1套（市值约200万），双方各有存款若干"},
    {"key": "key_disputes",      "label": "争议焦点",          "type": "textarea", "required": true,
     "placeholder": "如：子女抚养权归属、婚前房产认定、对方隐匿财产"},
    {"key": "claims",            "label": "诉讼请求",          "type": "textarea", "required": true},
    {"key": "case_stage",        "label": "案件阶段",          "type": "select",   "required": true,
     "options": ["前期谈案","调解阶段","一审诉讼中","二审中","执行阶段"]},
    {"key": "output_type",       "label": "输出用途",          "type": "select",   "required": true,
     "options": ["谈案展示（客户版·简洁）","办案解释（详细版）","朋友圈分享（极简版）"]},
    {"key": "lawyer_notes",      "label": "律师策略备注（内部）", "type": "textarea", "required": false}
  ],
  "qa_system_prompt": "你是专业法律信息收集助手。根据婚姻家事案件的已知信息，判断是否还有遗漏的关键信息（如婚前财产协议、转移财产迹象、子女意愿等）。如有则只提一个最关键的问题，如已充分则仅回复：READY"
}
```

### 10.4 交通事故（traffic_accident）

```json
{
  "id": "traffic_accident",
  "name": "交通事故",
  "description": "适用于机动车交通事故责任纠纷，含人身伤害赔偿",
  "min_tier": 1,
  "fields": [
    {"key": "client_role",      "label": "委托人身份",      "type": "select",   "required": true,
     "options": ["受害方","责任方"]},
    {"key": "accident_date",    "label": "事故发生日期",    "type": "text",     "required": true,
     "placeholder": "如：2025-11-20"},
    {"key": "fault_ratio",      "label": "责任认定情况",    "type": "select",   "required": false,
     "options": ["全责（对方）","主次责任（对方主责）","同等责任","主次责任（我方主责）","全责（我方）","尚未认定"]},
    {"key": "injuries",         "label": "伤亡情况",        "type": "textarea", "required": true,
     "placeholder": "如：颈椎骨折，住院30天，鉴定为十级伤残"},
    {"key": "medical_expenses", "label": "已产生医疗费（元）","type": "number",  "required": false},
    {"key": "claims_overview",  "label": "赔偿请求概要",    "type": "textarea", "required": true,
     "placeholder": "如：医疗费、误工费、护理费、残疾赔偿金，合计约XX万元"},
    {"key": "insurance_info",   "label": "保险情况",        "type": "textarea", "required": false,
     "placeholder": "如：对方车辆投保交强险+100万商业险"},
    {"key": "case_stage",       "label": "案件阶段",        "type": "select",   "required": true,
     "options": ["前期谈案","协商理赔中","一审诉讼中","二审中","执行阶段"]},
    {"key": "output_type",      "label": "输出用途",        "type": "select",   "required": true,
     "options": ["谈案展示（客户版·简洁）","办案解释（详细版）","朋友圈分享（极简版）"]},
    {"key": "lawyer_notes",     "label": "律师策略备注（内部）", "type": "textarea", "required": false}
  ],
  "qa_system_prompt": "你是专业法律信息收集助手。根据交通事故案件的已知信息，判断是否还有遗漏的关键信息（如伤残鉴定情况、事故认定书是否取得、对方赔偿态度等）。如有则只提一个最关键的问题，如已充分则仅回复：READY"
}
```

### 10.5 刑事辩护（criminal_defense）

```json
{
  "id": "criminal_defense",
  "name": "刑事辩护",
  "description": "适用于刑事案件辩护，含罪名解析、量刑分析、辩护策略",
  "min_tier": 2,
  "fields": [
    {"key": "defendant_name",        "label": "被告人姓名",    "type": "text",     "required": true},
    {"key": "charge",                "label": "涉嫌罪名",      "type": "text",     "required": true,
     "placeholder": "如：诈骗罪"},
    {"key": "case_stage",            "label": "案件阶段",      "type": "select",   "required": true,
     "options": ["侦查阶段","审查逮捕阶段","审查起诉阶段","一审中","二审中"]},
    {"key": "alleged_facts",         "label": "指控事实概述",  "type": "textarea", "required": true,
     "placeholder": "简述检察机关/警方的指控事实"},
    {"key": "defense_direction",     "label": "辩护方向",      "type": "select",   "required": true,
     "options": ["无罪辩护","罪轻辩护（量刑过重）","认罪认罚（争取宽处）","程序违法（证据排除）","其他"]},
    {"key": "key_evidence_issues",   "label": "关键证据/程序问题", "type": "textarea", "required": false,
     "placeholder": "如：关键证人证言前后矛盾；电子数据提取程序违法"},
    {"key": "output_type",           "label": "输出用途",      "type": "select",   "required": true,
     "options": ["谈案展示（客户版·简洁）","办案解释（详细版）","朋友圈分享（极简版）"]},
    {"key": "lawyer_notes",          "label": "律师策略备注（内部）", "type": "textarea", "required": false}
  ],
  "qa_system_prompt": "你是专业法律信息收集助手。根据刑事案件的已知信息，判断是否还有遗漏的关键信息（如羁押情况、同案犯情况、认罪认罚意愿等）。如有则只提一个最关键的问题，如已充分则仅回复：READY"
}
```

---

## 11. 前端页面规格

### 11.1 落地页（/）

未登录时显示，已登录重定向 `/dashboard`：
- Hero：产品名 + 一句话介绍 + "立即体验"按钮（→ `/auth/register`）
- 功能展示：3张静态截图（谈案方案 / 流程图 / 分享卡片）
- 定价区：3个积分包卡片（尝鲜/标准/专业）
- 底部：联系微信号

### 11.2 仪表盘（/dashboard）

- `CreditBalance`：显示余额，"充值"→ 弹出积分包对话框
- "新建可视化"按钮 → `/generate`
- 历史列表（分页 10条/页）：模板名、层级徽章、时间、状态、"查看"/"分享链接"

### 11.3 选模板页（/generate）

- 卡片网格（3列），每张显示模板名/描述/层级要求/积分消耗
- 点击→弹出层级选择 Modal（对比各层级特性和积分）
- 确认层级 → `/generate/{templateId}?tier={tier}`

### 11.4 生成页（/generate/[templateId]）

同一页面内3个阶段切换（URL不变，state控制）：

**阶段1：填写表单**
- `DynamicForm` 根据 `fields_schema` 渲染：
  - text → `<input type="text">`
  - textarea → `<textarea>`
  - select → `<select>`
  - number → `<input type="number">`
  - date → date picker
- 必填字段红色 `*` 标注，提交时前端校验
- "下一步" → 调用 POST `/api/generate/start`

**阶段2：AI 追问**
- `QAChat` 组件：对话气泡展示 AI 问题
- 底部文本框回答，"提交回答" → POST `/api/generate/{gen_id}/qa`
- 显示"第 X 轮，最多 3 轮"
- "跳过，直接生成"按钮（随时可用）→ POST `/api/generate/{gen_id}/submit`
- AI 返回 ready 后自动触发 submit

**阶段3：生成中**
- 加载动画 + 文案（"AI 正在生成可视化..."）
- 每 2 秒 GET `/api/generate/{gen_id}/status`
- 完成 → 跳转 `/generate/result/{genId}`

### 11.5 结果页（/generate/result/[genId]）

**布局：左70% 预览 + 右30% 操作面板**

左侧 `HTMLPreview`：
- `<iframe src={html_public_url}>` 加载生成结果
- 注入 inline 编辑脚本：点击 `.editable` 元素 → `contenteditable=true`，失焦时 → PATCH `/api/generate/{gen_id}/html`

右侧 `ExportPanel`：
- 积分消耗说明
- 使用模型标注（GPT-5.5 / Claude Opus 4.8 + 北大法宝）
- "下载 HTML"（直接下载 `html_public_url`）
- "复制分享链接"（复制 `/share/{token}`）
- "截图下载"（`html2canvas` 截取 iframe 内容）
- "重新生成"（扣积分重新走生成流程）
- tier=3 时：展开显示北大法宝引用法条/案例列表

### 11.6 公开分享页（/share/[token]）

- 无需登录
- 调用 GET `/api/share/{token}`，全屏 iframe
- 顶部小横幅："由 LawViz 生成 · 立即试用 →"

---

## 12. 阿里云部署规格

### 12.1 资源配置

| 资源 | 规格 | 说明 |
|------|------|------|
| ECS | 2 vCPU / 4GB / Ubuntu 22.04 | 运行全部服务 |
| RDS PostgreSQL 15 | 1 vCPU / 2GB | 仅允许 ECS 内网 IP |
| OSS Bucket | 按量付费 | 同地域，绑定自定义域名 |
| SSL 证书 | 阿里云免费 DV 证书 | |

### 12.2 Nginx 关键配置

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        root /var/www/lawviz/frontend/out;
        try_files $uri $uri.html $uri/ /index.html;
    }

    location /api/ {
        proxy_pass         http://127.0.0.1:8000;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;
        proxy_read_timeout 300s;
    }
}
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 12.3 环境变量（backend/.env）

```env
DATABASE_URL=postgresql://user:password@rds内网地址:5432/lawviz
NEWAPI_BASE_URL=http://your-newapi-server/v1
NEWAPI_API_KEY=sk-your-key
OSS_ACCESS_KEY_ID=your-key-id
OSS_ACCESS_KEY_SECRET=your-secret
OSS_BUCKET=lawviz-generations
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_PUBLIC_DOMAIN=https://files.yourdomain.com
PKULAW_API_BASE=https://open.pkulaw.com
PKULAW_API_KEY=your-pkulaw-key
HUPIJIAO_PID=your-pid
HUPIJIAO_KEY=your-key
JWT_SECRET=随机64位字符串
JWT_EXPIRE_HOURS=72
BASE_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## 13. 非功能要求

- **响应时间**：非生成 API < 500ms；生成 30-120s（异步轮询）
- **安全**：JWT 72h 过期；webhook 签名验证；RDS 不开公网
- **数据合规**：所有数据存储于阿里云中国大陆节点
- **错误处理**：生成失败不扣积分；显示友好错误信息含"重试"入口
- **积分并发**：SELECT FOR UPDATE 防止超扣

---

## 14. 第二期规划（本文档不涉及实现）

微信小程序：案件管理 + 客户看板 + 文件管理 + 进度推送。
第一期生成的 HTML 可视化作为看板卡片通过链接嵌入。

---

## 11. 前端设计标准 — 方案B「晓光」

> **规范文件（唯一真相来源）**：`docs/lawviz/lawviz-design-spec-b.html`  
> **渲染样例**：`docs/lawviz/scheme-b-dawn.html`  
> 开发前端前必须通读规范文件。以下为关键摘要，供快速参考。

**产品中文名**：律析 | **英文名**：LawViz  
**目标用户**：中国年轻女性律师  
**设计哲学**：知性 · 克制 · 温度

### 11.1 色彩 Token

```css
:root {
  --bg:           oklch(98% 0.005 75);
  --surface:      oklch(100% 0 0);
  --surface-2:    oklch(96% 0.007 75);
  --fg:           oklch(17% 0.02 285);
  --muted:        oklch(50% 0.016 285);
  --border:       oklch(88% 0.008 75);
  --border-cool:  oklch(90% 0.006 285);
  --accent:       oklch(40% 0.17 294);
  --accent-light: oklch(40% 0.17 294 / 0.07);
  --accent-mid:   oklch(40% 0.17 294 / 0.18);
  --coral:        oklch(68% 0.15 18);       /* 仅主行动按钮 */
  --coral-soft:   oklch(68% 0.15 18 / 0.1);
}
```

### 11.2 字体

| 角色 | 字体 | 用途 |
|------|------|------|
| 展示 | Playfair Display italic 400 / bold 700 | H1、H2、Logo、价格 |
| 正文 | -apple-system / PingFang SC | body、表单、标签 |
| 等宽 | SF Mono / Menlo / Consolas | 日期、ID |

Playfair 不用于正文、按钮、导航，不用于 < 14px 文字。

### 11.3 布局

| 页面 | 布局 |
|------|------|
| 落地页 Hero | 55fr/45fr（左：标题+CTA，右：案件卡） |
| 功能区/定价区 | repeat(3, 1fr) |
| 结果页 | 70fr/30fr（预览/操作面板） |

全站：`max-width: 1160px; padding: 0 40px`

### 11.4 禁止事项（阻断性，合并前必须修复）

- 渐变背景（背景只能是 `--bg` 或 `--surface`）
- Emoji 图标（用 Lucide React stroke-width:1.5 替代）
- 左侧彩色边框卡片
- 虚构统计数字（用 `—` 或 `[上线后更新]` 占位）
- `--coral` 用于非主行动按钮
- H2/H3 旁加图标

完整规范含 Tailwind config、组件代码、响应式断点，见 `lawviz-design-spec-b.html`。

---
*文档结束。配套文件：2026-05-31-lawviz-workplan.md（工作规划）、lawviz-design-spec-b.html（前端设计规范）、scheme-b-dawn.html（落地页样例）*
