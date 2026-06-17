import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchBlogPostBySlug } from "@/content";
import { formatDate } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { PageContent } from "@/components/page/PageContent";
import { BlogPostBody } from "@/components/content/BlogPostBody";
import { Section } from "@/components/ui/Section";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return { title: "Post" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.imageSrc, alt: post.imageAlt }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="border-b border-border">
      <Section as="header" variant="muted" spacing="pageHero" border="bottom">
        <Container>
          <time className="text-xs uppercase tracking-wider text-muted" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">{post.excerpt}</p>
        </Container>
      </Section>

      <div className="relative aspect-[21/9] w-full max-h-[min(56vh,520px)] overflow-hidden border-b border-border">
        <Image
          src={post.imageSrc}
          alt={post.imageAlt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <PageContent border="bottom">
        <BlogPostBody content={post.content} className="mx-auto max-w-2xl" />
      </PageContent>
    </article>
  );
}
