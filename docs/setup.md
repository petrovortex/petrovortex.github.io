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
| Ruby and Bundler | Ruby 3.3.13 | Jekyll 3.10 and the site wrapper |
| Node.js and npm | Node.js 24.22.1 | Imports, artwork, exports, and tests |
| Python | Python 3.12.15 | PDF exports |
| Arial or DejaVu Sans TTF files | Regular, bold, italic, bold italic | Embedded PDF fonts, including Cyrillic |

Dependency versions are recorded in [Gemfile.lock](../Gemfile.lock), [package-lock.json](../package-lock.json), and [requirements.txt](../scripts/content/pdf/requirements.txt).

Preview and build commands refresh downloads at startup, so they need Ruby, Node.js, and Python. The Obsidian vault is needed only for import commands.

## Install

Install the tools listed above first; their commands must be available in your terminal. Then run these commands in the site folder, one at a time:

```sh
bundle config set --local path vendor/bundle
bundle install
npm ci
```

In the same terminal, create the Python environment for PDF exports. On Windows:

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

Existing workspace installations can skip this section. On Windows, [preview.ps1](../scripts/preview.ps1) uses the Ruby executable available in the terminal, or `../.site-tools/ruby/bin/ruby.exe` if present. Here `../` means the parent of the site folder; `.site-tools` is outside the repository.

## Daily preview

In a [terminal opened in the site folder](#where-to-run-commands), start the site:

```sh
bundle exec ruby scripts/site.rb serve
```

Windows users can instead run:

```powershell
.\scripts\preview.ps1
```

Open <http://127.0.0.1:4000/>. Leave the terminal running and refresh the browser after a successful rebuild. Ctrl+C stops the process. Do not start a second server on the same port.

To import Obsidian changes automatically, first set the [vault path](content-workflow.md#import-manifest). Open a second terminal in the site folder and run:

```sh
npm run content:watch
```

This is the **content watcher**: it imports selected notes and refreshes downloads after saves. The first terminal runs Jekyll, which rebuilds the web pages. If you write only in site files, use this command in the second terminal instead:

```sh
npm run content:exports -- --watch
```

Restart the Jekyll preview after changing `_config.yml`. Restart the content watcher after changing the Node scripts it runs. Watching does not publish anything.

## Command reference

Type these in a [site terminal](#where-to-run-commands), not in Obsidian, a Markdown file, or the browser console.

| Command | Effect |
| --- | --- |
| `npm run content:sync` | Import selected vault files, then refresh downloads and compiled math |
| `npm run content:watch` | Import selected notes and refresh downloads after each saved change |
| `npm run content:exports` | Refresh exports from existing site files; no vault import |
| `npm run content:exports -- --watch` | Watch site content and refresh exports without reading vault files |
| `bundle exec ruby scripts/site.rb serve` | Refresh exports, validate metadata, build, and serve with Jekyll watching |
| `bundle exec ruby scripts/site.rb build` | Refresh exports, validate metadata, and build `_site/` once |
| `bundle exec ruby scripts/site.rb validate` | Validate site metadata without importing, exporting, or building |
| `npm test` | Run the Node test suite |
| `npm run verify` | Check an already-built `_site/`; does not build it |
| `npm run verify:docs` | Check documentation links/headings, YAML examples, and template fields |
| `npm run pdf:check` | Render existing PDF downloads and check text bounds and attribution |
| `bundle exec ruby scripts/site.rb fixtures` | Build synthetic content under `.preview/fixture-site/` |
| `npm run verify:fixtures` | Verify that fixture build |
| `npm run art:build` | Rebuild the fixed SVG illustrations defined in the artwork script; not needed for uploaded images |
| `npm run art:favicon` | Regenerate the PNG favicon from `assets/favicon.svg` |

On Windows, the equivalents are `.\scripts\preview.ps1 -Action build`, `.\scripts\preview.ps1 -Action validate`, and `.\scripts\preview.ps1 -Action fixtures`, typed in the site terminal.

## Environment variables

These are optional settings for commands run from your terminal. The usual vault location is set in `config/obsidian-imports.yml`; use an override below when needed.

| Variable or option | Meaning |
| --- | --- |
| `--vault "path/to/vault"` | Vault override passed after `--` to an npm content command |
| `OBSIDIAN_VAULT` | Vault path when no `--vault` is provided |
| `SITE_PYTHON` | Path to the Python executable used for PDF generation |
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
