# Setup and commands

[Documentation](../README.md#documentation) / Setup

Install dependencies and run the site locally. Commands on this page are typed in a terminal, with the site folder as its current directory.

On this page: [Where to run commands](#where-to-run-commands) · [Requirements](#requirements) · [Install](#install) · [Daily preview](#daily-preview) · [Commands](#command-reference) · [Environment](#environment-variables)

## Where to run commands

The **site folder**, also called the repository root, contains `package.json`, `_config.yml`, and this project's README. The Obsidian vault is a different folder.

**Windows:** open the site folder in File Explorer. Click the address bar, type `powershell`, and press Enter. A PowerShell terminal opens in that folder. Type each command there and press Enter. If PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`, for example `npm.cmd run content:sync`.

**macOS/Linux:** open Terminal and type `cd "/full/path/to/petrovortex.github.io"`, replacing the quoted path with your site folder's actual path. Press Enter before running the documented commands.

Run commands one at a time and wait for each to finish. Preview and watch commands keep running; leave their terminals open. To run another command, open a separate terminal in the same site folder. Ctrl+C stops a running preview or watcher.

## Requirements

| Tool | Validated local version | Used for |
| --- | --- | --- |
| Node.js and npm | Node.js 24.22.1 | Preview, site builds, imports, artwork, and tests |
| Python (optional for preview) | Python 3.12.15 | PDF exports and the full production build |
| Arial or DejaVu Sans TTF files (PDF only) | Regular, bold, italic, bold italic | Embedded PDF fonts, including Cyrillic |

Dependency versions are recorded in [package-lock.json](../package-lock.json) and [requirements.txt](../scripts/content/pdf/requirements.txt).

Preview and Obsidian imports require only Node.js. Imports prepare source Markdown, Markdown downloads, and link-preview images; Eleventy builds the pages, formulas, and references. Existing PDFs remain available; generating or updating PDFs requires Python. The Obsidian vault is needed only for import commands.

## Install

Install Node.js, then run this once in the site folder on Windows:

```powershell
npm.cmd ci
```

On macOS/Linux, use `npm ci`. Repeat after a checkout or a dependency-lockfile update. You can now start the [preview](#daily-preview).

### Optional PDF environment

For PDF exports and the full production build, install Python. In the same site terminal, create its environment. On Windows:

```powershell
python -m venv ../.site-tools/pdf-env
../.site-tools/pdf-env/Scripts/python.exe -m pip install -r scripts/content/pdf/requirements.txt
```

On macOS/Linux:

```sh
python3 -m venv ../.site-tools/pdf-env
../.site-tools/pdf-env/bin/python -m pip install -r scripts/content/pdf/requirements.txt
```

The exporter detects this environment automatically. It searches standard Windows Arial, Linux DejaVu, and macOS font directories; set [`SITE_FONT_DIR`](#environment-variables) if the four matching fonts are elsewhere.

Here `../` means the parent of the site folder; `.site-tools` is outside the repository. If Python is already installed but `python` is not recognized, use its actual executable path in place of `python`. For an installation managed by `uv`, `uv python find 3.12` prints that path; in PowerShell, invoke a quoted path with `&`, as shown in the [repair instructions](troubleshooting.md#repair-the-pdf-python-environment).

## Daily preview

In a [terminal opened in the site folder](#where-to-run-commands), start the site. On Windows, type:

```powershell
npm.cmd run dev
```

Leave this terminal running. The launcher starts Eleventy to build and watch the site, and BrowserSync to serve it on `127.0.0.1` and reload the browser when you add or edit files. Both stop with the launcher. You do not need a second watcher when editing files in the site repository.

After hiding, deleting, or moving a page, or changing its `permalink`, press Ctrl+C and run the start command again. Eleventy's watcher does not rebuild on deletion or remove old output URLs. Starting a new preview or production build clears the generated `_site/` folder first.

On macOS/Linux:

```sh
npm run dev
```

Wait for the terminal to report the server address, then open <http://127.0.0.1:4000/>. Ctrl+C stops the process. If port 4000 is occupied, use the running preview or stop its terminal first. To run a separate preview on port 4001:

```powershell
npm.cmd run dev -- --port 4001
```

Then open <http://127.0.0.1:4001/>. Preview does not invoke Python or regenerate PDFs. Existing PDF links use the last generated edition; a new article gains its PDF link after successful export.

To import Obsidian changes automatically, first set the [vault path](content-workflow.md#import-manifest). Open a second terminal in the site folder and run:

```sh
npm run content:watch
```

This second terminal imports selected Obsidian notes and prepares web content after saves. The preview then rebuilds the pages. To refresh PDF editions, run this separately after saving or importing:

```sh
npm run content:exports
```

Restart the preview after changing build configuration or its scripts. Restart the Obsidian watcher after changing its implementation scripts. To prepare a publication, stop the preview with Ctrl+C and run `npm run build`; it updates PDF/Markdown editions, validates content, and builds a clean `_site/`. Preview and production builds use this same output folder. Watching and building do not publish anything.

## Command reference

Type these in a [site terminal](#where-to-run-commands), not in Obsidian, a Markdown file, or the browser console.

| Command | Effect |
| --- | --- |
| `npm run dev` | Prepare web content, build, serve, and watch the site; no Python or PDF generation |
| `npm run build` | Refresh all editions including PDFs, validate content, and build `_site/` once |
| `npm run validate` | Validate content metadata and course/note relationships |
| `npm run content:sync` | Import selected vault files, then prepare Markdown downloads and link images; no PDF generation |
| `npm run content:watch` | Repeat the import and web preparation after saved changes in selected vault files |
| `npm run content:prepare` | Prepare Markdown downloads and link images from site files; no vault import or PDF generation |
| `npm run content:exports` | Refresh PDF/Markdown editions from existing site files; no vault import |
| `npm run content:exports -- --watch` | Watch site content and refresh all editions, including PDFs |
| `npm test` | Run the Node test suite |
| `npm run verify` | Check an already-built `_site/`; does not build it |
| `npm run verify:docs` | Check documentation links/headings, YAML examples, and template fields |
| `npm run pdf:check` | Render existing PDF downloads and check text bounds and attribution |
| `npm run fixtures` | Build synthetic content under `.preview/fixture-site/` |
| `npm run verify:fixtures` | Verify that fixture build |
| `npm run art:build` | Rebuild the fixed SVG illustrations defined in the artwork script; not needed for uploaded images |
| `npm run art:favicon` | Regenerate the PNG favicon from `assets/favicon.svg` |

On Windows, use `npm.cmd` in place of `npm` in this table. The older `.\scripts\preview.ps1 -Action serve` command remains a thin wrapper around the same Node launcher.

## Environment variables

These are optional settings for commands run from your terminal. The usual vault location is set in `config/obsidian-imports.yml`; use an override below when needed.

| Variable or option | Meaning |
| --- | --- |
| `--vault "path/to/vault"` | Vault override passed after `--` to an npm content command |
| `OBSIDIAN_VAULT` | Vault path when no `--vault` is provided |
| `SITE_PYTHON` | Explicit path to the Python executable used for PDF generation; an invalid override fails instead of silently selecting another interpreter |
| `SITE_FONT_DIR` | Folder containing a complete Arial or DejaVu Sans TTF family |

The vault path is taken from `--vault` first, then `OBSIDIAN_VAULT`, then `vault` in `config/obsidian-imports.yml`. Relative paths start in the site folder.

For a one-time override, type this in the site terminal, replacing `D:/Notes/Obsidian Vault` with your vault's full path:

```sh
npm run content:sync -- --vault "D:/Notes/Obsidian Vault"
```

To set an environment variable, type its assignment in the same terminal before the content command. For example, replace the Python path below with an existing executable.

PowerShell:

```powershell
$env:SITE_PYTHON = "C:/path/to/python.exe"
npm.cmd run content:exports
```

macOS/Linux:

```sh
export SITE_PYTHON="/path/to/python3"
npm run content:exports
```

Use the same assignment syntax for `OBSIDIAN_VAULT` or `SITE_FONT_DIR`, substituting the variable name and folder path. These assignments last for the current terminal session. Without `SITE_PYTHON`, the exporter tries the environment created under [Install](#install), then `python` on Windows or `python3` elsewhere.

Related: [Content authoring](author-guide.md) · [Checks and publishing](development.md#checks) · [Troubleshooting](troubleshooting.md)
