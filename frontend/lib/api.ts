export type GenerationStatus = "draft" | "qa" | "plan" | "confirmed" | "generating" | "done" | "failed";

export type CaseType =
  | "contract_dispute"
  | "labor_dispute"
  | "divorce_family"
  | "traffic_accident"
  | "criminal_defense";

export type UserRole = "admin" | "lawyer" | string;
export type UserStatus = "pending" | "active" | "disabled" | string;

export type AuthUser = {
  id: string;
  email: string;
  phone: string;
  status: UserStatus;
  role: UserRole;
  is_active: boolean;
  is_verified?: boolean;
  credits?: number;
  subscription_tier?: string;
  lawyer_profile?: {
    full_name?: string;
    law_firm?: string;
  } | null;
  full_name?: string;
  law_firm?: string;
};

export type SmsSendPayload = {
  phone: string;
  purpose: "register" | "login" | string;
};

export type RegisterPayload = {
  phone: string;
  sms_code: string;
  email: string;
  password: string;
  full_name: string;
  law_firm: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export type CreditBalance = {
  balance: number;
  available_balance: number;
  frozen_balance: number;
};

export type CreditLedgerEntry = {
  id: string;
  user_id: string;
  amount: number;
  balance_after?: number;
  type?: string;
  reason?: string | null;
  created_at?: string;
};

export type AdminCreditPayload = {
  user_id: string;
  amount: number;
  reason?: string;
  idempotency_key?: string;
};

export type StartGenerationPayload = {
  case_type: CaseType | string;
  initial_message: string;
  model_used: string;
  use_pkulaw: boolean;
};

export type Generation = {
  id: string;
  status: GenerationStatus;
  case_type: string;
  model_used?: string | null;
  use_pkulaw: boolean;
  plan_text?: string | null;
  credits_cost: number | string;
  html_oss_key?: string | null;
  share_token?: string | null;
  llm_output?: Record<string, unknown> | null;
  error?: string | null;
};

export type GenerationMessageResponse = {
  generation: Generation;
  questions: string[];
};

export const API_ROUTES = {
  smsSend: "/api/auth/sms/send",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  register: "/api/auth/register",
  me: "/api/auth/me",
  creditBalance: "/api/credits/balance",
  creditLedger: "/api/credits/ledger",
  adminUsers: "/api/admin/users",
  adminUserActivate: (userId: string) => `/api/admin/users/${userId}/activate`,
  adminUserDisable: (userId: string) => `/api/admin/users/${userId}/disable`,
  adminCreditGrant: "/api/admin/credits/grant",
  adminCreditAdjust: "/api/admin/credits/adjust",
  adminCreditLedger: "/api/admin/credits/ledger",
  startGeneration: "/api/generate/start",
  generationHistory: "/api/generate/history",
  generationStatus: (genId: string) => `/api/generate/${genId}/status`,
  generationMessage: (genId: string) => `/api/generate/${genId}/message`,
  confirmGeneration: (genId: string) => `/api/generate/${genId}/confirm`,
  exportGeneration: (genId: string, format: "pdf" | "png") => `/api/generate/${genId}/export?format=${format}`,
  renderGeneration: (genId: string) => `/api/render/${genId}`,
  share: (token: string) => `/api/share/${token}`,
} as const;

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  contract_dispute: "合同纠纷",
  labor_dispute: "劳动争议",
  divorce_family: "婚姻家事",
  traffic_accident: "交通事故",
  criminal_defense: "刑事辩护",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const TOKEN_STORAGE_KEY = "lawviz_access_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function saveAccessToken(token?: string) {
  if (typeof window === "undefined" || !token) return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getAccessToken() {
  if (typeof window === "undefined") return undefined;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? undefined;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "detail" in body ? String(body.detail) : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

async function requestText(path: string, options: RequestInit = {}): Promise<string> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const body = await response.text();
  if (!response.ok) {
    throw new ApiError(body || `Request failed (${response.status})`, response.status);
  }
  return body;
}

export const api = {
  sendSmsCode(payload: SmsSendPayload) {
    return request<{ sent: boolean }>(API_ROUTES.smsSend, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async register(payload: RegisterPayload) {
    return request<AuthUser>(API_ROUTES.register, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async login(payload: LoginPayload) {
    const result = await request<LoginResponse>(API_ROUTES.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    saveAccessToken(result.access_token);
    return result;
  },
  async logout() {
    try {
      await request<void>(API_ROUTES.logout, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },
  me() {
    return request<AuthUser>(API_ROUTES.me);
  },
  creditBalance() {
    return request<CreditBalance>(API_ROUTES.creditBalance);
  },
  creditLedger() {
    return request<CreditLedgerEntry[]>(API_ROUTES.creditLedger);
  },
  adminUsers() {
    return request<AuthUser[]>(API_ROUTES.adminUsers);
  },
  adminActivateUser(userId: string) {
    return request<AuthUser>(API_ROUTES.adminUserActivate(userId), { method: "POST" });
  },
  adminDisableUser(userId: string) {
    return request<AuthUser>(API_ROUTES.adminUserDisable(userId), { method: "POST" });
  },
  adminGrantCredits(payload: AdminCreditPayload) {
    return request<CreditLedgerEntry>(API_ROUTES.adminCreditGrant, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  adminAdjustCredits(payload: AdminCreditPayload) {
    return request<CreditLedgerEntry>(API_ROUTES.adminCreditAdjust, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  adminCreditLedger() {
    return request<CreditLedgerEntry[]>(API_ROUTES.adminCreditLedger);
  },
  startGeneration(payload: StartGenerationPayload) {
    return request<Generation>(API_ROUTES.startGeneration, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  generationHistory() {
    return request<Generation[]>(API_ROUTES.generationHistory);
  },
  generationStatus(genId: string) {
    return request<Generation>(API_ROUTES.generationStatus(genId));
  },
  sendGenerationMessage(genId: string, message: string) {
    return request<GenerationMessageResponse>(API_ROUTES.generationMessage(genId), {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },
  confirmGeneration(genId: string) {
    return request<Generation>(API_ROUTES.confirmGeneration(genId), { method: "POST" });
  },
  renderGeneration(genId: string, style = "classic") {
    return requestText(`${API_ROUTES.renderGeneration(genId)}?style=${encodeURIComponent(style)}`);
  },
};
