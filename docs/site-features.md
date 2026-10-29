# Site behavior

[Documentation](../README.md#documentation) / Site behavior

What readers can do and how the static site behaves. For configuration locations, see [Configuration](configuration.md).

On this page: [Navigation](#navigation-and-themes) · [Lists](#sorting-and-topics) · [Reading](#reading-navigation) · [Statistics](#views-and-likes) · [Sharing](#sharing-and-reader-messages) · [Feeds](#rss-and-substack) · [Caching](#navigation-and-caching)

## Navigation and themes

Internal links stay in the current tab. External links, including CV links, open separately. The language switcher connects documents with the same `lang_ref`; an unavailable translation is disabled.

The theme follows the device preference initially. The header toggle stores a light/dark preference in the current browser. A small startup script applies it before the page paints; theme controls still work when persistent storage is unavailable.

## Sorting and topics

Blog and Library share these options:

| Option | Ordering |
| --- | --- |
| Newest | Creation `date`, descending; default |
| Recently updated | `last_modified_at`, descending, with `date` as fallback; courses include their notes' updates |
| Most viewed | View count, descending |
| Most liked | Like count, descending |
| Title: A–Z | Locale-aware title order |

Popularity ties use newer creation dates; equal dates fall back to the stable ID. Unavailable counts sort after available counts and display a dash. Live count updates can reorder results, but reordering waits while a reader is using a control inside the list.

Blog topics come from post `tags`; Library topics come from course `topics`. Their vocabularies are independent. The topic menu is alphabetized, searchable, scrollable, and supports multiple selections. A result matches **any** selected topic. Search only narrows the menu; it does not clear selections.

Selections use repeated `?topic=...` parameters and `?sort=...`, so filtered views can be shared and browser Back restores them. Legacy `?tag=...` links still work. Inside a course, notes always follow the author's `order`; there are no chapter sort or topic controls.

Posts and courses use consistent list separators, dedicated thumbnails, and views/likes/share controls. Sorting and filtering need JavaScript; content and ordinary navigation remain available without it.

## Reading navigation

Posts and notes share the reader layout. The desktop table of contents follows the current `##` section and reveals its `###` subsections. On a narrow screen, contents start collapsed. Section links reveal folded content.

Rendered formulas can be clicked or focused and activated with Enter/Space to copy their original Markdown: `$...$` for inline math and `$$...$$` for display math. TeX commands and line breaks are preserved. A pointer cursor and tooltip indicate the action; formulas keep their normal appearance. Keyboard focus has the standard outline. Clipboard success uses a brief toast; blocked clipboard access opens selectable source text.

Notes add breadcrumbs, course contents, and previous/next links in the authored sequence. Original source links appear in the course's collapsed Course materials menu. Each post/note offers its own PDF and Markdown editions; note downloads retain the course's source attribution. See [exports](content-workflow.md#downloadable-editions) for their contents and limits.

Posts and notes use the same numbered references, generated from footnotes during export, including in PDFs. References form a separate section that can be collapsed independently. Repeated citations share a number; return links reveal the section containing the mention. Ordinary links do not add references. Follow [Add numbered references](author-guide.md#add-numbered-references) to write them in Obsidian or repository Markdown.

Wide tables scroll horizontally within the article. Readers can swipe, use the scrollbar, or focus the table region with Tab and scroll with the arrow keys.

## Views and likes

| Content | Firebase path |
| --- | --- |
| Blog post | `posts/<lang_ref>` |
| Note | `posts/library--<lang_ref>` |
| Course | `posts/course--<lang_ref>` |

Translations share counts. The Library row and its course page also share counts. Visiting a list does not increment an article/course view; opening the reading or course page does.

Views and likes are deduplicated using browser storage. There are no visitor accounts and no unlike action. Clearing storage resets local deduplication, so these are interaction counts, not verified unique-person analytics. The store synchronizes repeated controls, preserves views when liking, and allows failed writes to be retried. A statistics failure does not block reading or navigation.

Local preview uses namespaced browser data rather than the live database. The production hostname boundary and Firebase configuration are documented in [Configuration](configuration.md#scope-and-existing-integrations).

## Sharing and reader messages

The Share menu offers Copy link, X, Telegram, Copy for Discord, and Email. It uses the canonical public URL even in local preview. Discord sharing copies a link for the reader to paste into a conversation. The menu does not invoke the operating system's native share sheet; no platform SDK is loaded for it. If clipboard access fails, a selectable link is shown.

The floating author button opens a message form. It accepts letters, combining accents, numbers, punctuation, spaces, tabs, and line breaks, up to 2,000 characters as counted by the form. Symbols such as emoji are rejected. The prepared draft includes a reader-message heading and the current page's title and canonical URL.

| Destination | Action |
| --- | --- |
| Telegram | Open a draft addressed to the configured handle |
| Email | Open a mail-client draft with a subject |
| X / Discord | Copy the draft and open the configured profile/app; the reader pastes it |

The site does not send the message. Platform login, messaging permissions, and mail-client availability still apply. A failed copy exposes selectable text; a visible destination link is available when opening an app fails. Drafts are not stored on a site server.

The up button appears below the author button only after scrolling upward while more than 500px down the page.

## RSS and Substack

The footer's RSS link points to a full-content **Atom feed**, a format accepted by feed readers:

| Route | Contents |
| --- | --- |
| `/feed.xml` | English blog posts |
| `/ru/feed.xml` | Russian blog posts |

Feeds rebuild with Jekyll. They exclude redirect pages and notes. Subscribers can read updates in a feed reader; the site does not send newsletter emails.

Substack synchronization is not implemented. A manual workflow is to publish here, copy the rendered article into Substack, add an original-publication link, and review formatting and delivery settings there. The two sites keep separate engagement statistics.

## Navigation and caching

This is a static multi-page site. Following an internal link requests another HTML document. Browsers can reuse cached assets, and Back/Forward may restore a whole page. Cache headers are controlled by the host; local preview behavior differs from production. There is no service worker or client-side page router.

Related: [Configuration](configuration.md) · [Troubleshooting](troubleshooting.md)
