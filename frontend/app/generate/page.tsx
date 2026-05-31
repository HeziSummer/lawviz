import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileText, Send, SlidersHorizontal } from "lucide-react";

const caseTypes = ["合同纠纷", "劳动争议", "婚姻家事", "交通事故", "刑事辩护"];
const questions = ["争议金额或主要诉求是什么？", "目前有哪些证据材料？", "是否需要引用法宝检索结果？"];

export default function GeneratePage() {
  return (
    <main>
      <Topbar />
      <section className="lv-container grid gap-6 py-8 lg:grid-cols-[320px_1fr_360px]">
        <aside className="space-y-4">
          <div className="lv-card p-5">
            <p className="lv-kicker">Case Type</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-fg">新建案件可视化</h1>
            <p className="mt-3 text-sm leading-6 text-muted">先选案由，再输入第一段案情；未选择案由时不应启动生成。</p>
            <select className="lv-input mt-5" defaultValue="合同纠纷">
              {caseTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="lv-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <SlidersHorizontal size={16} strokeWidth={1.5} /> 模型与工具
            </div>
            <div className="mt-4 grid gap-3">
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                GPT
                <input type="radio" name="model" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                Claude
                <input type="radio" name="model" />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                法宝检索
                <input type="checkbox" />
              </label>
            </div>
          </div>
        </aside>

        <section className="lv-card flex min-h-[720px] flex-col overflow-hidden">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg">对话追问</h2>
                <p className="mt-1 text-sm text-muted">最多 5 轮结构化追问，模型切换后保留上下文。</p>
              </div>
              <span className="lv-status">qa round 2 / 5</span>
            </div>
          </div>
          <div className="flex-1 space-y-5 bg-surface-2 p-5">
            <Message from="user" text="买卖合同已经履行大半，对方拖欠尾款并拒绝对账，希望生成一份客户沟通用的可视化报告。" />
            <Message from="assistant" text="已识别为合同纠纷。请补充合同类型、争议金额、付款节点和现有证据。" />
            <div className="rounded-lg border border-accent-mid bg-accent-light p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Bot size={16} strokeWidth={1.5} /> 结构化追问
              </div>
              <div className="mt-4 grid gap-3">
                {questions.map((item) => (
                  <label key={item} className="block text-sm font-medium text-fg">
                    {item}
                    <input className="lv-input mt-2" placeholder="可精确填写，也可写不确定" />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border bg-surface p-4">
            <div className="flex gap-3">
              <textarea className="lv-input min-h-[76px] flex-1 resize-none" placeholder="继续补充案情、证据或修改方向" />
              <button className="lv-btn-coral self-end">
                <Send size={16} strokeWidth={1.5} /> 发送
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="lv-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <FileText size={16} strokeWidth={1.5} /> 方案确认
            </div>
            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4 text-sm leading-7 text-muted">
              <p className="font-semibold text-fg">拟生成报告结构</p>
              <p>1. 争议焦点：尾款支付义务与对账争议。</p>
              <p>2. 时间线：合同签署、交付、付款、催收节点。</p>
              <p>3. 证据清单：合同、送货单、聊天记录、发票。</p>
              <p>4. 律师沟通建议：以客户展示为目标，不替代法律意见。</p>
            </div>
            <div className="mt-4 grid gap-3">
              <Link href="/generate/result/gen_contract_001" className="lv-btn-coral w-full">
                <CheckCircle2 size={16} strokeWidth={1.5} /> 确认并生成报告
              </Link>
              <button className="lv-btn-ghost w-full">继续修改方案</button>
            </div>
          </div>
          <div className="lv-card p-5 text-sm leading-6 text-muted">
            <p className="font-semibold text-fg">生成前提示</p>
            <p className="mt-3">确认后进入 JSON Schema 校验、模板渲染、HTML 预览和 PDF/PNG 导出流程。失败重试和额度处理由后端执行。</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Topbar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="lv-container flex h-[72px] items-center justify-between">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">律析</span>
          <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
        </Link>
        <Link href="/dashboard" className="text-sm font-semibold text-accent">
          返回仪表盘
        </Link>
      </div>
    </header>
  );
}

function Message({ from, text }: { from: "user" | "assistant"; text: string }) {
  const isUser = from === "user";
  return (
    <div className={`max-w-[82%] rounded-lg border p-4 text-sm leading-7 ${isUser ? "ml-auto border-accent-mid bg-accent-light" : "border-border-cool bg-surface"}`}>
      <p className="mb-1 text-xs font-semibold text-muted">{isUser ? "律师输入" : "LawViz Agent"}</p>
      <p className="text-fg">{text}</p>
    </div>
  );
}
