import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="lv-container grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1fr_460px]">
      <section>
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold text-accent">律析</span>
          <span className="text-[11px] font-semibold uppercase text-muted">LawViz</span>
        </Link>
        <p className="lv-kicker mt-14">Private Access Request</p>
        <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold leading-tight text-fg">申请内部验证账号</h1>
        <p className="mt-6 max-w-xl text-base leading-8 text-muted">
          注册页只建立受控访问入口。内部额度由团队手动发放，公开付费、套餐价格和正式商业规则均不在 Sprint 1 启用。
        </p>
      </section>

      <section className="lv-card p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
            <ShieldCheck size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-fg">访问申请</h2>
            <p className="text-sm text-muted">用于后续律师资料和报告名片</p>
          </div>
        </div>
        <form className="grid gap-4">
          <label className="block text-sm font-medium text-fg">
            姓名
            <input className="lv-input mt-2" placeholder="例如：陈律师" />
          </label>
          <label className="block text-sm font-medium text-fg">
            律所
            <input className="lv-input mt-2" placeholder="用于报告页名片信息" />
          </label>
          <label className="block text-sm font-medium text-fg">
            手机号或邮箱
            <input className="lv-input mt-2" placeholder="用于登录和访问控制" />
          </label>
          <label className="block text-sm font-medium text-fg">
            密码
            <input className="lv-input mt-2" type="password" placeholder="设置访问密码" />
          </label>
          <Link href="/dashboard" className="lv-btn-coral w-full">
            创建内部账号 <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </form>
        <p className="mt-5 text-sm text-muted">
          已有账号？{" "}
          <Link href="/auth/login" className="font-semibold text-accent">
            去登录
          </Link>
        </p>
      </section>
    </main>
  );
}
