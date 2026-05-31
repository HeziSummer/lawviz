import Link from "next/link";
import { ArrowRight, FileText, History, WalletCards } from "lucide-react";

const workflow = [
  "选择案由并输入初始案情",
  "AI 结构化追问，律师补充关键事实",
  "确认方案后生成 HTML 报告并导出 PDF/PNG",
];

const cases = ["合同纠纷", "劳动争议", "婚姻家事", "交通事故", "刑事辩护"];

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="lv-container grid min-h-[calc(100vh-73px)] items-center gap-10 py-12 lg:grid-cols-[1fr_460px]">
        <div>
          <p className="lv-kicker">Private MVP Workbench</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-tight text-fg md:text-6xl">
            律析 LawViz 私有案件可视化工作台
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            面向律师的内部验证版：从案情对话到方案确认，再到报告预览和导出。当前阶段只开放受控访问、内部额度和真实生成流程入口。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/login" className="lv-btn-coral">
              进入私有工作台 <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/dashboard" className="lv-btn-ghost">
              查看仪表盘
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {workflow.map((item, index) => (
              <div key={item} className="border-t border-border pt-4">
                <span className="text-xs font-semibold text-accent">0{index + 1}</span>
                <p className="mt-2 text-sm leading-6 text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="lv-card shadow-soft">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-fg">今日工作队列</p>
                <p className="mt-1 text-xs text-muted">私有验证环境 · 登录后可操作</p>
              </div>
              <span className="lv-status">Access gated</span>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <Metric icon={<WalletCards size={17} strokeWidth={1.5} />} label="内部额度" value="128 credits" />
            <Metric icon={<History size={17} strokeWidth={1.5} />} label="最近生成" value="10 条记录入口" />
            <Metric icon={<FileText size={17} strokeWidth={1.5} />} label="导出格式" value="HTML / PDF / PNG" />
            <div className="rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-xs font-semibold text-accent">已启用案由</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {cases.map((item) => (
                  <span key={item} className="rounded-full border border-accent-mid bg-accent-light px-3 py-1 text-xs text-accent">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="lv-container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">律析</span>
          <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted">
          <Link href="/auth/login" className="hover:text-accent">
            登录
          </Link>
          <Link href="/auth/register" className="lv-btn-coral px-5 py-2 text-[13px]">
            申请访问
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light text-accent">{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-sm font-semibold text-fg">{value}</p>
      </div>
    </div>
  );
}
