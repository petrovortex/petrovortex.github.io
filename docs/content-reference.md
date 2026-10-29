# Content reference

[Documentation](../README.md#documentation) / Content reference

Definitions for the YAML settings at the top of Markdown files (front matter) and the relationships between posts, courses, and notes. For complete starting files, use the [post](templates/post.md), [course](templates/course.md), and [note](templates/note.md) templates. Procedures are in [Content authoring](author-guide.md).

On this page: [Where settings go](#where-settings-go) · [Shared fields](#shared-fields) · [Posts](#blog-post-fields) · [Courses](#course-fields) · [Notes](#note-fields) · [Images](#image-fields) · [Identifiers](#identifiers-and-languages) · [Dates](#dates-and-visibility)

## Where settings go

Open the file in a text editor. A **field** is one setting, such as `title: My article`.

| Content | Where to write the settings below |
| --- | --- |
| Imported post or note | In `config/obsidian-imports.yml`, find the entry by its `source` path and edit its `metadata:` block. Align setting lines with `title:` (six spaces) |
| Directly authored post | At the top of its file in `content/_posts/en/` or `content/_posts/ru/`, between the first two `---` lines |
| Directly authored note | At the top of its file in `content/_notes/en/` or `content/_notes/ru/`, between the first two `---` lines |
| Course | At the top of its file in `content/_courses/en/` or `content/_courses/ru/`, between the first two `---` lines |

The settings block between `---` lines is called **front matter**. Its fields have no indentation; the article body follows the closing `---`. Keep existing fields and change their values rather than adding duplicate keys. In front matter, lines starting with `#` are comments; remove `# ` to enable an optional setting from a template.

For imports, some settings may instead live in the original Obsidian note's front matter. The [supported fields and override rules](content-workflow.md#metadata-and-timestamps) define which ones. The generated site file is replaced on every import.

In filename patterns, `YYYY-MM-DD` means the publication date, `<lang>` means `en` or `ru`, and `slug` means a short name using lowercase letters, digits, and hyphens, such as `neural-networks`. Replace these placeholders; do not keep angle brackets in filenames.

## Shared fields

Required fields below describe ordinary published content; legacy redirect files are handled separately.

| Field | Applies to | Requirement and meaning |
| --- | --- | --- |
| `title` | All | Required page title; do not repeat it as a `#` heading in the body |
| `date` | All | Required creation/publication timestamp; include an offset, e.g. `2026-10-28T12:00:00+07:00` |
| `lang` | All | Required: `en` or `ru`; must match the first folder inside the collection |
| `lang_ref` | All | Required stable ID shared by translations and used for views/likes; lowercase letters, digits, `_` and `-` |
| `last_modified_at` | All | Optional update timestamp; defaults to `date` for sorting and course update calculations |
| `published` | All | Optional boolean; `false` excludes the document from normal site output |
| `permalink` | All | Required for library content; optional explicit URL for a post |
| `math` | Posts, notes | Optional boolean; `true` enables compiled TeX formulas |
| `copyright_year` | Posts, notes | Optional export notice override; otherwise the year of `date` is used |

Defaults in [_config.yml](../_config.yml) assign `layout` and `section` by collection. Ordinary content does not need to repeat them.

## Blog post fields

Location: `content/_posts/en/YYYY-MM-DD-slug-en.md` or `content/_posts/ru/YYYY-MM-DD-slug-ru.md`.

| Field | Meaning |
| --- | --- |
| `excerpt` | Recommended short summary for the Blog list; plain text is easiest to scan |
| `tags` | List of blog topics, e.g. `[Machine learning, Projects]` |
| `permalink` | Stable explicit route, e.g. `/example-project-en/`; otherwise the dated filename determines the route under the current `/:title/` setting |

The download generator uses the `permalink` value when present; otherwise it derives the URL from the dated filename. If changing Jekyll's global URL scheme, update the export route handling too.

## Course fields

Location: `content/_courses/en/slug-en.md`, or the corresponding `ru/` folder for Russian.

| Field | Requirement and meaning |
| --- | --- |
| `course_id` | Required stable collection ID referenced by its notes; use a lowercase hyphenated slug |
| `description` | Required short summary for the Library list and course page |
| `topics` | Required list of general course topics; `[]` is valid |
| `status` | Required: `in_progress` or `complete` |
| `source_author` | Required original instructor or author credit |
| `source_url` | Required absolute `https://` or `http://` source URL |
| `materials` | Optional nonempty list of `{title, url}` entries for the collapsed Course materials menu; URLs must start with `https://` or `http://`. Omit it to use `source_url` as the sole link |
| `permalink` | `/library/<slug>/` for English or `/ru/library/<slug>/` for Russian |
| `image`, `preview_image` | Optional page cover and list thumbnail; see [image fields](#image-fields) |

A course's body is its introduction. Its contents are all notes whose `course` and `lang` match. The displayed update timestamp is the latest `last_modified_at` (falling back to `date`) among the course and its notes. The Library list displays this update date, while Newest sorting uses the course's creation date.

Courses have engagement controls but no combined PDF/Markdown download. Downloads belong to individual posts and notes.

## Note fields

Location: `content/_notes/en/slug-en.md`, or the corresponding `ru/` folder for Russian. Additional folders may group notes inside a language folder.

| Field | Requirement and meaning |
| --- | --- |
| `course` | Required matching `course_id`; the course must exist in the same language |
| `order` | Required positive integer, unique within the course and language |
| `description` | Optional summary in the course's chapter list |
| `module` | Optional heading for a consecutive group of notes |
| `permalink` | One slug inside the matching course URL, e.g. `/library/example-course/introduction/` |

Notes are ordered only by `order`. Values need not be consecutive; displayed chapter numbers are consecutive. Notes do not have library topics or their own sort/filter controls. The importer removes note-level `tags`.

## Image fields

Put these in the [settings block for your source](#where-settings-go). [Assign artwork](banner-design.md#assign-artwork) gives copyable examples for each file type.

| Field | Applies to | Meaning |
| --- | --- | --- |
| `image` | All | Wide cover below the heading; also used for social metadata and post/note downloads |
| `image_dark` | All | Optional dark-mode cover |
| `image_alt` | All | Description of the cover; defaults to the title |
| `image_caption` | All | Optional visible caption or image credit |
| `preview_image` | All | Separate 3:2 list thumbnail: Blog, Library, or a course's chapter list |
| `preview_image_dark` | All | Optional dark-mode version of that separate thumbnail |
| `banner` | Courses | Optional existing SVG selection: `name` selects `assets/images/banners/name.svg` and `name-dark.svg`. Used only when `image` is absent; both files must exist |

For a file saved under the site's `assets/images/`, use its website path beginning with `/assets/images/`. Imported post/note image fields may instead name vault attachments; the importer copies them. Course assets are managed directly in the repository.

Without `preview_image`, the item's `image`/`image_dark` pair is the thumbnail fallback. With a separate preview, only `preview_image_dark` supplies its dark variant; omitting that variant uses the same preview in both themes. Exports use the light full cover. A course's `banner` does not automatically become its list thumbnail.

Artwork sizes, composition, and assignment examples: [Artwork](banner-design.md).

## Identifiers and languages

| Identifier | Scope | Keep stable because… |
| --- | --- | --- |
| Import `id` | One manifest entry | It marks generated ownership and names copied-attachment directories |
| `lang_ref` | One article or course across translations | It connects language versions and engagement records |
| `course_id` | One course across translations | It connects notes to their collection |
| `permalink` | One language version | It is used by links, feeds, sharing, and download attribution |

Translations use separate files in the corresponding `en/` or `ru/` collection folder and share `lang_ref`. Translated courses also share `course_id`; each language has its own notes and order values. Import IDs are distinct per file and allow lowercase letters, digits, and hyphens only.

The main English sections are at `/`, `/blog/`, `/library/`, and `/links/`; Russian sections start at `/ru/`. Existing blog articles retain their published URLs. Library URL prefixes and course/note relationships are validated by [site.rb](../scripts/site.rb).

## Dates and visibility

Keep creation and update timestamps separate. Editing content changes `last_modified_at`, not `date`. Imported timestamp defaults and overrides are defined in [the import reference](content-workflow.md#metadata-and-timestamps).

Future-dated blog posts are excluded by normal Jekyll builds. The exporter skips future-dated posts and notes. Use `published: false` or keep drafts outside selected content rather than relying on dates alone to hide a library collection.

`published: false` controls site output, not repository access. Removing a manifest entry stops updates without deleting an existing site file. See [hiding and removing content](author-guide.md#hide-or-remove-content).
