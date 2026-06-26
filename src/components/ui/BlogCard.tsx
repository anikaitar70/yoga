import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/content/types";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";

type BlogCardProps = {
  post: BlogPost;
};

export async function BlogCard({ post }: BlogCardProps) {
  const [locale, localeContent] = await Promise.all([getLocale(), loadSiteConfigRowForLocale()]);
  const postHref = localizedPath(`/blog/${encodeURIComponent(post.slug)}`, locale);
  const readMore = uiMessage(locale, "readMore", localeContent);

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <Link
        href={postHref}
        className="relative block aspect-[16/10] overflow-hidden"
        aria-label={`${readMore}: ${post.title}`}
      >
        <Image
          src={post.imageSrc}
          alt={post.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <time className="text-xs uppercase tracking-wider text-muted" dateTime={post.date}>
          {formatDate(post.date, locale)}
        </time>
        <h3 className="mt-2 font-display text-xl font-medium text-foreground">
          <Link
            href={postHref}
            className="hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <Link
          href={postHref}
          className="mt-4 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {readMore}
          <span className="sr-only"> — {post.title}</span>
        </Link>
      </div>
    </Card>
  );
}
