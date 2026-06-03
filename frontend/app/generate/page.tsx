"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, FileText, Send, SlidersHorizontal } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import { api, CASE_TYPE_LABELS, type CaseType } from "../../lib/api";

const CASE_TYPES = Object.entries(CASE_TYPE_LABELS) as Array<[CaseType, string]>;

export default function GeneratePage() {
  return (
    <AuthGuard>
      {() => <GenerateContent />}
    </AuthGuard>
  );
}

function GenerateContent() {
  const router = useRouter();
  const [caseType, setCaseType] = useState<CaseType>("contract_dispute");
  const [modelUsed, setModelUsed] = useState("gpt");
  const [usePkulaw, setUsePkulaw] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const estimatedCredits = (modelUsed === "claude" ? 2 : 1) + (usePkulaw ? 1 : 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);
    try {
      const generation = await api.startGeneration({
        case_type: caseType,
        initial_message: initialMessage,
        model_used: modelUsed,
        use_pkulaw: usePkulaw,
      });
      router.push(`/generate/result/${generation.id}`);
    } catch {
      setMessage("创建生成任务失败，请确认账号已激活且后端服务可用。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <header className="border-b border-border bg-surface">
        <div className="lv-container flex h-[72px] items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-accent">
            <ArrowLeft size={16} strokeWidth={1.5} /> 返回仪表盘
          </Link>
          <span className="text-sm text-muted">预计消耗 {estimatedCredits} credits</span>
        </div>
      </header>

      <section className="lv-container grid gap-6 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <div className="lv-card p-5">
            <p className="lv-kicker">Case Type</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-fg">新建可视化报告</h1>
            <p className="mt-3 text-sm leading-6 text-muted">先选择案件类型和模型，再输入第一段案情。确认方案后才会扣减积分。</p>
            <label className="mt-5 block text-sm font-medium text-fg">
              案件类型
              <select className="lv-input mt-2" value={caseType} onChange={(event) => setCaseType(event.target.value as CaseType)}>
                {CASE_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="lv-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-fg">
              <SlidersHorizontal size={16} strokeWidth={1.5} /> 模型与工具
            </div>
            <div className="mt-4 grid gap-3">
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                GPT
                <input type="radio" name="model" checked={modelUsed === "gpt"} onChange={() => setModelUsed("gpt")} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                Claude
                <input type="radio" name="model" checked={modelUsed === "claude"} onChange={() => setModelUsed("claude")} />
              </label>
              <label className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                法宝检索
                <input type="checkbox" checked={usePkulaw} onChange={(event) => setUsePkulaw(event.target.checked)} />
              </label>
            </div>
          </div>
        </aside>

        <form className="lv-card flex min-h-[620px] flex-col overflow-hidden" onSubmit={submit}>
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg">案情输入</h2>
                <p className="mt-1 text-sm text-muted">输入案件背景、争议焦点、证据材料或希望报告回答的问题。</p>
              </div>
              <Bot className="text-accent" size={20} strokeWidth={1.5} />
            </div>
          </div>

          <div className="flex-1 bg-surface-2 p-5">
            <label className="block text-sm font-medium text-fg">
              第一段案情
              <textarea
                className="lv-input mt-2 min-h-[300px] resize-none bg-surface"
                placeholder="例如：买卖合同已履行大半，对方拖欠尾款并拒绝对账，希望生成一份面向客户沟通的可视化报告。"
                value={initialMessage}
                onChange={(event) => setInitialMessage(event.target.value)}
                required
              />
            </label>

            <div className="mt-5 rounded-lg border border-border bg-surface p-4 text-sm leading-6 text-muted">
              <div className="mb-2 flex items-center gap-2 font-semibold text-fg">
                <FileText size={16} strokeWidth={1.5} /> 生成边界
              </div>
              <p>提交后先生成方案草稿；进入结果页确认生成时，后端会按内部 credits 账本扣减。失败退款逻辑已在后端预留。</p>
            </div>

            {message ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-surface p-4">
            <span className="text-sm text-muted">当前预计：{estimatedCredits} credits</span>
            <button className="lv-btn-coral" type="submit" disabled={submitting || !initialMessage.trim()}>
              {submitting ? "创建中..." : "生成方案"} <Send size={16} strokeWidth={1.5} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
