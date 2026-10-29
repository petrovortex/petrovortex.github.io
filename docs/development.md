# Development and publishing

[Documentation](../README.md#documentation) / Development

Run all commands below in a [terminal opened in the site folder](setup.md#where-to-run-commands), which contains `package.json` and `_config.yml`. Use a separate terminal if the preview or content watcher is running. Install dependencies using [Setup](setup.md#install) first.

On this page: [Code map](#code-map) · [Checks](#checks) · [Generated files](#generated-files) · [Publishing](#publishing) · [Maintenance](#maintenance-conventions)

## Code map

See [Repository architecture](architecture.md) for the folder map, module responsibilities, and placement conventions.

## Checks

If you edited a selected Obsidian note, save it and run:

```sh
npm run content:sync
```

Then run these commands one at a time in the same terminal. If you edited only site files, start here:

```sh
bundle exec ruby scripts/site.rb build
npm test
npm run verify
```

The build refreshes exports and validates metadata before Jekyll runs. `verify` expects that build to exist. A checked-out copy can run this sequence without the vault by omitting `content:sync`. On Windows, the [PowerShell wrapper](setup.md#command-reference) is equivalent to the Ruby command.

For changes to library layouts, content relationships, or image fallbacks, also check the synthetic pages:

```sh
bundle exec ruby scripts/site.rb fixtures
npm run verify:fixtures
```

| Check | Covers |
| --- | --- |
| Node tests | Imports, metadata precedence, math, sort/filter URLs, reader navigation, preferences, sharing, and engagement failures/deduplication |
| Metadata validation | Required fields/dates, library routes, course/language relationships, status/topics, and chapter order uniqueness |
| Generated-site verification | Links/assets/anchors, translations, metadata, feeds, thumbnails, engagement placements, and current download copies |
| Documentation (`npm run verify:docs`) | Local links and headings, one page title per document, YAML examples, and required template fields |
| Fixtures | Synthetic library content and independent cover/thumbnail behavior, excluded from publication |

The verifier also contains assertions for the checked-in site content; it is not a general-purpose validator for an arbitrary Jekyll project. Update intentional content expectations when the repository changes.

After documentation or file-path changes, run `npm run verify:docs`.

After visual changes, inspect the affected pages in the local preview, in both themes and at wide/narrow window widths. After PDF layout changes, run `npm run pdf:check` in the site terminal. Open the resulting `page-*.png` files under `.preview/pdf-review/<download-name>/` to inspect each page; `<download-name>` is the PDF filename without `.pdf`.

## Generated files

| Files | Edit source | Commit output? |
| --- | --- | --- |
| Imported documents carrying `obsidian_import` | Vault note + manifest metadata | Yes |
| `assets/imported/` | Referenced vault attachments | Yes |
| `assets/downloads/`, `_data/downloads.json`, `_includes/compiled/` | Posts, notes, course attribution, export scripts | Yes |
| Named SVG outputs of [the artwork script](banner-design.md#regenerate-vector-artwork) | `scripts/artwork/build-banners.mjs` | Yes |
| `assets/favicon-ap.png` | `assets/favicon.svg` | Yes |
| `_site/` | Jekyll source | No |
| `.preview/`, `node_modules/`, `vendor/`, `.bundle/`, Jekyll caches | Local tooling/dependencies | No |

Uploaded artwork under `assets/images/` is ordinary source content, not an output of the SVG script. Commit these files together with their content image settings.

Generated copies are part of publication because GitHub Pages does not run the custom import/export tools. The content watcher keeps source-derived copies current locally; it does not stage or commit them.

## Publishing

1. Save the source changes. If you edited imported notes, run `npm run content:sync` in the site terminal.
2. Run the checks above and inspect affected pages/downloads locally.
3. Run `git status` and `git diff` in the site terminal to review changes. Include the public generated files listed [above](#generated-files) in the commit; keep ignored build/cache directories out.
4. Commit and push through this repository's existing GitHub Pages publishing setup when ready to publish.
5. Check the deployed routes, images, downloads, language links, feeds, and engagement behavior on the live origin.

The ordinary GitHub Pages build does not run `scripts/site.rb` validation or the Node/Python import and export tools. Local checks and committed outputs are therefore required. A local server or build command alone does not deploy the site.

## Maintenance conventions

- Keep shared list behavior in `listings.js` and reusable markup in `_includes/`; keep course ordering separate.
- Preserve published permalinks, translation references, and engagement IDs unless a migration is intentional.
- Keep UI labels in `_data/ui.yml`. Preserve corresponding language keys and the existing CSS design tokens.
- Keep imported data transformations separate from output formatting. Validate imported targets before writing.
- Use behavior tests for changes to routing, sorting, imports, or engagement; visually review presentation changes.
- Document commands in `setup.md`, fields in `content-reference.md`, and processing rules in `content-workflow.md`. Link from task recipes instead of maintaining competing definitions. Use relative links and keep machine-specific paths out of general instructions. Describe the general procedure first, then use fictional examples. Avoid inventories of currently published posts or courses in authoring instructions. Before a copyable block, name the file and insertion point, or the terminal and working folder. Define placeholders and required indentation.

Related: [Configuration boundaries](configuration.md#scope-and-existing-integrations) · [Troubleshooting](troubleshooting.md)
