"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AdminGalleryCollage,
  AdminGalleryCollection,
  AdminGalleryItem,
} from "@/lib/admin-types";
import { adminJsonRequest, adminDeleteRequest } from "@/lib/admin-fetch";
import { uploadAdminImage } from "@/lib/upload-client";
import { COLLAGE_LAYOUT_LABELS, COLLAGE_LAYOUTS } from "@/lib/collage-layouts";
import { GALLERY_CATEGORY_LABELS } from "@/lib/gallery-categories";
import { PreviewViewport } from "@/components/admin/preview/PreviewViewport";
import { PreviewStudioLink } from "@/components/admin/PreviewStudioLink";
import { CollageGrid } from "@/components/content/CollageGrid";
import type { CollageLayout } from "@/lib/collage-layouts";
import type { GalleryItem } from "@/content/types";
import type { PreviewViewportMode } from "@/lib/preview-viewport";

type Props = {
  collections: AdminGalleryCollection[];
  gallery: AdminGalleryItem[];
  collages: AdminGalleryCollage[];
  onGalleryChange: (items: AdminGalleryItem[]) => void;
  onCollagesChange: (items: AdminGalleryCollage[]) => void;
  onMessage: (message: string | null) => void;
  onSaving: (saving: boolean) => void;
};
type PendingUpload = {
  url: string;
  uploadPath: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  width?: number;
  height?: number;
  title: string;
  altText: string;
  description: string;
};

const emptyCollage: AdminGalleryCollage = {
  id: "",
  name: "",
  slug: "",
  layout: "MASONRY",
  category: "ART",
  collectionId: null,
  imageIds: [],
  isPublished: true,
};

