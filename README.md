# Alexander Petrov — personal site

Source for [petrovortex.github.io](https://petrovortex.github.io): a bilingual Jekyll site with a personal homepage, a blog, and a library of course notes. It builds to static HTML; browser modules add filtering, reading navigation, themes, and engagement controls.

## Content model

| Content | Source | Purpose |
| --- | --- | --- |
| Blog post | `content/_posts/` | An original article, with its own URL and downloads |
| Course | `content/_courses/` | A course or book collection, with topics and completion status |
| Note | `content/_notes/` | One chapter in a course, placed in an explicit sequence |

Each collection groups files by language (`en/` or `ru/`). Main page sources are paired under `pages/en/` and `pages/ru/`; their permalinks preserve the existing public addresses. See the [repository map](docs/architecture.md#content-and-page-sources).

Articles can be written directly in this repository or imported from selected Obsidian notes. Imported files and downloadable editions are committed with the site. The vault is separate and is not needed to preview the existing content.

## Repository structure

Source files and folders at the site root:

```text
_config.yml          Site settings and Jekyll collections
_data/               Profile, links, translations, and download index
_includes/           Shared page fragments and generated article HTML
_layouts/            Page layouts
assets/              Images, styles, browser scripts, and downloads
config/              Obsidian import settings
content/             Posts, courses, and notes
docs/                Documentation and content templates
pages/               English/Russian sections, redirects, and 404 page
scripts/             Import, export, preview, artwork, and check commands
tests/               Automated tests and sample test content
Gemfile              Ruby dependency list
Gemfile.lock         Resolved Ruby dependency versions
package.json         npm commands and Node dependency list
package-lock.json    Resolved Node dependency versions
README.md            Project overview and documentation index
.gitignore           Files and folders excluded from normal Git staging
```

A local checkout also contains `.git/`. Installing dependencies or running tools can create `.bundle/`, `node_modules/`, `vendor/`, `.preview/`, and `_site/`. These are explained under [Local folders](docs/architecture.md#local-folders). Subfolder contents and code responsibilities are in [Repository architecture](docs/architecture.md).

## Documentation

**Site folder** (repository root): the folder containing this README, `package.json`, and `_config.yml`. File paths in the docs start there unless marked as vault paths. A **vault** is the folder opened in Obsidian.

Run commands in a terminal opened in the site folder: [where to type commands](docs/setup.md#where-to-run-commands). Edit YAML and Markdown blocks in the file named immediately above the example.

Choose a task:

| Goal | Start here |
| --- | --- |
| Find where to type a command | [Terminal instructions](docs/setup.md#where-to-run-commands) |
| Install dependencies or run the local preview | [Setup and commands](docs/setup.md) |
| Edit an existing article | [Choose the source file](docs/author-guide.md#edit-existing-content) |
| Take an Obsidian draft through import, images, and publication | [Authoring workflow](docs/author-guide.md#from-draft-to-publication) |
| Add a post, course, or lecture note | [Content authoring](docs/author-guide.md) |
| Edit the links in Course materials | [Course material settings](docs/author-guide.md#course-materials) |
| Look up a front matter field, date, or identifier | [Content reference](docs/content-reference.md) |
| Configure Obsidian imports or understand PDF/Markdown exports | [Import and download reference](docs/content-workflow.md) |
| Cite papers with numbered references | [Citation syntax and commands](docs/author-guide.md#add-numbered-references) |
| Add banners and separate list thumbnails | [Artwork](docs/banner-design.md) |
| Generate consistent artwork with an image model | [Reusable prompts](docs/artwork-prompts.md) |
| Change profile data, links, language text, or integrations | [Configuration](docs/configuration.md) |
| Understand sorting, likes, sharing, RSS, or caching | [Site behavior](docs/site-features.md) |
| Find code or decide where a new file belongs | [Repository architecture](docs/architecture.md) |
| Run checks or prepare a publication | [Development and publishing](docs/development.md) |
| Resolve a missing page, failed import, or stale download | [Troubleshooting](docs/troubleshooting.md) |

## Working with this repository

Start with [setup](docs/setup.md), then use the [daily preview workflow](docs/setup.md#daily-preview). Saving a file, importing a note, or building the site does not commit, push, or publish it. Publication is a [separate step](docs/development.md#publishing).

This repository includes Alexander's writing, profile data, artwork, and existing service configuration. The [configuration reference](docs/configuration.md#scope-and-existing-integrations) identifies those boundaries for anyone inspecting or adapting the code. Third-party asset sources and licenses are documented under [credits](docs/configuration.md#credits-and-licenses).
