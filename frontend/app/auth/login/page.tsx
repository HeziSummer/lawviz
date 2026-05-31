import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="lv-container grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1fr_420px]">
      <section>
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">律析</span>
          <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
        </Link>
        <p className="lv-kicker mt-14">Access Control</p>
        <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-tight text-fg">登录后进入私有生成流程</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">
          当前版本不开放公开注册、公开分享或 public checkout。账号用于内部额度、历史记录、报告渲染和导出权限校验。
        </p>
      </section>

      <section className="lv-card p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
            <LockKeyhole size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">私有 MVP 登录</h2>
            <p className="text-sm text-muted">Sprint 1 前端基础表单</p>
          </div>
        </div>
        <form className="space-y-4">
          <label className="block text-sm font-medium text-fg">
            手机号或邮箱
            <input className="lv-input mt-2" placeholder="lawyer@example.com" />
          </label>
          <label className="block text-sm font-medium text-fg">
            密码
            <input className="lv-input mt-2" type="password" placeholder="输入访问密码" />
          </label>
          <Link href="/dashboard" className="lv-btn-coral w-full">
            登录并进入仪表盘 <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </form>
        <p className="mt-5 text-sm text-muted">
          还没有内部访问账号？{" "}
          <Link href="/auth/register" className="font-semibold text-accent">
            提交访问申请
          </Link>
        </p>
      </section>
    </main>
  );
}
