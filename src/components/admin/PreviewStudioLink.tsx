import Link from "next/link";
import { cn } from "@/lib/utils";

type PreviewStudioLinkProps = {
  href: string;
  title: string;
  description?: string;
  className?: string;
};

export function PreviewStudioLink({
  href,
  title,
  description = "Desktop, tablet, and mobile preview with layout sliders for every section.",
  className,
}: PreviewStudioLinkProps) {
  return (
    <div className={cn("rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-amber-950">{title}</h2>
          <p className="mt-1 text-sm text-amber-900/80">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-amber-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900"
        >
          Open preview studio
        </Link>
      </div>
    </div>
  );
}
