# Repository architecture

[Documentation](../README.md#documentation) / Architecture

Paths in this map start in the site folder containing `package.json` and `_config.yml`. [Development](development.md) covers checks and publishing; [Content authoring](author-guide.md) covers writing.

On this page: [At a glance](#at-a-glance) · [Root files](#root-files) · [Local folders](#local-folders) · [Content and pages](#content-and-page-sources) · [Page rendering](#page-rendering) · [Browser code](#browser-code) · [Build tools](#build-tools) · [Tests](#tests) · [Placement and naming](#placement-and-naming)

## At a glance

This table groups folders by purpose. [README lists every source entry at the root](../README.md#repository-structure); the diagrams below show selected subfolders.

| Area | Location | Responsibility |
| --- | --- | --- |
| Writing | `content/_posts/`, `content/_courses/`, `content/_notes/` | Articles, course collections, and ordered notes |
| Page entry points | `pages/en/`, `pages/ru/`, `pages/redirects/`, `pages/404.html` | Matching language page sources and explicit public routes |
| Site configuration | `_config.yml`, `_data/` | Jekyll settings, translations, profile, social and contact data |
| Tool configuration | `config/` | Selected Obsidian sources and publication metadata; excluded from the site |
| Presentation | `_layouts/`, `_includes/`, `assets/` | Page markup, shared fragments, browser code, and public assets |
| Local tools | `scripts/` | Imports, exports, Jekyll commands, artwork generation, and checks |
| Verification | `tests/` | Browser/content behavior tests and synthetic site content |
| Documentation | `docs/` | Task guides, references, and authoring templates |

Generated public files live beside the sources that consume them: downloads in `assets/downloads/`, their index in `_data/downloads.json`, and rendered articles with formulas or footnotes in `_includes/compiled/`. See [generated-file ownership](development.md#generated-files) before editing them.

## Root files

The full root listing is in [README](../README.md#repository-structure). These files configure or describe the project:

| File | How it is maintained |
| --- | --- |
| `_config.yml` | Edit site settings, collection definitions, and build exclusions here; restart the preview after saving |
| `Gemfile` | Declares the Ruby packages used by Jekyll |
| `Gemfile.lock` | Written by Bundler to record resolved Ruby versions; commit it with dependency changes |
| `package.json` | Defines `npm run` commands and Node dependencies |
| `package-lock.json` | Written by npm to record resolved Node versions; commit it with dependency changes |
| `README.md` | Project overview, root listing, and documentation index |
| `.gitignore` | Excludes local files from normal Git staging; website build exclusions are configured separately in `_config.yml` |

## Local folders

These entries can appear beside the source files in a local checkout. Their presence depends on which tools have run.

| Entry | Contents |
| --- | --- |
| `.git/` | Git history, branches, and remote configuration |
| `.bundle/` | Bundler's local installation settings |
| `node_modules/` | Installed Node packages |
| `vendor/` | Ruby packages installed under `vendor/bundle/` by the setup commands |
| `.preview/` | PDF cache, review images, and temporary test builds |
| `_site/` | Generated website files; edit their sources instead |
| `.jekyll-cache/`, `.jekyll-metadata`, `.sass-cache/` | Build caches that Jekyll or its dependencies may create |

`.git/` is managed by Git. The other entries are excluded by `.gitignore` and are not committed. The vault and the optional `../.site-tools/` installation folder are outside the site root.

## Content and page sources

Jekyll's native [`collections_dir`](https://jekyllrb.com/docs/collections/#gather-your-collections) setting points to `content/`. Collection folders keep their required underscores. Each document lives under its `lang` folder; create a language folder when adding its first document.

```text
content/
  _posts/
    en/                    Dated English articles
    ru/                    Dated Russian articles
  _courses/
    en/                    Course/book introductions and metadata
  _notes/
    en/                    Individual notes
pages/
  en/                      home.html, blog.html, library.html, links.html, feed.xml
  ru/                      Matching Russian page sources
  redirects/               Existing /en/ and /about-*/ compatibility pages
  404.html                 Shared not-found page
```

Russian courses and notes belong in `content/_courses/ru/` and `content/_notes/ru/` when those translations exist. Extra folders inside a language folder can group related notes; course membership and reading order still come from `course` and `order`.

Pages use standard [front matter permalinks](https://jekyllrb.com/docs/permalinks/#front-matter). For example, `pages/en/blog.html` produces `/blog/`, and `pages/ru/blog.html` produces `/ru/blog/`. The source paths do not appear in the public URLs. Existing post filenames retain their language suffixes to preserve filename-derived URLs.

Jekyll reads these directories directly, including during a safe build. No source-copying step or custom plugin is needed. `_config.yml`, `_layouts/`, `_includes/`, and `_data/` stay in their conventional Jekyll locations.

## Page rendering

A route or content document selects a layout through front matter or `_config.yml` defaults. Section layouts use `default.html` for the shared page shell. Post and note layouts both use the article reader.

```text
_layouts/                 Page layouts, named for their content or section
_includes/
  site/                   Contact dialog, footer credits, and Atom feed
  components/             Icons, banners, preview images, list controls, engagement
  article/                Shared reader and download links
  library/                Course status, last-update calculation, note counts
  compiled/               Generated article HTML for formulas and footnotes
```

Includes are small Liquid fragments, not standalone pages. Layouts supply the language text (`t`); include parameters such as `item`, `course`, or `id` supply the content. Some fragments assign values used later in their parent: `library/last-updated.html` sets `course_updated`, and `article/downloads.html` sets `download`.

Keep public URLs and translation/engagement identifiers in content metadata. Moving a template is independent of changing an article's URL or stored statistics.

## Browser code

Browser modules are served directly from `assets/js/`; there is no bundler or client framework. The directory is intentionally flat while each feature fits in one module.

| File | Responsibility |
| --- | --- |
| `main.js` | Initialization, mobile menu, sharing, toast/copy UI, and engagement DOM wiring |
| `listings.js` | Shared Blog/Library sorting, topic selection, and filter URL state |
| `math-copy.js` | Click/keyboard copying of the original formula Markdown |
| `reader.js` | Contents tracking, section folding, and reference links |
| `engagement.js` | Statistics store, deduplication, and preview/Firebase adapters |
| `theme-init.js` | Early theme application before the page is painted |
| `theme.js` | Theme button and preference changes |
| `contact.js` | Reader-message drafts and scroll-up visibility |
| `external-links.js` | External link targets |

`assets/css/style.css` holds the shared visual rules, theme variables, and responsive overrides. `assets/images/` holds authored artwork; `assets/imported/` holds copied vault attachments; `assets/licenses/` records vendored asset licenses.

## Build tools

```text
config/
  obsidian-imports.yml    Selected vault documents and their destination metadata
scripts/
  content.mjs             Content command and watch loop
  site.rb                 Jekyll command and test-site build
  preview.ps1             Windows wrapper for site.rb
  content/
    import-obsidian.mjs    Vault-to-site conversion
    export-content.mjs    Markdown editions, compiled HTML, and PDF jobs
    documents.mjs         Front matter, safe paths, writes, and route helpers
    render-markdown.mjs   Markdown and static math rendering
    pdf/
      export.py           PDF layout
      images.mjs          Embedded image and formula preparation
      requirements.txt    Python dependencies
  site/
    validate-content.rb   Content metadata and relationship validation
  artwork/
    build-banners.mjs     Banner and thumbnail source drawings
    build-favicon.mjs     SVG-to-PNG favicon conversion
  checks/
    verify-site.mjs       Generated routes, assets, controls, feeds, and downloads
    verify-docs.mjs       Documentation links, headings, examples, and template fields
    render-pdfs.mjs       PDF page rendering and text-bound checks
    pdf-contact-sheet.py  Review sheets assembled from rendered PDF pages
```

Type the [documented commands](setup.md#command-reference) in a [terminal opened in the site folder](setup.md#where-to-run-commands). Prefer npm commands for Node entry points so their implementation can move without changing the daily workflow. `scripts/site.rb` and `scripts/preview.ps1` are the Jekyll entry points.

The import command reads `config/obsidian-imports.yml`; its relative vault and destination paths resolve from the repository root. It imports only selected documents, then creates downloadable editions. The site build refreshes exports and validates metadata before calling Jekyll; it does not import from the vault. Full precedence and output rules live in [Imports and downloads](content-workflow.md).

## Tests

| Location | What belongs here |
| --- | --- |
| `tests/browser/` | DOM behavior, reader, filtering, sharing, themes, and engagement |
| `tests/content/` | Vault conversion, publication metadata, and Markdown/math rendering |
| `tests/fixtures/` | Synthetic Jekyll posts, courses, and notes for integration checks |

Behavior tests run through `npm test`. Generated-site checks live in `scripts/checks/` because they inspect build output rather than importing application modules. The synthetic fixture site is built under `.preview/` and is never published.

## Placement and naming

- Use lowercase, hyphenated filenames for new modules and fragments. Keep Jekyll collection names and dated post filenames in their required forms. Match each content document’s `lang` to its language folder.
- Put executable entry points at the top of `scripts/` only when they coordinate a workflow; put implementation in the corresponding responsibility folder.
- Put cross-section UI fragments in `_includes/components/`; put article- or library-specific fragments in their respective folders.
- Keep browser features in `assets/js/` and build-only code in `scripts/`. Browser modules must not import Node/Python tooling.
- Put author-editable tool settings in `config/` and values consumed by Liquid in `_data/`.
- Add field rules to [Content reference](content-reference.md), commands to [Setup](setup.md), and processing rules to [Imports and downloads](content-workflow.md).
- Preserve published asset paths, permalinks, translation references, and engagement IDs unless a migration is intentional. Source folder names do not need to match public URLs.

Related: [Development and publishing](development.md) · [Configuration](configuration.md) · [Content authoring](author-guide.md)
