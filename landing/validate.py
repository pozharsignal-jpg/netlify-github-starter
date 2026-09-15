from pathlib import Path
from lxml import html
import json,subprocess
P=Path(__file__).parent
s=P.joinpath('test-preview.html').read_text(encoding='utf-8')
r=html.fromstring(s)
ids=r.xpath('//@id')
assert len(ids)==len(set(ids)), 'Duplicate IDs'
assert len(r.xpath('//h1'))==1
for a in r.xpath('//a[starts-with(@href,"#")]'):
 target=a.get('href')[1:]
 assert not target or target in ids, target
for img in r.xpath('//img[@src]'):
 assert img.get('alt') and img.get('width') and img.get('height')
 src=img.get('src')
 assert src.startswith('https://') or src.startswith('/media/'), src
for sc in r.xpath('//script[@type="application/ld+json"]'):
 json.loads(sc.text)
snippet=P.joinpath('02_PAGE_FULL_T123.html').read_text(encoding='utf-8')
assert 'C:\\' not in snippet and 'src="assets/' not in snippet
assert 'jquery' not in snippet.lower() and 'bootstrap' not in snippet.lower()
assert '�' not in snippet
print('PASS: IDs, anchors, H1, images, JSON-LD, UTF-8, isolation dependencies')
