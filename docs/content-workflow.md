# Imports and downloads

[Documentation](../README.md#documentation) / Imports and downloads

Reference for selected Obsidian imports and generated PDF/Markdown editions. The **site folder** contains `package.json` and `_config.yml`; the **vault** is the folder opened in Obsidian. For step-by-step editing, use [Content authoring](author-guide.md). Run commands in a [terminal opened in the site folder](setup.md#where-to-run-commands).

On this page: [Flow](#processing-flow) · [Manifest](#import-manifest) · [Metadata](#metadata-and-timestamps) · [Syntax](#supported-syntax) · [Image paths](#image-paths) · [Exports](#downloadable-editions) · [Watching](#watching-and-failures)

## Processing flow

```text
Selected vault notes + import manifest
                  │ content:sync / content:watch
                  ▼
content/_posts/ and content/_notes/ + referenced assets
                  │ download generation (also used by content:exports)
                  ├── assets/downloads/ + _data/downloads.json
                  │ Eleventy + layouts + site data
                  ▼
                _site/
```

The importer reads the vault without editing it. Only manifest entries become site documents. Directly authored posts and notes are read from `content/_posts/` and `content/_notes/`; they need no vault. Notebooks are authored in the repository.

Content commands also refresh [link preview images](banner-design.md#link-previews) from covers and the profile portrait. Preview and import commands refresh these images and Markdown downloads without Python. Eleventy renders the article HTML, including formulas and footnotes, directly from Markdown. `npm run content:exports` and `npm run build` also generate PDFs. The site preview/build **does not import the vault**. Sync selected notes before a one-time build, or keep the content watcher running during editing.

## Import manifest

The **import manifest** is the file `config/obsidian-imports.yml` in the site folder. Open it in a text editor. Edit its existing `vault:` line to point to the folder opened in Obsidian. For a vault next to the site folder, named `obsidian-vault`, that line is:

```yaml
vault: ../obsidian-vault
```

`../` means the parent of the site folder. You can also use a full path, such as `vault: "D:/Notes/My Vault"`, replacing the example with your actual path.

The file's `items:` section lists the selected notes. An **entry** is the block beginning with `- id:` and ending before the next `- id:`. Append new entries under the existing ones; [post and note examples](author-guide.md#add-a-blog-post) show the indentation. Each entry has:

| Key | Meaning |
| --- | --- |
| `id` | Unique lowercase hyphenated import ID, e.g. `example-note-en` |
| `source` | Existing Markdown file relative to the vault |
| `destination` | Repository-relative `content/_notes/<lang>/<slug>.md` or dated `content/_posts/<lang>/YYYY-MM-DD-<slug>.md` |
| `collect_references` | Defaults to `true` for imported posts and notes. Set to `false` alongside `source` and `destination` to disable the automatic list of external links for this item. |
| `metadata` | Publication properties such as language, stable reference, public URL, notebook, and order |

Use a distinct entry for each language. The destination folder must match metadata `lang` (`en` or `ru`); additional folders may group documents inside that language folder. The tools read the project's `collections_dir` setting from `_config.yml` to locate the collections. Source/destination paths must stay inside their respective roots. Destinations and IDs must be unique. To use a different vault without editing this file, pass `--vault` or set `OBSIDIAN_VAULT` as described in [Setup](setup.md#environment-variables).

Imported documents receive `obsidian_import: <id>`. An existing destination may be replaced only if it already has that matching marker. Do not add the marker to bypass an overwrite error; migrate directly authored content deliberately while preserving its URL, date, and engagement reference.

Adding a note to the vault does not select it for publication. Only files listed under `items` are imported.

## Metadata and timestamps

An entry's `metadata:` block contains its publication settings. These **override the front matter of the original vault note**: the settings between the first two `---` lines at the top of that `.md` file. The importer copies only these source fields:

`title`, `description`, `excerpt`, `tags`, `image`, `image_dark`, `image_alt`, `image_caption`, `preview_image`, `preview_image_dark`, `math`, `published`, and `date`.

Write `lang`, `lang_ref`, `permalink`, `notebook`, and `order` inside the entry's `metadata:` block in `config/obsidian-imports.yml`, aligned with `title:`. Other source properties are omitted, except for the timestamp fallbacks below. Manifest metadata itself is publication data and is written to the generated front matter.

The first non-empty value wins:

| Output field | Precedence |
| --- | --- |
| `date` | Manifest `date` → source `date` → source `created` → source `created_at` → existing imported `date` → source file creation time (modification time if creation time is unavailable) |
| `last_modified_at` | Manifest `last_modified_at` → manifest `updated` → source `last_modified_at` → source `updated` → source file modification time |

An existing imported creation date survives ordinary saves when no explicit date overrides it. Explicit timestamp overrides remain fixed until edited; remove an update override to follow the source file's modification time again.

## Supported syntax

| In the vault | Public result |
| --- | --- |
| Standard Markdown headings, lists, tables, quotes, and code | Markdown content preserved |
| `[phrase](https://example.org/report "Full report title")` | The phrase links to the source. The automatic list uses the link title when supplied. See [Add numbered references](author-guide.md#add-numbered-references) |
| `[^label]` and a matching `[^label]: Source` definition | Numbered citations and a references list; see [authoring instructions](author-guide.md#add-numbered-references) |
| `[[Selected note\|label]]` | Link to the selected note's public URL |
| `[[Selected note#Heading]]` | Public URL plus a heading anchor |
| `![[picture.png\|Description]]` or local inline Markdown image | Copied asset and image link |
| PNG, JPEG, WebP, GIF, SVG; linked PDF attachments | Copied under `assets/imported/<lang_ref>/` using names based on file contents |
| `%% comments %%` outside code | Omitted from public prose |
| `$...$` / `$$...$$` with `math: true` | Formulas rendered in web pages and PDF editions; Markdown downloads keep TeX |

If the opening `#` heading matches the publication title, the reader displays it once above the article. The shallowest remaining heading becomes `##`, and deeper headings keep their relative levels up to `######`. Fenced and inline code are left unchanged, including example wiki syntax. Numeric wiki-image size aliases are ignored in favor of responsive layout.

The importer stops on unselected note links, missing or ambiguous attachment names, unsupported file types, note transclusions (`![[Other note]]`), or note block references (`#^block`). Use a heading link, select the linked note, or replace it with plain text. Plugin output such as Dataview and Canvas is not executed. Use inline Markdown links for local targets; reference-style local links are not rewritten.

Imports prepare all documents and attachments before writing. Transformation/validation errors therefore do not leave a half-transformed set of files; filesystem write failures are still possible.

## Image paths

Local images in supported Markdown syntax and the four image properties (`image`, `image_dark`, `preview_image`, `preview_image_dark`) are copied automatically. The property value can be a plain attachment path or a quoted `![[attachment.png]]` embed without a size or alias. See [body-image examples](author-guide.md#photos-and-diagrams-in-the-body) and [cover settings](banner-design.md#in-obsidian).

For a local path, the importer tries:

1. The path relative to the source note's folder.
2. The path relative to the vault root.
3. A unique filename anywhere in the vault, when only a filename is given.

Files must stay inside the vault. If two attachments share a filename, use an explicit path. Spaces work in wiki embeds; for inline Markdown, use `<Attachments/my photo.jpg>` or URL-encoded spaces (`my%20photo.jpg`). Raw HTML `<img>` tags and reference-style image links such as `![Photo][photo]` are not rewritten. Use an inline image or wiki embed for local attachments. HEIC and other unlisted formats must be converted before import.

The importer preserves the attachment's bytes under `assets/imported/<lang_ref>/`. Translations with the same `lang_ref` share one copy of each identical image. New image contents get a new public URL. Resize large camera photos before importing. Body images keep their positions in the note. Choose banners and thumbnails separately with the corresponding image properties.

`https://` and `http://` images remain external URLs. `/assets/...` paths refer to files already in the site and are not copied from the vault. Import metadata takes precedence over note properties; an old `image` override can therefore keep a newly selected Obsidian cover from appearing.

## Downloadable editions

Each published, non-redirect blog post and note gets a Markdown edition during web preparation and a PDF edition during full export. Preview preserves the last generated PDF; a new article has no PDF link until its PDF has been generated. Future-dated articles are skipped. Notebooks do not get combined notebook downloads.

| Output | Role |
| --- | --- |
| `assets/downloads/post-<lang_ref>-<lang>.md` / `.pdf` | Blog editions |
| `assets/downloads/note-<lang_ref>-<lang>.md` / `.pdf` | Note editions |
| `_data/downloads.json` | Maps public article URLs to available Markdown and PDF editions |
| `.preview/exports/` | Local intermediate images, jobs, and PDF cache; not committed |

After editing an imported note, run `npm run content:sync` in the site terminal. To refresh PDF editions after saving or importing, run `npm run content:exports`; `npm run build` also includes that step. Do not edit generated outputs manually. Commit public outputs with the source for local downloads and review. The GitHub Actions workflow regenerates them before deployment.

In the automatic references list, a return arrow jumps to the corresponding mention on the page or in the PDF. In the Markdown download, that arrow links to the mention in the published article.

Editions include the configured author, copyright year, and canonical public URL, even in local preview. Notes also credit the notebook's original author and source URL. Markdown keeps editable TeX and absolute asset links. Its images load from the published site; the `.md` download is not a standalone offline image bundle. New image URLs work publicly after publication. PDF embeds local images and formulas, uses Unicode fonts and page numbers, and preserves links. Remote images remain links in the PDF; store an illustration locally to embed it. Convert complex HTML widgets to ordinary Markdown for reliable exports.

Changing publication status or removing an article causes exports recorded in the previous index to be removed. Imported attachment directories are retained so shared references can be reviewed separately. PDFs are cached using their content, attribution, generator and referenced local images. Changing site CSS, a thumbnail, or an unrelated image does not rebuild them.

## Watching and failures

Start the content watcher by typing `npm run content:watch` in a site terminal and leaving that terminal open. Stop it with Ctrl+C.

The watcher checks for saved changes about every 1.5 seconds and processes updates sequentially. It watches selected source files, vault attachments, the manifest, site content/images, and configuration. It does not import every note in the vault or auto-publish changes.

Import and PDF export are separate commands. A failed PDF export does not prevent local web preview; a full publication build fails until the export error is fixed. Check the terminal's final result before publishing. An error is reported without terminating watch mode; correct the affected input and save again, or rerun the command. Restart the watcher after editing its implementation scripts.

Removing a manifest entry stops syncing; it does not unpublish the existing copy. Follow [Hide or remove content](author-guide.md#hide-or-remove-content) for that operation.

Related: [Content reference](content-reference.md) · [Generated files and publishing](development.md#generated-files) · [Troubleshooting](troubleshooting.md)
