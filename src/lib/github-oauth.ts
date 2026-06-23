import { randomBytes } from "crypto";
import { getAppUrl } from "@/lib/env";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_EMAILS_URL = "https://api.github.com/user/emails";

export const OAUTH_STATE_COOKIE = "nirvana_oauth_state";
export const OAUTH_STATE_MAX_AGE_SEC = 60 * 10;

type GitHubEmailRecord = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export function getGitHubOAuthConfig() {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  const redirectUri = `${getAppUrl()}/api/admin/auth/github/callback`;

  return { clientId, clientSecret, redirectUri };
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export function buildGitHubAuthorizeUrl(state: string): string | null {
  const { clientId, redirectUri } = getGitHubOAuthConfig();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeGitHubCodeForToken(code: string): Promise<string | null> {
  const { clientId, clientSecret, redirectUri } = getGitHubOAuthConfig();
  if (!clientId || !clientSecret) return null;

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { access_token?: string; error?: string };
  return typeof payload.access_token === "string" ? payload.access_token : null;
}

export async function fetchGitHubPrimaryVerifiedEmail(accessToken: string): Promise<string | null> {
  const response = await fetch(GITHUB_USER_EMAILS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "NirvanaYoga-Admin",
    },
  });

  if (!response.ok) return null;

  const emails = (await response.json()) as GitHubEmailRecord[];
  if (!Array.isArray(emails)) return null;

  const primaryVerified = emails.find((entry) => entry.primary && entry.verified);
  if (primaryVerified?.email) return primaryVerified.email;

  const anyVerified = emails.find((entry) => entry.verified);
  return anyVerified?.email ?? null;
}
