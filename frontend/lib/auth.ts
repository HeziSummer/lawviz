import type { AuthUser } from "./api";

export type PrivateUser = AuthUser;

export function isAdmin(user: AuthUser | null | undefined) {
  return user?.role === "admin";
}

export function isPrivateAccessRequired(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/generate") ||
    pathname.startsWith("/share") ||
    pathname.startsWith("/admin")
  );
}

export function displayUserName(user: AuthUser | null | undefined) {
  return user?.lawyer_profile?.full_name ?? user?.full_name ?? user?.email ?? "User";
}

export function displayLawFirm(user: AuthUser | null | undefined) {
  return user?.lawyer_profile?.law_firm ?? user?.law_firm ?? "";
}
