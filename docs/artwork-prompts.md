# Artwork prompts

[Documentation](../README.md#documentation) / [Artwork](banner-design.md) / Prompts

Use these prompts to create consistent, subject-specific banners and thumbnails. They can be given to this assistant or another image model. File locations and image settings are covered in [Artwork](banner-design.md#save-the-files).

On this page: [Instructions](#how-to-use) · [Brief](#content-brief) · [Colors](#colors) · [Generation prompt](#generation-prompt) · [Dark version](#optional-dark-version) · [Example](#example)

## How to use

1. Open a chat that supports image generation. In its message box, paste the [content brief](#content-brief). Replace the text in square brackets with details from your draft. For a course, describe the course or book; for a note, describe that chapter.
2. In the same message, paste the [generation prompt](#generation-prompt) below the completed brief. Write `FORMAT: banner` and fill `COLORS` with the matching row from [Colors](#colors). Send the message.
3. Download the result as `banner.png` (or keep its actual `.jpg`/`.webp` extension). Send another message with the same brief and prompt, changing the line to `FORMAT: thumbnail`. Attach the accepted banner as a reference if supported. Download this result as `thumbnail.png` with its actual extension.
4. For dark versions, attach each accepted image to a new message and paste the [dark-version prompt](#optional-dark-version), filling in the dark colors.
5. [Save the files and assign them to the content](banner-design.md#save-the-files). These prompts go in the image-generation chat; no site configuration file needs them.

The process produces two main files per item: banner and thumbnail. Optional dark versions make four files. Do not put both formats into one combined image. Exact sizes and colors may need adjustment after generation; model support varies. If the model cannot generate the target aspect ratio, use a larger canvas and crop it without cutting off the subject. Do not stretch it.

An existing site illustration can be supplied as a style reference. Ask the model to reuse its colors and line treatment while drawing the new subject. Image generation is not connected to the site's import or build commands.

## Content brief

Paste this block into the image-generation chat's message box and replace each bracketed value. Give concrete objects or relationships that represent the content; “technology” or “learning” alone is too broad.

```text
CONTENT TYPE: [blog post / note / course]
TITLE: [used for context; do not draw it in the image]
SUMMARY: [2–4 sentences describing the content]
MAIN IDEA: [one idea the reader should remember]
VISUAL SUBJECT: [1–3 specific objects and their relationship]
KEEP OUT: [irrelevant imagery, misleading symbols, or motifs to avoid]
COLORS: [background, line, accent, fill, and surface from the table below]
FORMAT: [banner / thumbnail]
REFERENCE IMAGE: [optional attached illustration]
```

## Colors

Use the Blog row for original articles. Use the Library row for courses and notes. Keep these same colors when making related images.

| Section and theme | Background | Line | Accent | Fill | Surface |
| --- | --- | --- | --- | --- | --- |
| Blog, light | `#f2e9df` | `#856457` | `#bb513a` | `#dfb395` | `#faf5ec` |
| Library, light | `#e9ece2` | `#65715d` | `#60754f` | `#b4bfa2` | `#f7f7ee` |
| Blog, dark | `#302824` | `#b69a86` | `#e49574` | `#755443` | `#3b312b` |
| Library, dark | `#272e26` | `#a0ac92` | `#b2c18e` | `#53624a` | `#323b2f` |

These match the existing SVG illustrations. A very faint background dot pattern may use the line color at low opacity. Its purpose is texture, not a visible grid.

## Generation prompt

Paste this below the completed brief in the same chat message. Keep the shared style instructions when using it for another article.

```text
Create one illustration for a minimal personal website, using the content
brief supplied above. Output only the requested image, not a webpage mockup.

Subject:
Represent the MAIN IDEA with the VISUAL SUBJECT from the brief. Make the
relationship between the objects easy to understand. Respect KEEP OUT.
Choose details specific to this content. Do not default to books, lightbulbs,
brains, robots, or code screens unless the brief explicitly calls for them.
Do not invent scientific measurements, equations, labels, or claims.

Shared style:
Quiet editorial illustration with clean, rounded lines and simple flat
shapes. Use the supplied background, line, accent, fill, and surface colors.
Keep the background opaque and mostly empty. Use restrained contrast, a
barely visible dot texture, and one small accent-colored dot near the lower
right corner. No heavy shadows, glossy 3D effects, or busy decoration.
Do not draw words, letters, numbers, titles, logos, borders, or watermarks.
The website provides the title separately.

Composition depends on FORMAT:
- banner: wide 48:13 canvas, ideally 1920 × 520 pixels. Arrange the main
  subject across the center with generous space around it. At most three
  major elements. Keep essential details at least 8% away from the edges.
- thumbnail: 3:2 canvas, ideally 720 × 480 pixels. Redraw the idea around
  one dominant object or one simple relationship. Make it recognizable
  at 180 × 120 pixels. Remove secondary details. Do not shrink or crop the
  complete banner to create this composition.

If a reference image is supplied, keep its palette and line treatment.
A banner reference for a thumbnail establishes the subject and style;
it does not require repeating the banner's layout.
Generate only the requested FORMAT as one separate image.
```

## Optional dark version

In a new chat message, attach the accepted light image and paste the block below. Replace `[hex]` with the matching dark color codes from the table. Send one request for the banner and another for the thumbnail.

```text
Create a dark-theme version of the attached illustration.
Preserve its dimensions, objects, positions, spacing, and line treatment.
Change only the palette:
Background: [hex]
Line: [hex]
Accent: [hex]
Fill: [hex]
Surface: [hex]
Keep the background opaque. Maintain clear, restrained contrast on the
new background, including the faint texture and small accent dot.
Do not add new details, text, labels, or a frame.
Output one image with the same composition and aspect ratio.
```

A dark version is optional. Check the original in the site's dark theme first; photographs and some illustrations work well unchanged.

## Example

This fictional note shows how to make a brief specific without tying the procedure to a published article:

```text
CONTENT TYPE: note
TITLE: Why a cache helps
SUMMARY: The note explains how frequently used data can be served from a
small nearby cache, avoiding repeated trips to slower storage. It compares
a cache hit with a miss without presenting measured performance results.
MAIN IDEA: A short route makes repeated access cheaper.
VISUAL SUBJECT: A small group of data squares beside a processor, with a
short solid route between them and a longer faint route to distant storage.
KEEP OUT: Books, invented benchmark numbers, text labels.
COLORS: background #e9ece2; line #65715d; accent #60754f;
fill #b4bfa2; surface #f7f7ee.
FORMAT: banner
REFERENCE IMAGE: none
```

For its thumbnail, keep the processor and nearby data squares, and omit the distant storage. The main idea remains recognizable with fewer details.
