# Nirvana Yoga — Complete Client Handbook

**Your guide to managing the Nirvana Yoga website**

Version 1.0 · June 2026

---

> **Who this handbook is for**  
> This guide is written for studio owners and staff who want to update the Nirvana Yoga website without calling a developer for everyday tasks. No technical background is required. If you can use email and upload a photo from your phone, you can use this system.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Logging In](#2-logging-in)
3. [CMS Overview — Every Menu Explained](#3-cms-overview--every-menu-explained)
4. [Editing the Homepage](#4-editing-the-homepage)
5. [The About Page](#5-the-about-page)
6. [Program Pages](#6-program-pages)
7. [Blog Management](#7-blog-management)
8. [Events Management](#8-events-management)
9. [Gallery Management](#9-gallery-management)
10. [Contacts & Subscribers](#10-contacts--subscribers)
11. [Design Settings](#11-design-settings)
12. [Global Settings vs Page-Specific Settings](#12-global-settings-vs-page-specific-settings)
13. [The Preview System](#13-the-preview-system)
14. [Analytics](#14-analytics)
15. [Diagnostics](#15-diagnostics)
16. [Branding](#16-branding)
17. [Image Guidelines](#17-image-guidelines)
18. [Frequent Tasks — Quick Guides](#18-frequent-tasks--quick-guides)
19. [Troubleshooting](#19-troubleshooting)
20. [When to Contact the Developer](#20-when-to-contact-the-developer)
21. [Website Ownership & Maintenance](#21-website-ownership--maintenance)

**Appendices**

- [Appendix A: CMS Glossary](#appendix-a-cms-glossary)
- [Appendix B: Recommended Image Sizes](#appendix-b-recommended-image-sizes)
- [Appendix C: Content Writing Tips](#appendix-c-content-writing-tips)
- [Appendix D: SEO Best Practices](#appendix-d-seo-best-practices)

---

# 1. Introduction

## 1.1 What is the Nirvana Yoga CMS?

**CMS** stands for **Content Management System**. In plain language, it is the private “back office” of your website — a secure area where you log in to change words, photos, events, blog posts, and visual styling.

Your public website (what visitors see at your domain) and the CMS (what you see after logging in) are two sides of the same system. When you save a change in the CMS, it appears on the live website for everyone to see.

[Screenshot: The public Nirvana Yoga homepage side by side with the admin Dashboard]

The Nirvana Yoga CMS was built specifically for your studio. It lets you manage:

- Homepage content (hero banner, program previews, testimonials, gallery, contact area)
- About page (biography, experience timeline, teaching philosophy)
- Program pages (Yoga, Healing, Just Art Affaire)
- Blog articles
- Events and workshops
- Photo gallery and collages
- Site-wide design (fonts, colors, logos, navigation)
- Visitor analytics
- Contact messages and newsletter subscribers

You access the CMS by visiting your website address followed by `/admin`. For example: `https://yoursite.com/admin`.

---

## 1.2 What You Can Change

You have full control over **content** — the information your visitors read and see:

| Area | Examples of what you can change |
|------|--------------------------------|
| Text | Headlines, paragraphs, button labels, navigation links |
| Images | Hero photos, gallery images, blog covers, event photos |
| Events | Dates, locations, prices, descriptions |
| Blog | Articles with rich text, images, galleries, and quotes |
| Testimonials | Client quotes, names, photos |
| Design | Fonts, colors, logo size, header layout |
| Contact info | Email, phone, address, Instagram links |

---

## 1.3 What You Should Not Change

Some parts of the website are managed by your developer and are not meant to be edited through the CMS:

| Do not attempt | Why |
|----------------|-----|
| Server settings, domain DNS, or hosting | These live outside the CMS on your web server |
| The CMS login secret key itself | Only your developer should change this in server settings |
| Code, database files, or server folders | Editing these can break the entire website |
| Creating new gallery “collections” (tabs) | Collections are pre-set; you add photos within them |
| Adding entirely new page types or features | Requires developer work |

> **Note**  
> If you are unsure whether something is safe to change, use the checklist in [Section 20](#20-when-to-contact-the-developer) or ask your developer before proceeding.

---

## 1.4 Content vs Design — What Is the Difference?

Understanding this distinction will save you time and confusion.

**Content** is *what you say* and *which photos you show*:
- “Welcome to Nirvana Yoga” → content
- A photo of a sunrise yoga class → content
- An event titled “Spring Retreat in Kyoto” → content

**Design** is *how things look across the whole site*:
- The font used for headings → design
- The warm terracotta accent color → design
- How large the logo appears in the navigation bar → design
- Whether text is left-aligned or centered in a section → layout (a mix of content and design)

| You want to… | Go to… |
|--------------|--------|
| Change a headline or paragraph | CMS → relevant section, or Program Pages |
| Change the font for all headings site-wide | Design Settings → Typography |
| Change one section’s spacing or image size | Preview Studio for that page |
| Replace the logo | Design Settings → Header Layout → Branding |

> **Best practice**  
> Update content often (weekly or monthly). Change global design settings only when you are refreshing the brand look — frequent font or color changes can make the site feel inconsistent.

---

# 2. Logging In

## 2.1 How to Access the Admin Area

1. Open your web browser (Chrome, Safari, Firefox, or Edge).
2. Go to your website address with `/admin` at the end.  
   Example: `https://nirvanayoga.org/admin`
3. You will see the **Nirvana Yoga admin** login screen.

[Screenshot: Admin login screen showing the Nirvana Yoga logo and “Secret key” field]

## 2.2 Signing In

Your website uses a **secret key** instead of a traditional username and password. Think of it like a single, strong key that unlocks the admin area.

**Steps:**

1. Enter your secret key in the **Secret key** field.  
   (The characters will be hidden, like a password.)
2. Click **Sign in**.
3. If the key is correct, you will be taken to the **Dashboard** (Overview).
4. Your session stays active for **24 hours**. After that, you will need to sign in again.

> **Tip**  
> Bookmark `https://yoursite.com/admin` in your browser for quick access.

---

## 2.3 Password Reset

There is **no “Forgot password” link** in this system because there are no individual user accounts. Access is controlled by one shared secret key stored securely on the server.

**If you forget or lose the secret key:**

1. Contact your developer.
2. They will set a new key on the server and share it with you securely (never by public email if it can be avoided).
3. You will use the new key to sign in.

> **Warning**  
> Never share the secret key in social media messages, public posts, or with anyone who does not need admin access.

---

## 2.4 Signing Out

Always sign out when you finish editing, especially on a shared or public computer.

1. Look for **Sign out** at the bottom of the left sidebar (on the Dashboard) or inside the mobile menu (☰) on other admin pages.
2. Click **Sign out**.
3. You will return to the login screen.

---

## 2.5 Security Recommendations

| Recommendation | Why it matters |
|----------------|----------------|
| Keep the secret key in a password manager | Safe storage; easy to retrieve |
| Do not write the key on sticky notes at the studio | Anyone who finds it can edit your site |
| Sign out after each session on shared devices | Prevents unauthorized changes |
| Limit who knows the key | Only trusted staff should have access |
| Tell your developer immediately if you suspect the key was exposed | They can issue a new one quickly |

If someone enters the wrong key too many times, the system may temporarily block further attempts. This protects your site from guessing attacks. Wait a minute and try again, or contact your developer if the problem persists.

---

# 3. CMS Overview — Every Menu Explained

After you log in, you will see a navigation menu. On the **Dashboard**, this menu appears as a sidebar on the left. On all other pages, tap the **☰** menu icon at the top to open the same links.

[Screenshot: Admin sidebar showing all menu items]

Below is every menu item, what it does, and when to use it.

---

## 3.1 Dashboard (Overview)

**Location:** First item in the menu · `/admin`

**Purpose:** A quick snapshot of your website’s activity.

**What you see:**

| Card | Meaning |
|------|---------|
| Events | Total number of events in the system |
| Blog posts | Total number of blog articles |
| Subscribers | People who signed up for newsletter updates |
| Contact messages | Messages sent through your contact forms |

**What it controls:** Nothing directly — it is read-only.

**When to use it:** When you want a quick health check, such as “Do we have upcoming events listed?” or “Have we received new contact messages?”

---

## 3.2 Events

**Location:** Events · `/admin/events`

**Purpose:** Create, edit, and delete studio events, workshops, retreats, and classes.

**What it controls:** Event listings on the website, including the homepage “Featured events” area (for events marked as Featured).

**When to use it:**

- Adding a new workshop or retreat
- Updating dates, locations, or prices
- Unpublishing an event that has been cancelled
- Uploading or changing an event photo

---

## 3.3 Blog Posts

**Location:** Blog posts · `/admin/blogs`

**Purpose:** Write and publish articles for your blog.

**What it controls:** The public blog section and any blog links on your site.

**When to use it:**

- Publishing a new article about yoga philosophy, travel, or studio news
- Editing or correcting an existing post
- Removing outdated articles

---

## 3.4 CMS (Content Management)

**Location:** CMS · `/admin/content`

**Purpose:** The main hub for homepage content, site-wide settings, testimonials, and the photo gallery.

**What it controls:**

- Homepage hero banner
- All homepage sections (about preview, philosophy, program pathways, events preview, retreats, gallery preview, newsletter, contact preview)
- About page hero (top banner only)
- Site name, navigation links, contact details, Instagram URLs
- Testimonials library (shared across pages)
- Gallery images and collages

**When to use it:** Any time you need to update homepage content, contact information in the footer, testimonials, or gallery photos.

**Internal tabs** (see [Section 4](#4-editing-the-homepage) for detail):

| Tab | Purpose |
|-----|---------|
| Preview studio | Fine-tune homepage layout |
| Hero | Top banner of homepage |
| Homepage sections | All content blocks below the hero |
| About page | About page top banner only |
| Site & footer | Contact info, navigation, social links |
| Testimonials | Manage client quotes |
| Gallery | Upload and organize photos |

---

## 3.5 Program Pages

**Location:** Program pages · `/admin/pages`

**Purpose:** Build and edit the Yoga, Healing, Just Art Affaire, and About pages using flexible sections.

**What it controls:** The main content on `/yoga`, `/healing`, `/just-art-life`, and the body sections of `/about`.

**When to use it:**

- Updating your biography or teaching timeline on the About page
- Adding a new image-and-text section to the Yoga page
- Publishing or drafting a new program section

---

## 3.6 Subscribers

**Location:** Subscribers · `/admin/subscribers`

**Purpose:** View people who have signed up for newsletter updates.

**What it controls:** Nothing — this is a read-only list.

**When to use it:** When you want to see who has opted in to receive updates. Use this list to add emails to your external newsletter tool (such as Mailchimp) if you send bulk emails from there.

---

## 3.7 Contacts

**Location:** Contacts · `/admin/contact`

**Purpose:** Read messages submitted through your website’s inquiry and contact forms.

**What it controls:** Nothing — this is a read-only inbox.

**When to use it:** Daily or weekly, to respond to new inquiries from potential students or retreat participants.

---

## 3.8 Design Settings

**Location:** Design settings · `/admin/design`

**Purpose:** Control fonts, colors, logos, header layout, hero alignment, navigation colors, text selection colors, and page background style.

**What it controls:** The visual appearance of your entire public website.

**When to use it:** When refreshing your brand look — not for everyday content updates.

---

## 3.9 Analytics

**Location:** Analytics · `/admin/analytics`

**Purpose:** See how many people visit your website and which pages are most popular.

**What it controls:** Nothing — read-only statistics.

**When to use it:** Monthly check-ins on website traffic, or after publishing a major blog post or event to see if visits increased.

---

## 3.10 Diagnostics

**Location:** Diagnostics · `/admin/diagnostics`

**Purpose:** Monitor server health, storage space, backups, and error logs.

**What it controls:** Nothing directly — it is a monitoring dashboard for you and your developer.

**When to use it:** If something seems wrong with the site (uploads failing, saves not working), or during periodic health checks. Your developer may also review this area during maintenance.

---

# 4. Editing the Homepage

The homepage is your studio’s front door. Most visitors land here first. You edit it under **CMS** in the admin menu.

[Screenshot: CMS page with “Jump to a section” tabs visible]

> **Important**  
> Changes are **not saved automatically**. Always look for a save button and wait for a confirmation message before leaving the page.

---

## 4.1 The Hero Section

**Where to edit:** CMS → **Hero** tab

**What visitors see:** The large banner at the very top of the homepage — your main headline, supporting text, buttons, and background image (or images).

### Fields explained

| Field | What it does | Example |
|-------|--------------|---------|
| Title | Main headline | “Find stillness. Move with intention.” |
| Subtitle | Supporting paragraph below the title | A short welcome message |
| Primary CTA label | Text on the main button | “Explore programs” |
| Primary CTA URL | Where the main button links | `/yoga` |
| Secondary CTA label | Text on the second button | “View events” |
| Secondary CTA URL | Where the second button links | `/events` |
| Hero media mode | How the background looks | See options below |
| Hero image | Upload a single background photo | Your best studio or landscape shot |
| Image alt text | Describes the image for accessibility | “Morning yoga class in natural light” |

### Hero media modes

| Mode | Best for |
|------|----------|
| Single image | One strong hero photo |
| Rotating images | Multiple photos that cycle (enter one URL and description per line) |
| Collage | A curated multi-image layout you built in Gallery → Collages |
| Featured collection | Pulls from a gallery collection you selected |

**How to save:** Click **Save hero**. Wait for “Saved successfully.”

[Screenshot: Hero section editor with all fields labeled]

> **What visitors will see**  
> The hero fills the top of the screen. Your Nirvana Yoga logo appears above the headline (alignment is set in Design Settings → Hero Layout). Buttons invite visitors to explore programs or events.

---

## 4.2 Homepage Sections Overview

**Where to edit:** CMS → **Homepage sections** tab

Below the hero, the homepage is made of named sections. Scroll through the editor to find each panel.

**How to save:** Click **Save homepage sections** at the bottom of this tab.

---

## 4.3 About Preview Section

**Panel name:** Homepage — About preview

| Field | Purpose |
|-------|---------|
| Eyebrow | Small label above the heading (e.g. “About Nirvana Yoga”) |
| Heading | Section title |
| Body | Main paragraph text |
| Highlights | Short bullet points, one per line |
| Link label / Link URL | “Read more” style link, often to `/about` |
| About image | Photo alongside the text |
| Image alt text | Description of the photo |
| Image side | Photo on left or right |

> **What visitors will see**  
> A preview of who you are, with a photo and link to the full About page.

---

## 4.4 Philosophy Section

**Panel name:** Philosophy

| Field | Purpose |
|-------|---------|
| Eyebrow | Small introductory label |
| Heading | Section title |
| Closing paragraph | Final thoughts below the sutra interpretations |
| Interpretation (per sutra) | Your explanation of each yoga sutra (the sutra source text is shown for reference) |

> **What visitors will see**  
> A thoughtful section sharing your teaching philosophy rooted in classical yoga texts.

---

## 4.5 Program Pathways (Yoga / Healing / Art)

**Panel name:** Program pathways

This section shows three cards — one for each major program. Each pathway has its own set of fields:

| Field | Purpose |
|-------|---------|
| Eyebrow | Small label (e.g. “Program”) |
| Title | Program name |
| Section logo | Optional small logo for this card |
| Subtitle | Tagline under the title |
| Description | Longer explanation |
| Highlights | Bullet points, one per line |
| CTA label / CTA link | Button text and destination |
| Image side | Photo on left or right |
| Section style | Default, Warm, or Muted background tone |
| Pathway image | Feature photo for this program |
| Image alt text | Photo description |

> **What visitors will see**  
> Three inviting cards that guide visitors to your Yoga, Healing, and Just Art Affaire programs.

> **Tip**  
> The full program pages are edited separately under **Program Pages**. This section is only the homepage preview of those programs.

---

## 4.6 Featured Events Section

**Panel name:** Featured events

| Field | Purpose |
|-------|---------|
| Eyebrow | Small label above the title |
| Title (when featured events exist) | Headline when you have featured events |
| Title (fallback) | Headline when no featured events are set |
| Subtitle | Supporting text |
| CTA label (desktop) / CTA label (mobile) | Button text (can differ on small screens) |
| CTA link | Usually links to `/events` |

> **Note**  
> The actual event cards come from **Events** in the admin menu. Mark an event as **Featured** there to show it in this section.

> **What visitors will see**  
> A row of upcoming featured events with dates, titles, and links to details.

---

## 4.7 Retreats Preview

**Panel name:** Retreats preview

Edit the section title, subtitle, and call-to-action button. Retreat events themselves are managed under **Events** (category: Retreat or Retreats and Tours).

---

## 4.8 Gallery Preview

**Panel name:** Gallery preview

Edit the section heading and empty-state message. The photos themselves are managed under CMS → **Gallery** tab. Mark images as **Featured on homepage** to appear here.

---

## 4.9 Testimonials Section (Homepage)

**Panel name:** Testimonials

On the homepage sections tab, you can only edit the **section chrome** — the eyebrow, title, and subtitle that frame the testimonials.

The actual quotes are managed under CMS → **Testimonials** tab (see [Section 4.10](#410-testimonials)).

---

## 4.10 Testimonials

**Where to edit:** CMS → **Testimonials** tab

**What visitors see:** Rotating or displayed quotes from students and clients on the homepage and program pages.

### Adding a testimonial

1. Click **+ New testimonial**.
2. Optionally upload a **screenshot** of a handwritten note or message — the system can read the text automatically (OCR).
3. Review and edit the **Quote**, **Name**, **Role**, **City**, and **Country**.
4. Choose **Display style**: Handwritten journal or Standard card.
5. Set **Status** to **Approved** when ready to show on the site.
6. Check **Featured testimonial** to prioritize it.
7. Click **Add testimonial** or **Update testimonial**.

### Reordering

Use the **↑** and **↓** arrows in the list to change display order.

[Screenshot: Testimonial editor with OCR preview side by side]

> **Common mistake**  
> Leaving status as “Pending review” — approved testimonials only appear when status is set to **Approved**.

---

## 4.11 Newsletter Section

**Panel name:** Newsletter (under Homepage sections)

| Field | Purpose |
|-------|---------|
| Title | Section headline |
| Subtitle | Encouraging text above the signup form |

> **What visitors will see**  
> A newsletter signup area on the homepage. Subscriber records appear under **Subscribers** in the admin menu.

---

## 4.12 Contact Preview Section

**Panel name:** Contact preview

| Field | Purpose |
|-------|---------|
| Eyebrow, Title, Subtitle | Section framing text |
| Primary / Secondary CTA label & link | Buttons (e.g. “Send a message”, “View programs”) |

> **Note**  
> Your actual email, phone, and address are **not** edited here. They come from CMS → **Site & footer** tab.

> **What visitors will see**  
> A contact encouragement section with buttons. Your email and phone appear in the footer site-wide.

---

## 4.13 Site & Footer (Contact Details)

**Where to edit:** CMS → **Site & footer** tab

| Field | Purpose |
|-------|---------|
| Site name | Appears in browser tab and branding |
| Tagline | Short description |
| Navigation links | One per line: `Label\|/link` — e.g. `Yoga\|/yoga` |
| Contact email | Shown in footer and contact areas |
| Contact phone | Shown in footer |
| Contact address | Studio or mailing address |
| Instagram URL (Nirvana Yoga) | Link to your Instagram |
| Instagram URL (Just Art Affaire) | Link to Just Art Affaire Instagram |

**How to save:** Click **Save site config**.

> **Tip**  
> A link to **Design settings** appears here if you want to adjust fonts and colors.

---

# 5. The About Page

The About page is edited in **two places**. This is intentional — the top banner and the body content are managed separately.

---

## 5.1 About Page Hero (Top Banner)

**Where to edit:** CMS → **About page** tab

| Field | Required? |
|-------|-----------|
| Eyebrow | Yes |
| Title | Yes |
| Subtitle | Yes |

**How to save:** Click **Save about hero**.

> **What visitors will see**  
> The elegant header at the top of `/about` with your name or studio identity and a short introduction.

[Screenshot: About page hero editor]

---

## 5.2 Biography, Timeline, and Philosophy (Body Content)

**Where to edit:** Program Pages → **About** tab

Here you add and arrange **sections** — the same system used for Yoga and Healing pages.

### Typical About page sections

| Section type | Use for |
|--------------|---------|
| Custom text block → Default | Biography paragraphs |
| Custom text block → Experience timeline | Your journey — years, titles, descriptions |
| Custom text block → Philosophy | Sutra passages with translations and your interpretations |
| Image + text | Photo with supporting story |
| Photo gallery | Studio or travel photos |
| Testimonials | Client quotes (or use shared library) |
| Contact / inquiry | Let visitors reach out |

### Editing biography (Default variant)

1. Go to **Program Pages** → **About**.
2. Find or add a **Custom text block** section.
3. Click **Edit**.
4. Choose layout variant **Default — simple paragraphs**.
5. Enter your text in **Body text**. Separate paragraphs with a blank line.
6. Click **Publish** (or **Save draft** to preview first).

### Editing the experience timeline

1. Add or edit a **Custom text block** section.
2. Choose variant **Experience timeline — year, title, and body rows**.
3. Add timeline items with year, title, and description.
4. Use **Timeline styling** to adjust colors and fonts (optional).
5. Click **Publish**.

### Editing teaching philosophy

1. Add or edit a **Custom text block** section.
2. Choose variant **Philosophy — multiple sutra passages**.
3. For each sutra, enter Sanskrit, transliteration, translation, source, and your interpretation.
4. Click **Publish**.

[Screenshot: About page timeline editor]

---

## 5.3 Layout Controls for About Sections

Each section has a **Layout** panel:

| Setting | Options |
|---------|---------|
| Section spacing | Tight, Normal, Spacious |
| Content width | Narrow, Normal, Wide |
| Text alignment | Left, Center |

For fine-tuning (padding, image height, animations), open **Preview studio — About** from the Program Pages screen.

---

## 5.4 How Changes Affect the Live Page

| Action | Live site effect |
|--------|------------------|
| **Save draft** | Visible in Preview Studio only — **not** on the public site |
| **Publish** | Section appears on the live About page immediately |
| Unpublish (uncheck Published) | Section hidden from visitors |
| Edit published section and Publish again | Live page updates immediately |

> **Best practice**  
> Always open **Preview studio — About** before publishing a major change. Check desktop, tablet, and mobile views.

---

# 6. Program Pages

Program pages tell the full story of each offering. You manage them under **Program Pages** in the admin menu.

**Public URLs:**

| Admin tab | Website address |
|-----------|-----------------|
| Yoga | `/yoga` |
| Healing | `/healing` |
| Just Art Affaire | `/just-art-life` |
| About | `/about` |

[Screenshot: Program Pages admin with page tabs]

---

## 6.1 Section Types

Click **Add section** to choose a type:

| Section type | Best for |
|--------------|----------|
| Hero / introduction | Top banner with headline and buttons |
| Image + text | Story section with photo beside text |
| Photo gallery | Collection of images |
| Testimonials | Quotes specific to this program |
| Upcoming events | Filtered list of events |
| Contact / inquiry | Inquiry form for this program |
| Custom text block | Biography, timelines, philosophy, journey narratives |

---

## 6.2 Adding Content — Step by Step

**Example: Adding a new section to the Yoga page**

1. Go to **Program Pages** → **Yoga** tab.
2. Click **Add section** → choose **Image + text**.
3. Click **Edit** on the new section.
4. Fill in **Title**, **Subtitle / eyebrow**, and **Body text**.
5. Upload a **Section image** and add **Image alt text**.
6. Adjust **Layout** settings (spacing, image side, aspect ratio).
7. Check **Published** when ready.
8. Click **Publish**.

> **What visitors will see**  
> A new section on the Yoga page, in the order shown in your section list. Use ↑↓ arrows to reorder.

---

## 6.3 Editing Existing Content

1. Find the section in the list.
2. Click **Edit**.
3. Make your changes.
4. Click **Publish** (or **Save draft**).

Sections marked **· Draft** are not visible on the live site.

---

## 6.4 Changing Images

- **Section image:** Upload directly in the section editor.
- **Gallery sections:** Use **+ Add image** within the gallery editor; upload each photo with alt text and optional title.
- **Hero sections:** Upload in the hero-specific fields (tagline, CTAs, etc.).

Supported formats: JPEG, PNG, WebP, GIF. Maximum file size: 15 MB.

---

## 6.5 Changing Layouts

**In the section editor (quick presets):**

| Setting | What it changes |
|---------|-----------------|
| Section spacing | Vertical breathing room above and below |
| Content width | How wide the text block is |
| Text alignment | Left or center |
| Image aspect | Shape of the image (landscape, square, etc.) |
| Image side | Photo on left or right (Image + text sections) |
| Gallery layout | Horizontal scroll, Masonry, Grid, or Immersive |

**In Preview Studio (fine control):**

Open **Preview studio — [Page name]** for slider-based tuning: padding, image height, card width, gallery style, section background style, and animation presets.

Click **Save layout** in Preview Studio to keep those changes.

---

## 6.6 Typography and Style Overrides

### Global typography (all pages)

Edit under **Design Settings → Typography**. See [Section 11](#11-design-settings).

### Timeline typography (specific sections)

When editing a **Custom text block** with a timeline variant, use the **Timeline styling** panel:

- Number color, title color, text color
- Fonts and weights for numbers, titles, and body
- Line and dot colors
- **Scope:** This timeline only · All timelines on this page · All timelines site-wide

### Page-specific font overrides

Your developer can set fonts that apply to only one program page (for example, a different heading font on the Yoga page). These are not editable in the standard admin screens. If you need this, ask your developer.

---

## 6.7 Program-Specific Custom Text Variants

| Page | Special layout variants |
|------|------------------------|
| Yoga | Yoga journey — sutra callout |
| Healing | Healing journey — side timeline + callouts |
| Just Art Affaire | Art journey — numbered timeline + callouts |
| About | Experience timeline, Philosophy |

Each variant has tailored fields (callouts, timeline rows, sutra passages). Explore the variant dropdown when editing a Custom text block.

---

## 6.8 Events Section on Program Pages

When you add an **Upcoming events** section:

| Setting | Purpose |
|---------|---------|
| Show | All events, Sessions only, or Retreats only |
| Event categories | Filter by type (Yoga, Healing, Workshop, etc.) |
| Max events | How many to display (1–24) |

Events themselves are created under **Events** in the admin menu.

---

## 6.9 Contact Section on Program Pages

| Setting | Purpose |
|---------|---------|
| Show inquiry form | Display a contact form on this page |
| Form email subject | Default subject line for submissions |
| CTA button label & link | Optional button above the form |

---

# 7. Blog Management

Your blog shares stories, teachings, and news. Manage it under **Blog posts** in the admin menu.

---

## 7.1 Blog List

The main screen shows all posts with title, summary, published date, and section count.

- **Edit** — open the post for changes
- **Delete** — remove the post (you will be asked to confirm)

---

## 7.2 Creating a Blog Post

1. Click **Create post**.
2. Fill in the fields below.
3. Click **Create post** at the bottom.

### Basic fields

| Field | Purpose |
|-------|---------|
| Title | Article headline |
| Slug | Web address ending (auto-generated from title if left blank) |
| Summary | Short excerpt shown in blog listings |
| Cover image | Main image at the top of the article |
| Tags | Comma-separated keywords (e.g. `yoga, retreat, mindfulness`) |
| Published | Check to make visible on the live site |
| Published at | Date and time shown on the article |

---

## 7.3 Story Sections (Building Your Article)

Instead of one big text box, articles are built from **sections** — flexible blocks you can reorder.

Click **Add section** and choose a type:

### Rich text

- Optional section title
- Paragraphs of text (blank line = new paragraph)

**Use for:** Main article body, introductions, conclusions.

### Image

- Upload an image
- Alt text (required for accessibility)
- Optional caption

**Use for:** A single striking photo within the article.

### Image + text

- Section title
- Image on left or right
- Alt text
- Body paragraphs

**Use for:** Photo essays, before/after stories, travelogues.

### Gallery

- Optional gallery title
- Multiple images, each with alt text
- Add or remove images as needed

**Use for:** Retreat photo collections, workshop highlights.

### Quote

- Quote text
- Optional attribution (who said it)

**Use for:** Pull quotes, sutra excerpts, student testimonials within an article.

### Reordering sections

Use **Up**, **Down**, and **Remove** on each section block.

[Screenshot: Blog post editor with multiple section types]

---

## 7.4 Editing a Blog Post

1. Click **Edit** next to the post.
2. Make changes.
3. Click **Update post**.

---

## 7.5 Deleting a Blog Post

1. Click **Delete**.
2. Confirm in the dialog.
3. The post is permanently removed from the live site.

> **Warning**  
> Deletion cannot be undone through the CMS. Contact your developer if you need to recover a deleted post.

---

## 7.6 Example Workflow: Publishing a New Blog Article

**Scenario:** You return from a retreat in Japan and want to share a photo essay.

| Step | Action |
|------|--------|
| 1 | Go to **Blog posts** → **Create post** |
| 2 | Title: “Autumn Silence: A Week in Kyoto” |
| 3 | Summary: Two sentences enticing readers to open the article |
| 4 | Upload a cover image — your best landscape or group photo |
| 5 | Add section: **Rich text** — write your opening paragraphs |
| 6 | Add section: **Image + text** — a temple photo with the story of a morning practice |
| 7 | Add section: **Gallery** — upload 6–10 retreat photos with alt text |
| 8 | Add section: **Quote** — a meaningful quote from a participant |
| 9 | Add section: **Rich text** — closing thoughts and link to your next event |
| 10 | Tags: `retreat, japan, yoga` |
| 11 | Check **Published**, set **Published at** to today |
| 12 | Click **Create post** |
| 13 | Visit your blog on the live site to proofread |

> **Tip**  
> Write the summary last — it is easier once you know what the article covers.

---

# 8. Events Management

Events power your calendar, homepage features, and program page listings. Manage them under **Events**.

---

## 8.1 Creating an Event

1. Click **Create event**.
2. Fill in the form.
3. Click **Create event**.

### Event fields

| Field | Purpose |
|-------|---------|
| Title | Event name |
| Slug | URL-friendly name (e.g. `spring-yoga-nidra`) |
| Location | City, studio, or “Online” |
| Category | Yoga, Yoga Nidra, Workshop, Teacher Training, Philosophy, Healing, Just Art Affaire, Retreat, Retreats and Tours |
| Price | Optional — leave blank for free events |
| Starts at | Date and time the event begins |
| Ends at | Optional end date and time |
| Event image | Promotional photo |
| Description | Full details — what to expect, what to bring |
| Featured | Show on homepage featured events area |
| Published | Visible on the live site (checked by default) |

[Screenshot: Event create form]

---

## 8.2 Editing an Event

1. Click **Edit** on the event row.
2. Update fields as needed.
3. Click **Update event**.

---

## 8.3 Deleting an Event

1. Click **Delete**.
2. Confirm in the browser dialog.

> **Tip**  
> For cancelled events, consider unchecking **Published** instead of deleting — this preserves the record in your admin history.

---

## 8.4 Managing Dates

- Use the **Starts at** and **Ends at** date pickers.
- Events sort by start date (newest first in admin).
- Past events may still show on the site depending on your theme — unpublish them when they are over if you do not want them listed.

---

## 8.5 Managing Images

- Upload JPEG, PNG, WebP, or GIF up to 15 MB.
- Choose a photo that represents the event mood — workshops benefit from action shots; retreats from landscape imagery.
- Add a clear description in the event title and description; the image alt text is derived from your content context.

---

## 8.6 How Events Appear on the Site

| Location | Which events appear |
|----------|---------------------|
| Homepage — Featured events | Events with **Featured** checked |
| Homepage — Retreats preview | Retreat-category events |
| Program page — Events section | Filtered by your section settings |
| Events listing page | All **Published** events |

---

# 9. Gallery Management

Your photo gallery showcases the life of your studio. Manage it under CMS → **Gallery** tab.

---

## 9.1 Gallery Collections

Photos are organized into **collections** (tabs at the top of the gallery manager). Collections are pre-set for your studio — for example, art, yoga nidra, or travel events.

**You cannot create new collection tabs** through the admin. You add photos *within* the existing collections.

[Screenshot: Gallery manager with collection tabs]

---

## 9.2 Uploading Photos

1. Select the correct **collection** tab.
2. Click **Upload multiple images**.
3. Select one or more photos from your computer.
4. For each pending upload, enter **Title** and **Alt text**.
5. Click **Save N pending upload(s)**.

> **Tip**  
> Alt text should describe what is in the photo for visitors using screen readers and for search engines.

---

## 9.3 Editing a Photo

1. Click the image in the list.
2. Update **Title**, **Alt text**, or **Description**.
3. Toggle **Featured on homepage** to show in the homepage gallery preview.
4. Toggle **Published** to hide a photo without deleting it.
5. Click **Save changes**.

---

## 9.4 Deleting a Photo

1. Click the image to open the editor.
2. Click **Delete**.
3. Confirm if prompted.

---

## 9.5 Organizing Photos

Use **↑** and **↓** arrows on each row to change display order within a collection.

---

## 9.6 Collages

Collages are reusable multi-image layouts for your hero or sections.

**To create or edit a collage:**

1. Scroll to the **Collages** panel in the Gallery tab.
2. Select an existing collage or click **New collage**.
3. Enter **Collage name** and **slug**.
4. Choose a **Layout** preset (Masonry grid, Stacked, Hero + supporting images, etc.).
5. Link a **Collection**.
6. Click images to include them.
7. Preview in desktop, tablet, and mobile viewports.
8. Click **Save collage**.

Use collages in the homepage hero by setting Hero media mode to **Collage**.

---

## 9.7 Image Size Recommendations for Gallery

| Recommendation | Detail |
|----------------|--------|
| Format | JPEG or WebP for photos |
| Max file size | 15 MB per image |
| Dimensions | At least 1600px on the longest side for best quality |
| Aspect ratio | Mixed ratios work — the gallery layouts adapt |

The system automatically creates optimized versions for fast loading.

---

# 10. Contacts & Subscribers

---

## 10.1 Contacts (Inquiry Messages)

**Where to view:** Contacts in the admin menu

**What is collected** when someone submits an inquiry form:

| Information | Always collected? |
|-------------|-------------------|
| Name | Yes |
| Email | Yes |
| Subject | Yes |
| Message | Yes |
| Phone | Optional (if provided) |
| Preferred contact method | Optional (WhatsApp, Call, Email, etc.) |
| Newsletter opt-in | Optional checkbox |

**How to view:**

1. Go to **Contacts**.
2. Messages appear newest first.
3. Each card shows subject, sender name, timestamp, email, preferred contact method, and full message.

**Export:** There is no export button in the admin. To keep records, copy important details to your email archive or spreadsheet manually.

> **Best practice**  
> Check Contacts at least once per business day and reply from your regular email client using the address shown.

---

## 10.2 Subscribers (Newsletter List)

**Where to view:** Subscribers in the admin menu

**What is collected:**

| Field | Description |
|-------|-------------|
| Name | If provided |
| Email | Always |
| Subscribed date | When they opted in |

**How people get on this list:**

- Checking **“Receive newsletter updates from us”** on a contact/inquiry form
- Other signup paths your developer may enable

**Export:** No export button is built into the admin. You can manually copy emails or ask your developer for a data export if you need to import into Mailchimp or similar.

---

# 11. Design Settings

Design Settings control how your entire website *looks*. Open **Design settings** from the admin menu.

A **live preview panel** on the right shows how changes will appear. Always click **Save design settings** when finished.

[Screenshot: Design Settings with Typography tab and live preview]

---

## 11.1 Typography

**Tab:** Typography

Control fonts for four roles:

| Role | Where it appears |
|------|------------------|
| Headings | Page titles, section headings |
| Body | Paragraphs, general text |
| Navigation | Menu links in the header |
| Buttons | Button labels site-wide |

### Per-role settings

| Setting | What it does |
|---------|--------------|
| Font family | Choose from curated fonts (e.g. Cormorant Garamond, DM Sans) |
| Font weight | Light (300) through Bold (700) |
| Font size | Size in pixels |
| Font color | Color picker |
| Letter spacing | Navigation only — space between letters |

**How to test:** Watch the preview panel as you change values. After saving, visit the homepage and a program page to confirm.

> **Tip**  
> Pair a serif font (headings) with a sans-serif font (body) for an elegant, readable combination.

---

## 11.2 Colors

**Tab:** Colors

| Setting | What it changes |
|---------|-----------------|
| Primary | Main brand color — buttons, accents |
| Accent | Secondary highlights |
| Background | Page background tone |
| Foreground | Default text color |
| Muted | Subtle text (captions, labels) |

### Site background preset

Choose the atmospheric background style for all pages:

| Preset | Mood |
|--------|------|
| Luminous Aurora | Soft, glowing gradients (default) |
| Breath Mandala | Meditative circular patterns |
| Warm Horizon | Sunset-inspired warmth |
| Quiet Ripple | Gentle water-like movement |

### Selection colors

| Setting | What it changes |
|---------|-----------------|
| Selection background | Highlight color when visitors select text |
| Selection text | Text color within the selection |

**How to test:** Save, then highlight text on your live site with your mouse.

---

## 11.3 Header Layout

**Tab:** Header layout

### Branding logos

| Brand | Used where |
|-------|------------|
| Nirvana Yoga | Default across site, homepage hero |
| Just Art Affaire | Just Art Affaire page navigation |

For each logo:

| Control | Purpose |
|---------|---------|
| Logo upload | Replace the logo image (saves immediately on upload) |
| Logo scale | Size multiplier (0.5× to 4×) |

### Header position controls

| Setting | What it changes |
|---------|-----------------|
| Logo width | Width in pixels (0 = automatic) |
| Logo height | Height in pixels |
| Left / Right offset | Push logo away from edges |
| Header gap | Space between navigation links |
| Alignment | Left, Center, Right, or Custom |
| Custom horizontal position | Fine-tune when alignment is Custom |

**Where it appears:** The top navigation bar on every page.

---

## 11.4 Hero Layout

**Tab:** Hero layout

| Setting | Options |
|---------|---------|
| Hero logo alignment | Left, Center, Right |

**Where it appears:** Homepage hero — positions your logo relative to the headline and buttons.

---

## 11.5 Navigation

**Tab:** Navigation

| Setting | What it changes |
|---------|-----------------|
| Link color | Default menu link color |
| Active color | Current page link color |
| Hover color | Color when mouse hovers over a link |

**How to test:** Save, then move your mouse over menu items on the live site.

---

## 11.6 Saving Design Settings

1. Make changes across any tabs.
2. Click **Save design settings** at the bottom.
3. Wait for confirmation.

> **Note**  
> Logo uploads save **immediately** when uploaded — you do not need to click Save for those. Other settings require **Save design settings**.

---

# 12. Global Settings vs Page-Specific Settings

Your website applies design in layers. Think of it like decorating a house:

- **Global settings** = the paint and flooring throughout the whole house
- **Page-specific settings** = a different accent wall in one room
- **Section settings** = a special frame around one photograph

---

## 12.1 Global Settings

**Edited in:** Design Settings

**Apply to:** Every page unless something more specific overrides them.

**Examples:**

- Body font = DM Sans → all paragraphs use DM Sans
- Primary color = terracotta → buttons site-wide use terracotta
- Header logo height = 48px → navigation logo size everywhere

---

## 12.2 Page-Specific Settings

**Edited by:** Your developer (not in standard admin tabs)

**Apply to:** One program page only (Yoga, Healing, Just Art Affaire, or About).

### Example 1: Different heading font on Yoga page

| Layer | Headings font |
|-------|---------------|
| Global | Playfair Display |
| Yoga page override | Cormorant Garamond |
| **Result** | Yoga page uses Cormorant. All other pages use Playfair. |

### Example 2: Different accent on Healing page

| Layer | Accent color |
|-------|--------------|
| Global | #d97745 (terracotta) |
| Healing page override | #5a7a65 (sage green) |
| **Result** | Healing page accents are sage. Other pages stay terracotta. |

### Example 3: No page override

| Layer | Body font |
|-------|-----------|
| Global | DM Sans |
| Yoga page override | (none) |
| **Result** | Yoga page uses DM Sans like everywhere else. |

---

## 12.3 Section-Specific Settings

**Edited in:** Preview Studio (layout and timeline styling)

**Apply to:** One section on one page.

### Example: Wider content on one About section

| Layer | Content width |
|-------|---------------|
| Global | Normal |
| About page | Normal |
| One biography section (via Preview Studio) | Wide |
| **Result** | Only that section is wider. Others stay normal. |

### Example: Timeline colors on About page only

| Layer | Timeline number color |
|-------|----------------------|
| Site-wide timeline scope | Burgundy |
| **Result** | All timeline sections across the site use burgundy numbers. |

When editing timeline styling, choose scope carefully:

- **This timeline only** — just this section
- **All timeline sections on this page** — all timelines on About (for example)
- **All timeline sections site-wide** — every timeline everywhere

---

## 12.4 Quick Reference Table

| I want to change… | Where to go |
|-------------------|-------------|
| Fonts site-wide | Design Settings → Typography |
| Colors site-wide | Design Settings → Colors |
| One page’s font (special) | Ask developer |
| One section’s padding | Preview Studio → Save layout |
| Timeline colors | Section editor or Preview Studio → Save timeline style |

---

# 13. The Preview System

The Preview System lets you see changes before they go live — and fine-tune spacing, sizing, and alignment with sliders.

---

## 13.1 Where to Find Preview Studios

| Preview Studio | How to open |
|----------------|-------------|
| Homepage | CMS → Preview studio tab, or `/admin/content/preview` |
| Yoga | Program Pages → Yoga → Preview studio — Yoga |
| Healing | Program Pages → Healing → Preview studio — Healing |
| Just Art Affaire | Program Pages → Just Art Affaire → Preview studio |
| About | Program Pages → About → Preview studio — About |

[Screenshot: Preview Studio with desktop/tablet/mobile toggles]

---

## 13.2 Device Previews

At the top of Preview Studio, switch between:

| Viewport | Simulates |
|----------|-----------|
| Desktop | Laptop or monitor |
| Tablet | iPad-sized screen |
| Mobile | Phone-sized screen |

Always check all three before publishing major layout changes.

---

## 13.3 Using the Preview Panel

1. The page renders in a preview frame.
2. **Click any section** to select it.
3. An **Editor** drawer opens with sliders and options.
4. Adjust values — changes appear **instantly** in the preview.
5. Click **Save layout** to keep changes permanently.
6. Click **Reset section** to undo preview changes back to last saved state.

> **Important**  
> Preview changes are **temporary until you click Save layout**. The banner at the top reminds you of this.

---

## 13.4 What Updates Instantly vs What Requires Saving

| Action | Instant preview? | Requires save button? |
|--------|------------------|----------------------|
| Moving a slider in Preview Studio | Yes | Yes — **Save layout** |
| Typing text in CMS forms | No — not in Preview Studio | Yes — section save button |
| Uploading an image | Shows after upload + save | Yes |
| Design Settings changes | Yes in preview panel | Yes — **Save design settings** |
| Program section draft | Visible in Preview Studio | **Publish** for live site |

---

## 13.5 Save Behavior Summary

| Area | Save button | Effect |
|------|-------------|--------|
| CMS Hero | Save hero | Live immediately |
| CMS Homepage sections | Save homepage sections | Live immediately |
| CMS Site & footer | Save site config | Live immediately |
| Program section | Save draft / Publish | Draft = preview only; Publish = live |
| Preview Studio layout | Save layout | Live for that section’s layout |
| Preview Studio timeline | Save timeline style | Live for timeline appearance |
| Design Settings | Save design settings | Live site-wide |
| Blog / Events | Create / Update post or event | Live when Published |

---

## 13.6 View Live Page

Click **View live page** in Preview Studio to open the public website in a new tab. Compare preview to live after saving.

---

# 14. Analytics

**Where to view:** Analytics in the admin menu

Analytics help you understand how people use your website. The system is privacy-friendly: it does not store personal information or IP addresses.

---

## 14.1 Visitors

| Metric | Meaning |
|--------|---------|
| Total | Unique visitors since tracking began |
| Today | New visitors today |
| This week | New visitors in the last 7 days |

A “visitor” is counted once per browser using an anonymous cookie — not by name or email.

---

## 14.2 Page Views (Traffic)

| Metric | Meaning |
|--------|---------|
| Total page views | Every page load counted |
| Today | Views today |
| This week | Views in the last 7 days |

**Visitors vs page views:** One visitor might view five pages in a session. That counts as one visitor but five page views.

---

## 14.3 Popular Pages (Top Pages)

A table of the ten most-viewed pages on your site, with path and view count.

| Path example | Likely page |
|--------------|-------------|
| `/` | Homepage |
| `/yoga` | Yoga program page |
| `/blog/your-article-slug` | A specific blog post |

---

## 14.4 How to Interpret the Numbers

| Pattern | Possible meaning |
|---------|------------------|
| Homepage views high | Normal — most people start here |
| Blog post views spike | Article was shared or is ranking in search |
| Program page views rise | Interest in that offering — consider promoting related events |
| Low overall numbers | New site, or need for social media / SEO promotion |

> **Tip**  
> Check analytics monthly, not hourly. Trends over weeks are more meaningful than daily fluctuations.

---

## 14.5 Analytics Not Updating?

Analytics exclude admin visits, API calls, and image loads. Only real visitor page views count. If numbers seem low, you may be testing while logged in — your own browsing in `/admin` is not tracked.

---

# 15. Diagnostics

**Where to view:** Diagnostics in the admin menu

Diagnostics is your website’s health dashboard. You do not need to check it daily, but it is valuable when something feels wrong.

[Screenshot: Diagnostics dashboard overview]

---

## 15.1 System Health (Live)

Shows real-time server performance:

| Metric | What it means |
|--------|---------------|
| CPU now / average | How hard the server is working (high sustained = problem) |
| RAM now / average | Memory usage |
| Uptime | How long since the server last restarted |
| Sparkline charts | Visual trend over the last minute |

**Live monitoring** can be toggled on/off. It polls every 5 seconds.

---

## 15.2 Storage Overview

| Metric | What it means |
|--------|---------------|
| Disk total / used / free | Overall server storage |
| Measured app data | Space used by your uploads, database, and logs |
| Unaccounted disk | System files, Docker images — usually normal |

### Storage breakdown

| Category | Contains |
|----------|----------|
| Uploads | Your photos and files |
| Database | All text content, events, blog posts |
| Brand assets | Logo files |
| Logs | Server activity records |

### Uploads by folder

Shows how much space each upload category uses (events, gallery, blog, etc.).

**When to worry:** If disk free space is very low (under 10%), contact your developer.

---

## 15.3 Database Information

Shows counts of your content (blog posts, events, page sections, gallery images, uploaded files) and total database size. Useful for confirming content was saved.

---

## 15.4 Services Status

| Service | Healthy means |
|---------|---------------|
| Application | Website software is running |
| Database | Connected and responding |
| Uploads | Server can write new files |

If any show a problem status, contact your developer.

---

## 15.5 Backup Status

| Backup type | What it protects |
|-------------|------------------|
| Database backup | All content and settings |
| Uploads backup | All uploaded images and files |

Shows last successful backup time and file size. If backups show “not configured,” ask your developer to set up automated backups.

---

## 15.6 Application Errors

Click **View application errors** to see a log of recent problems:

| Category | Examples |
|----------|----------|
| Failed uploads | Image too large or wrong format |
| Failed logins | Wrong secret key attempts |
| CMS save failures | Network or server issue during save |
| Image processing failures | Gallery image could not be optimized |

Each entry shows date, message, and details. If you see repeated CMS save failures, note the time and contact your developer.

---

## 15.7 When to Contact the Developer (Diagnostics)

| Situation | Action |
|-----------|--------|
| Uploads folder “not writable” | Contact developer immediately |
| Database “failed” | Contact developer immediately |
| Backups not configured | Ask developer to enable |
| Occasional single upload failure | Retry; check file size and format |
| CPU/RAM high briefly | Usually normal during heavy use |

---

# 16. Branding

Your brand identity — logos and visual presence — is managed primarily in **Design Settings → Header layout**.

---

## 16.1 Nirvana Yoga Logo

**Used on:** Navigation bar, footer, homepage hero, admin login screen

**To upload a new logo:**

1. Go to **Design settings** → **Header layout**.
2. Find **Nirvana Yoga** in the branding section.
3. Click upload and select your file.
4. The logo saves automatically.

**Logo scale:** Use the slider (0.5× to 4×) to adjust size without re-uploading.

---

## 16.2 Just Art Affaire Logo

**Used on:** Just Art Affaire program page navigation, section titles on that page

Upload and scale the same way as the Nirvana Yoga logo.

---

## 16.3 Hero Logo

The homepage hero displays the **Nirvana Yoga** logo above the headline. Its position (left, center, right) is set in **Design Settings → Hero layout → Hero logo alignment**.

---

## 16.4 Brand Colors

Brand colors are not a separate panel — they are your **Design Settings → Colors** choices:

- Set **Primary** and **Accent** to match your brand palette.
- Coordinate with your logo colors for a cohesive look.

---

## 16.5 Recommended Logo Dimensions

| Format | Recommendation |
|--------|----------------|
| File type | PNG with transparent background, or SVG for crisp scaling |
| Dimensions | At least 400px wide; height proportional |
| Max file size | 15 MB (logos are usually much smaller) |
| Aspect ratio | Horizontal logos work best in the navigation bar |

> **Tip**  
> If your logo looks too small or large, adjust **Logo scale** before uploading a different file.

---

# 17. Image Guidelines

High-quality images make your website feel professional and welcoming. Follow these guidelines for best results.

---

## 17.1 General Rules (All Images)

| Rule | Detail |
|------|--------|
| Max file size | 15 MB per image |
| Formats | JPEG, PNG, WebP, GIF (SVG for logos only) |
| Quality | Use well-lit, in-focus photos |
| Alt text | Always describe the image — required for accessibility |

---

## 17.2 Hero Images

| Recommendation | Detail |
|----------------|--------|
| Aspect ratio | Wide landscape (16:9 or 3:2) works best |
| Dimensions | At least 1920 × 1080 pixels |
| Subject | Clear focal point; avoid cluttered backgrounds |
| Text overlay | Ensure headline text remains readable — avoid busy areas behind text |
| Mood | Calm, inviting, authentic to your studio |

---

## 17.3 Gallery Images

| Recommendation | Detail |
|----------------|--------|
| Dimensions | At least 1600px on longest side |
| Mix | Variety of orientations is fine — layouts adapt |
| Consistency | Similar color grading creates a cohesive gallery |

---

## 17.4 Blog Images

| Image type | Recommendation |
|------------|----------------|
| Cover image | 1200 × 630px or larger (landscape) |
| Inline images | At least 1000px wide |
| Gallery sections | 800px minimum; consistent orientation helps |

---

## 17.5 Program Page Images

| Image type | Recommendation |
|------------|----------------|
| Section images | 1200 × 800px minimum |
| Hero sections | Wide format, 1920px wide ideal |
| Gallery sections | Mix of detail and wide shots |

---

## 17.6 Event Images

| Recommendation | Detail |
|----------------|--------|
| Dimensions | 800 × 600px minimum |
| Content | Show the activity, location, or atmosphere |
| Text | Do not embed important text in the image — use the description field |

---

## 17.7 File Size Tips

Large files slow uploads and page loading:

- Resize photos before uploading (your phone’s “Large” setting is often sufficient).
- Use JPEG for photographs at 80–85% quality.
- Use PNG only when you need transparency.

---

# 18. Frequent Tasks — Quick Guides

---

## 18.1 How to Publish a New Blog Post

1. **Blog posts** → **Create post**
2. Enter title and summary
3. Upload cover image
4. Add story sections (Rich text, Image, Gallery, etc.)
5. Add tags
6. Check **Published**, set date
7. **Create post**
8. Visit live blog to proofread

---

## 18.2 How to Change Homepage Text

1. **CMS** → **Homepage sections**
2. Find the section (e.g. Philosophy, Program pathways)
3. Edit the text fields
4. **Save homepage sections**

For hero headline: **CMS** → **Hero** → edit → **Save hero**.

---

## 18.3 How to Replace a Photo

**Homepage hero:** CMS → Hero → upload new image → Save hero

**Gallery:** CMS → Gallery → click image → upload or edit → Save changes

**Program page:** Program Pages → Edit section → upload new section image → Publish

**Blog:** Edit post → upload new cover or section image → Update post

---

## 18.4 How to Add an Event

1. **Events** → **Create event**
2. Fill title, date, location, category, description
3. Upload image
4. Check **Published**; check **Featured** for homepage
5. **Create event**

---

## 18.5 How to Update Contact Details

1. **CMS** → **Site & footer**
2. Update email, phone, address, Instagram URLs
3. **Save site config**
4. Check footer on live site

---

## 18.6 How to Change Fonts

1. **Design settings** → **Typography**
2. Select role (Headings, Body, Navigation, Buttons)
3. Choose font family, weight, size, color
4. **Save design settings**
5. Check homepage and one inner page

---

## 18.7 How to Change Colors

1. **Design settings** → **Colors**
2. Adjust Primary, Accent, Background, etc.
3. Adjust Selection colors if desired
4. Choose Site background preset
5. **Save design settings**

---

## 18.8 How to Upload a Logo

1. **Design settings** → **Header layout**
2. Find Nirvana Yoga or Just Art Affaire
3. Upload PNG or SVG
4. Adjust Logo scale if needed (saves automatically)
5. Check navigation on live site

---

# 19. Troubleshooting

---

## 19.1 Image Won’t Upload

| Check | Solution |
|-------|----------|
| File too large? | Must be under 15 MB — resize and retry |
| Wrong format? | Use JPEG, PNG, WebP, or GIF |
| Not logged in? | Sign in again — sessions expire after 24 hours |
| Still failing? | Check Diagnostics → Application errors; contact developer |

---

## 19.2 Changes Not Appearing on Live Site

| Check | Solution |
|-------|----------|
| Did you click Save? | All CMS forms require explicit save |
| Program section in draft? | Click **Publish**, not just Save draft |
| Browser cache? | Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac) |
| Editing wrong section? | Confirm you are on the correct tab or page type |
| Preview Studio only? | Click **Save layout** in Preview Studio |

---

## 19.3 Wrong Font Showing

| Check | Solution |
|-------|----------|
| Global font | Design Settings → Typography → save |
| One page different | May be a page override — ask developer |
| Timeline section | Check Timeline styling scope in section editor |
| Browser cache | Hard refresh the page |

---

## 19.4 Page Layout Looks Broken

| Check | Solution |
|-------|----------|
| Recent Preview Studio changes? | Open Preview Studio → Reset section |
| Very long unbroken text? | Add paragraph breaks |
| Huge image? | Resize image before upload |
| Mobile only? | Check Preview Studio mobile viewport |

---

## 19.5 Analytics Not Updating

| Check | Solution |
|-------|----------|
| Testing while logged in? | Admin visits are not counted |
| Checking too soon? | Allow a few minutes for data to appear |
| Very low traffic? | Normal for new or quiet sites |

---

## 19.6 Cannot Log In

| Check | Solution |
|-------|----------|
| Wrong secret key? | Re-enter carefully (case-sensitive) |
| Too many attempts? | Wait one minute, try again |
| Session expired? | Normal after 24 hours — sign in again |
| “Admin secret not configured” | Server issue — contact developer |

---

## 19.7 Save Failed or Error Message

1. Check your internet connection.
2. Try the save again.
3. If it fails twice, go to **Diagnostics** → **Application errors**.
4. Note the time and error message.
5. Contact your developer with those details.

---

## 19.8 Testimonial Not Showing

| Check | Solution |
|-------|----------|
| Status | Must be **Approved**, not Pending or Rejected |
| Homepage section | Testimonials section must have content configured |
| Featured flag | Optional — controls prominence, not visibility |

---

# 20. When to Contact the Developer

---

## 20.1 Safe Tasks (You Can Do These)

- Edit all text and images through the CMS
- Create, edit, publish, and delete blog posts
- Create, edit, and delete events
- Manage gallery photos and collages
- Approve and reorder testimonials
- Change fonts, colors, and logos in Design Settings
- View contacts, subscribers, analytics, and diagnostics
- Use Preview Studios for layout tuning
- Add, edit, publish, and reorder program page sections

---

## 20.2 Tasks Requiring Developer Assistance

| Task | Why |
|------|-----|
| Change domain name or DNS | Server and SSL configuration |
| Reset or change admin secret key | Stored in server environment |
| Set up email delivery from the server | Technical mail configuration |
| Fix website completely down | Server or application failure |
| Database errors | Technical repair needed |
| Enable or restore backups | Server cron and scripts |
| Add new gallery collection tabs | Pre-configured in system |
| Add new page types or features | Requires code changes |
| Page-specific font/color overrides | Developer-level settings |
| Major redesign (new layout structure) | Beyond CMS content edits |
| SSL certificate issues | Server configuration |
| Newsletter form not collecting signups | May need technical fix |
| Recover deleted content | Database restore from backup |

---

## 20.3 How to Report a Problem

When contacting your developer, include:

1. **What you were trying to do** (e.g. “Upload event image”)
2. **What happened** (e.g. “Error message after clicking Save”)
3. **When** (date and approximate time)
4. **Screenshot** if possible
5. **Any error from Diagnostics** → Application errors

---

# 21. Website Ownership & Maintenance

---

## 21.1 What Is Hosted on Your Server (VPS)

Your website runs on a **VPS** (Virtual Private Server) — a dedicated slice of a remote computer that stays on 24/7.

**What lives on the server:**

| Component | Purpose |
|-----------|---------|
| Website application | The Nirvana Yoga site and CMS |
| Database | All your content, events, posts, settings |
| Uploaded images | Gallery, blog, event photos |
| Web server (Nginx) | Delivers the site to visitors securely |
| SSL certificate | Enables `https://` secure browsing |

**Architecture (simplified):**

```
Visitor's browser
       ↓
   Your domain (e.g. nirvanayoga.org)
       ↓
   Web server (Nginx)
       ↓
   Nirvana Yoga website
       ↓
   Database + uploaded images
```

---

## 21.2 What Is Backed Up

Automated backups should include:

| Backup | Contents | Typical schedule |
|--------|----------|------------------|
| Database | All content and settings | Nightly |
| Uploads | All uploaded images and files | Nightly |
| SSL certificates | Security certificates | Managed with renewal |

Check **Diagnostics → Backup status** for last backup time.

> **Important**  
> Backups on the server protect against software failures. Your developer should also copy backups to a separate location (cloud storage, another server) in case of hardware failure.

---

## 21.3 How Updates Are Handled

| Update type | Who handles it |
|-------------|----------------|
| Content changes (you) | Saved through CMS — immediate |
| Security patches and software updates | Developer |
| New features you request | Developer — quoted and scheduled |
| Domain or SSL changes | Developer |

Do not attempt to update server software yourself.

---

## 21.4 Maintenance Recommendations

| Task | Frequency | Who |
|------|-----------|-----|
| Check contact messages | Daily or weekly | You |
| Review analytics | Monthly | You |
| Publish blog or event content | As needed | You |
| Verify backups in Diagnostics | Monthly | You or developer |
| Server updates and security | As needed | Developer |
| Review Diagnostics errors | After any issue | You or developer |
| Test admin login | Monthly | You |
| Renew domain registration | Annually | You (domain registrar) |

---

## 21.5 Your Responsibilities as Owner

- Keep your **admin secret key** secure
- Keep your **domain registration** current
- Respond to contact inquiries promptly
- Provide content (text, photos) for updates
- Report website problems to your developer with details

---

## 21.6 Developer Maintenance (Typical)

- Server security updates
- SSL certificate renewal
- Database and upload backups
- Fixing bugs and errors
- Performance monitoring
- Deploying new features you request

---

# Appendix A: CMS Glossary

| Term | Plain-language meaning |
|------|------------------------|
| Admin | The private area where you manage the website (`/admin`) |
| Alt text | A short description of an image for accessibility |
| CMS | Content Management System — the editing interface |
| CTA | Call to Action — a button that invites a click (“Learn more”) |
| Draft | Saved but not visible on the public site |
| Featured | Highlighted content (e.g. featured events on homepage) |
| Hero | The large banner at the top of a page |
| Layout | How content is arranged — spacing, width, alignment |
| OCR | Automatic text reading from a photo (testimonials) |
| Preview Studio | Visual editor for fine-tuning section layout |
| Publish | Make content visible on the live website |
| Section | A content block on a page (text, gallery, events, etc.) |
| Slug | The URL-friendly name (e.g. `spring-retreat`) |
| SSL | Security that enables `https://` in the browser |
| VPS | The remote server where your website lives |

---

# Appendix B: Recommended Image Sizes

| Use | Min dimensions | Aspect ratio | Max file size | Format |
|-----|----------------|--------------|---------------|--------|
| Homepage hero | 1920 × 1080 | 16:9 or 3:2 | 15 MB | JPEG/WebP |
| Logo | 400px wide | Horizontal | 15 MB | PNG/SVG |
| Gallery photo | 1600px longest side | Any | 15 MB | JPEG/WebP |
| Blog cover | 1200 × 630 | ~1.9:1 | 15 MB | JPEG/WebP |
| Blog inline | 1000px wide | Any | 15 MB | JPEG/WebP |
| Event image | 800 × 600 | 4:3 or 16:9 | 15 MB | JPEG/WebP |
| Program section | 1200 × 800 | 3:2 | 15 MB | JPEG/WebP |
| Testimonial screenshot | 800px wide | Any | 15 MB | JPEG/PNG |

---

# Appendix C: Content Writing Tips

## Voice and tone

- Write as you speak to students — warm, clear, unhurried
- Avoid jargon unless you explain it
- Use short paragraphs (2–4 sentences)

## Headlines

- Lead with benefit or feeling, not just the activity name
- Keep under 10 words when possible

## Calls to action

- Use specific verbs: “Explore the Yoga program” not “Click here”
- Match the button text to where it leads

## Blog posts

- Open with a personal moment or question
- Use section breaks (story sections) every 2–3 paragraphs
- End with a gentle invitation (class, event, or newsletter)

## About page

- Tell your story chronologically in the timeline
- Let philosophy sections breathe — one sutra at a time

---

# Appendix D: SEO Best Practices

**SEO** (Search Engine Optimization) helps people find your site through Google and other search engines.

| Practice | How to do it in your CMS |
|----------|--------------------------|
| Descriptive page titles | Use clear section titles and blog post titles |
| Alt text on every image | Describe what is in the photo |
| Blog tags | Add relevant tags (yoga, city name, retreat) |
| Fresh content | Publish blog posts and events regularly |
| Clear URLs (slugs) | Use readable slugs: `kyoto-retreat-2026` not `event1` |
| Contact information | Keep email, phone, and address current in Site & footer |
| Mobile-friendly layout | Use Preview Studio to verify mobile appearance |

> **Note**  
> Your developer may have configured additional SEO settings (meta descriptions, sitemap, structured data). Ask them for a summary if you want to go deeper.

---

# Document Information

| Item | Detail |
|------|--------|
| Website | Nirvana Yoga |
| Document | Complete Client Handbook |
| Version | 1.0 |
| Date | June 2026 |
| Admin URL | `https://yoursite.com/admin` |

---

*Thank you for caring for the Nirvana Yoga digital home. May your updates reflect the same presence and intention you bring to the mat.*

---

**End of Handbook**
