"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiagnosticsSnapshot, SystemMetricsSample } from "@/lib/server-metrics";
import { formatBytes } from "@/lib/format-bytes";

const LIVE_INTERVAL_MS = 5000;
const HISTORY_WINDOW_MS = 60_000;

type DiagnosticsDashboardProps = {
  initial: DiagnosticsSnapshot;
};

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

function MetricCard({ label, value, hint }: { label: string; value: string | number | null; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value ?? "—"}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
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
  status: DiagnosticsSnapshot["backups"]["database"];
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

function Sparkline({ values, max }: { values: number[]; max: number }) {
  if (values.length === 0) {
    return <div className="h-16 rounded-xl bg-slate-100" />;
  }

  return (
    <div className="flex h-16 items-end gap-1 rounded-xl bg-slate-100 px-2 py-2">
      {values.map((value, index) => {
        const height = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 8;
        return (
          <div
            key={index}
            className="flex-1 rounded-sm bg-slate-700/70"
            style={{ height: `${height}%` }}
            title={`${value}${max <= 100 ? "%" : ""}`}
          />
        );
      })}
    </div>
  );
}

function averageCpu(samples: SystemMetricsSample[]): number | null {
  const values = samples.map((sample) => sample.cpuUsagePercent).filter((value): value is number => value != null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function averageRamBytes(samples: SystemMetricsSample[]): number | null {
  if (samples.length === 0) return null;
  return Math.round(samples.reduce((sum, sample) => sum + sample.ramUsedBytes, 0) / samples.length);
}

function StorageBar({ label, bytes, totalBytes, detail }: { label: string; bytes: number; totalBytes: number; detail: string }) {
  const percent = totalBytes > 0 ? Math.min(100, Math.round((bytes / totalBytes) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="mt-1 text-sm text-slate-600">{detail}</p>
        </div>
        <p className="text-sm font-semibold text-slate-900">{formatBytes(bytes)}</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-700" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{percent}% of uploads folder</p>
    </div>
  );
}

export function DiagnosticsDashboard({ initial }: DiagnosticsDashboardProps) {
  const [snapshot, setSnapshot] = useState(initial);
  const [history, setHistory] = useState<SystemMetricsSample[]>([
    {
      collectedAt: initial.collectedAt,
      cpuUsagePercent: initial.systemHealth.cpuUsagePercent,
      ramUsedBytes: initial.systemHealth.ramUsedBytes,
      ramFreeBytes: initial.systemHealth.ramFreeBytes,
      ramTotalBytes: initial.systemHealth.ramTotalBytes,
      ramUsed: initial.systemHealth.ramUsed,
      ramFree: initial.systemHealth.ramFree,
      ramTotal: initial.systemHealth.ramTotal,
      uptimeSeconds: initial.systemHealth.uptimeSeconds,
      uptime: initial.systemHealth.uptime,
    },
  ]);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastLiveAt, setLastLiveAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimHistory = useCallback((samples: SystemMetricsSample[]) => {
    const cutoff = Date.now() - HISTORY_WINDOW_MS;
    return samples.filter((sample) => new Date(sample.collectedAt).getTime() >= cutoff);
  }, []);

  const pollMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/diagnostics/metrics", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load live metrics.");
      }
      const sample = (await response.json()) as SystemMetricsSample;
      setHistory((current) => trimHistory([...current, sample]));
      setLastLiveAt(sample.collectedAt);
      setError(null);
    } catch (pollError) {
      setError(pollError instanceof Error ? pollError.message : "Live metrics failed.");
    }
  }, [trimHistory]);

  useEffect(() => {
    if (!liveEnabled) return;
    void pollMetrics();
    const timer = window.setInterval(() => {
      void pollMetrics();
    }, LIVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [liveEnabled, pollMetrics]);

  const latest = history[history.length - 1] ?? history[0];
  const avgCpu = averageCpu(history);
  const avgRam = averageRamBytes(history);
  const cpuHistory = history.map((sample) => sample.cpuUsagePercent ?? 0);
  const ramHistory = history.map((sample) =>
    sample.ramTotalBytes > 0 ? Math.round((sample.ramUsedBytes / sample.ramTotalBytes) * 100) : 0,
  );

  const storageDenominator = useMemo(() => {
    return snapshot.storage.uploadsFolderBytes > 0 ? snapshot.storage.uploadsFolderBytes : 1;
  }, [snapshot.storage.uploadsFolderBytes]);

  async function refreshFullSnapshot() {
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to refresh diagnostics.");
      }
      const next = (await response.json()) as DiagnosticsSnapshot;
      setSnapshot(next);
      setHistory((current) =>
        trimHistory([
          ...current,
          {
            collectedAt: next.collectedAt,
            cpuUsagePercent: next.systemHealth.cpuUsagePercent,
            ramUsedBytes: next.systemHealth.ramUsedBytes,
            ramFreeBytes: next.systemHealth.ramFreeBytes,
            ramTotalBytes: next.systemHealth.ramTotalBytes,
            ramUsed: next.systemHealth.ramUsed,
            ramFree: next.systemHealth.ramFree,
            ramTotal: next.systemHealth.ramTotal,
            uptimeSeconds: next.systemHealth.uptimeSeconds,
            uptime: next.systemHealth.uptime,
          },
        ]),
      );
      setLastLiveAt(next.collectedAt);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Diagnostics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Live CPU/RAM updates every 5 seconds. Storage snapshot collected at{" "}
              {new Date(snapshot.collectedAt).toLocaleString()}.
            </p>
            {lastLiveAt ? (
              <p className="mt-1 text-xs text-slate-500">
                Last live sample: {new Date(lastLiveAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLiveEnabled((value) => !value)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                liveEnabled
                  ? "bg-emerald-100 text-emerald-900"
                  : "border border-slate-300 bg-slate-50 text-slate-700"
              }`}
            >
              {liveEnabled ? "Live monitoring on" : "Live monitoring off"}
            </button>
            <button
              type="button"
              onClick={() => void refreshFullSnapshot()}
              disabled={refreshing}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {refreshing ? "Refreshing…" : "Refresh storage snapshot"}
            </button>
            <Link
              href="/admin/diagnostics/errors"
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              View application errors
            </Link>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>

      <Section title="System Health (live)">
        <p className="mb-4 text-sm text-slate-600">
          Rolling 1-minute window — {history.length} sample{history.length === 1 ? "" : "s"} collected
          {liveEnabled ? " every 5 seconds." : "."}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="CPU now"
            value={latest?.cpuUsagePercent == null ? "Unavailable" : `${latest.cpuUsagePercent}%`}
          />
          <MetricCard
            label="CPU avg (1 min)"
            value={avgCpu == null ? "—" : `${avgCpu}%`}
            hint="Average of samples in the last minute"
          />
          <MetricCard label="RAM now" value={latest?.ramUsed ?? "—"} />
          <MetricCard
            label="RAM avg (1 min)"
            value={avgRam == null ? "—" : formatBytes(avgRam)}
            hint="Average used memory in the last minute"
          />
          <MetricCard label="Server uptime" value={latest?.uptime ?? "—"} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">CPU history (1 min)</p>
            <Sparkline values={cpuHistory} max={100} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">RAM usage history (1 min)</p>
            <Sparkline values={ramHistory} max={100} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MetricCard label="RAM free now" value={latest?.ramFree ?? "—"} />
          <MetricCard label="RAM total" value={latest?.ramTotal ?? "—"} />
          <MetricCard
            label="RAM used %"
            value={
              latest && latest.ramTotalBytes > 0
                ? `${Math.round((latest.ramUsedBytes / latest.ramTotalBytes) * 100)}%`
                : "—"
            }
          />
        </div>
      </Section>

      <Section title="Storage Overview">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total disk (container view)" value={snapshot.storage.diskTotal} />
          <MetricCard label="Used disk" value={snapshot.storage.diskUsed} />
          <MetricCard label="Free disk" value={snapshot.storage.diskFree} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MetricCard
            label="Measured app data"
            value={snapshot.storage.measuredAppData}
            hint="Uploads + database + brand assets + logs"
          />
          <MetricCard
            label="Unaccounted (container disk)"
            value={snapshot.storage.unaccountedDisk}
            hint="Typically Docker image, OS, and dependencies"
          />
        </div>
      </Section>

      <Section title="Storage Breakdown">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Uploads folder (total)" value={snapshot.storage.uploadsFolder} />
          <MetricCard label="Database size" value={snapshot.storage.database} />
          <MetricCard label="Static brand assets" value={snapshot.storage.staticBrandAssets} />
          <MetricCard label="Docker images" value={snapshot.storage.dockerImages} />
          <MetricCard label="Docker volumes" value={snapshot.storage.dockerVolumes} />
          <MetricCard label="Logs folder" value={snapshot.storage.logs} />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-slate-700">Uploads by folder</p>
          {snapshot.storage.uploadsBreakdown.length === 0 ? (
            <p className="text-sm text-slate-600">No uploads found yet.</p>
          ) : (
            snapshot.storage.uploadsBreakdown.map((item) => (
              <StorageBar
                key={item.id}
                label={item.label}
                bytes={item.bytes}
                totalBytes={storageDenominator}
                detail={`${item.fileCount} file${item.fileCount === 1 ? "" : "s"}`}
              />
            ))
          )}
        </div>

        <ul className="mt-6 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {snapshot.storage.hostNotes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      </Section>

      <Section title="Database Information">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total blog posts" value={snapshot.database.blogPosts} />
          <MetricCard label="Total events" value={snapshot.database.events} />
          <MetricCard label="Total page sections" value={snapshot.database.pageSections} />
          <MetricCard label="Total gallery images" value={snapshot.database.galleryImages} />
          <MetricCard label="Total uploaded files" value={snapshot.database.uploadedFiles} />
        </div>
      </Section>

      <Section title="Services">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Application</p>
            <div className="mt-2">
              <StatusBadge value={snapshot.services.application} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Database</p>
            <div className="mt-2">
              <StatusBadge value={snapshot.services.database} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Uploads</p>
            <div className="mt-2">
              <StatusBadge value={snapshot.services.uploads} />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Backup Status">
        <div className="grid gap-4 md:grid-cols-2">
          <BackupPanel title="Database backup" status={snapshot.backups.database} />
          <BackupPanel title="Uploads backup" status={snapshot.backups.uploads} />
        </div>
      </Section>
    </div>
  );
}
