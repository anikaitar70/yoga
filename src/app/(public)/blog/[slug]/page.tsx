import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchBlogPostBySlug, fetchRelatedBlogPosts } from "@/content/repositories/blog";
import { formatDate } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { PageContent } from "@/components/page/PageContent";
import { BlogPostBody } from "@/components/content/BlogPostBody";
import { BlogSectionsRenderer } from "@/components/content/BlogSectionsRenderer";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/lib/i18n/server";
import { fetchSite } from "@/content";
import { buildPageMetadata, mergeSeoDefaults } from "@/lib/seo/metadata";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/structured-data";
import {
  estimateReadingTimeMinutes,
  formatReadingTime,
  blogSectionPlainText,
} from "@/lib/seo/reading-time";
import { uiMessage } from "@/lib/i18n/resolve";
import { localizedPath } from "@/lib/i18n/paths";
import { BlogCard } from "@/components/ui/BlogCard";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, locale, site] = await Promise.all([
    fetchBlogPostBySlug(slug),
    getLocale(),
    fetchSite(),
  ]);
  if (!post) return { title: "Post", robots: { index: false, follow: false } };

  const merged = mergeSeoDefaults(
    { title: post.title, description: post.excerpt },
    post,
  );

  return buildPageMetadata(
    {
      title: merged.title,
      description: merged.description,
      path: `/blog/${post.slug}`,
      ogImage: merged.ogImage ?? post.imageSrc,
      ogImageAlt: post.imageAlt,
      keywords: merged.keywords ?? post.focusKeywords,
      canonicalOverride: merged.canonicalOverride ?? post.canonicalUrlOverride,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags,
    },
    locale,
    site.name,
    site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga,
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, locale] = await Promise.all([fetchBlogPostBySlug(slug), getLocale()]);
  if (!post) notFound();

  const related = await fetchRelatedBlogPosts(post.slug, post.tags, 3);
  const bodyText = [post.content, blogSectionPlainText(post.sections)].join(" ");
  const readingMinutes = estimateReadingTimeMinutes(bodyText);
  const homeLabel = uiMessage(locale, "home");

  const breadcrumbItems = [
    { label: homeLabel, href: "/" },
    { label: uiMessage(locale, "blog"), href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <article className="border-b border-border">
      <JsonLd
        data={[
          blogPostingJsonLd({ ...post, readingTimeMinutes: readingMinutes }, locale),
          breadcrumbJsonLd(breadcrumbItems, locale),
        ]}
      />

      <Section as="header" variant="muted" spacing="pageHero" border="bottom">
        <Container>
          <Breadcrumbs className="mb-6" items={breadcrumbItems} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-wider text-muted">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
            {post.updatedAt && post.updatedAt !== post.date ? (
              <span>
                · {locale === "ja" ? "更新" : "Updated"} {formatDate(post.updatedAt, locale)}
              </span>
            ) : null}
            <span>· {formatReadingTime(readingMinutes, locale)}</span>
            {post.authorName ? (
              <span>
                · {locale === "ja" ? "著者" : "By"} {post.authorName}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">{post.excerpt}</p>
          {post.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={locale === "ja" ? "タグ" : "Tags"}>
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </Section>

      {post.imageSrc ? (
        <div className="relative aspect-[21/9] w-full max-h-[min(56vh,520px)] overflow-hidden border-b border-border">
          <Image
            src={post.imageSrc}
            alt={post.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            unoptimized={post.imageSrc.startsWith("/uploads/")}
          />
        </div>
      ) : null}

      <PageContent border="bottom">
        {post.sections.length > 0 ? (
          <BlogSectionsRenderer sections={post.sections} className="py-12" />
        ) : (
          <BlogPostBody content={post.content} className="mx-auto max-w-2xl" />
        )}
      </PageContent>

      {related.length > 0 ? (
        <Section variant="muted" spacing="default" border="subtle">
          <Container>
            <h2 className="font-display text-2xl font-medium text-foreground">
              {uiMessage(locale, "relatedArticles")}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
            <p className="mt-8">
              <Link
                href={localizedPath("/blog", locale)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {uiMessage(locale, "backToBlog")}
              </Link>
            </p>
          </Container>
        </Section>
      ) : null}
    </article>
  );
}
