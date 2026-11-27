# Content authoring

[Documentation](../README.md#documentation) / Authoring

**Site folder** means the folder containing `package.json` and `_config.yml`. **Vault** means the folder opened in Obsidian. Paths below start in the site folder unless marked as vault paths.

Edit site files in a text editor and vault notes in Obsidian. Type all commands in a [terminal opened in the site folder](setup.md#where-to-run-commands). Start the [local preview](setup.md#daily-preview) to inspect changes in a browser.

The preview rebuilds saved site files automatically. Import vault changes with `npm run content:sync`, or keep its watcher running. To create or update PDF downloads, run `npm run content:exports` separately; ordinary preview and imports update Markdown downloads but keep existing PDFs.

On this page: [Workflow](#from-draft-to-publication) · [Edit](#edit-existing-content) · [Add a post](#add-a-blog-post) · [Create a notebook](#create-a-notebook) · [Add a note](#add-a-note) · [References](#add-numbered-references) · [Images](#add-images) · [Translations](#add-a-translation) · [Hide or remove](#hide-or-remove-content)

## From draft to publication

1. Write the draft in Obsidian, including body images.
2. Add its source path and publication settings to `config/obsidian-imports.yml` using the [post](#add-a-blog-post) or [note](#add-a-note) procedure below.
3. In the site terminal, run `npm run content:sync`. This copies the selected notes and attachments and prepares Markdown downloads and link-preview images.
4. Create a banner and thumbnail using the [image prompts](artwork-prompts.md#how-to-use), then [save and assign the files](banner-design.md#save-the-files).
5. Run `npm run content:sync` again, then `npm run content:exports` to generate PDFs. Check the local page, list entry, and downloads, then follow [Publishing](development.md#publishing).

For automatic local updates, leave `npm run content:watch` running in a separate site terminal instead of running sync after each save. This is the **content watcher**. It does not publish the site.

## Edit existing content

Find the item's site Markdown file under `content/_posts/`, `content/_notes/`, or `content/_notebooks/`. Its title and other settings are between the opening and closing `---` lines; this block is called **front matter**. The article text follows the closing line.

If that settings block contains `obsidian_import`, the file is generated. Find the matching `id` in `config/obsidian-imports.yml`; its `source` gives the original note's path inside the vault.

| Content | File to edit | After saving |
| --- | --- | --- |
| Imported post or note | Original vault note for text; its entry in `config/obsidian-imports.yml` for publication settings | `npm run content:sync` |
| Directly authored post or note | Its file in `content/_posts/` or `content/_notes/` | The preview rebuilds automatically; run `npm run content:exports` when updating PDFs |
| Notebook | Its file in `content/_notebooks/` | The preview rebuilds automatically |

Do not edit generated copies; the next import replaces them. Keep `date`, `lang_ref`, and `permalink` unchanged when updating published content. For directly authored items, update `last_modified_at` inside their front matter. Imported update dates follow [these rules](content-workflow.md#metadata-and-timestamps).

## Add a blog post

### From Obsidian

1. Write a note in the vault. Use `##` for sections and `###` for subsections; the site supplies the page title.
2. Open `config/obsidian-imports.yml` in a text editor. Check that `vault:` points to your Obsidian folder; [configure that path](content-workflow.md#import-manifest) if needed.
3. Find `items:`. Append the block below after its existing entries. Align `- id:` with the other `- id:` lines, using two spaces before the hyphen. Keep the shown indentation and use spaces, not tabs.

```yaml
  - id: example-project-en
    source: Public/Example project.md
    destination: content/_posts/en/2026-10-28-example-project-en.md
    metadata:
      title: "Example project"
      date: 2026-10-28T12:00:00+07:00
      lang: en
      lang_ref: example-project
      excerpt: "One sentence describing the article."
      tags: [Machine learning, Projects]
      permalink: /example-project-en/
```

4. Replace the example values. `source` is the note's path inside the vault. `destination` is the site file to create; do not create it yourself. Choose a unique `id`, a stable `lang_ref`, and the desired public URL in `permalink`. Replace the date, title, summary, and tags. See [field definitions](content-reference.md) for the remaining rules.
5. Save the configuration. In the site terminal, run `npm run content:sync` and wait for it to finish without errors.
6. In the browser, open <http://127.0.0.1:4000/blog/> and click the new post. Check its text, images, links, formulas, and downloads. Add [artwork](banner-design.md#assign-artwork) when ready and sync again.

Settings inside `metadata:` override the original note's properties. To control a supported property in Obsidian, remove that property from this entry's `metadata:` block. For example, remove `image:` there to use the cover specified in the note.

### Directly in the repository

1. Copy `docs/templates/post.md` to `content/_posts/en/YYYY-MM-DD-your-post-en.md`. Replace the date in the filename and `your-post` with the post's short name, such as `neural-networks`.
2. Open the copy in a text editor. Replace the example settings between the first two `---` lines. Write the article below the closing `---`. A settings line starting with `#` is disabled; remove `# ` to use it.
3. Save the file. Wait for the running preview to rebuild, then open the local Blog list and check the post. Run `npm run content:exports` in the site terminal when ready to generate its PDF.

Do not add an import entry pointing to this directly authored file.

## Create a notebook

1. Copy `docs/templates/notebook.md` to `content/_notebooks/en/your-notebook-en.md`. Replace `your-notebook` with a short notebook name.
2. Open the copy in a text editor. In its top `---` block, replace the example title, description, topics, dates, `notebook_id`, `lang_ref`, and source credit. Set `permalink` to `/library/your-notebook/` using the same short name.
3. Write the introduction below the closing `---`. Add a banner and thumbnail using [the notebook image instructions](banner-design.md#directly-authored-post-note-or-notebook).
4. Save the file. In the site terminal, run `npm run validate` (`npm.cmd run validate` in PowerShell).
5. With the preview running, refresh <http://127.0.0.1:4000/library/> and open the new notebook. It can exist before any notes are added.

In the notebook's top settings block, use `status: in_progress` while working and `status: complete` when finished. Set `topics` there; individual notes do not have topics. Update `last_modified_at` when the introduction or status changes. The displayed update date also includes changes to its notes.

### Notebook materials

In the notebook file (`content/_notebooks/en/your-notebook-en.md`), add `materials` inside its top `---` settings block. Each entry needs a title and an absolute web URL:

```yaml
materials:
  - title: Source website
    url: https://example.com/notebook
  - title: Lecture slides
    url: https://example.com/notebook/slides
```

The notebook page shows these links, in the listed order, inside a collapsed **Notebook materials** menu. If `materials` is omitted, the menu contains one link to `source_url`. Keep `source_author` and `source_url`: they supply attribution in each note's downloads. The Library cards and note headers do not repeat this credit.

Field definitions: [Notebook fields](content-reference.md#notebook-fields).

## Add a note

Create its notebook first. Write the note in Obsidian, then open `config/obsidian-imports.yml` in a text editor. Append this block under `items:`, after the other entries, with the shown indentation:

```yaml
  - id: example-notebook-introduction-en
    source: Public/Example notebook/Introduction.md
    destination: content/_notes/en/example-notebook-introduction-en.md
    metadata:
      title: "Introduction"
      date: 2026-10-28T12:00:00+07:00
      lang: en
      lang_ref: example-notebook-introduction
      notebook: example-notebook
      order: 10
      description: "The main ideas covered in this note."
      permalink: /library/example-notebook/introduction/
      math: true
```

Replace the example paths, date, title, description, and IDs. Under `metadata:`, set `notebook` to the existing notebook's `notebook_id`; `lang` must also match. Set `permalink` to the notebook's URL followed by the note's short name and `/`.

Give each note a unique positive integer `order` within that notebook and language. Values `10`, `20`, and `30` leave room to insert `15`; readers see consecutive chapter numbers. An optional `module: "Part I"` line under `metadata:` labels a group of consecutive notes. `math: true` enables formulas.

Save the configuration and run `npm run content:sync` in the site terminal. Open the local Library list, the notebook, then the note. Check its position, navigation, images, and downloads, including the source credit in the downloads.

For a directly authored note, copy `docs/templates/note.md` to `content/_notes/en/your-notebook-your-topic-en.md`. Edit the copy's top `---` settings and body, then save; the running preview rebuilds it. Run `npm run content:exports` in the site terminal to generate its PDF.

## Add numbered references

Add sources in the original Obsidian note. Write an external Markdown link where you mention the source. If the phrase in the sentence is too short for the references list, give the link a title in quotation marks.

```markdown
The authors describe their method in [the report](https://example.org/report "A Survey of Model Evaluation Methods").
```

Readers see **the report** in the sentence and **A Survey of Model Evaluation Methods** in the list. Save the note and run `npm run content:sync` in the [site terminal](setup.md#where-to-run-commands). Each URL appears once, in order of first mention, with a return arrow for each place it appears. An article without sources has no generated list. To add a missing source later, edit the vault note and sync again. Run `npm run content:exports` to update its PDF.

To turn off automatic collection for one imported note, set `collect_references: false` beside its `source:` line in `config/obsidian-imports.yml`. For a post or note written directly under `content/_posts/` or `content/_notes/`, set `collect_references: true` in its front matter to enable the same behavior.

For a citation with author, year, or commentary, add a footnote in the article body. Put the marker after the work's name and the definition at the bottom of the same file.

```markdown
AlexNet[^alexnet] helped establish deep convolutional networks.

[^alexnet]: Alex Krizhevsky et al. [ImageNet Classification with Deep Convolutional Neural Networks](https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks.pdf). 2012.
```

Reuse the same footnote label for repeated citations. The renderer assigns the numbers and adds the References heading.

## Add images

### Photos and diagrams in the body

Paste or drag an image into the original Obsidian note where you want it to appear. Keep the attached file inside the vault. In Source mode, either of these forms can be written **in the note body**, below its settings block; use one, not both:

```markdown
![[Attachments/experiment photo.png|The experiment setup]]

![The experiment setup](<Attachments/experiment photo.png>)
```

Replace the example path with the actual attachment path. Importing copies the referenced file into the site. PNG, JPEG, WebP, GIF, and SVG are supported; convert HEIC first. Obsidian image-width settings are not carried over.

For a directly authored article, save the image as `assets/images/example-topic/experiment.jpg` inside the site folder. Add this line to the article's `.md` file **below the closing `---`**, at the desired position:

```markdown
![The experiment setup](/assets/images/example-topic/experiment.jpg)
```

Replace the path and description. Remote images remain remote; local HTML image tags and reference-style image links are not converted. See [supported paths](content-workflow.md#image-paths).

### Banner and thumbnail

Follow [Assign artwork](banner-design.md#assign-artwork): it gives the exact file and settings block for each content source. `image` selects the page banner; `preview_image` selects its list thumbnail. Body images do not become covers automatically.

### Refresh and check

After saving image changes, run `npm run content:sync` for an imported article; directly authored files rebuild automatically in the running preview. Check the browser page. Run `npm run content:exports` before checking updated PDF downloads. PDFs embed local images. Markdown downloads link to the published image files, which become available after publication.

## Add a translation

Create the translated document using the post, notebook, or note procedure above, in the other language folder (`en/` or `ru/`). For imports, add a separate entry in `config/obsidian-imports.yml` with a distinct `id` and destination.

In the new document's top settings block—or `metadata:` for imports—set `lang` to the new language, keep the original `lang_ref`, and set a distinct `permalink`. For notes, create the translated notebook first, with the same `notebook_id` as the original. See [identifiers and languages](content-reference.md#identifiers-and-languages).

Save and run `npm run content:sync` for imports; directly authored files need no import command. Check the language switcher after the local preview rebuilds.

## Hide or remove content

| Goal | Edit |
| --- | --- |
| Keep a vault draft private | Leave it out of `config/obsidian-imports.yml` |
| Hide an imported article | In its import entry's `metadata:` block, add `published: false` with the same indentation as `title:` |
| Hide directly authored content | In its Markdown file's top `---` block, add `published: false` without indentation |
| Remove an imported article | Remove its entire entry from `config/obsidian-imports.yml` and delete the site file named by that entry's `destination:` |
| Remove directly authored content | Delete its Markdown file under `content/` |

For an imported item, run `npm run content:sync` in the site terminal after saving. After hiding, deleting, or moving a site file, stop the preview with Ctrl+C and run `npm run dev` again to clear the old URL. Then [build and check](development.md#checks) before publishing the removal.

Before hiding or removing a notebook, hide or remove its notes too. Update links to removed items. `published: false` hides website output, not files in a public Git repository. Removing an import entry alone stops updates but does not delete its site copy.

Old downloads are removed automatically. Copied vault images remain under `assets/imported/`; check for remaining references before deleting them.
