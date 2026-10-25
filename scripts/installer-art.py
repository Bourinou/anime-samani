"""Convert the supplied logo to Windows icon and NSIS artwork without changing it."""
from pathlib import Path
from shutil import copyfile
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
logo=Image.open(root/'assets/branding/app-mark.png').convert('RGBA')
copyfile(root/'assets/branding/app-mark.png',root/'icon.png')
logo.save(root/'icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
font=root/'assets/fonts/Beckman-FREE.otf'
def canvas(size):
 image=Image.new('RGB',size)
 pixels=image.load()
 for y in range(size[1]):
  for x in range(size[0]):
   t=(x/size[0]+y/size[1])/2
   pixels[x,y]=(int(17+15*t),int(14+6*t),int(23+7*t))
 return image
header=canvas((150,57));mark=logo.copy();mark.thumbnail((49,49),Image.Resampling.LANCZOS);header.paste(mark,(3,4),mark)
d=ImageDraw.Draw(header);d.text((58,11),'ANIME',font=ImageFont.truetype(str(font),10),fill='#fff5ef');d.text((58,26),'SAMANI',font=ImageFont.truetype(str(font),14),fill='#ffb5b9')
header.save(root/'assets/installer/header.bmp')
sidebar=canvas((164,314));mark=logo.copy();mark.thumbnail((146,146),Image.Resampling.LANCZOS);sidebar.paste(mark,((164-mark.width)//2,42),mark)
d=ImageDraw.Draw(sidebar)
for text,y,size,color in [('ANIME',205,17,'#fff5ef'),('SAMANI',230,24,'#ffb5b9'),('V1',284,12,'#c7bfc9')]:
 f=ImageFont.truetype(str(font),size);box=d.textbbox((0,0),text,font=f);d.text(((164-(box[2]-box[0]))/2,y),text,font=f,fill=color)
sidebar.save(root/'assets/installer/sidebar.bmp')
print('Generated Windows icon and NSIS header/sidebar from supplied app-mark.png')
