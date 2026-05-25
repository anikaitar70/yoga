"use client";

import { useMemo, useState, type FormEvent } from "react";
import { slugify } from "@/lib/utils";
import type { AdminBlogPost } from "@/lib/admin-types";

interface BlogManagerProps {
  initialPosts: AdminBlogPost[];
}

const emptyBlog: Omit<AdminBlogPost, "id"> = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  coverImageUrl: "",
  tags: [],
  published: false,
  publishedAt: new Date().toISOString(),
};

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [formState, setFormState] = useState<Omit<AdminBlogPost, "id">>(emptyBlog);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    [posts],
  );

  function resetForm() {
    setEditingPost(null);
    setFormState(emptyBlog);
    setFeedback(null);
  }

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);

    try {
      const payload = {
        ...formState,
        slug: formState.slug || slugify(formState.title),
        tags: formState.tags,
      };

      const method = editingPost ? "PUT" : "POST";
      const url = editingPost ? `/api/blogs/${editingPost.id}` : "/api/blogs";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        setFeedback(result?.details?.join(" ") || result?.error || "Unable to save blog post.");
        return;
      }

      const savedPost = await response.json();
      setPosts((current) => {
        const updated = current.filter((item) => item.id !== savedPost.id);
        return [savedPost, ...updated];
      });
      resetForm();
      setShowForm(false);
    } catch (error) {
      setFeedback("Unable to save blog post.");
    } finally {
      setBusy(false);
    }
  }

  function handleEdit(post: AdminBlogPost) {
    setEditingPost(post);
    setFormState({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? "",
      tags: post.tags ?? [],
      published: post.published,
      publishedAt: post.publishedAt,
    });
    setShowForm(true);
    setFeedback(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage blog posts</h2>
          <p className="mt-1 text-sm text-slate-600">Create and edit studio articles for your blog.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm((value) => !value);
          }}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {showForm ? "Hide form" : "Create post"}
        </button>
      </div>

      {showForm ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">{editingPost ? "Edit post" : "New post"}</h3>
          <form className="mt-6 space-y-4" onSubmit={submitPost}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Title
                <input
                  value={formState.title}
                  onChange={(event) => setFormState({ ...formState, title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Slug
                <input
                  value={formState.slug}
                  onChange={(event) => setFormState({ ...formState, slug: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Summary
              <textarea
                value={formState.summary}
                onChange={(event) => setFormState({ ...formState, summary: event.target.value })}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Content
              <textarea
                value={formState.content}
                onChange={(event) => setFormState({ ...formState, content: event.target.value })}
                rows={6}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Cover image URL
              <input
                value={formState.coverImageUrl ?? ""}
                onChange={(event) => setFormState({ ...formState, coverImageUrl: event.target.value })}
                placeholder="/uploads/events/example.jpg or external link"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Tags (comma separated)
              <input
                value={formState.tags.join(", ")}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formState.published}
                  onChange={(event) => setFormState({ ...formState, published: event.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-slate-900"
                />
                Published
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Published at
                <input
                  value={formState.publishedAt.slice(0, 16)}
                  onChange={(event) =>
                    setFormState({ ...formState, publishedAt: new Date(event.target.value).toISOString() })
                  }
                  type="datetime-local"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </label>
            </div>

            {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? "Saving…" : editingPost ? "Update post" : "Create post"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Blog posts</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{posts.length} posts</span>
        </div>

        <div className="mt-6 space-y-4">
          {sortedPosts.map((post) => (
            <div key={post.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })}
                  </p>
                  <h4 className="text-lg font-semibold text-slate-900">{post.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{post.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(post)}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 ? <p className="text-sm text-slate-600">There are no posts yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
