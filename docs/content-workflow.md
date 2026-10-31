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
                  └── _includes/compiled/ for articles with formulas or footnotes
                  │ Jekyll + layouts + site data
                  ▼
                _site/
```

The importer reads the vault without editing it. Only manifest entries become site documents. Directly authored posts and notes are read from `content/_posts/` and `content/_notes/`; they need no vault. Courses are authored in the repository.

Content commands also refresh [link preview images](banner-design.md#link-previews) from covers and the profile portrait. Jekyll's preview/build wrapper refreshes these images and exports, but **does not import the vault**. Sync selected notes before a one-time build, or keep the content watcher running during editing.

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
| `metadata` | Publication properties such as language, stable reference, public URL, course, and order |

Use a distinct entry for each language. The destination folder must match metadata `lang` (`en` or `ru`); additional folders may group documents inside that language folder. The tools read Jekyll’s `collections_dir` from `_config.yml` to locate the collections. Source/destination paths must stay inside their respective roots. Destinations and IDs must be unique. To use a different vault without editing this file, pass `--vault` or set `OBSIDIAN_VAULT` as described in [Setup](setup.md#environment-variables).

Imported documents receive `obsidian_import: <id>`. An existing destination may be replaced only if it already has that matching marker. Do not add the marker to bypass an overwrite error; migrate directly authored content deliberately while preserving its URL, date, and engagement reference.

Adding a note to the vault does not select it for publication. Only files listed under `items` are imported.

## Metadata and timestamps

An entry's `metadata:` block contains its publication settings. These **override the front matter of the original vault note**: the settings between the first two `---` lines at the top of that `.md` file. The importer copies only these source fields:

`title`, `description`, `excerpt`, `tags`, `image`, `image_dark`, `image_alt`, `image_caption`, `preview_image`, `preview_image_dark`, `math`, `published`, and `date`.

Write `lang`, `lang_ref`, `permalink`, `course`, and `order` inside the entry's `metadata:` block in `config/obsidian-imports.yml`, aligned with `title:`. Other source properties are omitted, except for the timestamp fallbacks below. Manifest metadata itself is publication data and is written to the generated front matter.

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
| `[^label]` and a matching `[^label]: Source` definition | Numbered citations and a references list; see [authoring instructions](author-guide.md#add-numbered-references) |
| `[[Selected note\|label]]` | Link to the selected note's public URL |
| `[[Selected note#Heading]]` | Public URL plus a heading anchor |
| `![[picture.png\|Description]]` or local inline Markdown image | Copied asset and image link |
| PNG, JPEG, WebP, GIF, SVG; linked PDF attachments | Copied under `assets/imported/<id>/` using names based on file contents |
| `%% comments %%` outside code | Omitted from public prose |
| `$...$` / `$$...$$` with `math: true` | Formulas rendered during export |

The shallowest Markdown heading becomes a `##` heading; deeper headings keep their relative levels, up to `######`. Fenced and inline code are left unchanged, including example wiki syntax. Numeric wiki-image size aliases are ignored in favor of responsive layout.

The importer stops on unselected note links, missing or ambiguous attachment names, unsupported file types, note transclusions (`![[Other note]]`), or note block references (`#^block`). Use a heading link, select the linked note, or replace it with plain text. Plugin output such as Dataview and Canvas is not executed. Use inline Markdown links for local targets; reference-style local links are not rewritten.

Imports prepare all documents and attachments before writing. Transformation/validation errors therefore do not leave a half-transformed set of files; filesystem write failures are still possible.

## Image paths

Local images in supported Markdown syntax and the four image properties (`image`, `image_dark`, `preview_image`, `preview_image_dark`) are copied automatically. The property value can be a plain attachment path or a quoted `![[attachment.png]]` embed without a size or alias. See [body-image examples](author-guide.md#photos-and-diagrams-in-the-body) and [cover settings](banner-design.md#in-obsidian).

For a local path, the importer tries:

1. The path relative to the source note's folder.
2. The path relative to the vault root.
3. A unique filename anywhere in the vault, when only a filename is given.

Files must stay inside the vault. If two attachments share a filename, use an explicit path. Spaces work in wiki embeds; for inline Markdown, use `<Attachments/my photo.jpg>` or URL-encoded spaces (`my%20photo.jpg`). Raw HTML `<img>` tags and reference-style image links such as `![Photo][photo]` are not rewritten. Use an inline image or wiki embed for local attachments. HEIC and other unlisted formats must be converted before import.

The importer preserves the attachment's bytes and writes it under `assets/imported/<id>/`. It updates the public link when the file contents change. It does not resize or optimize photos, so resize very large camera images before publication. A body image remains at its position in the note; choosing a banner or thumbnail requires the corresponding image property.

`https://` and `http://` images remain external URLs. `/assets/...` paths refer to files already in the site and are not copied from the vault. Import metadata takes precedence over note properties; an old `image` override can therefore keep a newly selected Obsidian cover from appearing.

## Downloadable editions

Each published, non-redirect blog post and note gets PDF and Markdown editions. Future-dated articles are skipped. Courses do not get combined course downloads.

| Output | Role |
| --- | --- |
| `assets/downloads/post-<lang_ref>-<lang>.md` / `.pdf` | Blog editions |
| `assets/downloads/note-<lang_ref>-<lang>.md` / `.pdf` | Note editions |
| `_data/downloads.json` | Maps public article URLs to editions and optional compiled HTML |
| `_includes/compiled/` | Static article HTML for formulas and footnotes used by the reader layout |
| `.preview/exports/` | Local intermediate images, jobs, and PDF cache; not committed |

After editing an imported note, run `npm run content:sync` in the site terminal. For directly authored content, run `npm run content:exports`. Do not edit these generated outputs manually. Commit public outputs with the source because GitHub Pages does not run these Node/Python export tools.

Editions include the configured author, copyright year, and canonical public URL, even in local preview. Notes also credit the course's original author and source URL. Markdown keeps editable TeX and absolute asset links. Its images load from the published site; the `.md` download is not a standalone offline image bundle. New image URLs work publicly after publication. PDF embeds local images and formulas, uses Unicode fonts and page numbers, and preserves links. Remote images remain links in the PDF; store an illustration locally to embed it. Convert complex HTML widgets to ordinary Markdown for reliable exports.

Changing publication status or removing an article causes exports recorded in the previous index to be removed. Imported attachment directories are retained so shared references can be reviewed separately. PDFs are cached using article/generator/asset hashes; an asset change can rebuild multiple PDFs.

## Watching and failures

Start the content watcher by typing `npm run content:watch` in a site terminal and leaving that terminal open. Stop it with Ctrl+C.

The watcher checks for saved changes about every 1.5 seconds and processes updates sequentially. It watches selected source files, vault attachments, the manifest, site content/images, and configuration. It does not import every note in the vault or auto-publish changes.

Import and export are separate stages: a successful import can be followed by a failed PDF export. Check the terminal's final result before publishing. An error is reported without terminating watch mode; correct the affected input and save again, or rerun the command. Restart the watcher after editing its implementation scripts.

Removing a manifest entry stops syncing; it does not unpublish the existing copy. Follow [Hide or remove content](author-guide.md#hide-or-remove-content) for that operation.

Related: [Content reference](content-reference.md) · [Generated files and publishing](development.md#generated-files) · [Troubleshooting](troubleshooting.md)
