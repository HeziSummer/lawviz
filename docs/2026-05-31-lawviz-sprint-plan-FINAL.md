# LawViz Sprint 规划（最终版）

**版本**：Final  
**日期**：2026-05-31  
**配套文档**：`2026-05-31-lawviz-design-v1.2-FINAL.md`

---

## 概览

- **总时间**：26 个工作日（灰测前）+ 灰测期（2 个月）
- **开发模式**：单人（或小团队），每 Sprint 4-8 天
- **核心原则**：能抄就抄 → 质量优于速度 → 灰测数据优先

---

## Sprint 0：GitHub Recon + 基础设施（第 1-4 天）

### 目标

产出：
- `docs/what-to-copy.md`（可复用代码骨架）
- 基础设施采购清单
- 成本看板原型设计

### 任务

**0-1：GitHub Recon（第 1-2 天）**
- 搜索 5-8 个开源 Agent 项目
- 评分：简洁性、稳定性、可抄程度、HTML 质量
- 产出：`what-to-copy.md`（明确 intake 骨架 + prompt 来源）

**0-2：基础设施清单（第 2-3 天）**
- 立即采购：域名 2 个、ECS 2C4G、RDS PostgreSQL、OSS、SSL
- 启动流程：ICP 备案（此刻开始，需 1-2 周）
- 注册虎皮椒账号（支付接入）

**0-3：成本看板原型（第 3-4 天）**
- 设计 SQL 查询脚本框架（见设计文档 §5.2）
- CSV 导出方案

### 交付物

- [ ] `what-to-copy.md` 已产出
- [ ] 基础设施采购开始
- [ ] ICP 备案已提交
- [ ] 成本看板 SQL 模板已准备

---

## Sprint 1：项目初始化 + 数据库（第 5-7 天）

### 目标

- 本地开发环境完整可用
- 数据库初始化，5 个模板写入
- `POST /api/health` 返回 200

### 任务

**1-1：项目脚手架（第 5 天）**
```bash
# 后端
mkdir -p lawviz/backend/{app/api,app/agent,app/models,app/schemas,app/services}

# 前端
npx create-next-app@14 lawviz/frontend --ts --tailwind --app
```

**1-2：本地环境（第 5-6 天）**
- Python 3.11 venv + pip install fastapi/sqlalchemy/psycopg2
- Node.js 20 + npm install
- PostgreSQL Docker（`docker run postgres:15`）

**1-3：数据库初始化（第 6-7 天）**
- 执行 SQL schema（4 张表：users, generations, transactions, templates）
- 写入 5 个初始模板（contract_dispute, labor_dispute, divorce_family, traffic_accident, criminal_defense）
- 验证：`SELECT COUNT(*) FROM templates;` → 5

### 交付物

- [ ] 后端启动：`uvicorn main:app --reload`
- [ ] 前端启动：`npm run dev`
- [ ] PostgreSQL 连接成功，schema 初始化完成
- [ ] `/api/health` 返回 200

---

## Sprint 2：认证 + 订阅 + 支付（第 8-11 天）

### 目标

- 用户注册/登录 ✓
- 订阅套餐 ✓
- 虎皮椒支付链路完整 ✓

### 任务

**2-1：认证 API（第 8 天）**
- `POST /api/auth/register` / `login` → JWT token
- `GET /api/auth/me` → 用户信息
- 前端：`/auth/login` + `/auth/register` 页面

**2-2：订阅管理 API（第 8-9 天）**
- `GET /api/subscriptions/plans` → 三档套餐
- `POST /api/subscriptions/subscribe` → 订单 + 支付 URL
- `POST /api/subscriptions/upgrade` → 补差价 + 积分补齐

**2-3：虎皮椒集成（第 9-11 天）**
- 注册虎皮椒，获取 PID + Secret
- 实现 HMAC-MD5 签名验证
- `POST /api/webhooks/hupijiao` → 积分到账
- 本地用 ngrok 测试回调

**2-4：前端（第 10-11 天）**
- `/dashboard`：积分余额 + 升级按钮
- `/credits`：三档套餐选择 + 购买

### 交付物

- [ ] 注册/登录完整，token 有效
- [ ] 订阅/充值链路可跑通
- [ ] 虎皮椒回调验证通过（测试订单 ✓ 积分到账 ✓）

---

## Sprint 3：Agent + 生成 Pipeline + 模板（第 12-19 天）

**分两阶段**：3a（Agent + Pipeline + 1 个模板）+ 3b（剩余 4 个模板）

### 3a：核心生成链路（第 12-17 天）

**3a-1：对话框 Agent 骨架（第 12 天）**
- 从 what-to-copy.md 复制 intake 骨架，适配对话式流程
- 核心函数：`handle_message(gen_id, content, model) → {type, content}`
  - type = "question"：下一轮结构化问题
  - type = "plan"：全部轮次结束，输出方案纯文本
