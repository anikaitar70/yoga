import { DiagnosticsDashboard } from "@/components/admin/DiagnosticsDashboard";
import { collectDiagnostics } from "@/lib/server-metrics";

export const dynamic = "force-dynamic";

export default async function AdminDiagnosticsPage() {
  const data = await collectDiagnostics();
  return <DiagnosticsDashboard initial={data} />;
}
