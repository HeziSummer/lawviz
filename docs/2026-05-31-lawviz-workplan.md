# LawViz 工作规划 v1.0
> 目标读者：Claude Code / Codex 子代理、执行开发者
> 日期：2026-05-31
> 配套文档：`2026-05-31-lawviz-design.md`

---

## 核心原则（执行前必读）

1. **能抄的绝不自己写** — 每个模块动手前先 GitHub Recon，找到可复用的骨架再开始
2. **Agent 选型要系统** — 不只看 OpenDesign，要横向比较 5-8 个开源 agent 项目，评分选型
3. **模板开发有工作流** — 每个案件类型模板通过"人机协同开发工作流"完成，不靠感觉写 prompt
4. **设计文档是真相来源** — 有疑问看 `lawviz-design.md`，不要自行假设

---

## Sprint 0 · GitHub Recon & Agent 选型（第 1-4 天）

### 目标
产出一份 `what-to-copy.md`，明确：
- 哪个开源项目的哪个模块/文件直接复制
- 哪些需要裁剪后使用
- 哪些需要自己写

### 任务 0-1：系统检索 Agent 框架（第 1-2 天）

**搜索范围**（至少覆盖以下关键词）：
```
structured form + AI followup generation
intake skill agent open source
legal document generation agent
form to HTML generation pipeline
conversational form agent
AI questionnaire generator
```

**必须调研的项目**：
| 项目 | 重点看 |
|------|--------|
| manalkaff/opendesign | intake skill、verifier、prompt 结构 |
| nexu-io/open-design | DESIGN.md 设计系统列表 |
| EthanGuo2022/OpenDesign | HTML 模板库 |
| （搜索发现的其他项目 x 5-8 个） | 同上 |

**评分维度**（每个项目打分 1-5）：
- 简洁性：表单/追问流程是否简单，律师能快速上手
- 稳定性：输出是否可控，幻觉风险低
- 可抄程度：代码结构清晰，许可证允许商用（MIT/Apache 优先）
- HTML 输出质量：生成的 HTML 是否美观可用

**产出文件**：`docs/lawviz/what-to-copy.md`
```markdown
## 选定骨架：[项目名]
- 复制 intake skill -> 裁剪为 lawviz/agent/intake.py
- 复制 DESIGN.md 系统 #X -> 用于合同纠纷模板
- 自己写：支付回调、北大法宝 MCP 调用
```

### 任务 0-2：前端参考样例收集（第 2-3 天）

- 收集 10+ 个法律/金融/SaaS 前端截图或 CodePen
- 用户会提供 OpenDesign 自制样例（待收到后补充分析）
- 确定最终设计风格
- 产出：在 `lawviz-design.md` 补充"前端设计标准"章节

### 任务 0-3：模板开发工作流设计（第 3-4 天）

见下方独立章节「模板开发人机协同工作流」。
产出：`docs/lawviz/template-dev-workflow.md`

---

## 模板开发人机协同工作流

> 目的：让每个新案件类型/细分案由的开发有可重复的流程，
> 开发者与 AI 高效协作完成从 0 到"可上线模板"的全过程。

### 触发条件
- 新增案件类型（如：劳动争议 -> 细分「竞业限制纠纷」）
- 现有模板准确性不达标，需要重构

### 工作流步骤

**Step 1：案由分析（开发者 + AI，约 30 分钟）**
```
开发者输入：案件类型名称 + 2-3 个真实案例描述
AI 输出：
  - 该案由涉及的关键法律关系（举证责任、时效、赔偿计算）
  - 律师在谈案阶段最需要掌握的 5-8 个核心事实
  - 常见幻觉风险点（AI 容易编造的内容）
```

**Step 2：字段设计（开发者主导，AI 审查）**
```
开发者起草：表单字段列表（key, label, type, required, placeholder）
AI 审查清单：
  - 每个必填字段是否都对应"律师一定知道的事实"？
  - 有没有让律师猜测或填写他们不掌握的信息？
  - 字段覆盖率：能否支撑后续 AI 生成正确可视化？
开发者修订 -> 最终字段列表确认
```

**Step 3：QA Prompt 撰写（AI 起草，开发者审查）**
```
AI 根据字段列表起草：
  - system_prompt（HTML 生成角色定义）
  - qa_system_prompt（追问轮次规则）
  - 追问示例对话（3-5 轮）
开发者检查：
  - 追问问题是否过多（目标 <= 5 轮）
  - 有没有 AI 自行生成事实（幻觉风险）
  - 追问逻辑是否符合真实谈案节奏
```

**Step 4：HTML 模板设计（AI 起草，开发者审查）**
```
AI 根据该案由特点，从 what-to-copy.md 中选定 HTML 模板
生成 3 个 HTML 变体（不同信息密度/侧重点）
开发者选定 1 个 -> 标注修改意见
AI 输出最终版 HTML 模板（含 Jinja2 变量占位符）
```

