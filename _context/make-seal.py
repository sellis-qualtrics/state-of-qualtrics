import math
from PIL import Image, ImageDraw, ImageFont
S=1024; C=S/2
NAVY=(28,45,92,255); GREEN=(62,125,96,255); LG=(199,225,213,255); CREAM=(247,247,213,255); WHITE=(255,255,255,255)
img=Image.new("RGBA",(S,S),(0,0,0,0)); d=ImageDraw.Draw(img)
def circ(r,fill=None,outline=None,width=0): d.ellipse([C-r,C-r,C+r,C+r],fill=fill,outline=outline,width=width)
circ(502,fill=NAVY); circ(468,outline=LG,width=8); circ(292,fill=CREAM); circ(292,outline=LG,width=14)
serif="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
sans="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def arc_text(text,font,R,center_deg,spacing,color,bottom=False):
    widths=[font.getlength(ch)+spacing for ch in text]; widths[-1]-=spacing
    total=sum(widths); span=math.degrees(total/R)
    pos=-span/2
    out=[]
    for ch,w in zip(text,widths):
        cw=font.getlength(ch); mid=pos+math.degrees((cw/2)/R)
        out.append((ch,mid)); pos+=math.degrees(w/R)
    for ch,off in out:
        th = center_deg+off if not bottom else center_deg-off
        sz=int(font.size*2.4); tile=Image.new("RGBA",(sz,sz),(0,0,0,0))
        ImageDraw.Draw(tile).text((sz/2,sz/2),ch,font=font,fill=color,anchor="ms")
        rot = -(th+90) if not bottom else -(th-90)
        tile=tile.rotate(rot,resample=Image.BICUBIC)
        x=C+R*math.cos(math.radians(th)); y=C+R*math.sin(math.radians(th))
        img.alpha_composite(tile,(int(round(x-sz/2)),int(round(y-sz/2))))
    return span
f1=ImageFont.truetype(serif,68)
span=arc_text("STATE OF QUALTRICS",f1,356,-90,5,WHITE)
f2=ImageFont.truetype(sans,46)
span2=arc_text("★  EST. 2002  ★",f2,418,90,6,LG,bottom=True)
print("top span",round(span),"bottom span",round(span2))
# side dots
for th in (180-((360-span-span2)/4+span2/2)*0+0,):
    pass
for th in ():
    x=C+385*math.cos(math.radians(th)); y=C+385*math.sin(math.radians(th))
    d.ellipse([x-10,y-10,x+10,y+10],fill=GREEN)
# center art (SVG coords 0-200 scaled)
k=5.12
def P(x,y): return ((x-100)*k+C,(y-100)*k+C)
def bez(p0,p1,p2,p3,n=40):
    return [((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0],(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]) for t in [i/n for i in range(n+1)]]
d.polygon([P(54,128),P(78,98),P(92,110),P(112,84),P(146,128)],fill=NAVY)
d.polygon([P(112,84),P(120,95),P(114,94),P(108,99),P(104,95)],fill=WHITE)
leaf=bez((100,124),(82,112),(80,88),(100,70))+bez((100,70),(120,88),(118,112),(100,124))
d.polygon([P(*p) for p in leaf],fill=GREEN)
d.line([P(100,122),P(100,80)],fill=LG,width=13)
d.line([P(100,104),P(90,96)],fill=LG,width=10); d.line([P(100,94),P(109,87)],fill=LG,width=10)
# star
cx,cy=P(100,58); pts=[]
for i in range(10):
    r=60 if i%2==0 else 25; a=math.radians(-90+i*36); pts.append((cx+r*math.cos(a),cy+r*math.sin(a)))
d.polygon(pts,fill=GREEN)
x0,y0=P(54,128); x1,y1=P(146,132); d.rounded_rectangle([x0,y0,x1,y1],radius=10,fill=GREEN)
img.resize((512,512),Image.LANCZOS).save("/sessions/blissful-beautiful-curie/mnt/outputs/state-of-qualtrics/assets/img/seal.png",optimize=True)
img.save("/tmp/seal/seal-1024.png")
