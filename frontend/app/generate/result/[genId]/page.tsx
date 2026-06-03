"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, FileText, RefreshCcw } from "lucide-react";
import AuthGuard from "../../../../components/AuthGuard";
import { api, type Generation } from "../../../../lib/api";

const REPORT_STYLES = [
  { key: "classic", label: "Classic" },
  { key: "minimal", label: "Minimal" },
];

export default function ResultPage() {
  return (
    <AuthGuard>
      {() => <ResultContent />}
    </AuthGuard>
  );
}

function ResultContent() {
  const params = useParams<{ genId: string }>();
  const genId = params.genId;
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [styleKey, setStyleKey] = useState("classic");
  const [html, setHtml] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const current = await api.generationStatus(genId);
      setGeneration(current);
      if (current.status !== "done") setHtml(null);
    } catch {
      setMessage("无法读取生成任务状态。");
    } finally {
      setLoading(false);
    }
  }, [genId]);

  const loadHtml = useCallback(async () => {
    if (!generation || generation.status !== "done") return;
    try {
      setHtml(await api.renderGeneration(genId, styleKey));
    } catch {
      setMessage("报告 HTML 预览读取失败。");
    }
  }, [generation, genId, styleKey]);

  async function confirm() {
    setConfirming(true);
    setMessage(null);
    try {
      const current = await api.confirmGeneration(genId);
      setGeneration(current);
    } catch {
      setMessage("确认生成失败，请检查积分余额或稍后重试。");
    } finally {
      setConfirming(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void loadHtml();
  }, [loadHtml]);

  return (
    <main>
      <header className="border-b border-border bg-surface">
        <div className="lv-container flex h-[72px] items-center justify-between">
          <Link href="/generate" className="flex items-center gap-2 text-sm font-semibold text-accent">
            <ArrowLeft size={16} strokeWidth={1.5} /> 返回生成页
          </Link>
          <div className="flex items-center gap-3">
            <select className="lv-input w-[132px] py-2 text-sm" value={styleKey} onChange={(event) => setStyleKey(event.target.value)}>
              {REPORT_STYLES.map((style) => (
                <option key={style.key} value={style.key}>
                  {style.label}
                </option>
              ))}
            </select>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-accent" type="button" onClick={loadStatus}>
              <RefreshCcw size={15} strokeWidth={1.5} /> 刷新
            </button>
          </div>
        </div>
      </header>

      <section className="lv-container grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <article className="lv-card min-h-[720px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface p-5">
            <div>
              <p className="lv-kicker">HTML Preview</p>
              <h1 className="mt-2 text-xl font-semibold text-fg">报告预览</h1>
            </div>
            <span className="lv-status">{loading ? "loading" : generation?.status ?? "unknown"}</span>
          </div>
          <div className="bg-surface p-6">
            {message ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
            {generation?.status === "done" && html ? (
              <iframe className="h-[760px] w-full rounded-lg border border-border bg-white" sandbox="" srcDoc={html} title="LawViz report preview" />
            ) : (
              <div className="rounded-lg border border-border bg-bg p-6">
                <pre className="whitespace-pre-wrap text-sm leading-7 text-fg">
                  {generation?.plan_text ?? (loading ? "正在读取方案..." : "暂无方案内容。")}
                </pre>
              </div>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="lv-card p-5">
            <h2 className="text-lg font-semibold text-fg">生成操作</h2>
            <p className="mt-2 text-sm leading-6 text-muted">确认生成会扣减预计积分；完成后左侧以 sandbox iframe 预览后端渲染的 HTML 报告。</p>
            <div className="mt-5 grid gap-3">
              <button className="lv-btn-coral w-full" type="button" onClick={confirm} disabled={confirming || generation?.status === "done"}>
                <CheckCircle2 size={16} strokeWidth={1.5} /> {generation?.status === "done" ? "已生成" : confirming ? "生成中..." : "确认生成"}
              </button>
              <button className="lv-btn-ghost w-full" type="button" disabled={generation?.status !== "done"}>
                <Download size={16} strokeWidth={1.5} /> 导出占位
              </button>
            </div>
          </div>

          <div className="lv-card p-5">
            <h2 className="text-lg font-semibold text-fg">任务记录</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="任务 ID" value={genId} />
              <Row label="案件类型" value={generation?.case_type ?? "-"} />
              <Row label="模型" value={generation?.model_used ?? "-"} />
              <Row label="积分消耗" value={generation ? `${generation.credits_cost} credits` : "-"} />
              <Row label="法宝检索" value={generation?.use_pkulaw ? "启用" : "未启用"} />
            </dl>
          </div>

          <Link href="/dashboard" className="lv-btn-ghost w-full">
            <FileText size={16} strokeWidth={1.5} /> 回到仪表盘
          </Link>
        </aside>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-fg">{value}</dd>
    </div>
  );
}
