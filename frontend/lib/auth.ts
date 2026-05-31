export type PrivateUser = {
  id: string;
  name: string;
  firm?: string;
  credits: number;
};

export function isPrivateAccessRequired(pathname: string) {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/generate") || pathname.startsWith("/share");
}
