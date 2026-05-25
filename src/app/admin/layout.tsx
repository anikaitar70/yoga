import { cookies } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("nirvana_admin_token")?.value;
  const authorized = Boolean(ADMIN_SECRET && token === ADMIN_SECRET);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg">
          <AdminLoginForm />
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
