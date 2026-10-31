# Troubleshooting

[Documentation](../README.md#documentation) / Troubleshooting

Find the symptom below. Type commands in a [terminal opened in the site folder](setup.md#where-to-run-commands), which contains `package.json` and `_config.yml`. To find a content setting's exact file and block, use [Where settings go](content-reference.md#where-settings-go).

On this page: [Preview](#preview-and-setup) · [Imports](#obsidian-imports) · [Content](#content-and-navigation) · [Downloads](#downloads) · [Reader controls](#reader-controls)

## Preview and setup

| Symptom | What to check |
| --- | --- |
| `npm.ps1` cannot run in PowerShell | Use `npm.cmd` with the same arguments; no execution-policy change is needed |
| Ruby or Bundler is missing | Follow [runtime setup](setup.md#install); the Windows wrapper also recognizes the workspace Ruby fallback |
| Port 4000 is already in use | Use the preview already running, or stop its terminal with Ctrl+C before starting another |
| The page still shows old content | Wait for a successful import/export and Jekyll rebuild, then refresh; the preview does not automatically reload the browser |
| `_config.yml` changes have no effect | In the preview terminal, press Ctrl+C and repeat the [start command](setup.md#daily-preview). If author or site URL changed, run `npm run content:exports` in a separate site terminal |
| A change to a content script has no effect in watch mode | In the watcher terminal, press Ctrl+C, then repeat its `npm run content:watch` or `npm run content:exports -- --watch` command |
| A fresh checkout cannot find the vault | Preview existing content without import commands; configure the vault only if syncing source notes |

## Obsidian imports

| Symptom or error | Resolution |
| --- | --- |
| A saved note does not appear | Confirm it has an entry in `config/obsidian-imports.yml` and the content watcher is running; Jekyll alone does not import notes |
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
| Missing course or wrong language | Match the note's `course` to a course's `course_id` with the same `lang` |
| Duplicate chapter order | Give each note a distinct positive `order` within its course and language, then run `bundle exec ruby scripts/site.rb validate` in the site terminal |
| Chapter appears in the wrong position | Change `order`; dates, likes, and topic filters do not order chapters |
| Translation is disabled | Create the other language's document with the same `lang_ref` and a distinct public URL |
| Blog post is missing | Check `published`, `lang`, and whether `date` is in the future; verify the dated filename and front matter |
| A separate thumbnail is missing or wrong in dark mode | Check `preview_image` and its own `preview_image_dark`; the full cover's dark image is not used for a separate preview |
| A course banner is missing | Check `image` and its file path. If using the older `banner` setting instead, both `<banner>.svg` and `<banner>-dark.svg` must exist in `assets/images/banners/` |
| Shared link has an old photo, banner, or description | Follow [Link previews](banner-design.md#link-previews), publish the generated images and index, then check the public page's `og:image` and `og:description` tags. If those are current, the receiving app may still be using a cached card |
| Broken heading link | Check the rendered heading ID, especially duplicate titles or punctuation; use `npm run verify` after building |
| An empty filtered list persists | Clear selected topics, or remove `topic`/legacy `tag` parameters from the URL |

## Downloads

| Symptom | Resolution |
| --- | --- |
| PDF export cannot start Python | Install [PDF dependencies](setup.md#install), or set `SITE_PYTHON` in the terminal using [these instructions](setup.md#environment-variables) |
| Missing font error | Supply all four Arial or DejaVu Sans variants; set `SITE_FONT_DIR` to their folder using [these instructions](setup.md#environment-variables) if needed |
| PDF/Markdown differs from the page | Run `npm run content:sync` for imported content or `npm run content:exports` for direct site files. Then rebuild with `bundle exec ruby scripts/site.rb build`, or wait for the running preview to rebuild |
| Broken link in a locally downloaded edition | Its canonical URL points to the public site; newly added routes become reachable after publication |
| PDF contains a link instead of an image | Remote images are not embedded; copy the illustration to site/vault assets and reference it locally |
| Markdown images do not load offline or before publication | The `.md` contains public image URLs, not bundled image files; publish the referenced assets and use a network connection, or use the PDF for offline reading |
| No download for a course | Only individual posts and notes have downloadable editions |
| Export fails after import succeeds | Fix the reported export input/dependency and rerun; import and export are separate stages |
| PDF takes longer after an asset change | The cache includes site assets, so a change may rebuild several articles |

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
