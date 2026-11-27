# Troubleshooting

[Documentation](../README.md#documentation) / Troubleshooting

Find the symptom below. Type commands in a [terminal opened in the site folder](setup.md#where-to-run-commands), which contains `package.json` and `_config.yml`. To find a content setting's exact file and block, use [Where settings go](content-reference.md#where-settings-go).

On this page: [Preview](#preview-and-setup) · [Windows Application Control](#windows-application-control) · [Imports](#obsidian-imports) · [Content](#content-and-navigation) · [Downloads](#downloads) · [PDF environment](#repair-the-pdf-python-environment) · [Reader controls](#reader-controls)

## Preview and setup

| Symptom | What to check |
| --- | --- |
| `npm.ps1` cannot run in PowerShell | Use `npm.cmd` with the same arguments; no execution-policy change is needed |
| `node` or `npm.cmd` is not recognized | Install Node.js, reopen the terminal, and follow [setup](setup.md#install) |
| Site dependencies are missing | Run `npm.cmd ci` on Windows, or `npm ci` elsewhere, in the site folder |
| An old command tries to start Ruby/Jekyll | Use `npm.cmd run dev`; the current site uses Eleventy and does not need Ruby |
| Port 4000 is already in use | Use the preview already running, stop its terminal with Ctrl+C, or run `npm.cmd run dev -- --port 4001` for a separate preview |
| The page still shows old content | Wait for a successful Eleventy rebuild. Check the terminal for an error; manually refresh if browser reload did not occur |
| `_config.yml` changes have no effect | In the preview terminal, press Ctrl+C and repeat the [start command](setup.md#daily-preview). If author or site URL changed, run `npm run content:exports` in a separate site terminal |
| A change to a build/content script has no effect | Stop the relevant preview or watcher with Ctrl+C, then repeat its start command |
| A hidden, deleted, or moved page still opens locally | Press Ctrl+C and restart the preview. Eleventy does not rebuild on deletion or remove old output URLs while watching; a new preview or production build clears `_site/` first |
| A fresh checkout cannot find the vault | Preview existing content without import commands; configure the vault only if syncing source notes |

### Windows Application Control

The current preview uses Node.js and Eleventy. Old Ruby errors such as `json/pure` or blocked `.so` files belong to the previous launcher; use `npm.cmd run dev`.

If Windows blocks an executable still in use, read the complete error and note the named file. A blocked PDF Python interpreter affects PDF generation, not the current preview. See the [PDF environment repair](#repair-the-pdf-python-environment) when the base Python works but its virtual-environment launcher fails.

To collect the relevant Windows events, run this read-only command in PowerShell after the failed launch:

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-CodeIntegrity/Operational'
  Id = 3077, 3118
  StartTime = (Get-Date).AddMinutes(-15)
} -ErrorAction SilentlyContinue | Select-Object TimeCreated, Id, Message | Format-List
```

Keep the terminal error and matching event messages for diagnosis. An operating-system block is different from PowerShell refusing `npm.ps1`; changing PowerShell execution policy does not repair it. Restarting Windows has not been established as a fix.

## Obsidian imports

| Symptom or error | Resolution |
| --- | --- |
| A saved note does not appear | Confirm it has an entry in `config/obsidian-imports.yml` and `npm run content:watch` is running; the preview alone does not import vault files |
| Missing source / `ENOENT` | Check the selected vault and exact relative `source` path; see [vault lookup](setup.md#environment-variables) |
| `missing or ambiguous vault target` | Use an unambiguous path to the attachment/note and check its filename |
| `Link points to an unselected note` | Select the target too, or replace the private-note link with plain text/an appropriate public link |
| Note transclusion or block-reference error | Replace it with an ordinary link to a selected note and a heading anchor |
| `Refusing to overwrite a hand-written file` | Choose a new destination; do not forge `obsidian_import` to bypass the protection |
| A title, image, or date keeps reverting | Edit the original source or its manifest override, not the generated site copy; see [precedence](content-workflow.md#metadata-and-timestamps) |
| A pasted photo is missing | Keep the attachment inside the vault and use a supported image embed; check the [image path rules](content-workflow.md#image-paths) |
| A new Obsidian cover does not replace the old one | In `config/obsidian-imports.yml`, find the note's entry and remove the competing `image` or `preview_image` line under `metadata:`. Save and run `npm run content:sync` |
| An update timestamp stays fixed | Remove or update explicit `last_modified_at` / `updated` values if it should follow the source file's modification time |
| Removing a manifest entry did not remove the page | It stops syncing only; follow [Hide or remove content](author-guide.md#hide-or-remove-content) |

## Content and navigation

| Symptom | Resolution |
| --- | --- |
| Missing notebook or wrong language | Match the note's `notebook` to a notebook's `notebook_id` with the same `lang` |
| Duplicate chapter order | Give each note a distinct positive `order` within its notebook and language, then run `npm run validate` in the site terminal |
| Chapter appears in the wrong position | Change `order`; dates, likes, and topic filters do not order chapters |
| Translation is disabled | Create the other language's document with the same `lang_ref` and a distinct public URL |
| Blog post is missing | Check `published`, `lang`, and whether `date` is in the future; verify the dated filename and front matter |
| A separate thumbnail is missing or wrong in dark mode | Check `preview_image` and its own `preview_image_dark`; the full cover's dark image is not used for a separate preview |
| A notebook banner is missing | Check `image` and its file path. If using the older `banner` setting instead, both `<banner>.svg` and `<banner>-dark.svg` must exist in `assets/images/banners/` |
| Shared link has an old photo, banner, or description | Follow [Link previews](banner-design.md#link-previews), publish the generated images and index, then check the public page's `og:image` and `og:description` tags. If those are current, the receiving app may still be using a cached card |
| Broken heading link | Check the rendered heading ID, especially duplicate titles or punctuation; use `npm run verify` after building |
| An empty filtered list persists | Clear selected topics, or remove `topic`/legacy `tag` parameters from the URL |

## Downloads

| Symptom | Resolution |
| --- | --- |
| PDF export cannot start Python | Install [PDF dependencies](setup.md#optional-pdf-environment), or set `SITE_PYTHON` using [these instructions](setup.md#environment-variables). For a broken existing environment, see [repair](#repair-the-pdf-python-environment) |
| Missing font error | Supply all four Arial or DejaVu Sans variants; set `SITE_FONT_DIR` to their folder using [these instructions](setup.md#environment-variables) if needed |
| PDF differs from the page | Preview preserves the last generated PDF. Import changed vault notes first, then run `npm run content:exports`, or use `npm run build` before publishing |
| Markdown differs from the page | Wait for web preparation to finish; run `npm run content:prepare` to refresh it manually |
| A new article has no PDF button | Generate its first PDF with `npm run content:exports`; preview does not show a link to a missing file |
| Broken link in a locally downloaded edition | Its canonical URL points to the public site; newly added routes become reachable after publication |
| PDF contains a link instead of an image | Remote images are not embedded; copy the illustration to site/vault assets and reference it locally |
| Markdown images do not load offline or before publication | The `.md` contains public image URLs, not bundled image files; publish the referenced assets and use a network connection, or use the PDF for offline reading |
| No download for a notebook | Only individual posts and notes have downloadable editions |
| Export fails after import succeeds | Fix the reported export input/dependency and rerun; import and export are separate stages |
| PDF is rebuilt after an image change | PDF caching includes images used by that article. Unrelated site CSS or images do not require rebuilding it |

### Repair the PDF Python environment

Use this only when an existing PDF environment cannot start. Run both checks in the site terminal:

```powershell
python --version
../.site-tools/pdf-env/Scripts/python.exe --version
```

If the first works and the second fails, update the environment's launcher with that working Python:

```powershell
python -m venv --upgrade ../.site-tools/pdf-env
../.site-tools/pdf-env/Scripts/python.exe -c "import reportlab, bs4, pypdf; print('PDF dependencies OK')"
npm.cmd run content:exports
```

This keeps installed packages. If the import check reports a missing package, run the installation command in [Optional PDF environment](setup.md#optional-pdf-environment).

If the base Python is managed by `uv` and is not on `PATH`, use these PowerShell commands instead of the first check and upgrade command:

```powershell
$basePython = uv python find 3.12
& $basePython --version
& $basePython -m venv --upgrade ../.site-tools/pdf-env
```

`$basePython` is the installed interpreter path returned by `uv`; check its version before upgrading the environment. This repair was verified with CPython 3.12.15 after Windows blocked a launcher in an environment originally created by `uv`: package imports and PDF generation then succeeded. It does not guarantee that Windows will allow another blocked executable. If the base Python also fails, keep the full error for diagnosis; local site preview remains independent of Python.

## Reader controls

| Symptom | Explanation or next step |
| --- | --- |
| Preview statistics differ from production | Local preview uses its own browser storage and does not write to Firebase |
| Counts show a dash | Statistics are unavailable/loading; core content remains readable. On the live origin, check database/network availability |
| A Like button is disabled | The current browser has already liked the item, or a request is pending |
| Sharing needs a copy/paste step | Discord sharing copies a link; the site does not send it into a conversation |
| A message does not send from the site | The contact form prepares a draft; sending happens in the selected platform |
| Email/X/Telegram/Discord does not open as expected | Use the visible fallback link/text and check the selected platform's login or app setup |
| Internal navigation looks like a reload | Each route is a separate static document; asset caching and Back/Forward restoration are browser/host behavior |

Related: [Site behavior](site-features.md) · [Imports and downloads](content-workflow.md) · [Development checks](development.md#checks)
