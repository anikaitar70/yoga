# Design Settings Verification Checklist

Use this after changing global design settings in **Admin → Design settings**. Confirm each item in **Live preview** (right panel) and on the **public site** after save + hard refresh.

| Setting | Saves (200) | Preview updates live | Live site updates |
|--------|-------------|----------------------|-------------------|
| Primary / accent / background colors | ☐ | ☐ | ☐ |
| Heading font family / weight / size / color | ☐ | ☐ | ☐ |
| Body font family / weight / size / color | ☐ | ☐ | ☐ |
| Navigation font + colors | ☐ | ☐ | ☐ |
| Button font + size | ☐ | ☐ | ☐ |
| Selection background + text color | ☐ | ☐ | ☐ |
| Header logo width / height | ☐ | ☐ | ☐ |
| Header alignment (left / center / right / custom) | ☐ | ☐ | ☐ |
| Header offsets + gap | ☐ | ☐ | ☐ |
| Hero logo alignment (left / center / right) | ☐ | ☐ | ☐ |
| Navigation link / hover / active colors | ☐ | ☐ | ☐ |
| Footer credit (Anikait.page) | n/a | n/a | ☐ |
| Just Art Affaire logo in section | n/a | ☐ | ☐ |
| Just Art Affaire hidden from navbar | n/a | ☐ | ☐ |
| Carousel scroll arrows (events, testimonials, gallery rails) | n/a | n/a | ☐ |

## Quick test flow

1. Open **Admin → Design settings**.
2. Change **Navigation → link color** to a distinct hex (e.g. `#0066cc`). Preview nav labels should update immediately.
3. Change **Header → logo height** to `64`. Preview and live header logo should grow.
4. Set **Hero → alignment** to **Right**. Logo, title, and buttons should align right in preview and on homepage.
5. Set **Typography → Headings → font size** to `64px`. Hero title should resize in preview and on site.
6. Set **Colors → Selection background** to `#d97745`. Text selection across the site should use custom colors.
7. Save. Confirm `PUT /api/cms/site` returns **200** and hard-refresh `/` to verify persistence.
8. Confirm `/just-art-life` is **not** in the navbar but still loads at its URL.
9. Confirm **Just Art Affaire** section shows the CMS branding logo (not a text-only title).

## Architecture notes

- **Global defaults:** `SiteConfig.designSettings`
- **Page overrides:** `SiteConfig.designSettingsByPage[pageType]`
- **Section overrides:** `section.layout.designOverrides`
- **Resolution:** `sectionFont ?? pageFont ?? globalFont` via `mergeDesignSettings` / `resolvePageDesignSettings`

Preview and live site share `Navbar`, `HeroSectionView`, and `DesignSettingsProvider` (preview uses scoped CSS variables on a wrapper instead of `document.documentElement`).
