"""Portable article PDFs from the same Markdown as the site; no browser required."""
import io
import json
import os
from pathlib import Path
import re
import sys
from html import escape
from urllib.parse import urlparse, unquote

from pypdf import PdfReader
from bs4 import BeautifulSoup, NavigableString, Tag
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    HRFlowable, ListFlowable, ListItem, Preformatted, CondPageBreak, KeepTogether,
)

INK = colors.HexColor('#252522')
ACCENT = colors.HexColor('#b94432')
MUTED = colors.HexColor('#6f6b64')
PAGE_W, PAGE_H = A4
WIDTH = PAGE_W - 104

def register_fonts():
    configured = os.environ.get('SITE_FONT_DIR')
    locations = [Path(configured)] if configured else []
    locations += [Path('C:/Windows/Fonts'), Path('/usr/share/fonts/truetype/dejavu'), Path('/Library/Fonts')]
    for directory in locations:
        for names in [
            ('arial.ttf', 'arialbd.ttf', 'ariali.ttf', 'arialbi.ttf'),
            ('DejaVuSans.ttf', 'DejaVuSans-Bold.ttf', 'DejaVuSans-Oblique.ttf', 'DejaVuSans-BoldOblique.ttf'),
            ('Arial.ttf', 'Arial Bold.ttf', 'Arial Italic.ttf', 'Arial Bold Italic.ttf'),
        ]:
            if all((directory / n).exists() for n in names):
                for key, name in zip(['Body', 'Body-Bold', 'Body-Italic', 'Body-BoldItalic'], names):
                    pdfmetrics.registerFont(TTFont(key, str(directory / name)))
                pdfmetrics.registerFontFamily('Body', normal='Body', bold='Body-Bold', italic='Body-Italic', boldItalic='Body-BoldItalic')
                return
    raise RuntimeError('Install DejaVu Sans or set SITE_FONT_DIR to a folder containing Arial or DejaVu Sans TTF fonts.')

register_fonts()
BODY = ParagraphStyle('Body', fontName='Body', fontSize=10.5, leading=16, textColor=INK, spaceAfter=9, allowWidows=0, allowOrphans=0)
SMALL = ParagraphStyle('Small', parent=BODY, fontSize=8.5, leading=12, textColor=MUTED, spaceAfter=7)
CAPTION = ParagraphStyle('Caption', parent=SMALL, alignment=TA_LEFT)
STYLES = {n: ParagraphStyle(n, parent=BODY, fontName='Body-Bold', fontSize=size, leading=leading, spaceBefore=space, spaceAfter=9, keepWithNext=True)
          for n, size, leading, space in [('h1',25,31,0), ('h2',16,21,18), ('h3',12.5,18,13), ('h4',11,16,11), ('h5',11,16,9), ('h6',11,16,9)]}
CODE = ParagraphStyle('Code', parent=BODY, fontName='Body', fontSize=8, leading=11, backColor=colors.HexColor('#f4f1ec'), borderPadding=8, spaceBefore=5, spaceAfter=12)

def clean(text):
    return text.replace('\u00a0',' ').replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ')