export default function GalleryManager({
  collections,
  gallery: initialGallery,
  collages: initialCollages,
  onGalleryChange,
  onCollagesChange,
  onMessage,
  onSaving,
}: Props) {
  const [galleryItems, setGalleryItems] = useState(initialGallery);
  const [collages, setCollages] = useState(initialCollages);
  const [collageViewport, setCollageViewport] = useState<PreviewViewportMode>("desktop");
  const [activeCollectionId, setActiveCollectionId] = useState(collections[0]?.id ?? "");
  const [selectedItem, setSelectedItem] = useState<AdminGalleryItem | null>(null);
  const [collageForm, setCollageForm] = useState<AdminGalleryCollage>(emptyCollage);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onGalleryChange(galleryItems);
  }, [galleryItems, onGalleryChange]);

  useEffect(() => {
    onCollagesChange(collages);
  }, [collages, onCollagesChange]);

  function replaceGallery(updater: (current: AdminGalleryItem[]) => AdminGalleryItem[]) {
    setGalleryItems(updater);
  }

  function replaceCollages(updater: (current: AdminGalleryCollage[]) => AdminGalleryCollage[]) {
    setCollages(updater);
  }

  const activeCollection = collections.find((collection) => collection.id === activeCollectionId);

  const collectionItems = useMemo(
    () =>
      galleryItems
        .filter((item) => item.collectionId === activeCollectionId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [galleryItems, activeCollectionId],
  );

  const previewCollageItems: GalleryItem[] = useMemo(() => {
    return collageForm.imageIds
      .map((id) => galleryItems.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({
        id: item!.id,
        src: item!.src,
        alt: item!.alt,
        title: item!.title ?? undefined,
        description: item!.description ?? undefined,
      }));
  }, [collageForm.imageIds, galleryItems]);

  async function handleMultiUpload(files: FileList | null) {
    if (!files?.length || !activeCollection) {
      return;
    }

    setUploading(true);
    onMessage(null);

    try {
      const uploads: PendingUpload[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadAdminImage(file, "gallery", null, activeCollection.slug);
        if (!result.ok) {
          throw new Error(result.error);
        }
        uploads.push({
          url: result.url,
          uploadPath: result.url,
          thumbnailUrl: result.thumbnailUrl,
          mediumUrl: result.mediumUrl,
          width: result.width,
          height: result.height,
          title: file.name.replace(/\.[^.]+$/, ""),
          altText: `${activeCollection.title} photo`,
          description: activeCollection.description ?? "",
        });
      }
      setPendingUploads((current) => [...current, ...uploads]);
      onMessage(`${uploads.length} image(s) ready to save. Review metadata below.`);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function savePendingUploads() {
    if (!activeCollection || pendingUploads.length === 0) {
      return;
    }

    onSaving(true);
    onMessage(null);

    try {
      const created = await adminJsonRequest<
        Array<{
          id: string;
          url: string;
          altText?: string | null;
          title?: string | null;
          description?: string | null;
          sortOrder?: number;
          featuredOnHomepage?: boolean;
          isPublished?: boolean;
        }>
      >(
        "/api/cms/gallery",
        "POST",
        {
          collectionId: activeCollection.id,
          category: activeCollection.category,
          items: pendingUploads.map((item, index) => ({
            url: item.url,
            uploadPath: item.uploadPath,
            thumbnailUrl: item.thumbnailUrl,
            mediumUrl: item.mediumUrl,
            width: item.width,
            height: item.height,
            title: item.title,
            altText: item.altText,
            description: item.description,
            sortOrder: collectionItems.length + index,
          })),
        },
      );

      const mapped: AdminGalleryItem[] = created.map((item) => ({
        id: item.id,
        src: item.url,
        alt: item.altText ?? "",
        title: item.title,
        description: item.description ?? undefined,
        category: activeCollection.category,
        collectionId: activeCollection.id,
        collectionSlug: activeCollection.slug,
        sortOrder: item.sortOrder,
        featuredOnHomepage: item.featuredOnHomepage,
        isPublished: item.isPublished,
      }));

      replaceGallery((current) => [...mapped, ...current]);
      setPendingUploads([]);
      onMessage(`Saved ${mapped.length} image(s) to ${activeCollection.title}.`);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Batch save failed.");
    } finally {
      onSaving(false);
    }
  }

  async function saveSelectedItem() {
    if (!selectedItem?.id) {
      return;
    }

    onSaving(true);
    onMessage(null);

    try {
      const result = await adminJsonRequest<{
        id: string;
        url: string;
        altText?: string;
        title?: string;
        description?: string;
        category?: string;
        collectionId?: string;
        sortOrder?: number;
        featuredOnHomepage?: boolean;
        isPublished?: boolean;
      }>(`/api/cms/gallery/${selectedItem.id}`, "PUT", {
        url: selectedItem.src,
        uploadPath: selectedItem.src,
        altText: selectedItem.alt,
        title: selectedItem.title || undefined,
        description: selectedItem.description || undefined,
        category: selectedItem.category,
        collectionId: selectedItem.collectionId,
        sortOrder: selectedItem.sortOrder,
        featuredOnHomepage: selectedItem.featuredOnHomepage,
        isPublished: selectedItem.isPublished,
      });

      const mapped: AdminGalleryItem = {
        id: result.id,
        src: result.url,
        alt: result.altText ?? "",
        title: result.title,
        description: result.description,
        category: result.category,
        collectionId: result.collectionId,
        sortOrder: result.sortOrder,
        featuredOnHomepage: result.featuredOnHomepage,
        isPublished: result.isPublished,
      };

      replaceGallery((current) => current.map((item) => (item.id === mapped.id ? mapped : item)));
      setSelectedItem(mapped);
      onMessage("Gallery item updated.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      onSaving(false);
    }
  }

  async function deleteSelectedItem() {
    if (!selectedItem?.id) {
      return;
    }

    onSaving(true);
    try {
      await adminDeleteRequest(`/api/cms/gallery/${selectedItem.id}`);
      replaceGallery((current) => current.filter((item) => item.id !== selectedItem.id));
      setSelectedItem(null);
      onMessage("Gallery item deleted.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      onSaving(false);
    }
  }

  async function reorderItem(id: string, direction: "up" | "down") {
    const items = [...collectionItems];
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    const orderedIds = items.map((item) => item.id);

    onSaving(true);
    try {
      await adminJsonRequest("/api/cms/gallery", "PATCH", {
        collectionId: activeCollectionId,
        orderedIds,
      });
      replaceGallery((current) =>
        current.map((item) => {
          const orderIndex = orderedIds.indexOf(item.id);
          return orderIndex >= 0 ? { ...item, sortOrder: orderIndex } : item;
        }),
      );
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Reorder failed.");
    } finally {
      onSaving(false);
    }
  }

  async function saveCollage() {
    if (!collageForm.name || !collageForm.slug || collageForm.imageIds.length === 0) {
      onMessage("Collage needs a name, slug, and at least one image.");
      return;
    }

    onSaving(true);
    onMessage(null);

    try {
      const payload = {
        name: collageForm.name,
        slug: collageForm.slug,
        layout: collageForm.layout,
        category: collageForm.category,
        collectionId: collageForm.collectionId ?? undefined,
        imageIds: collageForm.imageIds,
        isPublished: collageForm.isPublished,
      };

      const result = collageForm.id
        ? await adminJsonRequest<AdminGalleryCollage>(`/api/cms/collages/${collageForm.id}`, "PUT", payload)
        : await adminJsonRequest<AdminGalleryCollage>("/api/cms/collages", "POST", payload);

      replaceCollages((current) =>
        collageForm.id
          ? current.map((item) => (item.id === result.id ? { ...result, imageIds: collageForm.imageIds } : item))
          : [{ ...result, imageIds: collageForm.imageIds }, ...current],
      );
      setCollageForm({ ...result, imageIds: collageForm.imageIds });
      onMessage("Collage saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Collage save failed.");
    } finally {
      onSaving(false);
    }
  }

  function toggleCollageImage(id: string) {
    setCollageForm((current) => {
      const exists = current.imageIds.includes(id);
      return {
        ...current,
        imageIds: exists
          ? current.imageIds.filter((imageId) => imageId !== id)
          : [...current.imageIds, id],
      };
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Gallery collections</h2>
        <p className="mt-2 text-sm text-slate-600">
          Images stay grouped by collection — art, yoga nidra, and Japan events remain separate.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              onClick={() => {
                setActiveCollectionId(collection.id);
                setSelectedItem(null);
                setPendingUploads([]);
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                activeCollectionId === collection.id
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {collection.title}
            </button>
          ))}
        </div>

        {activeCollection ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              {GALLERY_CATEGORY_LABELS[activeCollection.category as keyof typeof GALLERY_CATEGORY_LABELS]} ·{" "}
              {collectionItems.length} image(s)
            </p>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {uploading ? "Uploading…" : "Upload multiple images"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => handleMultiUpload(event.target.files)}
                />
              </label>
              {pendingUploads.length > 0 ? (
                <button
                  type="button"
                  onClick={savePendingUploads}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Save {pendingUploads.length} pending upload(s)
                </button>
              ) : null}
            </div>

            {pendingUploads.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {pendingUploads.map((item, index) => (
                  <div key={item.url} className="rounded-2xl border border-slate-200 p-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                      <Image src={item.url} alt="" fill className="object-cover" unoptimized />
                    </div>
                    <input
                      value={item.title}
                      onChange={(event) =>
                        setPendingUploads((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, title: event.target.value } : entry,
                          ),
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Title"
                    />
                    <input
                      value={item.altText}
                      onChange={(event) =>
                        setPendingUploads((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, altText: event.target.value } : entry,
                          ),
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Alt text"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="grid gap-2">
              {collectionItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                    <Image src={item.src} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="min-w-0 flex-1 text-left text-sm text-slate-700"
                  >
                    <strong>{item.title || item.alt}</strong>
                    {item.featuredOnHomepage ? (
                      <span className="ml-2 text-xs text-emerald-700">Featured</span>
                    ) : null}
                  </button>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => reorderItem(item.id, "up")} disabled={index === 0} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40">↑</button>
                    <button type="button" onClick={() => reorderItem(item.id, "down")} disabled={index === collectionItems.length - 1} className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40">↓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {selectedItem ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Edit image</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm">
              Title
              <input value={selectedItem.title ?? ""} onChange={(event) => setSelectedItem({ ...selectedItem, title: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Alt text
              <input value={selectedItem.alt} onChange={(event) => setSelectedItem({ ...selectedItem, alt: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </label>
            <label className="block text-sm">
              Description
              <textarea value={selectedItem.description ?? ""} onChange={(event) => setSelectedItem({ ...selectedItem, description: event.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" rows={3} />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedItem.featuredOnHomepage ?? false}
                onChange={(event) => {
                  const featuredOnHomepage = event.target.checked;
                  setSelectedItem({ ...selectedItem, featuredOnHomepage });
                  replaceGallery((current) =>
                    current.map((item) =>
                      item.id === selectedItem.id ? { ...item, featuredOnHomepage } : item,
                    ),
                  );
                }}
              />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedItem.isPublished ?? true} onChange={(event) => setSelectedItem({ ...selectedItem, isPublished: event.target.checked })} />
              Published
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={saveSelectedItem} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save changes</button>
            <button type="button" onClick={deleteSelectedItem} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Delete</button>
          </div>
        </section>
      ) : null}

      <PreviewStudioLink
        href="/admin/content/preview"
        title="Preview studio — Homepage gallery"
        description="Open the full homepage preview studio to check gallery spacing, height, and layout alongside other sections."
        className="mb-6"
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Collages</h2>
        <p className="mt-2 text-sm text-slate-600">Structured layout presets tied to a collection. Reusable across sections.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {collages.map((collage) => (
            <button
              key={collage.id}
              type="button"
              onClick={() => setCollageForm(collage)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm hover:bg-slate-100"
            >
              {collage.name}
            </button>
          ))}
          <button type="button" onClick={() => setCollageForm({ ...emptyCollage, collectionId: activeCollectionId, category: activeCollection?.category ?? "ART" })} className="rounded-2xl border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-600">
            New collage
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <input value={collageForm.name} onChange={(event) => setCollageForm({ ...collageForm, name: event.target.value })} placeholder="Collage name" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input value={collageForm.slug} onChange={(event) => setCollageForm({ ...collageForm, slug: event.target.value })} placeholder="slug-for-url" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <select value={collageForm.layout} onChange={(event) => setCollageForm({ ...collageForm, layout: event.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
              {COLLAGE_LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>{COLLAGE_LAYOUT_LABELS[layout]}</option>
              ))}
            </select>
            <select value={collageForm.collectionId ?? ""} onChange={(event) => {
              const collection = collections.find((entry) => entry.id === event.target.value);
              setCollageForm({
                ...collageForm,
                collectionId: event.target.value || null,
                category: collection?.category ?? collageForm.category,
              });
            }} className="w-full rounded-xl border px-3 py-2 text-sm">
              <option value="">Select collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>{collection.title}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Select images from the active collection list above.</p>
            <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto">
              {collectionItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCollageImage(item.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border ${collageForm.imageIds.includes(item.id) ? "ring-2 ring-slate-900" : ""}`}
                >
                  <Image src={item.src} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
            <button type="button" onClick={saveCollage} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Save collage</button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Live preview</p>
            <PreviewViewport mode={collageViewport} onModeChange={setCollageViewport} maxHeight="min(60vh, 560px)">
              {previewCollageItems.length > 0 ? (
                <div className="p-3">
                  <CollageGrid layout={collageForm.layout as CollageLayout} items={previewCollageItems} />
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-500">Select images to preview this collage layout.</p>
              )}
            </PreviewViewport>
          </div>
        </div>
      </section>
    </div>
  );
}
