"""Extract recipe sections from downloaded CC BY-SA Wikibooks HTML (stdlib only)."""
from html.parser import HTMLParser
from pathlib import Path
import re, json
from datetime import date
class RecipeParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.active=False; self.section=''; self.heading=False; self.heading_text=''; self.item=None; self.items=[]; self.depth=0
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in ('h2','h3'): self.heading=True; self.heading_text=''
        if tag=='li' and self.section in ('ingredients','procedure'):
            if self.item is None: self.item=''; self.depth=1
            else: self.depth+=1
    def handle_endtag(self,tag):
        if tag in ('h2','h3'):
            self.heading=False; title=self.heading_text.lower()
            if tag=='h2': self.section='ingredients' if 'ingredients' in title else 'procedure' if any(x in title for x in ('procedure','directions','method','preparation')) else ''
        if tag=='li' and self.item is not None:
            self.depth-=1
            if self.depth==0:
                self.items.append((self.section,re.sub(r'\s+',' ',self.item).strip()));self.item=None
    def handle_data(self,data):
        if self.heading:self.heading_text+=data
        if self.item is not None:self.item+=data

def extract():
    records=[]
    for source in json.loads(Path('data/source-manifest.json').read_text()):
        path=Path('data/source-pages')/source['file']
        if not path.exists():continue
        html=path.read_text();p=RecipeParser();p.feed(html.split('<div class="printfooter"')[0])
        revision=re.search(r'"wgRevisionId":(\d+)',html)
        record={**source,'license':'CC BY-SA 4.0','attribution':'Wikibooks contributors','retrieved':date.today().isoformat(),'revision':revision.group(1) if revision else None,'ingredients':[v for k,v in p.items if k=='ingredients'],'method':[v for k,v in p.items if k=='procedure']}
        records.append(record)
    Path('data/scraped-sources.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    for r in records: print(r['file'],r['title'], '\nING:', '; '.join(r['ingredients']), '\nMETHOD:', ' '.join(r['method'])[:1800], '\n')
if __name__=='__main__':extract()
