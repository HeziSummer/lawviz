export type GenerationStatus = "draft" | "qa" | "plan" | "confirmed" | "generating" | "done" | "failed";

export type CaseType =
  | "contract_dispute"
  | "labor_dispute"
  | "divorce_family"
  | "traffic_accident"
  | "criminal_defense";

export const API_ROUTES = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  me: "/api/auth/me",
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
