# Artwork

[Documentation](../README.md#documentation) / Artwork

A banner appears below the page heading. A thumbnail appears in the Blog, Library, or chapter list. Each post, note, or course can have both.

Paths below start in the **site folder**: the folder containing `package.json` and `_config.yml`. Edit files in a text editor. Run commands in a [terminal opened in that folder](setup.md#where-to-run-commands).

On this page: [Create](#create-artwork) · [Formats](#formats-and-style) · [Save](#save-the-files) · [Assign](#assign-artwork) · [Link previews](#link-previews) · [Review](#review-and-publish) · [SVG script](#regenerate-vector-artwork)

## Create artwork

Use the [artwork prompts](artwork-prompts.md#how-to-use) in an image-generation chat. Generate the banner and thumbnail separately, then download both files. Importing a note does not generate images. Photographs or your own illustrations also work.

## Formats and style

| Image | Aspect ratio | Suggested dimensions |
| --- | --- | --- |
| Banner | 48:13, about 3.69:1 | 960 × 260, or 1920 × 520 for sharper raster images |
| Thumbnail | 3:2 | 360 × 240, or 720 × 480 for sharper raster images |

Thumbnails are cropped to 3:2. Keep their composition simple enough to recognize at small sizes. Blog artwork uses terracotta; Library artwork uses sage. Use the [prompt colors](artwork-prompts.md#colors), depict the content's subject, and leave titles outside the image.

Dark versions are optional. Without them, the same images appear in both themes.

## Save the files

### In the repository

In the site folder, open `assets/images/` and create a folder for the item. Save the downloaded images there. For example:

```text
assets/images/example-topic/banner.png
assets/images/example-topic/thumbnail.png
```

Replace `example-topic` with a short name such as `neural-networks`. PNG, JPEG, WebP, and SVG are supported. Keep the actual extension in every reference; renaming `.jpg` to `.png` does not convert an image.

The file `assets/images/example-topic/banner.png` is referenced in content settings as `/assets/images/example-topic/banner.png`. The leading `/` means a website address, not a folder at the root of your computer. Continue with [Assign artwork](#assign-artwork).

### In Obsidian

For an imported post or note, you can keep the images in the vault instead:

1. In the vault folder, create `Attachments/example-topic/` and save `banner.png` and `thumbnail.png` there.
2. Open the original note in Obsidian's **Source mode**. At the very top, find its settings between the first two `---` lines. Add these lines inside that block, without indentation. If the block is absent, add an opening and closing `---` line around the settings.

```yaml
image: "Attachments/example-topic/banner.png"
image_alt: "A short description of the illustration."
preview_image: "Attachments/example-topic/thumbnail.png"
```

3. In the site's `config/obsidian-imports.yml`, find the entry whose `source` points to this note. Remove any `image`, `image_alt`, or `preview_image` lines from its `metadata` block so the note's values can take effect.
4. Save both files and follow [Review and publish](#review-and-publish).

Replace the example paths with your attachment paths. Imports copy the files into the site. Courses use the repository method above because they are not imported from Obsidian.

## Assign artwork

Choose the section matching where you write the content. If you already assigned vault images in [In Obsidian](#in-obsidian), skip to [Review and publish](#review-and-publish).

### Imported post or note, with images saved in the site

Open `config/obsidian-imports.yml` in a text editor. Find the entry whose `source:` is your Obsidian note. Inside that entry's `metadata:` block, add these lines alongside `title:`. Use **six spaces** before each line, matching `title:`:

```yaml
      image: /assets/images/example-topic/banner.png
      image_alt: "A short description of the illustration."
      preview_image: /assets/images/example-topic/thumbnail.png
```

Replace the image paths and description. If a key already exists, edit its value instead of adding a duplicate. Keep the other settings in the entry. Save `config/obsidian-imports.yml`; do not edit the generated Markdown file named by `destination:`.

### Directly authored post, note, or course

Open the item's Markdown file in a text editor:

| Item | File to edit |
| --- | --- |
| Blog post | `content/_posts/en/YYYY-MM-DD-your-post-en.md` |
| Note | `content/_notes/en/your-note-en.md` |
| Course | `content/_courses/en/your-course-en.md` |

These are filename patterns: choose the actual file for your item. Russian files use `ru/` and `-ru.md`.

At the top of that file, find the settings between the first two `---` lines. Add or update these lines **inside that block**, alongside `title:`, without indentation:

```yaml
image: /assets/images/example-topic/banner.png
image_alt: "A short description of the illustration."
preview_image: /assets/images/example-topic/thumbnail.png
```

Replace the paths and description, keep all other settings, and save the file.

### Optional caption and dark images

Add these settings in the **same block as `image`**, with the same indentation. Add only the lines you need; image files must exist at the paths you enter.

```yaml
image_caption: "Caption or image credit."
image_dark: /assets/images/example-topic/banner-dark.png
preview_image_dark: /assets/images/example-topic/thumbnail-dark.png
```

For vault images, use attachment paths such as `Attachments/example-topic/banner-dark.png` and remove competing values from the import entry's `metadata` block.

Without `preview_image`, the banner is also used as the thumbnail. An older course `banner` setting selects a named SVG pair; `image` takes precedence. See [Image fields](content-reference.md#image-fields) for the complete rules.

## Link previews

Sharing a page URL uses its title, description, and light banner automatically. These Open Graph and X card tags are written into the HTML; the receiving app does not need to run JavaScript.

| Item | Preview text | Preview image |
| --- | --- | --- |
| Homepage | `bio` for that language in `_data/ui.yml` | `portrait` in `_data/profile.yml` |
| Post | `description`, or `excerpt` if no description is set | `image` |
| Note or course | `description` | `image`, or a course's named `banner` |
| Blog or Library index | Its introduction in `_data/ui.yml` | Its section banner |

Edit article fields in the same front matter or import metadata block described under [Assign artwork](#assign-artwork). No additional preview fields are required. Without a banner, the preview uses `preview_image`, then the profile portrait. The separate list thumbnail remains unchanged.

`content:sync`, `content:exports`, `content:watch`, and the preview/build wrapper generate public preview images automatically. To refresh only link images, run this command in a [terminal opened in the site folder](setup.md#where-to-run-commands):

```sh
npm run previews:build
```

Local SVGs become PNGs; raster images are copied without changing their pixels. Generated files go in `assets/images/social/`, with a source-to-output index at `_data/social_images.json`. Their filenames change when image contents change. Commit both the images and index when publishing; GitHub Pages does not run this generation command. Do not edit these outputs directly.

Link previews become available to other apps after publication. An app may keep an older card in its cache, even when the public page is current. Updating an image URL helps with image caching but does not force apps to fetch the page again. Previously sent messages may retain their original preview.

## Review and publish

Save the edited files. In a [terminal opened in the site folder](setup.md#where-to-run-commands), run the command matching your source:

| Content | Command to type in the terminal |
| --- | --- |
| Imported post or note | `npm run content:sync` |
| Directly authored post, note, or course | `npm run content:exports` |

If `npm run content:watch` is already running in another terminal, wait for it to finish processing your save instead.

With the [local preview running](setup.md#daily-preview), open <http://127.0.0.1:4000/> in a browser. Refresh the list and the item's page. Check both images in light/dark mode and at a narrow window width. For posts and notes, open the PDF and Markdown downloads too; they use the light banner.

Follow [Publishing](development.md#publishing) when ready to update the public site.

## Regenerate vector artwork

The script `scripts/artwork/build-banners.mjs` draws the existing SVG illustrations from fixed shapes and coordinates. It does not read articles. New image files do not require changes to this script.

To edit those SVG drawings, open the script in a text editor and change the relevant drawing. Save it, then run these commands in the [site terminal](setup.md#where-to-run-commands), one at a time:

```sh
npm run art:build
npm run content:exports
```

Each drawing named in the script's `art` object produces `<name>.svg` and `<name>-dark.svg` in `assets/images/banners/`. The command overwrites those files. Other uploaded images are not changed. Commit script changes with their regenerated SVGs.