- 模型切换：切换时把 conversation_history 全量注入新模型，继续对话

**3a-2：生成 Pipeline（第 12-14 天）**

```python
async def run_generation(gen_id):
    generation = get(gen_id)

    # Step 1：法宝检索（进阶版+）
    if generation.use_pkulaw:
        law_refs = await pkulaw.search(generation.case_type,
                                       generation.conversation_history)

    # Step 2：LLM 生成 JSON（基于完整对话历史 + 已确认方案）
    llm_output = await llm.call(
        model=generation.model_used,
        prompt=build_prompt(generation.case_type,
                            generation.conversation_history,
                            generation.plan_text, law_refs)
    )

    # Step 3：JSON Schema 严格校验（失败重试 3 次）
    validated = validate_schema(llm_output, case_type_schema(generation.case_type))

    # Step 4：Jinja2 填充 → HTML
    html = render_template(generation.case_type, validated)

    # Step 5：OSS 私读上传
    await oss.upload_private(f"generations/{gen_id}.html", html)

    # Step 6：扣积分
    await credits.deduct(generation.user_id, cost)

    generation.status = "done"
```

**3a-3：三个外部集成（第 13-15 天）**
- New API 调用（GPT + Claude，支持动态切换）
- 北大法宝 MCP（法条检索）
- Aliyun OSS（私读上传）

**3a-4：PDF / 图片导出（第 14-15 天）**

**这是核心产品功能**，律师用报告主要靠 PDF 打印、发邮件、插 Word。

```python
# GET /api/generate/{gen_id}/export?format=pdf|png
async def export(gen_id, format):
    html_content = await oss.get(gen_id)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html_content)
        if format == "pdf":
            result = await page.pdf(print_background=True)
        else:
            result = await page.screenshot(full_page=True, type="png")
    return StreamingResponse(result)
```

灰测低并发没问题（按需渲染，不预存）。

**3a-5：第一个完整模板 - 合同纠纷（第 15-17 天）**

产出 4 个文件：

1. **Agent 问题框架**
   - 必问项：合同类型、当事人、争议金额、关键事实、案件阶段
   - 自适应：提到"工程合同"追问是否完工；金额大追问有无担保
   - 问题形式：选择题 + 数字输入 + 自由文本

2. **LLM 输出 Schema**
   ```json
   {"争议焦点": ["str"], "时间轴": [{"date": "YYYY-MM-DD", "event": "str"}],
    "律师建议": "str", "风险提示": ["str"]}
   ```

3. **HTML 模板**：Jinja2，CSS 内联，侧重时间轴 + 争议焦点 + 律师建议

4. **LLM 指导文档**：方案格式规范 + HTML 生成规则 + 分析重点

**端到端测试**：
- 走完对话框全流程 → 确认方案 → 下载 PDF
- 检查：对话 ≤5 轮、生成 ≤30s、PDF 可打印、无 AI 编造

**API 端点**：
```
POST /api/generate/start            {case_type, model, use_pkulaw, initial_message}
POST /api/generate/{gen_id}/message {content, model?}
POST /api/generate/{gen_id}/confirm {}
GET  /api/generate/{gen_id}/status
GET  /api/generate/{gen_id}/export  ?format=pdf|png
GET  /api/render/{gen_id}           [权限校验]
```

### 3b：剩余 4 个模板（第 17-19 天）

使用 3a 工作流，快速复制：
- labor_dispute（劳动争议）
- divorce_family（婚姻家事）
- traffic_accident（交通事故）
- criminal_defense（刑事辩护）

**每个 1-1.5 天**（可并行化），5 个模板全部完成。

### 交付物

- [ ] 5 个模板全部可用
- [ ] 积分正确扣除 + 退款逻辑
- [ ] 北大法宝调用正常（进阶版测试）
- [ ] HTML 公开 URL 可访问（`/api/render/{gen_id}`）

---

## Sprint 4：前端 UI（第 20-23 天）

### 目标

6 个页面全部可用，完整用户流程。

### 任务

**4-1：落地页 + 认证（第 20 天）**
- `/`：Hero + 三步流程 + 模板预览 + 定价表
- `/auth/login` + `/auth/register`

**4-2：仪表盘 + 积分（第 20 天）**
- `/dashboard`：积分余额 + 升级 + 历史
- `/credits`：套餐选择 + 购买

**4-3：对话框页（第 20-22 天，核心页面）**

`/generate`：
- 底部输入区：案件类型下拉（必选）+ 消息框 + 发送按钮（类型未选时置灰）
- 顶部工具栏：当前模型标签 + "切换模型"按钮
- 模型介绍弹窗：GPT-5.5 / Claude Opus 4.8 客观介绍，漂亮卡片式设计
- Agent 发出的结构化问题以"内嵌表单"或"选择题"形式渲染在对话框里
- 方案文本以固定格式展示在对话框末尾，下方"确认生成" / "继续修改"
- 确认后 loading → 轮询 status → 跳结果页

