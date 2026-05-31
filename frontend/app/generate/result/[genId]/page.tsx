import Link from "next/link";
import { Download, FileCode2, FileImage, FileText, RefreshCcw, ShieldCheck } from "lucide-react";

export default function ResultPage({ params }: { params: { genId: string } }) {
  return (
    <main>
      <header className="border-b border-border bg-surface">
        <div className="lv-container flex h-[72px] items-center justify-between">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-accent">律析</span>
            <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>genId: {params.genId}</span>
            <Link href="/generate" className="font-semibold text-accent">
              重新进入生成
            </Link>
          </div>
        </div>
      </header>

      <section className="lv-container grid gap-6 py-8 lg:grid-cols-[1fr_340px]">
        <article className="lv-card min-h-[760px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface p-5">
            <div>
              <p className="lv-kicker">HTML Preview</p>
              <h1 className="mt-2 text-xl font-semibold text-fg">合同尾款争议可视化报告</h1>
            </div>
            <span className="lv-status">sandbox preview</span>
          </div>
          <div className="bg-surface p-8">
            <div className="mx-auto max-w-3xl rounded-lg border border-border bg-bg p-8">
              <p className="lv-kicker">案件摘要</p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-fg">尾款支付与对账争议</h2>
              <p className="mt-5 text-sm leading-7 text-muted">
                本预览用于表达 Sprint 1 报告渲染容器和可编辑文本边界。真实内容应来自后端 JSON Schema 校验后的模板渲染结果。
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {["合同签署", "部分交付", "催收尾款"].map((item, index) => (
                  <div key={item} className="rounded-lg border border-border bg-surface p-4">
                    <span className="text-xs font-semibold text-accent">0{index + 1}</span>
                    <p className="mt-3 text-sm font-semibold text-fg">{item}</p>
                    <p className="mt-2 text-xs leading-5 text-muted">点击 editable 文本区域后，后续由 PATCH 接口保存。</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="text-base font-semibold text-fg">律师建议</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  先固定交付事实、付款节点和催收记录，再决定是否进入诉前函或诉讼准备。报告可导出为 PDF/PNG 用于客户沟通。
                </p>
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="lv-card p-5">
            <h2 className="text-lg font-semibold text-fg">导出与访问</h2>
            <p className="mt-2 text-sm leading-6 text-muted">导出接口需带用户鉴权。分享链接仅创建受控 token，不代表公开分享。</p>
            <div className="mt-5 grid gap-3">
              <Action icon={<FileText size={16} strokeWidth={1.5} />} label="下载 PDF" primary />
              <Action icon={<FileImage size={16} strokeWidth={1.5} />} label="下载 PNG" />
              <Action icon={<FileCode2 size={16} strokeWidth={1.5} />} label="下载 HTML" />
              <Link href="/share/private-preview-token" className="lv-btn-ghost w-full">
                <ShieldCheck size={16} strokeWidth={1.5} /> 打开受控分享页
              </Link>
              <button className="lv-btn-ghost w-full">
                <RefreshCcw size={16} strokeWidth={1.5} /> 重新生成
              </button>
            </div>
          </div>

          <div className="lv-card p-5">
            <h2 className="text-lg font-semibold text-fg">生成记录</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="模型" value="GPT · 可切换记录入库" />
              <Row label="状态" value="done" />
              <Row label="额度消耗" value="按内部 credits 记录" />
              <Row label="法宝引用" value="预留折叠清单" />
            </dl>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Action({ icon, label, primary = false }: { icon: React.ReactNode; label: string; primary?: boolean }) {
  return (
    <button className={`${primary ? "lv-btn-coral" : "lv-btn-ghost"} w-full`}>
      {icon}
      {label}
      <Download size={15} strokeWidth={1.5} />
    </button>
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