**Step 5：端到端测试（开发者操作）**
```
用真实（或仿真）案例数据走完全流程：
  填表 -> AI 追问 -> 生成 -> 查看 HTML
检查清单：
  [ ] 追问轮次 <= 5
  [ ] 生成耗时 <= 30 秒
  [ ] HTML 中没有 AI 编造的事实（对照输入数据核查）
  [ ] 北大法宝法条援引正确（如果该层级接入了法宝）
  [ ] 律师看了感觉"专业、可信"（主观判断）
```

**Step 6：配置文件产出**
```json
{
  "id": "labor_dispute_noncompete",
  "name": "竞业限制纠纷",
  "parent_type": "labor_dispute",
  "fields": [],
  "system_prompt": "...",
  "qa_system_prompt": "...",
  "html_template": "templates/labor_noncompete_v1.html",
  "min_tier": 1,
  "is_active": true
}
```
直接通过 `POST /api/admin/templates` 入库。

### 时间预估
- 首个模板（建立工作流期间）：2-3 小时
- 熟悉后每个新模板：45-90 分钟

---

## Sprint 1 · 项目初始化（第 5-7 天）

### 任务 1-1：目录脚手架
```
lawviz/
├── frontend/          # Next.js 14
├── backend/
│   ├── app/
│   │   ├── api/       # 路由
│   │   ├── agent/     # 从 what-to-copy.md 复制的 intake 骨架
│   │   ├── models/    # SQLAlchemy models
│   │   ├── services/  # 业务逻辑
│   │   └── config.py
│   └── main.py
├── templates/         # HTML 模板文件（含 Jinja2 占位符）
├── docs/lawviz/       # 设计文档、工作流文档
└── deploy/            # nginx.conf, docker-compose.yml
```

### 任务 1-2：本地开发环境
- Python 3.11 + FastAPI + uvicorn
- Node.js 20 + Next.js 14
- PostgreSQL（本地 Docker）
- `.env` 文件（参考 lawviz-design.md 的 .env 示例）
- 验证：`curl http://localhost:8000/health` 返回 `{"status":"ok"}`

### 任务 1-3：数据库初始化
- 执行 `lawviz-design.md` 中的 SQL schema（4 张表）
- 写入 5 个初始模板数据（参考设计文档中的模板定义）
- 验证：`SELECT COUNT(*) FROM templates;` 返回 5

---

## Sprint 2 · 用户系统 + 积分（第 8-11 天）

### 任务 2-1：认证 API
- `POST /api/auth/register`（手机号 + 密码）
- `POST /api/auth/login` -> 返回 JWT token
- `GET /api/auth/me` -> 需要 Authorization header
- 密码用 bcrypt hash，JWT 有效期 7 天

### 任务 2-2：积分 API
- `GET /api/credits/balance`
- `GET /api/credits/packs`（返回 starter/standard/pro 三档）
- `POST /api/credits/purchase`（创建虎皮椒订单，返回支付 URL）
- `POST /api/webhooks/hupijiao`（接收支付回调，更新积分）

### 任务 2-3：虎皮椒集成
- 注册虎皮椒账号，获取 AppID + AppSecret
- 实现签名验证逻辑（HMAC-SHA256）
- 本地用 ngrok 测试回调
- 测试流程：购买 starter 包 -> 支付完成 -> 积分增加 5

### 任务 2-4：前端认证页面
- `/auth/login`：手机号 + 密码表单
- `/auth/register`：手机号 + 密码 + 确认密码
- 登录成功后跳转 `/dashboard`
- Token 存 localStorage，axios 拦截器自动附加

---

## Sprint 3 · Agent 系统 + 模板（第 12-17 天）

### 任务 3-1：从 what-to-copy.md 复制 intake 骨架
- 按 Sprint 0 产出的指引复制/裁剪代码
- 适配到 FastAPI 项目结构
- 核心接口：`intake.run(template, user_inputs) -> qa_history`

### 任务 3-2：Generation Pipeline
参考 `lawviz-design.md` 中的伪代码实现：
```python
async def run_generation(gen_id, template, input_data, tier):
    # 1. 扣积分（先扣，失败后退款）
    # 2. QA 追问轮次（<= 5 轮）
    # 3. 调用北大法宝 MCP（tier >= 2）
    # 4. 生成 HTML（调用 New API -> 模型）
    # 5. 上传 OSS
    # 6. 更新 generations 表
```

### 任务 3-3：Generation API
- `POST /api/generate/start`
- `POST /api/generate/{gen_id}/qa`
- `POST /api/generate/{gen_id}/submit`
- `GET /api/generate/{gen_id}/status`
- `GET /api/generate/history`

### 任务 3-4：北大法宝 MCP 集成（tier >= 2）
- 配置 MCP 服务器连接（HTTP-based）
- 封装 `pkulaw.search(query, case_type) -> [法条引用]`
- 将法条引用注入 generation prompt
- 测试：合同纠纷搜索"违约金调整"，验证返回结果

