# Content authoring

[Documentation](../README.md#documentation) / Authoring

**Site folder** means the folder containing `package.json` and `_config.yml`. **Vault** means the folder opened in Obsidian. Paths below start in the site folder unless marked as vault paths.

Edit site files in a text editor and vault notes in Obsidian. Type all commands in a [terminal opened in the site folder](setup.md#where-to-run-commands). Start the [local preview](setup.md#daily-preview) to inspect changes in a browser.

On this page: [Workflow](#from-draft-to-publication) · [Edit](#edit-existing-content) · [Add a post](#add-a-blog-post) · [Create a course](#create-a-course) · [Add a note](#add-a-note) · [References](#add-numbered-references) · [Images](#add-images) · [Translations](#add-a-translation) · [Hide or remove](#hide-or-remove-content)

## From draft to publication

1. Write the draft in Obsidian, including body images.
2. Add its source path and publication settings to `config/obsidian-imports.yml` using the [post](#add-a-blog-post) or [note](#add-a-note) procedure below.
3. In the site terminal, run `npm run content:sync`. This copies the selected notes and attachments and creates PDF/Markdown downloads.
4. Create a banner and thumbnail using the [image prompts](artwork-prompts.md#how-to-use), then [save and assign the files](banner-design.md#save-the-files).
5. Run `npm run content:sync` again. Check the local page, list entry, and downloads, then follow [Publishing](development.md#publishing).

For automatic local updates, leave `npm run content:watch` running in a separate site terminal instead of running sync after each save. This is the **content watcher**. It does not publish the site.

## Edit existing content

Find the item's site Markdown file under `content/_posts/`, `content/_notes/`, or `content/_courses/`. Its title and other settings are between the opening and closing `---` lines; this block is called **front matter**. The article text follows the closing line.

If that settings block contains `obsidian_import`, the file is generated. Find the matching `id` in `config/obsidian-imports.yml`; its `source` gives the original note's path inside the vault.

| Content | File to edit | Command after saving, in the site terminal |
| --- | --- | --- |
| Imported post or note | Original vault note for text; its entry in `config/obsidian-imports.yml` for publication settings | `npm run content:sync` |
| Directly authored post or note | Its file in `content/_posts/` or `content/_notes/` | `npm run content:exports` |
| Course | Its file in `content/_courses/` | `npm run content:exports` |

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
3. Save the file and run `npm run content:exports` in the site terminal. Open the local Blog list and check the post and its downloads.

Do not add an import entry pointing to this directly authored file.

## Create a course

1. Copy `docs/templates/course.md` to `content/_courses/en/your-course-en.md`. Replace `your-course` with a short course name.
2. Open the copy in a text editor. In its top `---` block, replace the example title, description, topics, dates, `course_id`, `lang_ref`, and source credit. Set `permalink` to `/library/your-course/` using the same short name.
3. Write the introduction below the closing `---`. Add a banner and thumbnail using [the course image instructions](banner-design.md#directly-authored-post-note-or-course).
4. Save the file. In the site terminal, run `bundle exec ruby scripts/site.rb validate`. On Windows, `.\scripts\preview.ps1 -Action validate` is an alternative.
5. With the preview running, refresh <http://127.0.0.1:4000/library/> and open the new course. It can exist before any notes are added.

In the course's top settings block, use `status: in_progress` while working and `status: complete` when finished. Set `topics` there; individual notes do not have topics. Update `last_modified_at` when the introduction or status changes. The displayed update date also includes changes to its notes.

### Course materials

In the course file (`content/_courses/en/your-course-en.md`), add `materials` inside its top `---` settings block. Each entry needs a title and an absolute web URL:

```yaml
materials:
  - title: Course website
    url: https://example.com/course
  - title: Lecture slides
    url: https://example.com/course/slides
```

The course page shows these links, in the listed order, inside a collapsed **Course materials** menu. If `materials` is omitted, the menu contains one link to `source_url`. Keep `source_author` and `source_url`: they supply attribution in each note's downloads. The Library cards and note headers do not repeat this credit.

Field definitions: [Course fields](content-reference.md#course-fields).

## Add a note

Create its course first. Write the note in Obsidian, then open `config/obsidian-imports.yml` in a text editor. Append this block under `items:`, after the other entries, with the shown indentation:

```yaml
  - id: example-course-introduction-en
    source: Public/Example course/Introduction.md
    destination: content/_notes/en/example-course-introduction-en.md
    metadata:
      title: "Introduction"
      date: 2026-10-28T12:00:00+07:00
      lang: en
      lang_ref: example-course-introduction
      course: example-course
      order: 10
      description: "The main ideas covered in this note."
      permalink: /library/example-course/introduction/
      math: true
```

Replace the example paths, date, title, description, and IDs. Under `metadata:`, set `course` to the existing course's `course_id`; `lang` must also match. Set `permalink` to the course's URL followed by the note's short name and `/`.

Give each note a unique positive integer `order` within that course and language. Values `10`, `20`, and `30` leave room to insert `15`; readers see consecutive chapter numbers. An optional `module: "Part I"` line under `metadata:` labels a group of consecutive notes. `math: true` enables formulas.

Save the configuration and run `npm run content:sync` in the site terminal. Open the local Library list, the course, then the note. Check its position, navigation, images, and downloads, including the source credit in the downloads.

For a directly authored note, copy `docs/templates/note.md` to `content/_notes/en/your-course-your-topic-en.md`. Edit the copy's top `---` settings and body, then run `npm run content:exports` in the site terminal.

## Add numbered references

Posts and notes use the same footnote syntax. In the original Obsidian note, switch to Source mode. For a directly authored article, open its file under `content/_posts/` or `content/_notes/` in a text editor. Write a marker after the name of the work, then define that marker at the bottom of the **same file**, outside the top settings block:

```markdown
AlexNet[^alexnet] helped establish deep convolutional networks.

[^alexnet]: Alex Krizhevsky et al. [ImageNet Classification with Deep Convolutional Neural Networks](https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks.pdf). 2012.
```

Use a distinct label for each source; reuse the same label when citing it again. You provide the source title and URL. Exporting numbers the citations in order of first use and builds the references list below the article. Only the number is linked in the text. The generated References heading is a separate `##` section with its own collapse control and table-of-contents entry. Do not write a separate References heading.

Save the note, then run `npm run content:sync` in the [site terminal](setup.md#where-to-run-commands). Check the citation, its return link, and both downloads. For a post or note written directly in the repository, put the same syntax in its Markdown body and run `npm run content:exports` instead.

References work with or without formulas. PDF editions include the list and clickable citations; Markdown editions retain the footnote syntax. Ordinary links remain ordinary links and do not create references. The former `references` setting is no longer used and can be removed from article settings or import metadata.

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

After saving image changes, run `npm run content:sync` for an imported article or `npm run content:exports` for a directly authored article, in the site terminal. Refresh the browser page and open its downloads. PDFs embed local images. Markdown downloads link to the published image files, which become available after publication.

## Add a translation

Create the translated document using the post, course, or note procedure above, in the other language folder (`en/` or `ru/`). For imports, add a separate entry in `config/obsidian-imports.yml` with a distinct `id` and destination.

In the new document's top settings block—or `metadata:` for imports—set `lang` to the new language, keep the original `lang_ref`, and set a distinct `permalink`. For notes, create the translated course first, with the same `course_id` as the original. See [identifiers and languages](content-reference.md#identifiers-and-languages).

Save, run `npm run content:sync` for imports or `npm run content:exports` for direct files, and check the language switcher in the local preview.

## Hide or remove content

| Goal | Edit |
| --- | --- |
| Keep a vault draft private | Leave it out of `config/obsidian-imports.yml` |
| Hide an imported article | In its import entry's `metadata:` block, add `published: false` with the same indentation as `title:` |
| Hide directly authored content | In its Markdown file's top `---` block, add `published: false` without indentation |
| Remove an imported article | Remove its entire entry from `config/obsidian-imports.yml` and delete the site file named by that entry's `destination:` |
| Remove directly authored content | Delete its Markdown file under `content/` |

For an imported item, run `npm run content:sync`; for direct content, run `npm run content:exports`. Run these in the site terminal after saving. Then [build and check](development.md#checks) before publishing the removal.

Before hiding or removing a course, hide or remove its notes too. Update links to removed items. `published: false` hides website output, not files in a public Git repository. Removing an import entry alone stops updates but does not delete its site copy.

Old downloads are removed automatically. Copied vault images remain under `assets/imported/`; check for remaining references before deleting them.
