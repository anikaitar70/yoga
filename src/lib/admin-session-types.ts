export type AdminSessionRecord = {
  id: string;
  email: string;
  displayName: string;
  ipAddress: string;
  userAgent: string | null;
  loginAt: string;
  lastSeenAt: string;
  isCurrent?: boolean;
};
