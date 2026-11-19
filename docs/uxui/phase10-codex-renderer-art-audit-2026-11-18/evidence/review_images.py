"""Make local inspection sheets from actual DOM screenshots; no app asset edits."""
from PIL import Image, ImageDraw
from audit import RAW
families=['khmer-floral-gold','royal-garden-cinematic','silk-heritage','template-boilerplate','khmer-celestial','the-digital-yes-wedding','emerald-canva-luxe-wedding','withjoy-modern-portal','bliss-editorial-wedding','cover-khmer-golden-wedding']
for group in range(2):
    canvas=Image.new('RGB',(800,5*610),'#dedede'); draw=ImageDraw.Draw(canvas)
    for index,name in enumerate(families[group*5:(group+1)*5]):
        for column,state in enumerate(['cover','open']):
            path=RAW/'acceptance-frozen'/f'{name}-normal-{state}.png'
            if not path.exists():continue
            with Image.open(path)as img:
                top=img.crop((0,0,min(img.width,390),min(img.height,844))).convert('RGB')
                top.thumbnail((390,570));canvas.paste(top,(column*400,index*610+28))
            draw.text((column*400+4,index*610+4),name+' / '+state,fill='#111111')
    canvas.save(RAW/f'visual-review-{group+1}.jpg',quality=88)
for name,width in [('silk-heritage',1440),('emerald-canva-luxe-wedding',320)]:
    path=RAW/'acceptance-frozen'/f'desktop-chromium-{name}-{width}x{900 if width==1440 else 844}-open.png'
    if path.exists():
        with Image.open(path)as img:
            image=img.crop((0,0,img.width,min(img.height,1600))).convert('RGB')
            image.thumbnail((1000,1600));image.save(RAW/f'{name}-focused-review.jpg',quality=90)
print('Prepared two normal-motion cover/open sheets and focused Silk/Emerald images')
