import type { DiagnosticCategory } from "@prisma/client";
import { getDiagnosticEvents } from "@/lib/diagnostic-events";
import { DiagnosticsErrorsPanel } from "@/components/admin/DiagnosticsErrorsPanel";

const CATEGORIES: Array<{ key: DiagnosticCategory; title: string }> = [
  { key: "UPLOAD_FAILURE", title: "Failed Uploads" },
  { key: "LOGIN_FAILURE", title: "Failed Logins" },
  { key: "CMS_SAVE_FAILURE", title: "CMS Save Failures" },
  { key: "IMAGE_PROCESSING_FAILURE", title: "Image Processing Failures" },
];

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminDiagnosticsErrorsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const sections = await Promise.all(
    CATEGORIES.map(async (category) => ({
      ...category,
      ...(await getDiagnosticEvents(category.key, page)),
    })),
  );

  const totalPages = Math.max(...sections.map((section) => Math.ceil(section.total / section.pageSize)), 1);

  return <DiagnosticsErrorsPanel sections={sections} page={page} totalPages={totalPages} />;
}
