import { Suspense } from "react";
import { cookies } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { ADMIN_COOKIE_NAME, getAdminAuthState } from "@/lib/admin-auth";
import { fetchSite } from "@/content";

export const dynamic = "force-dynamic";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const site = await fetchSite();
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authState = getAdminAuthState(token, ADMIN_SECRET);

  if (!authState.authorized) {
    return (
      <BrandingProvider branding={site.branding}>
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
          <div className="w-full max-w-lg">
            <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>
      </BrandingProvider>
    );
  }

  return (
    <BrandingProvider branding={site.branding}>
      <AdminShell>{children}</AdminShell>
    </BrandingProvider>
  );
}
