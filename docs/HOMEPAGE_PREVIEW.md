# Homepage & CMS preview architecture

## Unified preview system

All CMS pages now share one preview stack:

```
PageSectionsManager / ContentManager (forms only)
    └── link → Preview studio route
            └── SectionPreviewStudio
                    ├── PreviewViewport + PreviewViewportToggle (desktop / tablet / mobile)
                    ├── PreviewSectionFrame (click to select, LayoutOverrideProvider)
                    │       └── Shared section renderers
                    └── PreviewLayoutPanel (spacing, width, padding, layout sliders)
```

| Page | CMS admin | Preview route |
|------|-----------|---------------|
| Homepage | `/admin/content` | `/admin/content/preview` |
| Yoga / Healing / Just Art Life / About | `/admin/pages` | `/admin/pages/preview/[pageType]` |

Program pages use `ProgramPagePreviewStudio` (thin wrapper). Homepage uses `HomepagePreviewStudio` (thin wrapper). Both delegate to `SectionPreviewStudio`.

## Mobile preview strategy

`PreviewViewport` simulates device widths inside the admin panel:

| Mode    | Canvas width |
|---------|----------------|
| Desktop | Scaled 1280px virtual width |
| Tablet  | 768px |
| Mobile  | 390px |

Tailwind breakpoints respond to the canvas width, not the admin window. No iframes.

## Homepage section rendering

- **`HomepageSectionViews`** — presentational components shared by the public homepage and preview studio.
- **`HomepagePreviewStudio`** — maps homepage sections to virtual section records with `SectionLayoutSettings`.
- Layout saves persist to `SiteConfig.homepageLayout.sectionLayouts` via `PUT /api/cms/site`.
- Legacy flat spacing fields (`heroPaddingY`, `galleryHeight`, etc.) are migrated automatically when section layouts are absent.

## Program page rendering

Unchanged data path: server loads all `PageSection` rows (including drafts), renders via `PageSectionRenderer`, layout saves via `PUT /api/cms/page-sections/[id]`.

## Layout controls

| Surface | Controls |
|---------|----------|
| CMS forms | `LayoutEditor` preset dropdowns (program pages) |
| Preview studio | `PreviewLayoutPanel` sliders (all pages) |

Fine-tuned layout stays local in the preview studio until **Save layout** is clicked.

## Removed (duplicate systems)

- `preview/HomepagePreviewStudio.tsx` — partial inline preview with focus toggles
- `preview/HomepageSpacingPanel.tsx` — homepage-only spacing sliders

## Remaining gaps

- Unsaved form edits in Content Manager / Page Sections Manager are not reflected in preview (DB state only).
- About page hero (`/admin/content` → About) has no preview studio (body sections preview at `/admin/pages/preview/ABOUT`).
- Homepage pathways use `ProgramPathwaySection` without per-pathway `SectionLayoutShell` layout tokens yet.
- Hero on homepage still uses `--home-hero-*` CSS vars on the public site; preview maps slider values into those vars via `heroLayoutToCssVariables`.
