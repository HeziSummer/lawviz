import Link from "next/link";
import { ArrowRight, BarChart3, FileText, History, Plus, WalletCards } from "lucide-react";

const history = [
  { id: "gen_contract_001", type: "合同纠纷", status: "done", time: "2026-05-31 21:40", model: "GPT" },
  { id: "gen_labor_014", type: "劳动争议", status: "plan", time: "2026-05-31 20:18", model: "Claude" },
  { id: "gen_family_006", type: "婚姻家事", status: "qa", time: "2026-05-30 17:02", model: "GPT" },
];

export default function DashboardPage() {
  return (
    <main>
      <Topbar />
      <section className="lv-container py-10">
        <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <p className="lv-kicker">Dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-fg">私有验证仪表盘</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              这里承载内部额度、生成历史和真实工作流入口。公开商业化、公开支付和正式价格仍保持关闭。
            </p>
          </div>
          <Link href="/generate" className="lv-btn-coral">
            <Plus size={16} strokeWidth={1.5} /> 新建可视化
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Panel icon={<WalletCards size={18} strokeWidth={1.5} />} label="本月内部额度" value="128 credits" detail="由管理员手动发放和调整" />
          <Panel icon={<FileText size={18} strokeWidth={1.5} />} label="本月生成" value="12 份" detail="包含草稿、追问、已完成状态" />
          <Panel icon={<BarChart3 size={18} strokeWidth={1.5} />} label="成本记录" value="已预留" detail="token、模型和导出成本将入库" />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="lv-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-fg">最近生成历史</h2>
                <p className="mt-1 text-sm text-muted">Sprint 1 使用静态数据表达后端契约，后续接 `/api/generate/history`。</p>
              </div>
              <History className="text-muted" size={18} strokeWidth={1.5} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-surface-2 text-xs text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">案由</th>
                    <th className="px-5 py-3 font-medium">模型</th>
                    <th className="px-5 py-3 font-medium">状态</th>
                    <th className="px-5 py-3 font-medium">时间</th>
                    <th className="px-5 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="px-5 py-4 font-medium text-fg">{item.type}</td>
                      <td className="px-5 py-4 text-muted">{item.model}</td>
                      <td className="px-5 py-4">
                        <span className="lv-status">{statusLabel(item.status)}</span>
                      </td>
                      <td className="px-5 py-4 text-muted">{item.time}</td>
                      <td className="px-5 py-4">
                        <Link href={`/generate/result/${item.id}`} className="font-semibold text-accent">
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="lv-card p-5">
            <h2 className="text-lg font-semibold text-fg">当前边界</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-muted">
              <p>分享链接仅在登录或有效访问控制后查看，不暴露 OSS 公开对象地址。</p>
              <p>导出入口预留 PDF/PNG/HTML，文件流由后端鉴权接口提供。</p>
              <p>额度是内部验证数据，不展示最终套餐价格。</p>
            </div>
            <Link href="/share/private-preview-token" className="lv-btn-ghost mt-6 w-full">
              查看分享边界 <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Topbar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="lv-container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">律析</span>
          <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted">
          <Link href="/dashboard" className="font-semibold text-accent">
            仪表盘
          </Link>
          <Link href="/generate" className="hover:text-accent">
            生成
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Panel({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="lv-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">{icon}</div>
        <p className="text-sm font-medium text-muted">{label}</p>
      </div>
      <p className="mt-5 text-3xl font-semibold text-fg">{value}</p>
      <p className="mt-2 text-sm text-muted">{detail}</p>
    </div>
  );
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    done: "已完成",
    plan: "待确认方案",
    qa: "追问中",
  };
  return labels[status] ?? status;
}
