import Link from "next/link";
import { collectDiagnostics } from "@/lib/server-metrics";

function StatusBadge({ value }: { value: string }) {
  const healthy = ["healthy", "connected", "writable"].includes(value);
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        healthy ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value ?? "—"}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BackupPanel({
  title,
  status,
}: {
  title: string;
  status: {
    configured: boolean;
    lastSuccessfulBackup: string | null;
    backupSize: string | null;
  };
}) {
  if (!status.configured) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-600">Backup monitoring not configured</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">
        Last successful backup:{" "}
        {status.lastSuccessfulBackup ? new Date(status.lastSuccessfulBackup).toLocaleString() : "No backups found"}
      </p>
      <p className="mt-1 text-sm text-slate-600">Backup size: {status.backupSize ?? "—"}</p>
    </div>
  );
}

export default async function AdminDiagnosticsPage() {
  const data = await collectDiagnostics();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Diagnostics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Server health, storage breakdown, and service status. Collected at{" "}
              {new Date(data.collectedAt).toLocaleString()}.
            </p>
          </div>
          <Link
            href="/admin/diagnostics/errors"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View application errors
          </Link>
        </div>
      </div>

      <Section title="System Health">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="CPU Usage"
            value={data.systemHealth.cpuUsagePercent == null ? "Unavailable" : `${data.systemHealth.cpuUsagePercent}%`}
          />
          <MetricCard label="RAM Used" value={data.systemHealth.ramUsed} />
          <MetricCard label="RAM Free" value={data.systemHealth.ramFree} />
          <MetricCard label="RAM Total" value={data.systemHealth.ramTotal} />
          <MetricCard label="Server Uptime" value={data.systemHealth.uptime} />
        </div>
      </Section>

      <Section title="Storage Overview">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Disk" value={data.storage.diskTotal} />
          <MetricCard label="Used Disk" value={data.storage.diskUsed} />
          <MetricCard label="Free Disk" value={data.storage.diskFree} />
        </div>
      </Section>

      <Section title="Storage Breakdown">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Uploads Folder Size" value={data.storage.uploadsFolder} />
          <MetricCard label="Database Size" value={data.storage.database} />
          <MetricCard label="Docker Images Size" value={data.storage.dockerImages} />
          <MetricCard label="Docker Volumes Size" value={data.storage.dockerVolumes} />
          <MetricCard label="Logs Size" value={data.storage.logs} />
        </div>
      </Section>

      <Section title="Database Information">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Database Size" value={data.database.size} />
          <MetricCard label="Total Blog Posts" value={data.database.blogPosts} />
          <MetricCard label="Total Events" value={data.database.events} />
          <MetricCard label="Total Page Sections" value={data.database.pageSections} />
          <MetricCard label="Total Gallery Images" value={data.database.galleryImages} />
          <MetricCard label="Total Uploaded Files" value={data.database.uploadedFiles} />
        </div>
      </Section>

      <Section title="Services">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Application</p>
            <div className="mt-2">
              <StatusBadge value={data.services.application} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Database</p>
            <div className="mt-2">
              <StatusBadge value={data.services.database} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Uploads</p>
            <div className="mt-2">
              <StatusBadge value={data.services.uploads} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Backup Status">
        <div className="grid gap-4 md:grid-cols-2">
          <BackupPanel title="Database Backup" status={data.backups.database} />
          <BackupPanel title="Uploads Backup" status={data.backups.uploads} />
        </div>
      </Section>
    </div>
  );
}