**4-4：结果页（第 22 天）**

`/generate/result/[genId]`：
- 左 70%：HTML 渲染 + contenteditable 编辑（失焦自动保存）
- 右 30%：
  - **"下载 PDF"**（核心，首位）
  - **"下载图片"**（PNG）
  - "下载 HTML"
  - "复制分享链接"
  - "重新生成"
  - 积分消耗 + 剩余积分

**4-5：分享页 + 个人设置 + 首次引导（第 22-23 天）**
- `/share/[token]`：展示 HTML，灰测期需登录，律师名片印在右下角
- `/settings`：头像、姓名、律所、微信号、手机号、简介
- 首次登录引导：注册后强制弹出资料填写（可跳过，有提示）

### 关键点

- **设计规范**：遵守 `design-spec-b.html`
- **响应式**：1280px 优先
- **分享署名**：律师微信二维码自动印在卡角，驱动主动分享

### 交付物

- [ ] 6 个页面完整可用
- [ ] 所有路由无 404
- [ ] 积分实时显示 + 更新
- [ ] 轮询 status 正常工作

---

## Sprint 5：部署 + 灰测发布（第 24-26 天）

### 目标

灰测版上线，所有链路在生产验证通过。

### 任务

**5-1：ECS 部署（第 24 天）**
- 安装：Python 3.11、Node.js、PM2
- 后端：`pm2 start "uvicorn main:app --host 0.0.0.0"`
- 前端：`npm run build` + `pm2 start`
- Nginx 反代（见设计文档 §2）

**5-2：环境变量（第 24 天）**
- DATABASE_URL、NEW_API_KEY、OSS 配置、HUPIJIAO 信息、JWT_SECRET

**5-3：生产验收（第 25-26 天）**
- [ ] https://yourdomain.com 可访问（HTTPS ✓）
- [ ] 完整流程验证（注册 → 登录 → 生成 → 分享）
- [ ] 虎皮椒支付验证（测试订单）
- [ ] 北大法宝正常（进阶版测试）
- [ ] HTML 公开 URL 可访问
- [ ] 成本数据正确记录
- [ ] ICP 备案已完成

**5-4：灰测准备（第 26 天）**
- [ ] 用户协议 + 隐私政策上线
- [ ] 反馈入口（邮件/微信）
- [ ] 成本看板 SQL 脚本准备好
- [ ] 邀请名单准备（50-100 人）

### 交付物

- [ ] 灰测版上线
- [ ] 所有核心链路验证通过
- [ ] 备份策略已启动

---

## Sprint 6：灰测数据 + 定价（灰测期间）

### 目标

收集 2 个月数据 → 反推定价 → 冻结费用表。

### 任务

**每周数据分析（每周 1 次，1 小时）**
- 运行成本看板 SQL，导出 CSV
- 统计：总生成数、平均 token、GPT/Claude 占比、法宝调用率
- 记录高成本 case

**灰测反馈收集（每周 1 次）**
- 从打分记录看高分/低分的共同点
- 直接问朋友：好用吗？有啥不满意？会转发吗？

**灰测结束定价（末期，1 天）**
- 汇总 60 天成本数据
- 按案件类型、订阅等级分类
- 反推定价：`基础费 = 平均成本 × 2-3 倍`
- 冻结费用表（v1.3 设计文档）

### 交付物

- [ ] 12 份周报
- [ ] 最终成本数据分析报告
- [ ] 冻结的费用表

---

## 关键里程碑

| 里程碑 | 完成标志 | 时间 |
|--------|---------|------|
| **M0** | what-to-copy.md + 基础设施清单 | 第 4 天 |
| **M1** | 本地环境 + 数据库初始化 | 第 7 天 |
| **M2** | 支付链路完整 + 虎皮椒回调验证 | 第 11 天 |
| **M3** | 合同纠纷模板完成 | 第 17 天 |
| **M3.5** | 5 个模板全部完成 | 第 19 天 |
| **M4** | 前端 6 页面完成 | 第 23 天 |
| **M5** | 灰测版上线 | 第 26 天 |
| **M6** | 灰测期结束，费用表冻结 | 灰测末期 |
| **M7** | 正式版上线 | 灰测末期 + 2 周 |

---

## 风险应对

| 风险 | 概率 | 应对 |
|------|------|------|
| 北大法宝接入困难 | 中 | Sprint 0 先申请 + 跑通 1 个接口 |
| html2canvas 截图差 | 中 | Sprint 0 实测，改用 Headless Chrome |
| 虎皮椒本地测试难 | 中 | 用 ngrok 或在云上临时测 |
| LLM JSON 失败率高 | 高 | 严格设计 Schema，重试 3 次 |
| ICP 备案延期 | 低 | Sprint 0 立即启动，不阻塞开发 |

---

**Sprint 规划定版。准备交付开发者。**
