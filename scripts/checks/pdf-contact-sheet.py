from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
root = Path('.preview/pdf-review')
for folder in root.iterdir():
    if not folder.is_dir(): continue
    pages = sorted(folder.glob('page-*.png'), key=lambda p: int(p.stem.split('-')[1]))
    sheet = Image.new('RGB',(1104,((len(pages)+2)//3)*535),'#ddd8d0')
    draw = ImageDraw.Draw(sheet)
    for i,page in enumerate(pages):
        image=Image.open(page).convert('RGB')
        image.thumbnail((352,499))
        x=(i%3)*368+8; y=(i//3)*535+24
        sheet.paste(image,(x,y))
        draw.text((x,y-17),page.stem,fill='black')
    sheet.save(folder/'contact.png')
