# Configuration

[Documentation](../README.md#documentation) / Configuration

Open the files below in a text editor. Paths start in the site folder containing `package.json` and `_config.yml`. In YAML files, change existing values and preserve indentation; use spaces, not tabs.

On this page: [Site data](#site-data) · [Publications](#publications) · [Timeline](#homepage-timeline) · [Photos](#homepage-photos) · [Presentation](#presentation) · [Integrations](#scope-and-existing-integrations) · [Credits](#credits-and-licenses)

## Site data

| Change | File | Notes |
| --- | --- | --- |
| Title, author for exports, email, public origin, timezone | [_config.yml](../_config.yml) | Restart the preview after editing; rebuild exports after changing origin or author |
| Greeting, bio, page introductions, interface translations | [_data/ui.yml](../_data/ui.yml) | Keep corresponding `en` and `ru` keys together |
| Portrait, CV link, career timeline | [_data/profile.yml](../_data/profile.yml) | Both languages use the same CV |
| Social profiles, platform names, groups, and icons | [_data/social.yml](../_data/social.yml) | Used by Links and the footer; group IDs are `personal`, `channels`, `research`, and `competitions`. Links show platform names without descriptions |
| Publication citations and their order | [_data/publications.yml](../_data/publications.yml) | One shared list for the English and Russian pages; see [Publications](#publications) |
| Reader-message handles | [_data/contact.yml](../_data/contact.yml) | Separate from public profile links; email comes from `_config.yml` |
| Selected vault files | [config/obsidian-imports.yml](../config/obsidian-imports.yml) | Selects vault notes and sets their publication properties |
| Notebook description, topics, status, attribution | Its file in [_notebooks](../content/_notebooks/) | See [notebook fields](content-reference.md#notebook-fields) |

Save the edited file and refresh the browser after the local preview rebuilds. If you changed `_config.yml`, stop the preview with Ctrl+C in its terminal and repeat the [preview start command](setup.md#daily-preview). If you changed the author or public site URL, also run `npm run content:exports` in a [separate site terminal](setup.md#where-to-run-commands) to update downloads.

The displayed author name is also present in `_layouts/default.html`, `_layouts/home.html`, and `_includes/site/feed.xml`; changing `_config.yml` alone does not replace those strings. Profile content and the AP favicon are authored assets, not generated from the config's name field.

In `_data/contact.yml`, a numeric `discord_id` enables a Discord profile link for reader messages. With only the handle, the form explains how to find the author. Changing a social URL does not automatically change the contact form's destination.

The `research` group is **Research / Исследования** and contains Google Scholar, ORCID, and GitHub. The `competitions` group is **Competitions / Соревнования** and contains Kaggle and LeetCode. Group labels are defined in `_data/ui.yml`; assign each profile's `group` in `_data/social.yml`.

### CV in TeXstudio

Open [resume/cv.tex](../resume/cv.tex) in TeXstudio. Edit the text there, publication entries in [publications.bib](../resume/publications.bib), and formatting in [style.sty](../resume/style.sty). To rebuild the bibliography and PDF, run XeLaTeX, Biber, then XeLaTeX twice on `cv.tex` in TeXstudio.

Commit the edited sources and the resulting [resume/cv.pdf](../resume/cv.pdf) together. The site serves this PDF at `/resume/cv.pdf`. Put previous versions in `resume/archive/`, which stays local.

### Publications

Open `_data/publications.yml` in a text editor. Each entry has an `id` and a `citation`. Edit `citation` directly, or add an entry using this structure:

```yaml
- id: example-2026
  citation: >-
    **A. Author** and B. Author. [Paper title](https://example.org/paper).
    *Journal name* 12 (2026), pp. 1–8.
```

Use normal Markdown for links, **bold**, and *italics*. Each citation appears as one paragraph without a bullet or number. Entries appear in file order; move the whole entry to reorder the list. Keep each `id` unique and unchanged after publication: it supplies the citation's page anchor.

Both language pages use this same list. The CV and the site are not synchronized automatically; when updating a publication in the CV, edit this file separately. Save the file and refresh the local preview after it rebuilds.

### Homepage timeline

Open `_data/profile.yml` and edit the entries under `timeline`. Each entry has `date`, `title`, and `place`, with `en` and `ru` text under each field. Optional `period` gives a role's full duration; optional `detail` adds a short explanation. These fields contain plain text, not Markdown.

Entries appear in file order. Keep the newest events first. Use the event date in `date`; for a role spanning several years, use its start date and put the full range in `period`. Record admission and graduation as separate education milestones. Preserve the source's precision: do not add a month when only a year or season is known. The timeline is edited separately from the CV.

### Homepage photos

Put the two image files under `assets/images/`. In `_data/profile.yml`, set `portrait` to the default image's site path and `portrait_alternate` to the second image's path. For example:

```yaml
portrait: /assets/images/portrait.jpg
portrait_alternate: /assets/images/portrait-alternate.jpg
```

The first image also supplies the default social preview image. The alternate appears only after a visitor activates the portrait. Removing `portrait_alternate` leaves a static photo. The square crop is controlled by `.portrait-frame img` in `assets/css/style.css`; the source images are unchanged.

## Presentation

| Area | Source |
| --- | --- |
| Layout, colors, spacing, dark theme, responsive rules | [assets/css/style.css](../assets/css/style.css) |
| Homepage, Blog, Library, Publications, and Links page metadata | `pages/en/` and `pages/ru/`; explicit `permalink` fields preserve their public URLs |
| Shared header/footer and page metadata | [_layouts/default.html](../_layouts/default.html) |
| Blog and Library list rows | [_layouts/blog.html](../_layouts/blog.html), [_layouts/library.html](../_layouts/library.html) |
| Shared publication list | [_layouts/publications.html](../_layouts/publications.html) |
| Shared reader and contents layout | [_includes/article/reader.html](../_includes/article/reader.html) |
| Uploaded banners and thumbnails | Content image settings; see [Artwork](banner-design.md#assign-artwork) |
| Existing SVG illustration drawings | [scripts/artwork/build-banners.mjs](../scripts/artwork/build-banners.mjs) |
| AP favicon source | [assets/favicon.svg](../assets/favicon.svg) |

New artwork can be created with the [reusable prompts](artwork-prompts.md) and saved as image files. Keep translated labels in `_data/ui.yml` rather than adding interface strings directly to JavaScript.

## Scope and existing integrations

The current site uses English and Russian, root-level hosting (`baseurl: ""`), and the public origin `https://petrovortex.github.io`. It is a maintained personal site, with some assumptions tied to that content and origin.

| Integration | Configuration boundary |
| --- | --- |
| Firebase views/likes | Public client configuration in `assets/js/engagement.js`; live hostname check in `assets/js/main.js` |
| Production engagement selection | Enabled only on `petrovortex.github.io` unless the page explicitly uses preview mode; other hosts use local preview storage |
| Canonical, share, feed, and export URLs | `url`/`baseurl` in `_config.yml`, plus explicit content permalinks |
| Generated-site verification | `scripts/checks/verify-site.mjs` includes assertions for this site's origin and checked-in content |
| Download routing | `scripts/content/documents.mjs` uses explicit permalinks or the current post filename convention |
| Hosting | `.github/workflows/pages.yml` builds and deploys static files; set the repository's Pages source to GitHub Actions |

A new origin, additional language, or subdirectory deployment needs a deliberate audit of these boundaries. Changing one config value does not establish support for all of them. Production statistics are not credentials needed for local preview; development should keep using the local adapter. Existing Firebase client identifiers are public configuration, while backend access remains governed by the database's rules.

There is no automatic Substack publisher or messaging backend. See [Site behavior](site-features.md) for RSS, sharing, contact drafts, and caching.

## Credits and licenses

The compact footer colophon is defined in [_includes/site/credits.html](../_includes/site/credits.html). It credits Lucide/Feather UI icons, Simple Icons brand icons, Inter, Eleventy, and MathJax. Third-party license files are in [assets/licenses](../assets/licenses/).


The custom illustrations and AP favicon are site artwork. Notebook-specific attribution belongs in notebook metadata and appears on note pages and downloads, separate from the footer credits. This repository currently has no repository-wide `LICENSE` file.

Related: [Site behavior](site-features.md) · [Development](development.md) · [Content reference](content-reference.md)
