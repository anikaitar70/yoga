// Central documentation data for Nirvana Yoga Admin Help.
// Keep language client-friendly. No secrets. Reflects actual implementation.

export type HelpSection = {
  id: string;
  title: string;
  icon: string;
  summary: string;
  keywords: string[];
  body: HelpBlock[];
};

export type HelpBlock =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "p"; text: string }
  | { type: "note"; text: string; variant?: "info" | "warning" | "tip" }
  | { type: "steps"; items: string[] }
  | { type: "bullets"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "callout"; title: string; text: string };

export const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🌱",
    summary: "First time in the admin? Start here.",
    keywords: ["getting started", "login", "first time", "overview", "dashboard", "admin", "sign in", "github"],
    body: [
      { type: "h2", text: "Welcome" },
      { type: "p", text: "This guide explains how to manage your Nirvana Yoga website without needing a developer. Every button, page, and setting you see in the admin is covered here." },
      { type: "h2", text: "How to open the admin" },
      { type: "steps", items: ["Go to yoursite.com/admin in your browser.", "If you are not signed in you will see a login screen.", "Sign in with GitHub (your email must be on the allowlist) or the local admin account on localhost during development.", "After login you land on the Overview page that shows counts for Events, Blog posts, Subscribers, and Contact messages."] },
      { type: "note", variant: "info", text: "The admin is never visible to public visitors. All /admin pages require a valid session cookie." },
      { type: "h2", text: "How navigation works" },
      { type: "bullets", items: ["On desktop (Overview page) you see a sidebar with every admin section.", "On other pages you see a top bar with a ☰ hamburger button that opens the same menu.", "The menu highlights the current page. Tap the same item or press Escape to close the drawer."] },
      { type: "h2", text: "What you can do from here" },
      { type: "bullets", items: ["Manage Events, Special Events, Blog posts, and Testimonials.", "Edit all Program pages (Yoga / Healing / Just Art Affaire / About) and the homepage hero, about block, gallery, and footer.", "Manage the gallery collections/collages and image library.", "Review newsletter subscribers, contact messages, and site analytics.", "Tune design settings, typography, spacing, and layout per section.", "Use Preview studios to see changes before they go live."] },
    ],
  },
  {
    id: "admin-overview",
    title: "Understanding the Admin Panel",
    icon: "🧭",
    summary: "Every item in the admin menu explained.",
    keywords: ["admin panel", "menu", "navigation", "overview", "dashboard", "sidebar", "hamburger", "analytics", "sessions", "diagnostics"],
    body: [
      { type: "h2", text: "The menu items" },
      {
        type: "table",
        headers: ["Menu label", "Where it goes", "When to use it"],
        rows: [
          ["Overview", "/admin", "See counts; your starting point after login."],
          ["Events", "/admin/events", "Daily/weekly classes and sessions list shown on /events plus the Read More panels."],
          ["Special events", "/admin/special-events", "Retreat / intensive pages with a dedicated URL at /events/special/[slug]."],
          ["Blog posts", "/admin/blogs", "Articles shown on /blog and /blog/[slug]."],
          ["CMS", "/admin/content", "Central content hub: Hero, About, Footer, Homepage sections, Gallery, Testimonials selection, Collections, Collages, and SEO."],
          ["Testimonials", "/admin/testimonials", "Global testimonial library and the header/layout settings for the /testimonials page."],
          ["Design settings", "/admin/design", "Site-wide typography, colors, spacing, and layout defaults."],
          ["Program pages", "/admin/pages", "Section editor for Yoga, Healing, Just Art Affaire, and About pages."],
          ["Subscribers", "/admin/subscribers", "Newsletter signups from the footer form."],
          ["Contacts", "/admin/contact", "Messages from the Contact page form."],
          ["Analytics", "/admin/analytics", "Page views recorded for public pages."],
          ["Sessions", "/admin/sessions", "Active admin login sessions - revoke if needed."],
          ["Diagnostics", "/admin/diagnostics", "Error log for uploads, CMS saves, and OCR failures."],
          ["Help & Documentation", "/admin/help", "This guide (you are here)."],
        ],
      },
      { type: "h2", text: "Section vs page - the key idea" },
      { type: "p", text: "A Page (e.g. Yoga) is made of Sections stacked vertically. Each section has a Type (Image + text, Gallery, Testimonials, etc.) and its own content, images, and layout controls. Reordering sections changes the order visitors see them on the public site." },
      { type: "h2", text: "Saved vs Published" },
      { type: "bullets", items: ["Save draft: stored in the database but the public site still shows the last published version. Use it while you are still editing.", "Publish: makes the section live. Visitors see it on their next page load (cache refreshes automatically for both English and Japanese).", "Delete: removes the section from the public page immediately. There is no undo - a deleted section must be recreated."] },
    ],
  },
  {
    id: "pages",
    title: "Pages",
    icon: "📄",
    summary: "Public pages and where their content comes from.",
    keywords: ["pages", "public", "home", "about", "yoga", "healing", "just art", "events", "gallery", "blog", "contact"],
    body: [
      { type: "h2", text: "Which public pages exist" },
      {
        type: "table",
        headers: ["Public URL", "Admin source"],
        rows: [
          ["/  (Home)", "CMS -> Hero, Homepage sections, Testimonials & Gallery"],
          ["/about", "CMS -> About page hero  +  Program pages -> About sections"],
          ["/yoga", "Program pages -> Yoga"],
          ["/healing", "Program pages -> Healing"],
          ["/just-art-life", "Program pages -> Just Art Affaire"],
          ["/events", "Events manager"],
          ["/events/special/[slug]", "Special events -> each event's Page content sections"],
          ["/gallery", "CMS -> Gallery tab"],
          ["/blog  and  /blog/[slug]", "Blog posts"],
          ["/testimonials", "Testimonials library + Page header controls"],
          ["/contact", "Site contact block in CMS (bottom of Content page)"],
        ],
      },
      { type: "h2", text: "What the admin calls a 'Page' vs a 'Page section'" },
      { type: "bullets", items: ["PageType = YOGA / HEALING / JUST_ART_LIFE / ABOUT. Selected with tabs at the top of Program pages.", "Page section = one block inside that page (Image + text, Custom text block, Gallery, Testimonials, etc.). You can add, edit, reorder with arrows, publish as draft, or delete."] },
      { type: "note", variant: "tip", text: "If a program page shows an empty-state placeholder on the public site, it means no sections are published yet for that PageType. Add and Publish a section in Program pages." },
    ],
  },
  {
    id: "page-sections",
    title: "Page Sections",
    icon: "🧱",
    summary: "How to add, edit, reorder, and publish sections.",
    keywords: ["sections", "add section", "remove", "delete", "reorder", "publish", "draft", "sort", "layout"],
    body: [
      { type: "h2", text: "How to edit a section" },
      {
        type: "steps",
        items: [
          "Open Program pages (for YOGA/HEALING/JUST_ART_LIFE/ABOUT) or open a Special event detail page for special event sections.",
          "At the top you see tabs or a list of existing sections. Each row shows the Title, Type, #anchorSlug (special events only), and Published/Draft badge.",
          "Click Edit (pencil icon) on the section you want to change. The editor scrolls into view and focuses the Title field.",
          "Change Title, Subtitle, Body, Image, and any Type-specific fields.",
          "Use the Layout panel for spacing, width, alignment, backgrounds, and font-size overrides.",
          "Press Save draft to keep working, or Publish to make it live. Preview the page to confirm.",
          "Click Close to hide the editor.",
        ],
      },
      { type: "h2", text: "How to add a section" },
      { type: "steps", items: ["Choose Add section -> select a type (e.g. Image + text) from the dropdown.", "A new draft section is created at the bottom of the list and the editor opens automatically.", "Fill the required fields (see each section type below) and press Save draft or Publish."] },
      { type: "h2", text: "How to reorder" },
      { type: "p", text: "Use the ↑ / ↓ arrow buttons on each section row. The new order is saved immediately via /api/cms/page-sections/reorder (or /api/events/[id]/page-sections/reorder for special events) and reflected on the public page after the cache refreshes." },
      { type: "h2", text: "How to delete" },
      { type: "p", text: "Click the trash icon. You will be asked to confirm. Deletion is permanent and calls DELETE /api/cms/page-sections/[id] (or the event-scoped equivalent). Refresh the public page - if it still shows old content, hard-refresh (Ctrl+F5) and wait a few seconds for the revalidation tag to clear." },
      { type: "note", variant: "warning", text: "There is no undo for deleted sections. If you delete by accident, recreate the section and paste content back from browser history or the preview studio if you still have the tab open." },
    ],
  },
  {
    id: "text-formatting",
    title: "Text Editing & Formatting",
    icon: "✍️",
    summary: "Rich text toolbar: what each button does.",
    keywords: ["text", "rich text", "formatting", "bold", "italic", "underline", "highlight", "lists", "alignment", "heading", "paragraph"],
    body: [
      { type: "h2", text: "Where rich text is available" },
      { type: "bullets", items: ["Program page section Body, Special event General -> Summary / Japanese summary, Blog post content, About paragraphs, and many Custom Text payload paragraphs.", "Title / Subtitle fields are plain text (single line) - they do not show the rich text toolbar. Formatting there is via the Section Text style toggles (B/I/U) in the Layout panel."] },
      { type: "h2", text: "Toolbar buttons (RichTextEditor)" },
      {
        type: "table",
        headers: ["Button", "What it does", "Shortcut"],
        rows: [
          ["B", "Bold the selected text", "Ctrl+B / Cmd+B"],
          ["I", "Italic", "Ctrl+I"],
          ["U", "Underline", "Ctrl+U"],
          ["◍ + color", "Highlight color - pick a color; uses execCommand hiliteColor. Select text first, then pick the color.", "-"],
          ["• ≡", "Bullet (unordered) list", "-"],
          ["1. ≡", "Numbered (ordered) list", "-"],
          ["L / C / R / J", "Align left / center / right / justify. Applies to the current paragraph.", "-"],
          ["⌫ᶠ", "Clear formatting - removes bold/italic/underline/highlight from selection.", "-"],
        ],
      },
      { type: "h2", text: "Pasting" },
      { type: "p", text: "Pasting strips rich formatting and inserts plain text only. This is intentional to avoid messy Word/Google Docs HTML. Re-apply bold/italic/lists with the toolbar after pasting." },
      { type: "h2", text: "Why a button may be inactive" },
      { type: "bullets", items: ["If the field is a single-line input (Title, Subtitle, image alt), the toolbar is not shown at all - that field is plain text by design.", "List and alignment buttons apply to paragraphs; place the cursor in a non-empty paragraph before clicking.", "Highlight works only on a selection - select text, then pick a color."] },
      { type: "faq", items: [{ q: "My headings look like plain paragraphs", a: "Body fields do not have explicit H1/H2 dropdowns. Use bold or increase heading font size in the Layout -> Font size controls for whole-section heading sizing." }] },
    ],
  },
  {
    id: "typography",
    title: "Typography & Font Size",
    icon: "🔤",
    summary: "Change heading and body sizes per section.",
    keywords: ["typography", "font size", "heading size", "body", "text width", "alignment", "weight", "underline", "font"],
    body: [
      { type: "h2", text: "Two places typography is controlled" },
      { type: "bullets", items: ["Design settings (/admin/design) - global defaults for headings and body that every section inherits.", "Section-level Font size panel inside each section's Layout -> Font size - this section - overrides the global size for that section only."] },
      { type: "h2", text: "Section Font size controls" },
      { type: "bullets", items: ["Heading font size - controls title + section headings inside that section. Default shown as 32px fallback.", "Body font size - controls all paragraph text inside that section. Default 16px.", "Both use sliders with a live px number. Copy the number to another section to reproduce the same size.", "Reset heading/body size to global - clears the override and the section inherits the Design settings value again."] },
      { type: "h2", text: "Section Text style toggles (B - Bold / I - Italic / U - Underline)" },
      { type: "p", text: "In the Layout panel you can toggle Bold, Italic, or Underline for the whole section. This applies to the section title/subtitle/content and is faster than selecting every line." },
      { type: "h2", text: "Text alignment" },
      { type: "bullets", items: ["Left / Center / Right / Justify dropdown in the Layout panel.", "For Image + text items, alignment interacts with Image side (left/right) - center is useful for narrow text columns."] },
      { type: "note", variant: "info", text: "If a heading size won't change, check whether the section has a font-size override active. Clear it to inherit the global design setting." },
    ],
  },
  {
    id: "spacing-layout",
    title: "Layout & Spacing Controls",
    icon: "📐",
    summary: "Every slider explained: padding, gap, width.",
    keywords: ["spacing", "layout", "padding", "gap", "width", "max width", "image width", "slider", "heading offset", "top padding", "bottom padding"],
    body: [
      { type: "h2", text: "Where to find layout controls" },
      { type: "p", text: "In every section editor, below the content fields, there is a collapsed Layout panel. For Program pages the simple presets (Spacing: Tight/Normal/Spacious and Content width: Narrow/Normal/Wide) are shown inline; fine-tuning sliders live in the Preview studio. Special event sections expose all sliders directly in the layout editor." },
      {
        type: "table",
        headers: ["Control", "What it does"],
        rows: [
          ["Section spacing (preset)", "Tight / Normal / Spacious - maps to top 24/0/48px and bottom 32/0/64px padding quickly."],
          ["Content width (preset)", "Narrow 672px / Normal 896px / Wide 1152px - width of the inner column."],
          ["Text alignment", "Left / Center / Right / Justify for body text."],
          ["Text style B/I/U", "Whole-section bold/italic/underline toggles (see Typography)."],
          ["Section background", "Auto (default) / None / Solid colour / Image - paint behind the entire section. Use the color picker or ImageUploadField that appears."],
          ["Text background", "Same choices but only behind the text column."],
          ["Font size - this section", "Per-section heading and body px overrides (see Typography)."],
          ["Heading horizontal offset", "−120 to 120px, step 4 - moves the heading with CSS transform (no layout shift). 0 = centered per alignment. Copy the number to reproduce on another heading."],
          ["Gap below heading", "0-48px - space between heading and subtitle/content. Collapsed when subtitle empty."],
          ["Section top padding", "0-160px - space above the section."],
          ["Section bottom padding", "0-160px - space below the section."],
          ["Gap below section", "0-120px - margin between this section and the next one."],
          ["Content max width", "400-1400px - container width in px."],
          ["Text max width", "320-900px - line length for readable body text."],
          ["Image height / Aspect", "For IMAGE_TEXT sections: auto / landscape 16:9 / wide 21:9 / square / compact 4:3 presets plus a fine-tuned height slider."],
          ["Image side", "Left or right on desktop for Image + text items."],
          ["Gallery style", "Horizontal scroll / Masonry / Grid / Immersive (GALLERY sections only)."],
        ],
      },
      { type: "note", variant: "tip", text: "Every slider shows its numeric px value. Write that number down to match spacing exactly in another section." },
    ],
  },
  {
    id: "toc",
    title: "Table of Contents",
    icon: "📑",
    summary: "How the special event TOC is built and customized.",
    keywords: ["table of contents", "toc", "anchor", "heading", "special event", "navigation", "spacing", "bold", "underline"],
    body: [
      { type: "h2", text: "What it is" },
      { type: "p", text: "On a Special Event public page a table of contents appears near the top so visitors can jump to any section. Each entry links to an #anchorSlug - a stable ID that never changes even if you edit the section title." },
      { type: "h2", text: "Two modes" },
      { type: "bullets", items: ["AUTOMATIC - entries are generated from each published section's Title, ordered the same as the sections. This is the default.", "CUSTOM - you hand-pick and label entries in the SpecialEventTocEditor. Use this when automatic titles are too long or you want to skip a section."] },
      { type: "h2", text: "How to customize (SpecialEventTocEditor)" },
      { type: "steps", items: ["Open the special event detail page (/admin/special-events/[id]).", "Scroll to the Table of Contents block below Page content.", "Switch between Automatic and Custom. In Custom mode: add, rename, reorder, or remove entries; each maps to a section anchorSlug.", "Click Save. The change is live after refresh."] },
      { type: "h2", text: "Spacing and formatting" },
      { type: "bullets", items: ["TOC item spacing in the Design / layout settings controls vertical gap between entries.", "Bold / Underline / Italic on TOC text is controlled by the same typography controls as section headings.", "Changing a section title updates the automatic TOC entry automatically. In Custom mode the override label stays until you edit it."] },
      {
        type: "faq",
        items: [
          { q: "I changed a heading but the TOC didn't change.", a: "You are in CUSTOM mode - edit the override label manually, or switch back to AUTOMATIC." },
          { q: "I don't see a heading in the TOC.", a: "That section is a Draft (unpublished) or its title is empty. Publish it and refresh." },
          { q: "I want more space between entries.", a: "Increase the TOC item spacing / Section gap slider and save. Copy the px number to reproduce elsewhere." },
        ],
      },
    ],
  },
  {
    id: "buttons-cta",
    title: "Buttons & Call-to-Actions",
    icon: "🔘",
    summary: "Add and test clickable buttons.",
    keywords: ["button", "cta", "call to action", "link", "url", "href", "contact", "external", "target blank"],
    body: [
      { type: "h2", text: "Where buttons exist" },
      { type: "bullets", items: ["Section type BUTTON inside any Program page or Special event - full control over label (EN+JA), URL, variant, size, alignment, and supporting text.", "Hero primary / secondary CTA on the homepage (CMS -> Hero).", "Special event Primary CTA / redirect block: separate from the event card external link. Show it by filling Button text and Button URL; leave both blank to hide it.", "Event card external link on the /events list (per event: External URL + External link label, e.g. 'Register')."] },
      {
        type: "table",
        headers: ["Field", "What to enter"],
        rows: [
          ["Button label - English", "Text visitors see, e.g. 'Book your retreat'"],
          ["Button label - Japanese", "Auto-translated via Gemini; editable. Use 'Translate / Regenerate Japanese' to regenerate."],
          ["Link (href)", "Either an internal path like /contact or a full https:// URL for an external site."],
          ["Open in new tab", "Check to open external links in a new tab."],
          ["Variant", "Primary (dark) / Warm / Secondary / Ghost - visual style."],
          ["Size", "Small / Medium / Large - padding and font size."],
          ["Alignment", "Left / Center / Right - where the button sits in its row."],
          ["Supporting text (EN/JA)", "Optional rich-text above or below the button (e.g. 'Limited spots')."],
        ],
      },
      { type: "h2", text: "What each button does / when to use it" },
      {
        type: "table",
        headers: ["Question", "Answer"],
        rows: [
          ["What does this button do?", "It navigates visitors to the href you entered - either an internal page (e.g. /contact, /yoga) or an external site (https://…). On the public site the ButtonSectionBlock renders a real <a> with hover styles; preview shows the same."],
          ["When should I use a BUTTON section?", "Use it for a single prominent action mid-page (e.g. Book this retreat, Contact us). For hero actions, use CMS -> Hero instead."],
          ["What happens after I click Save?", "The label/href are written to the PageSection/EventPageSection payload JSON. Publish the section and open /preview then the live URL - clicking the button should navigate or open a new tab if targetBlank/external."],
          ["Where will the change appear?", "Wherever that section sits - Yoga, Healing, About, or a special event dedicated page. The button appears centered / left / right as you set alignment."],
          ["Does it affect English, Japanese, or both?", "The BUTTON payload has label + labelJa and supportingText + supportingTextJa. Fill EN and click Translate / Regenerate Japanese for JA. The public JA page shows labelJa when present, otherwise label."],
          ["Do I need to save? Do I need to publish?", "Yes - edit the BUTTON section fields, then click Save draft (preview-only) or Publish (live). Site header/hero CTAs have their own Save hero/site buttons."],
          ["Can I undo? Will deleting permanently delete?", "Deleting a BUTTON section removes that row permanently - same as any section. Editing label/href can be undone only by retyping the old value."],
        ],
      },
      { type: "h2", text: "How to test a button" },
      { type: "steps", items: ["Publish the section and open the Preview studio link, or view the live page (/yoga etc. or /events/special/[slug]).", "Click the button. For internal links the URL should match a public page; for external links the new tab should open (targetBlank or https:// auto-opens external).", "If clicking does nothing, check that both Button label and Button URL are non-empty and the URL starts with / or https://. An empty href renders no link at all."] },
      { type: "note", variant: "warning", text: "Don't leave the button URL blank except to intentionally hide the button. A blank href renders no link on the public site. The public ButtonSectionBlock verifies href and localizes internal links via localizedPath." },
    ],
  },
  {
    id: "translation",
    title: "English & Japanese Translation",
    icon: "🌐",
    summary: "How EN -> JA works and when to edit Japanese manually.",
    keywords: ["translation", "japanese", "ja", "english", "locale", "gemini", "machine", "human reviewed", "translate button"],
    body: [
      { type: "h2", text: "How it works" },
      { type: "bullets", items: ["English is the primary editing language. You fill EN fields first.", "Japanese content lives alongside EN in parallel fields: JA locale columns (Event.jaLocale, BlogPost.jaLocale, EventPageSection.jaLocale, SiteConfig.localeContent, Testimonial.jaLocale) and EN/JA tab editors (LocaleEditorTabs).", "When JA is empty on the public site, visitors see the English content. That is intentional and not an error.", "Machine translation via Google Gemini (server-side, needs GEMINI_API_KEY + TRANSLATE_MODEL) can fill JA fields for you. Rich HTML tags are preserved."] },
      { type: "h2", text: "The EN / JA tabs" },
      { type: "p", text: "In section editors you see EN | JA tabs (or EN | 日本語). Switch to JA to see placeholder text from EN and fill the Japanese. A MachineTranslationNote banner reminds you that auto-generated JA is machine translation." },
      { type: "h2", text: "Translate buttons" },
      {
        type: "table",
        headers: ["Button", "What it does"],
        rows: [
          ["Translate title / subtitle to Japanese", "Translates that single field via POST /api/translate { plainText }. Prefixes machine banner and sets review status MACHINE."],
          ["Translate / Regenerate Japanese (items & buttons)", "Translates rich HTML via POST /api/translate { html } preserving tags for Image+Text items and Button labels/supporting text."],
          ["Translate field helpers in Testimonials/Blog/Special event JA locales", "Same Gemini-backed translation for the selected field."],
        ],
      },
      { type: "h2", text: "Does changing English overwrite Japanese?" },
      { type: "p", text: "No - except in the Image+Text JavaScript merging used on save: the JS sanitizer may choose to include JA if required, but your existing JA text is never auto-overwritten unless you click a Translate button again. To update JA after editing EN, click Translate again to regenerate, then review and correct." },
      { type: "h2", text: "Machine vs Human Reviewed" },
      { type: "bullets", items: ["TranslationReviewStatus = MACHINE when Gemini produced the text.", "When you manually correct any Japanese field and Save, it becomes HUMAN_REVIEWED.", "A public TranslationDisclaimer banner marks machine-translated JA pages so visitors know."] },
      { type: "h2", text: "Public language switching" },
      { type: "p", text: "Visitors switch via the language selector in the header. URLs are /... for English and /ja/... for Japanese. The proxy (src/proxy.ts) rewrites /ja/* to the underlying page and sets x-nirvana-locale: ja. The same page is served for both locales - only the resolved content differs." },
      { type: "note", variant: "info", text: "If Gemini is not configured (no GEMINI_API_KEY in server .env), the Translate buttons will return a clear error: 'GEMINI_API_KEY not configured ...' - fill Japanese manually in that case. The key is server-side only (src/lib/translate-server.ts -> Google Generative Language API) and never appears in the browser, clipboard, or documentation." },
      {
        type: "faq",
        items: [
          { q: "What happens if I only change English?", a: "Only the EN fields change. JA fields you already filled stay exactly as you left them. Visitors on /ja/... will still see your old JA until you click Translate / Regenerate Japanese and save." },
          { q: "What happens to Japanese translation after I save EN?", a: "Nothing automatically - your existing JA is preserved. Click any Translate / Regenerate Japanese button to overwrite JA with a fresh Gemini translation, then review and save." },
          { q: "Do I need to maintain duplicate English and Japanese manually?", a: "No. Fill English, click Translate buttons for each field (including per-item Translate for Image+Text items and Button labels). Review the Japanese that appears and tweak if needed. The server keeps the result." },
          { q: "Does deleting English delete Japanese?", a: "If you delete a whole section or event, both languages for that item are gone. If you only clear the EN title/content, the JA field still exists in the row but the public EN page will lack that text. Always keep both or clear both intentionally." },
          { q: "Will Japanese auto-appear on the frontend without me doing anything?", a: "If a JA field is empty, the public JA page falls back to English - no blank page. A banner tells Japanese visitors the content is machine-translated when it was auto-generated." },
        ],
      },
    ],
  },
  {
    id: "program-pages",
    title: "Program Pages",
    icon: "🧘",
    summary: "Yoga / Healing / Just Art Affaire / About guides.",
    keywords: ["program pages", "yoga", "healing", "just art", "about", "sections", "layout", "preview", "publish"],
    body: [
      { type: "h2", text: "What they are" },
      { type: "p", text: "Program pages live under /admin/pages. At the top you pick which page to edit: Yoga, Healing, Just Art Affaire, or About. Each page is a stack of ordered sections you create." },
      { type: "h2", text: "Section types you can add" },
      {
        type: "table",
        headers: ["Type", "Use when"],
        rows: [
          ["Hero / introduction", "Top banner / opening text."],
          ["Image + text", "Unified multi-item editor - each item has an image + rich text (EN+JA), layout direction and image sizing. Replaces the legacy Dynamic Image + Text."],
          ["Gallery", "Horizontal / masonry / grid / immersive photo strips. Pulls from image library or category/collection fallback."],
          ["Testimonials", "Manual cards or selected existing testimonials (see Testimonials selector below the list)."],
          ["Upcoming events", "Filtered Event list by categories / kind (sessions vs retreats)."],
          ["Contact / inquiry", "CTA block with form toggle."],
          ["Custom text block", "Rich journey/philosophy variants with sutras, highlights, and timelines."],
          ["Button / Call to action", "Standalone button row with full styling and supporting text."],
        ],
      },
      { type: "h2", text: "Editing flow" },
      { type: "steps", items: ["Select the page tab (e.g. Yoga).", "See existing sections ordered with arrows and status badges.", "Click Edit on one, or Add section -> pick a type.", "Fill Title, Subtitle, Body, Image, and type-specific fields. Use the EN/JA tabs for Japanese (or Translate buttons).", "Open the Layout editor for spacing/width/alignment/backgrounds/font size.", "Save draft to keep editing; Publish when ready. Open Preview studio - Yoga to verify.", "The bottom panel Testimonials for this page lets you select existing testimonials to feature just on that page (leave empty to use manual section items or the global fallback)."] },
      { type: "note", variant: "tip", text: "Preview studio link goes to /admin/pages/preview/[pageType] - it renders your saved sections with the same styles as the public site for accurate checking." },
    ],
  },
  {
    id: "special-events",
    title: "Special Events",
    icon: "🎪",
    summary: "Retreats & intensive event pages - the most detailed editor.",
    keywords: ["special events", "retreat", "event", "schedule", "date", "location", "cta", "preview", "slug", "publish", "sections"],
    body: [
      { type: "h2", text: "What a special event is" },
      { type: "p", text: "A Special Event is an Event row with isSpecialEvent = true. It gets both a card on the main /events list and its own dedicated page at /events/special/[slug]. Regular events only have the card." },
      { type: "h2", text: "Where they appear after saving" },
      { type: "bullets", items: ["Published + isSpecialEvent true -> card appears on /events (filtered with other events) and the dedicated page is reachable via the card link or direct URL.", "Published but not isSpecialEvent (via /admin/events) -> only the card on /events; no dedicated page.", "Draft / unpublished -> not visible on the public site at all; only in admin and in Preview (drafts) studios."] },
      { type: "h2", text: "How to create a special event" },
      { type: "steps", items: ["Go to Special events -> click + New special event (or Create).", "Fill Title - the slug auto-derives from title; you can edit it manually. Slugs must be unique.", "Fill Summary (description), Location, Category, Starts/Ends dates, and Hero image.", "Upload or choose an image via ImageUploadField (section=events). Alt text helps accessibility/SEO.", "Choose Published / Featured toggles.", "Fill SEO fields (title, description, og image, keywords) if desired.", "If you need a button on the dedicated page, fill Primary CTA / redirect: Button text + Button URL (https://… or /contact). Leave both blank to hide.", "Click Save general settings. The response validates title/location/dates/slug uniqueness and shows field errors inline if anything fails.", "Then scroll to Page content and add sections (Image + text items, Custom text, BUTTON, Gallery, etc.) - see Program pages for type details.", "Configure the Table of Contents (Automatic vs Custom) and select Testimonials for this event.", "Save each section (Save draft or Publish section). Use Preview (drafts) to check unpublished content and View live page for the public URL."] },
      { type: "h2", text: "Editing fields - what each means" },
      {
        type: "table",
        headers: ["Field", "What to do"],
        rows: [
          ["Title", "Shown on the card and the dedicated page header."],
          ["Slug", "URL part for /events/special/[slug]. Lowercase letters, numbers, hyphens recommended."],
          ["Summary / Description", "Rich text summary. Shown on the card and near the header."],
          ["Location", "Venue / city name shown on the card."],
          ["Starts / Ends", "Datetime-local fields - shown on card + page header."],
          ["Hero image", "Top image for the dedicated page. Max 15MB, JPEG/PNG/WebP/GIF/SVG."],
          ["Category", "EventCategory (YOGA / HEALING / ...). Filters which events appear on program pages."],
          ["Price", "Optional display price."],
          ["Published", "Unchecked = hidden everywhere public."],
          ["Featured", "Whether the event is highlighted in featured sections."],
          ["Primary CTA / redirect", "Dedicated page button; separate from the /events card external link."],
          ["SEO fields", "SeoFieldsEditor: seoTitle, metaDescription, ogImageUrl, canonicalUrlOverride, focusKeywords - used for search sharing."],
        ],
      },
      { type: "h2", text: "Admin editor vs Preview vs Live website" },
      {
        type: "table",
        headers: ["Surface", "What it shows"],
        rows: [
          ["Admin editor", "Editable forms; shows both drafts and published sections with badges."],
          ["Preview (drafts)", "/admin/special-events/[id]/preview - renders drafts too so you can review before publishing. Opens in a new tab."],
          ["View live page", "/events/special/[slug] - public page; shows only Published sections. What visitors (and Google) see."],
        ],
      },
      { type: "note", variant: "info", text: "Changing a section title does NOT change its anchorSlug - TOC deep-links stay valid after renaming. Preview is at /admin/special-events/[id]/preview (shows drafts + published); Live is at /events/special/[slug] (shows only Published). Unsaved edits do not appear in either until you click Save general settings or Save draft / Publish on the section. If Preview shows your change but Live does not, you saved as Draft - click Publish on that section." },
      {
        type: "faq",
        items: [
          { q: "What does Save draft do vs Publish?", a: "Save draft writes your changes to the database but hides that section from visitors. Preview studios show it. Publish makes it live immediately on both EN and JA after cache revalidation." },
          { q: "Where will my change appear?", a: "General fields (title/date/location/hero image/CTA) appear on both the /events list card and the dedicated page header. Page content sections appear only on /events/special/[slug] (and /ja/events/special/[slug])." },
          { q: "Does it affect English, Japanese, or both?", a: "General has EN and JA tabs - fill both or translate. Page sections each have an EN/JA toggle for title/subtitle/content and per-item Translate for Image+Text items. An empty JA field falls back to EN on /ja/." },
          { q: "Can I undo / recover from a mistake?", a: "Saving is immediate to the database. There is no undo for deleted sections - recreate and paste back. For text edits, the browser back/undo (Ctrl+Z) works only until you leave the page." },
          { q: "Will deleting this permanently delete it?", a: "Yes - Delete removes the EventPageSection row from the database and the anchorSlug. It disappears from Preview and Live on next load." },
        ],
      },
    ],
  },
  {
    id: "testimonials",
    title: "Testimonials",
    icon: "💬",
    summary: "Library, page selection, and the 'exists vs selected' distinction.",
    keywords: ["testimonials", "quote", "review", "selector", "featured", "approved", "ocr", "card", "handwritten"],
    body: [
      { type: "h2", text: "The critical distinction" },
      { type: "callout", title: "Exists vs Selected for this page", text: "\"Exists globally\" means the testimonial is in the library and visible on /testimonials. \"Selected for this page\" means a Program page or Special event explicitly chose it for its own testimonials block. A testimonial can exist globally but not appear on the Yoga page if it was never selected there." },
      { type: "h2", text: "Global library - /admin/testimonials" },
      {
        type: "bullets",
        items: [
          "The top Page header card controls the title, subtitle (EN+JA), layout (Grid vs List), content width, section spacing, and card gap shown on the public /testimonials page. Save with Save page settings after choosing layout/content width/section spacing/card gap. Choose Custom gap to type a precise px value.",
          "Below is TestimonialManager: list of all testimonials with sort arrows (order is exact on the public page), status badge (APPROVED / PENDING / REJECTED), and actions: Edit (inline form for quote, name, role, city, country, photo, alt, sourceType, displayStyle, ocrConfidence, featured, status), Save, and Delete.",
          "New testimonials are created via the Add testimonial form; quotes and name/role are the minimum. Images are optional but recommended for cards.",
          "Source type TEXT / IMAGE / OCR and display style CARD / HANDWRITTEN affect how the card renders. OCR results appear in extractedText after tesseract.js processing (ENG only, tesseract 45s timeout).",
          "Japanese fields live in the JA locale column - switch EN/JA tabs and use Translate buttons where shown.",
        ],
      },
      { type: "h2", text: "Selecting testimonials for a specific page" },
      {
        type: "steps",
        items: [
          "Program pages: scroll below the section list to 'Testimonials for this page'. This is a TestimonialSelector scoped to that PageType.",
          "Special events: same selector appears in the event detail below TOC as 'Testimonials for this event'.",
          "Homepage (CMS -> Homepage): HomepageTestimonial selector chooses up to 3 testimonials for the home testimonials section.",
          "Check the testimonials you want to feature there; reorder inside the selector if it supports ordering; save the selection.",
          "Leave the selector empty to fall back to manual testimonial section items (if a TESTIMONIALS section has items) or the global fallback set.",
        ],
      },
      { type: "h2", text: "Manual testimonial section items vs selected library" },
      { type: "bullets", items: ["A Program/Special Event TESTIMONIALS section type can have manual items (quote/name/role/image rows) entered directly in the section payload. These are not library entries.", "If the selector for that page is non-empty, it overrides manual items on the live page - visitors see the selected library entries. If the selector is empty, manual section items render; if those are empty too, a global fallback renders.", "To add a new testimonial to a page: first create it in the global library (/admin/testimonials), then check it in the selector for that page."] },
      { type: "h2", text: "CMS Content -> Testimonials quick selector" },
      { type: "p", text: "Inside /admin/content -> Testimonials sub-tab there is also a TestimonialSelector that controls which testimonials are featured on the homepage experience carousel and similar blocks; it is not the same as the program page selectors." },
      {
        type: "faq",
        items: [
          { q: "Testimonial is in admin but not on the public site.", a: "Check three things: 1) Its status is APPROVED (not PENDING/REJECTED). 2) For a program/special-event block, it is checked in that page's selector OR present as a manual item. 3) The section containing it is Published (not Draft). Then hard-refresh the public page." },
          { q: "How to reorder testimonials.", a: "Use the ↑↓ arrows. On the global library order is exact on the public page; on program page selectors the selector order wins. Save and refresh the live page." },
          { q: "Can guests submit testimonials?", a: "Yes - public POST /api/testimonials creates a PENDING entry that you approve in admin. Submissions come from the public testimonials form." },
        ],
      },
    ],
  },
  {
    id: "navigation-menu",
    title: "Navigation & Menu",
    icon: "☰",
    summary: "How to edit the header & hamburger menu links.",
    keywords: ["navigation", "menu", "hamburger", "desktop", "links", "pages", "header", "nav", "reorder"],
    body: [
      { type: "h2", text: "What visitors see" },
      { type: "bullets", items: ["Desktop: horizontal bar in the header. Each item is one link (label + destination) from your navigation list. The header uses whitespace-nowrap + flex-nowrap so long labels like Just Art Affaire never wrap onto a second line.", "Mobile: the same links appear behind the ☰ hamburger drawer that slides from the left. Secondary links (Gallery, Blog, Contact, Testimonials) also appear under More.", "The public language switcher (EN | JA) sits beside the navigation and rewrites URLs to /ja/..."] },
      { type: "h2", text: "Where to edit navigation" },
      { type: "bullets", items: ["Go to CMS -> Site & footer tab. Near the top you see the Navigation links editor with one row per menu item.", "Each row has two fields: Label (text visitors see, e.g. Yoga) and Link / href (destination - use /yoga, /events, /gallery, /blog, /contact, /testimonials for internal pages, or a full https://… for an external URL).", "Use ↑ / ↓ to reorder, ✕ to remove a row, + Add link to add a new row. Blank rows (empty label or empty link) are ignored on save."] },
      { type: "h2", text: "How to save" },
      { type: "steps", items: ["Edit labels/links or reorder rows in the Navigation links editor.", "Scroll to the bottom of the Site / footer card and click Save site config.", "Confirmation says Saved successfully. The header and hamburger menu update on the next page load (cache revalidated for both EN and JA).", "Do I need to publish separately? No - saving site config is the publish for navigation. There is no per-item publish."] },
      { type: "h2", text: "When to use it / common tasks" },
      {
        type: "table",
        headers: ["I want to…", "How"],
        rows: [
          ["Change a label (e.g. Yoga -> Classes)", "Edit the Label field in that row and save. English label changes do not auto-translate - update the JA locale path via the Translate flow if needed."],
          ["Change where a link goes", "Edit the href field (e.g. /yoga -> /healing) and save."],
          ["Add a new page to the menu", "Add a row with the page's label and href (e.g. Retreats | /events). Save. The target page must already exist (use its slug)."],
          ["Remove a link from the menu", "Click ✕ on that row and save. The page still exists at its direct URL - visitors can still reach it via /events/special/[slug] or shared links."],
          ["Reorder links", "Use ↑↓ arrows, then Save site config."],
        ],
      },
      { type: "note", variant: "tip", text: "Desktop shows primary links (Home, About, Yoga, Healing, Just Art Affaire, Events…) in the top bar; the secondary set (Gallery, Blog, Contact, Testimonials) stays under More on mobile. Rearranging order in the editor rearranges both." },
      { type: "faq", items: [{ q: "I added a Special event but don't see it in the menu", a: "That is normal - add a row for it (label + /events/special/your-slug) and save if you want it in the menu. Otherwise its slug URL still works when shared." }] },
    ],
  },
  {
    id: "footer",
    title: "Footer",
    icon: "🏁",
    summary: "Editable footer: branding, credentials, links, newsletter, socials.",
    keywords: ["footer", "logo", "credentials", "newsletter", "email", "location", "instagram", "youtube", "social", "page seo"],
    body: [
      { type: "h2", text: "What can be edited" },
      {
        type: "table",
        headers: ["Footer area", "What you control", "Where in admin"],
        rows: [
          ["Logos", "Two brand logos (Nirvana Yoga + Just Art Affaire) via BrandingEditor; each logo has a scale slider 0.5x to 4x. Result shown in navbar, footer, hero, and admin. Max 15MB.", "CMS -> Site & footer is not branding - use Design settings -> Branding section, or the inline preview cards in CMS Site for quick access"],
          ["Credentials logo", "Optional certificate/badge beneath the footer logo. Leave empty to hide. Set alt text to describe the credential (e.g. Yoga Alliance Certified).", "BrandingEditor -> Footer credentials logo (credentialsLogoSrc + credentialsLogoAlt)"],
          ["Description / tagline", "SiteConfig.tagline shown under the footer logo. Rich text allowed.", "CMS -> Site & footer -> Site name / Tagline"],
          ["Contact", "Contact email, phone, and location - shown in the footer contact column and used on /contact.", "CMS -> Site & footer -> Contact email/phone/address"],
          ["Social links", "Instagram, YouTube, Facebook - each has a destination URL and a visible label. Label and URL are independent: change label without moving URL.", "CMS -> Site & footer -> Social links"],
          ["Navigation links", "Repeated footer column - same list as the header. Edit once and both update.", "Same Navigation links editor as header (see Navigation & Menu)"],
          ["Newsletter signup", "Email field + submit in the footer; POST /api/newsletter. Subscribers list at /admin/subscribers.", "Footer itself + Homepage sections ordering for spacing above footer"],
        ],
      },
      { type: "h2", text: "How to change Instagram / YouTube labels vs URLs" },
      { type: "steps", items: ["Open CMS -> Site & footer tab.", "Find the Social links card: one pair per platform (URL + Display text).", "Edit the Display text field to change the text visitors read (e.g. Follow us on Instagram).", "Edit the URL field to change where clicks go (must be a full https://…).", "Leave both blank to hide that platform. Leave URL blank but label filled does not show a broken link - nothing renders.", "Click Save site config. Refresh the live footer to verify. The label changes instantly; the href stays as you set it."] },
      { type: "h2", text: "Credentials logo - how to add, replace, or remove" },
      { type: "steps", items: ["Open BrandingEditor (Design settings or CMS -> Site context). Find Footer credentials logo.", "To add: upload an image (PNG/WebP/SVG, max 320x120 recommended) via ImageUploadField.", "Alt text field below the upload: describe the credential for accessibility.", "To replace: upload a new file - the old URL is overwritten.", "To remove: click Remove under the preview. Save the site config - credentials area disappears from the footer."] },
      { type: "h2", text: "Branding logo scale" },
      { type: "p", text: "Each brand has a Logo scale slider 0.5x to 4x, step 0.05. It multiplies the logo size everywhere at once (navbar, footer, hero, admin). The live preview card in the Branding editor shows all contexts at the chosen scale before you save. Logos upload via onLogoSave (saved immediately when upload finishes)." },
      { type: "note", variant: "info", text: "Just Art Affaire logo rendering fix (2026): the header uses whitespace-nowrap + flex-nowrap so the two-word label never wraps, and BrandLogo uses overflow-hidden + object-contain + max-w:100%. If you still see wrapping on VPS after updating, rebuild on VPS (docker compose up -d --build) and hard-refresh." },
    ],
  },
  {
    id: "preview-vs-live",
    title: "Preview vs Live Website",
    icon: "👁️",
    summary: "What you see in admin vs what visitors see.",
    keywords: ["preview", "live", "draft", "publish", "save", "cache", "browser", "vps", "refresh"],
    body: [
      { type: "h2", text: "The flow" },
      { type: "steps", items: ["Admin editor - editable forms. Shows drafts (dark badge) and published sections together.", "Save draft - stored, NOT shown on the public site yet, but visible in Preview studios.", "Preview studio - faithful render of the page as visitors see it. For program pages: /admin/pages/preview/[pageType]. For special events: /admin/special-events/[id]/preview. It includes Draft sections so you can review.", "Publish button - marks that section Published = true.", "Live website - public URL (e.g. /yoga, /events/special/[slug], /ja/yoga). Shows only Published sections. Cache tag revalidation runs automatically after you publish, clearing both English and Japanese pages; allow a few seconds for the new render."] },
      { type: "h2", text: "What Preview actually shows" },
      { type: "bullets", items: ["Preview uses saved content (after you pressed Save/Publish). Unsaved edits visible only in the form you are still typing do NOT appear in the preview until you save.", "Preview includes fine-tuned layout sliders (section top/bottom padding, heading offset, gap values) exactly as they appear live.", "Preview does NOT use browser extensions or blocklists - it is the same Next.js render as the public page with an admin-only wrapper."] },
      { type: "h2", text: "How to verify a change" },
      { type: "steps", items: ["Save the section (Save draft or Publish).", "Open the Preview studio link in a new tab - confirm the section appears correctly.", "Open the live public URL in a second tab (or /ja/... for Japanese).", "If the live page looks stale, hard-refresh (Ctrl+F5 or Cmd+Shift+R). The revalidation helpers (revalidateHome / revalidateEvents / revalidatePageSections / etc.) have already cleared both locale caches on publish - stale views are usually browser cache.", "Wait 5-10 seconds and refresh again if you just saved many sections in quick succession."] },
      { type: "h2", text: "Common confusion" },
      {
        type: "table",
        headers: ["Symptom", "Explanation"],
        rows: [
          ["Preview shows my change but live page doesn't", "You saved as Draft, not Published. Click Publish on that section."],
          ["Preview link went to the live page", "Preview studio is at /admin/.../preview/ - double-check the URL bar. The live /events/special/[slug] shows only published sections."],
          ["Something looks right on localhost but wrong on the VPS", "The VPS proxy serves /uploads/* statically from a Docker volume; check that the image upload completed and the VPS built successfully. See /admin/diagnostics for CMS_SAVE_FAILURE / IMAGE_PROCESSING_FAILURE entries."],
        ],
      },
    ],
  },
  {
    id: "saving-publishing",
    title: "Saving & Publishing",
    icon: "💾",
    summary: "When changes go live.",
    keywords: ["saving", "publishing", "save", "publish", "draft", "immediate", "revalidation", "cache"],
    body: [
      { type: "h2", text: "Per-section saving" },
      { type: "bullets", items: ["Program pages and Special event sections save per row, not globally. Save draft and Publish are per section you are editing. Switching between sections without saving discards unsaved edits.", "Events overview (list editor at /admin/events): changes like price/location/description are submitted via the EventManager form and validated against max short-text lengths (MAX_SHORT_TEXT_LENGTH) and URL/JSON shapes."] },
      { type: "h2", text: "What saves immediately" },
      { type: "bullets", items: ["Section order (arrow moves) are saved immediately and revalidated.", "Branding logos are saved immediately on upload finish via onLogoSave.", "Image uploads via ImageUploadField are written to UPLOAD_DIR immediately; the returned URL is then stored only after you include it in a section or event form and save."] },
      { type: "h2", text: "What requires an explicit Save/Publish click" },
      { type: "bullets", items: ["Any text you typed in Title, Subtitle, Body, testimonial cards, SEO fields, gallery payload, CTA href/label - nothing is committed until you click Save draft or Publish.", "Special event general form: Save general settings is one dedicated submit; the error line and details list below it show validation failures if the save didn't go through."] },
      { type: "h2", text: "What the Save response does behind the scenes" },
      { type: "bullets", items: ["Writes to PostgreSQL via Prisma (Event / EventPageSection / PageSection / etc.), sanitizes rich HTML, normalizes layout JSON, and clamps numeric sliders to allowed ranges.", "Calls cache revalidation helpers (revalidateEvents, revalidatePageSections, revalidateHome, etc.) that invalidate unstable_cache tags and revalidatePath for the affected pages in both /... and /ja/... locales.", "If you have many tabs open, give revalidation a brief moment before hard-refreshing the live site."] },
    ],
  },
  {
    id: "images-media",
    title: "Images & Media",
    icon: "🖼️",
    summary: "Upload, replace, positioning, and file rules.",
    keywords: ["images", "media", "upload", "gallery", "cover", "alt", "positioning", "dimensions", "file size", "uploads", "webp"],
    body: [
      { type: "h2", text: "How to upload an image" },
      {
        type: "steps",
        items: [
          "In any editor look for an ImageUploadField: a preview box, an Upload/Choose file button, and a text field showing the current URL.",
          "Click Upload / Choose file, pick a file, and wait for progress to complete. Max file size 15MB.",
          "Allowed types: JPEG, PNG, WebP, GIF, SVG. The field validates before sending.",
          "On success the URL field fills with /uploads/<section>/…<timestamp>…<ext>. Select an existing image by pasting a /uploads/... URL into the same field.",
          "Save the surrounding section or entity - the URL is not stored in the database until you click Save/Publish on the section.",
        ],
      },
      { type: "h2", text: "How to replace / remove an image" },
      { type: "bullets", items: ["To replace: upload a new file or paste a new URL into the field and save the section - the API's replaceUrl handling can delete the previous file when supported.", "To remove: clear the field text and save the section with an empty imageUrl (the layout then renders without an image).", "Orphan files note: deleting a DB row does not always delete the file from disk - the /uploads volume may still hold unused files. This is normal; the app does not expose a delete-from-disk button."] },
      { type: "h2", text: "Image alt text" },
      { type: "p", text: "Every image field has an adjacent Alt text input. Fill it with a short description (e.g. 'Teacher leading morning yoga on the terrace'). It aids accessibility and SEO." },
      { type: "h2", text: "Sizing and positioning" },
      {
        type: "table",
        headers: ["Control", "What it does"],
        rows: [
          ["Image side (left/right)", "On desktop, which side the photo sits. Mobile stacks vertically."],
          ["Image height / Aspect presets", "Small 240px / Medium 360px / Large 500px presets or auto/landscape 16:9 / wide 21:9 / square / compact 4:3 presets. Applies to the section's image column."],
          ["Image fit (cover/contain)", "Cover crops to fill the box; contain shows the whole photo with letterboxing - useful for narrow logos."],
          ["Recommended dimensions", "Homepage hero: 1920x1080; Gallery cards: 800x600 minimum; Testimonial avatar: square 400x400. Sharp generates −thumb / −medium / −full WebP variants for gallery uploads sequentially (small VPS) - wait for variants before expecting all sizes."],
        ],
      },
      {
        type: "faq",
        items: [
          { q: "The image URL was set but the picture is broken.", a: "Check that the upload finished (no error banner). The server writes to UPLOAD_DIR which in production is /app/public/uploads - a Docker volume also mounted into nginx at /var/www/uploads. Confirm the live path is /uploads/... and not a local /public/... prefix. Images from /uploads must render unoptimized - the app always treats isLocalUploadUrl() images as unoptimized so they work via nginx static serving." },
          { q: "My image looks blurry.", a: "Gallery and hero images generate WebP variants lazily; the full variant may still be processing. Revisit in a minute or re-upload a higher-resolution original." },
        ],
      },
    ],
  },
  {
    id: "gallery-section",
    title: "Gallery Section Type",
    icon: "🖼️",
    summary: "GALLERY section payload and the standalone gallery page.",
    keywords: ["gallery", "images", "collections", "collages", "grid", "masonry", "carousel"],
    body: [
      { type: "h2", text: "GALLERY as a section inside a program or special event page" },
      {
        type: "bullets",
        items: [
          "Payload fields: images (each {url, alt, title}) filtered on save to require non-empty url + alt; carousel boolean; fallback config (mode: inherit/none/category/collection with category or collectionSlug).",
          "Leave images empty and choose a fallback (e.g. category = ART or collectionSlug = 'indian-embassy') to auto-populate from the gallery image database on the public page.",
          "Layout controls: Content width, Gallery style (horizontal scroll / masonry / grid / immersive), and Gallery height slider for tile size.",
        ],
      },
      { type: "h2", text: "Standalone gallery page ( /gallery )" },
      { type: "p", text: "The gallery page reads GalleryCollection, GalleryImage, and GalleryCollage tables (managed in CMS -> Gallery tab via GalleryManager). Collections group images (ART, YOGA_NIDRA, EVENTS, RETREATS...), collages pick imageIds plus a CollageLayout (MASONRY, STACKED, HERO_SUPPORTING...). GalleryManager supports upload, category toggles, collection assignment, featured-on-homepage flag, publishing, sort order, and collage creation." },
    ],
  },
  {
    id: "search-help",
    title: "Searchable Help",
    icon: "🔍",
    summary: "Find any topic instantly inside this guide.",
    keywords: ["search", "find", "help", "documentation"],
    body: [
      { type: "h2", text: "How the search box works" },
      { type: "bullets", items: ["At the top of this Help page you see a Search field.", "Type one or more words like 'testimonial', 'japanese', 'button', 'font size', 'spacing', 'preview', 'special event', 'instagram', or 'image'.", "Results filter sections and headings immediately as you type - no button to press. Click any result to jump to that section.", "Search looks across every title, summary, keyword list, and heading text inside this guide."] },
      { type: "note", variant: "tip", text: "Try misspelled shortcuts: 'japn' will still match Translation, 'spa' matches Spacing & Layout. The matcher is case-insensitive and word-prefix based." },
    ],
  },
  {
    id: "contextual-help",
    title: "Contextual Help (?)",
    icon: "❓",
    summary: "Small ? links beside confusing controls.",
    keywords: ["contextual", "help", "question", "tooltip", "links"],
    body: [
      { type: "h2", text: "What the ? buttons do" },
      { type: "bullets", items: ["Beside selected confusing controls in the admin (e.g. Font size, Spacing, Testimonials selector, Translation, CTA, Preview) you will see a small ? or Help link.", "Click it to jump directly to the corresponding section inside Help & Documentation, with that subsection highlighted.", "Examples: Font Size -> Typography section; Testimonials -> Testimonials section; Japanese translation -> Translation section; CTA -> Buttons & CTA; Preview -> Preview vs Live."] },
      { type: "p", text: "These are ordinary anchor links to /admin/help#<section-id> and behave like the search results - they scroll the help page to the right heading." },
    ],
  },
  {
    id: "chatgpt-help",
    title: "Getting Help with ChatGPT",
    icon: "🤖",
    summary: "Copy a ready-made prompt and paste it into ChatGPT.",
    keywords: ["chatgpt", "copy", "prompt", "help", "ai", "openai", "gemini"],
    body: [
      { type: "h2", text: "How the Copy buttons work" },
      {
        type: "bullets",
        items: [
          "Every major section header shows Copy this section for ChatGPT.",
          "At the top of the guide there is also Copy entire guide for ChatGPT.",
          "Clicking either button copies a carefully crafted prompt to your clipboard. It includes: who you are (editor of Nirvana Yoga admin), the relevant documentation section and rules, and a clear instruction to ChatGPT to use only that context.",
          "Open chat.openai.com (or any ChatGPT interface), paste (Ctrl+V / Cmd+V), type your own question where it says 'My question:' and send.",
          "Recommended: use Copy this section (smaller, precise). Use Copy entire guide only if your question spans many topics.",
        ],
      },
      { type: "h2", text: "What the copied prompt looks like" },
      { type: "p", text: "I am the owner/editor of the Nirvana Yoga website... Here is the official documentation for this section: [relevant docs] - Important behavior: [rules] - Please answer my question using the documentation above. Do not invent features not described. My question: [TYPE YOUR QUESTION HERE]" },
      { type: "note", variant: "warning", text: "The copied prompt never includes passwords, API keys, session cookies, or any values from your .env file. Only documentation text and safe non-sensitive context (current page name, section type) are included." },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: "🛠️",
    summary: "Fix common problems yourself.",
    keywords: ["troubleshooting", "problem", "fix", "not showing", "not appearing", "broken", "error", "cache", "translation missing"],
    body: [
      { type: "h2", text: "Common problems - what to check and try" },
      {
        type: "faq",
        items: [
          { q: "Changes are not appearing on the website.", a: "1) Did you click Publish on that section (not just Save draft)? Drafts appear only in Preview studios. 2) Are you looking at the correct locale? Check both /page and /ja/page. 3) Hard-refresh (Ctrl+F5). 4) Wait 10 seconds for cache tags to clear. 5) If still absent, confirm Published is checked and the section is not filtered out by its payload logic." },
          { q: "Japanese translation is missing.", a: "When jaLocale is empty the public JA page falls back to English - this is correct, not an error. Fill the JA tab or use a Translate button, then Save the section." },
          { q: "Japanese translation is outdated.", a: "Change EN text and click Translate / Regenerate Japanese again. Review the result and Save. Old JA text is NOT auto-overwritten unless you re-translate." },
          { q: "Button doesn't work.", a: "Check that Button label and Button URL are both non-empty. URL must start with / for an internal page or https:// for an external site. Open the Preview studio and click the button there. If it still fails, inspect the Diagnostics log for CMS_SAVE_FAILURE." },
          { q: "Image isn't showing.", a: "1) Confirm the upload completed without an error banner. 2) The field should contain /uploads/... (not a temporary or public/uploads prefix). 3) Check alt text is present. 4) Hard-refresh the live page. 5) If broken on the VPS but fine locally, confirm the Docker volume mounted and the VPS built OK - see deploy/nginx conf for /uploads static serving." },
          { q: "Testimonial is in admin but not on the website.", a: "Check status = APPROVED, selector for that page includes it (or manual items include it), the TESTIMONIALS section is Published, and you are on the right public URL (/testimonials vs /yoga). See Testimonials section for the Exists vs Selected distinction." },
          { q: "Special event isn't appearing.", a: "Confirm Published is checked and isSpecialEvent is true (Special events route auto-sets this). Verify the slug is unique, and that you used Save general settings on the general form. Look for inline errorDetails below the general form - they list validation failures." },
          { q: "Preview isn't showing the expected page.", a: "Confirm you opened /admin/.../preview/... (Preview studio) not /events/... (live). Preview includes drafts; the live URL hides them. Ensure you saved the section before opening preview." },
          { q: "Font size isn't changing.", a: "If a per-section Font size override is set, the global Design setting won't apply. Clear the section override (Reset to global) or change the section's own heading/body size value." },
          { q: "Spacing looks wrong.", a: "Multiple spacing sources stack: Section spacing preset + Top/Bottom padding + Gap below section. Reduce your preset to Tight or zero out the numeric padding/gap sliders. Copy the px numbers from a section that looks correct." },
          { q: "Heading has too much space above/below.", a: "Check Gap below heading and Section top/bottom padding sliders. Also check whether Heading horizontal offset is pushing the visual box; it affects transform only, not height." },
          { q: "Table of contents doesn't look right.", a: "See TOC section: AUTOMATIC vs CUSTOM. Switch to AUTOMATIC if custom labels are stale, or edit custom labels manually. Ensure every section has a non-empty Title and is Published." },
          { q: "Navigation item is missing.", a: "Navigation is defined in SiteConfig. The new page may not have a nav entry yet - use its direct URL and ask your developer to add the link to navigation JSON." },
          { q: "Footer link isn't displaying correctly.", a: "Confirm the footer column's label and URL are both filled in SiteConfig.social / socialConfig. The label is what visitors read; the URL is where clicks go - they are independent." },
          { q: "Something looks correct locally but wrong on the VPS.", a: "The VPS runs standalone build with revalidation and Docker volumes. Check Diagnostics for upload/save failures, confirm the latest build deployed (docker compose up -d --build), ensure UPLOAD_DIR translation matches production, and compare logs with local dev. Hard-refresh the VPS URL; local preview uses the same DB but different image cache." },
        ],
      },
      { type: "h2", text: "When to suspect a real bug (not user error)" },
      {
        type: "bullets",
        items: [
          "Published section with valid content still not rendering on the live site after hard-refresh and 60 seconds.",
          "Translate buttons consistently return GEMINI_API_KEY errors even though the server should be configured (server logs will show the key is missing).",
          "Upload succeeds but images remain broken across every browser after a full deploy and Diagnostics shows IMAGE_PROCESSING_FAILURE repeated.",
          "Session issues: immediately logged out or redirected to login after a saved change - check /admin/sessions and verify the ADMIN_SECRET hasn't changed mid-session.",
        ],
      },
      { type: "note", variant: "warning", text: "If you suspect a bug, include a screenshot, the exact page URL, the section title/type, and the time. Use Still stuck? -> Copy problem details for ChatGPT before contacting the developer." },
    ],
  },
  {
    id: "deployment-workflow",
    title: "Updating the Website After Code Changes",
    icon: "🚀",
    summary: "How your developer deploys code updates to the VPS.",
    keywords: ["deployment", "deploy", "vps", "git", "github", "docker", "update", "code", "release", "production"],
    body: [
      { type: "p", text: "Normal content editing (text, images, events, testimonials, navigation, design) does NOT require a deployment - just Save / Publish in the admin. The steps below are only when your developer changes code." },
      { type: "h2", text: "Actual deployment from this project (see DEPLOYMENT.md)" },
      {
        type: "steps",
        items: [
          "Developer makes changes locally, runs npm run lint and npm run build (must show 41/41 pages).",
          "Check git status - .env must NOT appear (gitignored). Commit only intended files.",
          'Commit: git add -A and git commit -m "feat: describe change".',
          "Push to GitHub: git push origin main (repo: https://github.com/anikaitar70/yoga.git, branch main).",
          "On the VPS (ssh ubuntu@51.79.251.45, cd /opt/yoga) run: git fetch origin and git pull origin main.",
          "If package.json changed, rebuild: docker compose up -d --build. This runs prisma migrate deploy (falls back to db push), consolidates SiteConfig, and starts node server.js.",
          "Always after rebuilding the app: docker compose restart nginx (nginx caches the old app container IP).",
          "Verify: docker compose ps (app, db, nginx Up), curl -sS https://nirvanayoga.org/api/health should be {ok:true}, and check /, /ja/, /testimonials and a special event in the browser.",
          "Rollback if needed: git log --oneline -10, git reset --hard <good-commit>, docker compose up -d --build, docker compose restart nginx.",
        ],
      },
      { type: "h2", text: "Environment on the VPS" },
      { type: "bullets", items: ["File is /opt/yoga/.env (never committed). It must contain APP_URL=https://nirvanayoga.org, DATABASE_URL (postgres://…@db:5432/yoga), ADMIN_SECRET (32+ chars), GITHUB_CLIENT_ID/SECRET, ADMIN_ALLOWED_EMAILS, GEMINI_API_KEY (from https://aistudio.google.com/app/apikey), TRANSLATE_MODEL=gemini-3.7-flash (default), UPLOAD_DIR=/app/public/uploads.", "GEMINI_API_KEY is server-side only - never in NEXT_PUBLIC_ or committed, never exposed to the browser (see src/lib/translate-server.ts).", "Docker volumes: uploads_data:/app/public/uploads (also mounted read-only into nginx at /var/www/uploads) and db_data:/var/lib/postgresql/data. Backups live in deploy/*.sh and are cron-scheduled."] },
      { type: "note", variant: "info", text: "One-liner your developer uses on the VPS: cd /opt/yoga && git pull origin main && docker compose up -d --build && docker compose restart nginx && docker compose ps && curl -sS https://nirvanayoga.org/api/health" },
      { type: "h2", text: "When you need to contact the developer for a deployment" },
      { type: "bullets", items: ["Someone edited .env, rotated ADMIN_SECRET, or changed GITHUB OAuth settings.", "A new SiteConfig column or Prisma migration was added (column does not exist errors in docker logs).", "Header layout or font handling changes that require a fresh CSS build (e.g. Just Art nav spacing)."] },
    ],
  },
  {
    id: "getting-help",
    title: "What to do if something is actually broken",
    icon: "🆘",
    summary: "When troubleshooting doesn't fix it.",
    keywords: ["broken", "bug", "help", "contact", "developer", "support", "stuck"],
    body: [
      { type: "h2", text: "Still stuck after troubleshooting?" },
      {
        type: "steps",
        items: [
          "Click Copy this section for ChatGPT at the bottom of the relevant help section.",
          "Paste into ChatGPT, add your question under 'My question:' and send.",
          "If ChatGPT cannot answer, copy the same prompt and send it to your developer along with: the admin URL you were on, the section name/type, a screenshot of any error banner, and what you expected vs what happened.",
          "Optionally copy the problem details panel's structured report (available under Troubleshooting) which includes safe non-sensitive state like current page and section type.",
        ],
      },
      { type: "h2", text: "What information to include for the developer" },
      { type: "bullets", items: ["Public URL that misbehaves (with /ja/ if relevant) and the admin URL you edited.", "Section type and title, Published/Draft status, language you observed (EN or JA).", "Steps that reproduce the issue.", "Screenshot or screen recording.", "Time of day and your timezone.", "What you just edited before the bug appeared."] },
      { type: "note", variant: "info", text: "Do NOT paste your .env file, tokens, or passwords when asking for help - they are not needed to fix content issues and are security sensitive." },
    ],
  },
];