class Renderer:
    def __init__(self, job):
        self.job = job
        self.temp = Path(job['root']) / '.preview' / 'exports' / job['key']
        self.temp.mkdir(parents=True, exist_ok=True)
        self.counter = 0
        self.anchors = set()
        self.targets = set()

    def local_image(self, src):
        parsed = urlparse(src)
        if parsed.scheme:
            base = self.job['origin']
            if not src.startswith(base + '/'):
                # External images are retained as clickable links in the PDF.
                return None
            src = src[len(base):]
        target = (Path(self.job['root']) / unquote(src).lstrip('/')).resolve()
        target.relative_to(Path(self.job['root']).resolve())
        if not target.is_file():
            raise ValueError('Missing article image: ' + src)
        from PIL import Image as PILImage
        with PILImage.open(target) as img:
            w, h = img.size
        return target, w, h

    def inline(self, node):
        if isinstance(node, NavigableString):
            return escape(clean(str(node)))
        if not isinstance(node, Tag):
            return ''
        name = node.name
        content = lambda: ''.join(self.inline(child) for child in node.children)
        if name in ['strong','b']: return '<b>' + content() + '</b>'
        if name in ['em','i']: return '<i>' + content() + '</i>'
        if name == 'code': return '<font color="#7c493f">' + content() + '</font>'
        if name == 'br': return '<br/>'
        if name in ['s','del']: return '<strike>' + content() + '</strike>'
        if name in ['sub','sup']: return '<' + name + '>' + content() + '</' + name + '>'
        if name == 'a':
            if 'footnote-backref' in node.get('class', []):
                # Text avoids missing arrow/variation-selector glyphs in PDF fonts.
                content = lambda: '[назад]' if self.job['lang'] == 'ru' else '[back]'
            anchor = node.get('id')
            prefix = ''
            if anchor and anchor not in self.anchors:
                prefix = '<a name="' + escape(anchor, quote=True) + '"/>'
                self.anchors.add(anchor)
            href = node.get('href','')
            if href.startswith('#') and unquote(href[1:]) in self.targets:
                return prefix + '<a href="#' + escape(unquote(href[1:]), quote=True) + '" color="#b94432">' + content() + '</a>'
            if href.startswith('/'): href = self.job['origin'] + href
            if href.startswith('#'): href = self.job['canonical'] + href
            if href.startswith(('https://','http://','mailto:')):
                return prefix + '<a href="' + escape(href, quote=True) + '" color="#b94432">' + content() + '</a>'
            return prefix + content()
        if name == 'img':
            if 'math-equation' in node.get('class',[]):
                file = (Path(self.job['root']) / node['src'].lstrip('/')).resolve()
                file.relative_to(Path(self.job['root']).resolve())
                w, h = float(node['width']), float(node['height'])
                scale = min(1,(WIDTH-20)/w)
                return '<img src=\"' + escape(str(file),quote=True) + '\" width=\"' + str(w*scale) + '\" height=\"' + str(h*scale) + '\" valign=\"-2\"/>'
            return escape(node.get('alt',''))
        if name in ['script','style']: return ''
        return content()

    def image_block(self, node, width):
        src = node.get('src','')
        image = self.local_image(src)
        if image is None:
            return [Paragraph('Image: <a href="' + escape(src, quote=True) + '" color="#b94432">' + escape(node.get('alt') or src) + '</a>', SMALL)]
        file, w, h = image
        ratio = min(width/w, 570/h, 1 if file.suffix.lower() != '.png' else 2)
        return [Image(str(file), width=w*ratio, height=h*ratio, hAlign='LEFT'), Spacer(1,9)]

    def blocks(self, parent, width=WIDTH):
        result = []
        nodes, buffer = [], []
        for child in list(parent.children):
            inline = isinstance(child,NavigableString) or (isinstance(child,Tag) and child.name in ['strong','b','em','i','code','a','span','br','s','del','sup','sub'])
            if inline:
                buffer.append(str(child))
            else:
                if ''.join(buffer).strip(): nodes.append(BeautifulSoup('<p>'+''.join(buffer)+'</p>','html.parser').p)
                buffer=[]
                nodes.append(child)
        if ''.join(buffer).strip(): nodes.append(BeautifulSoup('<p>'+''.join(buffer)+'</p>','html.parser').p)
        for node_index, node in enumerate(nodes):
            if isinstance(node, NavigableString):
                if str(node).strip(): result.append(Paragraph(escape(clean(str(node))), BODY))
                continue
            if not isinstance(node, Tag): continue
            name = node.name
            if name in ['script','style']: continue
            if name in STYLES:
                anchor = node.get('id')
                prefix = ''
                if anchor and anchor not in self.anchors:
                    prefix = '<a name="' + escape(anchor, quote=True) + '"/>'
                    self.anchors.add(anchor)
                # ListFlowable can split immediately after a heading despite keepWithNext.
                # Reserve enough room for the heading and its opening lines as well.
                previous_is_heading = node_index > 0 and isinstance(nodes[node_index-1], Tag) and nodes[node_index-1].name in STYLES
                if name != 'h1' and not previous_is_heading: result.append(CondPageBreak(92))
                result.append(Paragraph(prefix + self.inline(node), STYLES[name]))
            elif name == 'img':
                result += self.image_block(node, width)
            elif name == 'p' and node.select('img:not(.math-equation)'):
                # Preserve text before/after images without squeezing diagrams into lines.
                fragment = BeautifulSoup('', 'html.parser')
                for child in list(node.children):
                    if isinstance(child, Tag) and child.name == 'img':
                        if fragment.get_text().strip(): result.append(Paragraph(self.inline(fragment), BODY))
                        fragment = BeautifulSoup('', 'html.parser')
                        result += self.image_block(child, width)
                    else: fragment.append(child)
                if fragment.get_text().strip(): result.append(Paragraph(self.inline(fragment), BODY))
            elif name in ['p','figcaption']:
                result.append(Paragraph(self.inline(node), CAPTION if name == 'figcaption' else BODY))
            elif name == 'pre':
                # Long code lines wrap; never let a single code block overflow a page.
                text = clean(node.get_text()).expandtabs(4)
                wrapped=[]
                for line in text.split('\n'):
                    part=''
                    for char in line:
                        if part and pdfmetrics.stringWidth(part+char,'Body',8)>width-18:
                            wrapped.append(part); part=''
                        part+=char
                    wrapped.append(part)
                result.append(Preformatted('\n'.join(wrapped), CODE))
            elif name in ['ul','ol']:
                items = []
                for li in node.find_all('li', recursive=False):
                    children = self.blocks(li, width-22)
                    if children: items.append(ListItem(children, leftIndent=0))
                if items:
                    result.append(ListFlowable(items, bulletType='1' if name == 'ol' else 'bullet', start=int(node.get('start',1)) if name == 'ol' else None,
                                               leftIndent=19, bulletFontName='Body', bulletFontSize=8, spaceAfter=8))
            elif name == 'li':
                result += self.blocks(node, width)
            elif name == 'table':
                rows = []
                for tr in node.find_all('tr'):
                    rows.append([Paragraph(self.inline(cell), SMALL) for cell in tr.find_all(['th','td'], recursive=False)])
                if rows:
                    columns = max(map(len,rows))
                    table = Table(rows, colWidths=[width/columns]*columns, repeatRows=1 if node.find('th') else 0, hAlign='LEFT')
                    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,0),.5,colors.HexColor('#ccc5ba')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#f4f1ec')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
                    result += [table, Spacer(1,12)]
            elif name == 'hr':
                result += [HRFlowable(width='100%', thickness=.5, color=colors.HexColor('#d7d0c5'), spaceBefore=9, spaceAfter=12)]
            elif name == 'div' and 'math-display' in node.get('class',[]):
                result += [Paragraph(self.inline(node), BODY), Spacer(1,5)]
            elif name in ['div','section','article','figure','blockquote']:
                result += self.blocks(node, width)
            else:
                result.append(Paragraph(self.inline(node), BODY))
        return result

    def footer(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor('#d7d0c5'))
        canvas.line(52,43,PAGE_W-52,43)
        canvas.setFont('Body',7)
        canvas.setFillColor(MUTED)
        canvas.drawString(52,30,'Alexander Petrov')
        label = self.job['canonical'].removeprefix('https://')
        canvas.drawCentredString(PAGE_W/2,30,label)
        canvas.linkURL(self.job['canonical'], (150,25,PAGE_W-90,39), relative=0)
        canvas.drawRightString(PAGE_W-52,30,str(doc.page))
        canvas.restoreState()

    def create(self):
        job = self.job
        story = [Paragraph(escape(clean(job['title'])), STYLES['h1']), Spacer(1,7),
                 Paragraph(escape(job['ownership']), SMALL),
                 Paragraph('Original publication: <a color="#b94432" href="' + escape(job['canonical'],quote=True) + '">' + escape(job['canonical']) + '</a>', SMALL)]
        if job['source']:
            story += [Paragraph(escape(job['source']), SMALL),
                      Paragraph('Course: <a color="#b94432" href="' + escape(job['source_url'],quote=True) + '">' + escape(job['source_url']) + '</a>', SMALL)]
        story += [HRFlowable(width='100%', thickness=.6, color=colors.HexColor('#d7d0c5'), spaceBefore=5, spaceAfter=17)]
        body = BeautifulSoup(job['html'],'html.parser')
        # Citation targets belong to list items; ReportLab anchors live in paragraphs.
        for item in body.select('li.footnote-item[id]'):
            paragraph = item.find('p')
            if paragraph is not None:
                anchor = body.new_tag('a', id=item['id'])
                paragraph.insert(0, anchor)
        self.targets = {node['id'] for node in body.select('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], a[id]')}
        # Keep a short closing section intact instead of leaving one bullet on a last page.
        headings = body.find_all(['h2','h3'], recursive=False)
        tail = None
        if headings:
            last = headings[-1]
            siblings = [last, *list(last.next_siblings)]
            words = sum(len(node.get_text().split()) for node in siblings if isinstance(node, Tag))
            complex_content = any(node.name in ['pre','table','figure'] or node.find(['pre','table','figure']) or node.select('img:not(.math-equation)') for node in siblings if isinstance(node, Tag))
            if words <= 220 and not complex_content:
                tail = BeautifulSoup('', 'html.parser')
                for node in siblings: tail.append(node.extract())
        story += self.blocks(body)
        if tail is not None: story.append(KeepTogether([flow for flow in self.blocks(tail) if not isinstance(flow, CondPageBreak)]))
        output = Path(job['pdf'])
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = self.temp / 'result.pdf'
        doc = SimpleDocTemplate(str(temporary), pagesize=A4, leftMargin=52, rightMargin=52, topMargin=48, bottomMargin=59, title=job['title'], author=job['author'], subject='Original publication: ' + job['canonical'])
        doc.build(story, onFirstPage=self.footer, onLaterPages=self.footer)
        # Validate readable text and page boundaries before replacing the public file.
        pdf = PdfReader(str(temporary))
        text = ''.join(page.extract_text() for page in pdf.pages)
        if job['author'] not in text or job['canonical'] not in text:
            raise RuntimeError('Missing attribution in generated PDF')
        print('PDF: ' + job['key'] + ' (' + str(len(pdf.pages)) + ' pages)')
        output.write_bytes(temporary.read_bytes())

for job in json.loads(Path(sys.argv[1]).read_text(encoding='utf-8')):
    Renderer(job).create()