### 任务 3-5：New API 集成
- 配置 `NEW_API_BASE_URL` + `NEW_API_KEY`
- 封装 `llm.call(model, messages) -> str`
- 模型路由：tier 1/2 -> `gpt-5.5`，tier 3 -> `claude-opus-4-8`
- 测试：调用两个模型各生成一次，验证响应

### 任务 3-6：Aliyun OSS 集成
- 配置 OSS bucket（公读私写）
- 封装 `oss.upload(key, html_content) -> public_url`
- 测试：上传 HTML，通过公开 URL 可访问

### 任务 3-7：用模板开发工作流完成 5 个模板
对 5 个案件类型各走一遍「模板开发人机协同工作流」：
1. 合同纠纷
2. 劳动争议
3. 婚姻家事
4. 交通事故
5. 刑事辩护

每个产出：字段配置 JSON + system_prompt + HTML 模板文件

---

## Sprint 4 · 前端（第 18-23 天）

> 执行此 Sprint 前，必须先阅读 `lawviz-design.md` 中的"前端设计标准"章节。
> 前端设计标准在用户确认样例后补充，未确认前不得开始 Sprint 4。

### 任务 4-1：Landing Page（`/`）
- Hero：产品价值主张 + CTA
- 功能介绍：三步流程（填写 -> AI 生成 -> 分享）
- 案件类型预览（5 个模板卡片）
- 价格区间展示

### 任务 4-2：Dashboard（`/dashboard`，需登录）
- 积分余额显示
- 最近 5 次生成历史
- 快速进入模板选择

### 任务 4-3：模板选择（`/generate`）
- 5 个模板卡片（名称、说明、积分消耗、层级标识）

### 任务 4-4：生成流程（`/generate/[templateId]`）
三个阶段：
1. **表单阶段**：渲染结构化字段，验证必填项
2. **AI 追问阶段**：展示 QA 对话，用户逐条回答
3. **生成中**：进度提示，轮询 `/status`

### 任务 4-5：结果页（`/result/[genId]`）
- iframe 嵌入生成的 HTML
- 「复制分享链接」按钮
- 「下载 HTML」按钮

### 任务 4-6：分享页（`/share/[token]`，无需登录）
- 展示可视化 HTML
- 水印 + 简单 CTA

### 任务 4-7：积分充值（`/credits`，需登录）
- 三个积分包选择
- 点击「购买」-> 跳转支付页

---

## Sprint 5 · 部署（第 24-26 天）

### 任务 5-1：阿里云 ECS 配置
- 实例规格：2 vCPU 4GB
- 安装：Nginx、Python 3.11、Node.js 20、PM2

### 任务 5-2：RDS PostgreSQL
- 创建实例，创建 database `lawviz_prod`
- 执行生产环境 schema 初始化

### 任务 5-3：Nginx 配置
- `api.lawviz.cn` -> FastAPI（8000 端口）
- `app.lawviz.cn` -> Next.js（3000 端口）
- HTTPS（Let's Encrypt）

### 任务 5-4：手动部署脚本
```bash
git pull origin main
cd backend && pip install -r requirements.txt && pm2 restart lawviz-api
cd frontend && npm install && npm run build && pm2 restart lawviz-web
```

### 任务 5-5：生产环境验收
```
[ ] https://app.lawviz.cn 可访问
[ ] 注册 -> 登录 -> 生成一次（合同纠纷）全流程跑通
[ ] 积分购买流程跑通（测试订单）
[ ] 生成的 HTML 公开 URL 可访问
[ ] 分享链接无登录可访问
[ ] 北大法宝调用正常（tier 2 测试）
```

---

## 里程碑汇总

| 里程碑 | 完成标志 | 预计时间 |
|--------|---------|---------|
| M0: Recon 完成 | `what-to-copy.md` 产出 | 第 4 天 |
| M1: 本地跑通 | health check + 数据库初始化 | 第 7 天 |
| M2: 支付跑通 | 完整充值 -> 积分到账 | 第 11 天 |
| M3: 生成跑通 | 合同纠纷端到端生成 HTML | 第 17 天 |
| M4: 前端完成 | 6 个页面可用 | 第 23 天 |
| M5: 上线 | 生产环境验收全部通过 | 第 26 天 |

---

## 风险与应对

| 风险 | 概率 | 应对 |
|------|------|------|
| 北大法宝 API 文档不清晰 | 中 | Sprint 0 时先测通一个接口，确认可用再接入 |
| 虎皮椒回调测试困难 | 中 | 本地用 ngrok 暴露，或先上阿里云测 |
| HTML 生成质量不稳定 | 高 | 每个模板走完整工作流，>=3 次测试后才上线 |
| OpenDesign 等项目许可证限制 | 低 | 优先选 MIT/Apache，Recon 时检查 LICENSE |
| New API 中转不稳定 | 低 | 配置 retry 逻辑，失败时退款积分 |
