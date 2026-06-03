"use client";

import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { api, type CreditBalance as CreditBalanceValue } from "../lib/api";
import { formatCredits } from "../lib/utils";

export default function CreditBalance() {
  const [balance, setBalance] = useState<CreditBalanceValue | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    api
      .creditBalance()
      .then((result) => {
        if (mounted) setBalance(result);
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const value = balance?.available_balance ?? balance?.balance ?? 0;

  return (
    <div className="lv-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent">
          <WalletCards size={18} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-muted">Internal credits</p>
      </div>
      <p className="mt-5 text-3xl font-semibold text-fg">{error ? "Unavailable" : formatCredits(value)}</p>
      <p className="mt-2 text-sm text-muted">Managed manually by administrators.</p>
    </div>
  );
}
