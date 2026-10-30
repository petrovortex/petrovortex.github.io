# Configuration

[Documentation](../README.md#documentation) / Configuration

Open the files below in a text editor. Paths start in the site folder containing `package.json` and `_config.yml`. In YAML files, change existing values and preserve indentation; use spaces, not tabs.

On this page: [Site data](#site-data) · [Presentation](#presentation) · [Integrations](#scope-and-existing-integrations) · [Credits](#credits-and-licenses)

## Site data

| Change | File | Notes |
| --- | --- | --- |
| Title, author for exports, email, public origin, timezone | [_config.yml](../_config.yml) | Restart Jekyll after editing; rebuild exports after changing origin or author |
| Greeting, bio, page introductions, interface translations | [_data/ui.yml](../_data/ui.yml) | Keep corresponding `en` and `ru` keys together |
| Portrait, CV URLs, career timeline | [_data/profile.yml](../_data/profile.yml) | Timeline labels have language-specific values |
| Social profiles, platform names, groups, and icons | [_data/social.yml](../_data/social.yml) | Used by Links and the footer; group IDs are `personal`, `channels`, and `code`. Links show platform names without descriptions |
| Reader-message handles | [_data/contact.yml](../_data/contact.yml) | Separate from public profile links; email comes from `_config.yml` |
| Selected vault files | [config/obsidian-imports.yml](../config/obsidian-imports.yml) | Selects vault notes and sets their publication properties |
| Course description, topics, status, attribution | Its file in [_courses](../content/_courses/) | See [course fields](content-reference.md#course-fields) |

Save the edited file and refresh the browser after the local preview rebuilds. If you changed `_config.yml`, stop the preview with Ctrl+C in its terminal and repeat the [preview start command](setup.md#daily-preview). If you changed the author or public site URL, also run `npm run content:exports` in a [separate site terminal](setup.md#where-to-run-commands) to update downloads.

The displayed author name is also present in `_layouts/default.html`, `_layouts/home.html`, and `_includes/site/feed.xml`; changing `_config.yml` alone does not replace those strings. Profile content and the AP favicon are authored assets, not generated from the config's name field.

In `_data/contact.yml`, a numeric `discord_id` enables a Discord profile link for reader messages. With only the handle, the form explains how to find the author. Changing a social URL does not automatically change the contact form's destination.

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
| Homepage, Blog, Library, and Links page metadata | `pages/en/` and `pages/ru/`; explicit `permalink` fields preserve their public URLs |
| Shared header/footer and page metadata | [_layouts/default.html](../_layouts/default.html) |
| Blog and Library list rows | [_layouts/blog.html](../_layouts/blog.html), [_layouts/library.html](../_layouts/library.html) |
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
| Hosting | The repository's GitHub Pages publishing configuration; no server application in this repository |

A new origin, additional language, or subdirectory deployment needs a deliberate audit of these boundaries. Changing one config value does not establish support for all of them. Production statistics are not credentials needed for local preview; development should keep using the local adapter. Existing Firebase client identifiers are public configuration, while backend access remains governed by the database's rules.

There is no automatic Substack publisher or messaging backend. See [Site behavior](site-features.md) for RSS, sharing, contact drafts, and caching.

## Credits and licenses

The compact footer colophon is defined in [_includes/site/credits.html](../_includes/site/credits.html). It credits Lucide/Feather UI icons, Simple Icons brand icons, Inter, Jekyll, and MathJax. Third-party license files are in [assets/licenses](../assets/licenses/).


The custom illustrations and AP favicon are site artwork. Course-specific attribution belongs in course metadata and appears on note pages and downloads, separate from the footer credits. This repository currently has no repository-wide `LICENSE` file.

Related: [Site behavior](site-features.md) · [Development](development.md) · [Content reference](content-reference.md)
