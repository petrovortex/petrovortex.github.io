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
| Site configuration | `_config.yml`, `_data/` | Public site settings, translations, profile, publications, social and contact data |
| Build configuration | `eleventy.config.js` | Eleventy collections, template engines, assets, and preview preparation |
| Tool configuration | `config/` | Selected Obsidian sources, publication metadata, and the local preview server; excluded from the site |
| Presentation | `_layouts/`, `_includes/`, `assets/` | Page markup, shared fragments, browser code, and public assets |
| Local tools | `scripts/` | Imports, exports, preview/build commands, artwork generation, and checks |
| Publishing | `.github/workflows/` | GitHub Pages build and deployment |
| Verification | `tests/` | Browser/content behavior tests and synthetic site content |
| Documentation | `docs/` | Task guides, references, and authoring templates |

Generated public files include downloads in `assets/downloads/`, their index in `_data/downloads.json`, and link images in `assets/images/social/` with `_data/social_images.json`. Eleventy renders article HTML, formulas, and references into `_site/`. See [generated-file ownership](development.md#generated-files) before editing generated files.

## Root files

The full root listing is in [README](../README.md#repository-structure). These files configure or describe the project:

| File | How it is maintained |
| --- | --- |
| `_config.yml` | Public origin, author, language/timezone settings, and content directory |
| `eleventy.config.js` | Collection definitions, Markdown/Nunjucks setup, data loading, asset copying, exclusions, and build hooks |
| `package.json` | Defines `npm run` commands and Node dependencies |
| `package-lock.json` | Written by npm to record resolved Node versions; commit it with dependency changes |
| `README.md` | Project overview, root listing, and documentation index |
| `.gitignore` | Excludes local files from normal Git staging; website build exclusions are configured separately in `eleventy.config.js` |
| `.gitattributes` | Marks PDFs as binary so Git preserves their bytes |

## Local folders

These entries can appear beside the source files in a local checkout. Their presence depends on which tools have run.

| Entry | Contents |
| --- | --- |
| `.git/` | Git history, branches, and remote configuration |
| `node_modules/` | Installed Node packages |
| `.preview/` | PDF cache, review images, and temporary test builds |
| `_site/` | Generated website files; edit their sources instead |

`.git/` is managed by Git. The other entries are excluded by `.gitignore` and are not committed. The vault and the optional `../.site-tools/` installation folder are outside the site root.

## Content and page sources

The project's `collections_dir` setting in `_config.yml` points to `content/`. Eleventy collects Markdown files from its `_posts`, `_courses`, and `_notes` subfolders. Each document lives under its `lang` folder; create a language folder when adding its first document.

```text
content/
  _posts/
    _posts.11tydata.js      Shared post layout, section, and filename-based URL
    en/                    Dated English articles
    ru/                    Dated Russian articles
  _courses/
    _courses.11tydata.json  Shared course layout and section
    en/                    Course/book introductions and metadata
  _notes/
    _notes.11tydata.json    Shared note layout and section
    en/                    Individual notes
pages/
  en/                      home.html, blog.html, library.html, publications.html, links.html, feed.xml
  ru/                      Matching Russian page sources
  redirects/               Existing /en/ and /about-*/ compatibility pages
  404.html                 Shared not-found page
```

Russian courses and notes belong in `content/_courses/ru/` and `content/_notes/ru/` when those translations exist. Extra folders inside a language folder can group related notes; course membership and reading order still come from `course` and `order`.

Pages use Eleventy front matter `permalink` values. For example, `pages/en/blog.html` produces `/blog/`, and `pages/ru/blog.html` produces `/ru/blog/`. The source paths do not appear in public URLs. Directory data files provide shared defaults through Eleventy's data cascade; explicit document front matter can override them. Post filenames retain their language suffixes to preserve filename-derived URLs.

`pages/en/publications.html` and `pages/ru/publications.html` use `_layouts/publications.html` to render the shared `_data/publications.yml` list. Its ordered `id`/`citation` records contain Markdown citations; the layout renders each as a paragraph and uses its `id` as an anchor. This list is edited by hand, separately from the CV. See [editing publications](configuration.md#publications).

Eleventy reads the source folders directly. `_data/`, `_layouts/`, and `_includes/` are selected through its directory settings in `eleventy.config.js`. YAML data is available to templates by filename: `_data/ui.yml` becomes `ui`, for example. The `site` object supplies settings from `_config.yml` and the current build time.

## Page rendering

A page selects a layout through front matter or its collection's directory data. Section layouts use `default.html` for the shared page shell. Post and note layouts both use the article reader.

```text
_layouts/                 Page layouts, named for their content or section
_includes/
  site/                   Contact dialog, footer credits, Atom feed, link metadata
  components/             Icons, banners, preview images, list controls, engagement
  article/                Shared reader and download links
  library/                Course status and note counts
```

HTML and feed templates use Nunjucks. Includes share page context; reusable components use Nunjucks macros with explicit arguments. Translations come from `ui[lang]`. Native collection entries expose front matter as `item.data` and the public address as `item.url`. Small site-specific filters, such as formatted dates and a course's last-update time, live in `scripts/site/template-filters.mjs`.

Markdown uses the shared renderer in `scripts/content/render-markdown.mjs`, including static MathJax formulas and numbered references. The reader receives this rendered HTML directly. Browser modules then provide folding, the table of contents, and formula copying.

Keep public URLs and translation/engagement identifiers in content metadata. Moving a template is independent of changing an article's URL or stored statistics.

## Browser code

Browser modules are served directly from `assets/js/`; there is no bundler or client framework. The directory is intentionally flat while each feature fits in one module.

| File | Responsibility |
| --- | --- |
| `main.js` | Initialization, sharing, toast/copy UI, and engagement DOM wiring |
| `navigation.js` | Mobile menu, keyboard dismissal, and focus handling |
| `portrait.js` | Homepage photo toggle |
| `accent-theme.js` | Optional rainbow accents and saved preference |
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
  preview.cjs             BrowserSync loopback server and browser reload settings
scripts/
  content.mjs             Content command and watch loop
  site.mjs                Preview/build launcher and process cleanup
  preview.ps1             Optional Windows wrapper for site.mjs
  content/
    import-obsidian.mjs    Vault-to-site conversion
    export-content.mjs    Markdown editions and optional PDF generation
    documents.mjs         Front matter, safe paths, writes, and route helpers
    render-markdown.mjs   Markdown and static math rendering
    pdf/
      export.py           PDF layout
      images.mjs          Embedded image and formula preparation
      cache.mjs           PDF hashes from article content and its images
      requirements.txt    Python dependencies
  site/
    validate-content.mjs  Content metadata and relationship validation
    template-filters.mjs  Nunjucks URL, date, collection, and content helpers
    build-fixtures.mjs    Separate synthetic-content build
  artwork/
    build-banners.mjs     Banner and thumbnail source drawings
    build-favicon.mjs     SVG-to-PNG favicon conversion
    build-social-previews.mjs  Raster link images and their source index
  checks/
    verify-site.mjs       Generated routes, assets, controls, feeds, and downloads
    verify-docs.mjs       Documentation links, headings, examples, and template fields
    render-pdfs.mjs       PDF page rendering and text-bound checks
    pdf-contact-sheet.py  Review sheets assembled from rendered PDF pages
```

Type the [documented commands](setup.md#command-reference) in a [terminal opened in the site folder](setup.md#where-to-run-commands). Prefer npm commands so implementation files can move without changing the daily workflow. `npm run dev` uses `scripts/site.mjs` to start Eleventy in watch mode and BrowserSync to serve `_site/` on this computer. Eleventy rebuilds source files; its build hook first validates content and prepares Markdown downloads and link images without Python. BrowserSync reloads the browser when generated files change. Its server settings are in `config/preview.cjs`; the launcher stops both processes on exit.

The import command reads `config/obsidian-imports.yml`; its relative vault and destination paths resolve from the repository root. It imports only selected documents and prepares web content. PDF generation is a separate stage: `npm run content:exports` updates editions, while `npm run build` runs it before building the production site. PDF caching depends on each article's rendered content, attribution, generator, and referenced images; unrelated site styles do not invalidate it. Full precedence and output rules live in [Imports and downloads](content-workflow.md).

## Tests

| Location | What belongs here |
| --- | --- |
| `tests/browser/` | DOM behavior, reader, filtering, sharing, themes, and engagement |
| `tests/content/` | Vault conversion, metadata, Markdown/math rendering, export separation, and launcher behavior |
| `tests/fixtures/` | Synthetic posts, courses, and notes for integration checks |

Behavior tests run through `npm test`. Generated-site checks live in `scripts/checks/` because they inspect build output rather than importing application modules. The synthetic fixture site is built under `.preview/` and is never published.

## Placement and naming

- Use lowercase, hyphenated filenames for new modules and fragments. Keep Eleventy directory-data filenames paired with their folder names. Match each content document’s `lang` to its language folder, and preserve dated post filenames unless deliberately changing their public URL.
- Put executable entry points at the top of `scripts/` only when they coordinate a workflow; put implementation in the corresponding responsibility folder.
- Put cross-section UI fragments in `_includes/components/`; put article- or library-specific fragments in their respective folders.
- Keep browser features in `assets/js/` and build-only code in `scripts/`. Browser modules must not import Node/Python tooling.
- Put author-editable tool settings in `config/` and values consumed by templates in `_data/`.
- Add field rules to [Content reference](content-reference.md), commands to [Setup](setup.md), and processing rules to [Imports and downloads](content-workflow.md).
- Preserve published asset paths, permalinks, translation references, and engagement IDs unless a migration is intentional. Source folder names do not need to match public URLs.

Related: [Development and publishing](development.md) · [Configuration](configuration.md) · [Content authoring](author-guide.md)
