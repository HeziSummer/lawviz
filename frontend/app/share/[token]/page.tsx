import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function SharePage({ params }: { params: { token: string } }) {
  return (
    <main>
      <header className="border-b border-border bg-surface">
        <div className="lv-container flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-accent">律析</span>
            <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
          </Link>
          <span className="lv-status">private share</span>
        </div>
      </header>

      <section className="lv-container grid min-h-[calc(100vh-73px)] items-center gap-8 py-10 lg:grid-cols-[1fr_420px]">
        <div>
          <p className="lv-kicker">Share Access Boundary</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl font-bold leading-tight text-fg">分享页需要登录或有效访问控制</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            灰测期不会开放公网无鉴权报告。token 只作为受控访问凭证的一部分，真实报告 HTML 仍应通过后端 render/share 代理校验后返回。
          </p>
          <div className="mt-8 rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-fg">当前 token</p>
            <code className="mt-3 block rounded-md border border-border-cool bg-surface-2 p-3 text-sm text-accent">{params.token}</code>
          </div>
        </div>

        <aside className="lv-card p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
            <LockKeyhole size={22} strokeWidth={1.5} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-fg">访问受限</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            请先登录内部账号。登录成功后，系统应校验 `share_token`、报告归属或授权关系，再展示 sandbox 预览。
          </p>
          <div className="mt-6 grid gap-3">
            <Link href="/auth/login" className="lv-btn-coral">
              <ShieldCheck size={16} strokeWidth={1.5} /> 登录后查看
            </Link>
            <Link href="/dashboard" className="lv-btn-ghost">
              返回仪表盘
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