export function buildChatPromptForSection(section: HelpSection): string {
  const blockText = (b: HelpBlock): string => {
    if (b.type === "h2") return `\n## ${b.text}\n`;
    if (b.type === "h3") return `\n### ${b.text}\n`;
    if (b.type === "p") return `${b.text}\n`;
    if (b.type === "note") return `[${(b.variant ?? "info").toUpperCase()}] ${b.text}\n`;
    if (b.type === "steps") return b.items.map((s, i) => `${i + 1}. ${s}`).join("\n") + "\n";
    if (b.type === "bullets") return b.items.map((s) => `- ${s}`).join("\n") + "\n";
    if (b.type === "table") return `${b.headers.join(" | ")}\n${b.headers.map(() => "---").join(" | ")}\n${b.rows.map((r) => r.join(" | ")).join("\n")}\n`;
    if (b.type === "faq") return b.items.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n") + "\n";
    if (b.type === "callout") return `> ${b.title}: ${b.text}\n`;
    return "";
  };

  const docs = section.body.map(blockText).join("\n");

  return `I am the owner/editor of the Nirvana Yoga website (nirvanayoga.org).

I am asking for help with the admin panel - specifically: "${section.title}" (${section.id}).

Here is the official documentation for this section:

---
${docs}
---

Summary: ${section.summary}

Important behavior for this admin:
- English is the primary language; Japanese is in parallel JA fields and Gemini-powered machine-translated content.
- Special events have two surfaces: the /events card and the dedicated /events/special/[slug] page.
- Each Program page / Special event page is a stack of typed Sections (Image+text, Gallery, Testimonials, Custom text, BUTTON, etc.). Each section has Save draft / Publish and reorders via arrows.
- Preview studios (/admin/.../preview/...) include drafts; the live site shows only Published sections. Image URLs live under /uploads/... and are served statically by nginx.
- Admin requires a signed session cookie; all docs endpoints are admin-only.

Please answer my question using the documentation above.

Do not invent features that are not described here.

If my problem cannot be solved from the documentation, explain what information I should provide and what to check next.

My question:

[TYPE YOUR QUESTION HERE]`;
}

export function buildChatPromptForGuide(): string {
  const compact = helpSections.map((s) => `### ${s.title} (${s.id})\n${s.summary}`).join("\n");
  return `I am the owner/editor of the Nirvana Yoga website (nirvanayoga.org) using the custom admin at /admin.

Overview of the documentation sections:
${compact}

The full per-section documentation is long; ask me which section to drill into. Key rules:

- English is primary; Japanese is parallel JA fields (Locale tabs) and Gemini machine translation (POST /api/translate).
- Pages are stacks of typed Sections with per-section Save draft / Publish, delete, and arrow reordering.
- Preview studios (/admin/.../preview/...) show drafts; live site shows only Published.
- Images upload to /uploads/... and are served by nginx. Rich text toolbar has B/I/U/highlight/lists/alignment.
- Help is at /admin/help and is admin-only.

Please answer my question using this context.

Do not invent features.

My question:

[TYPE YOUR QUESTION HERE]`;
}
