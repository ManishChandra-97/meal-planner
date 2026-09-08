"""Refresh only the reviewed Wikibooks source allowlist; never publish unreviewed recipes.

Usage: python3 scripts/scrape_recipes.py
Requires curl. Downloads at most 30 pages/minute and stops on HTTP errors.
"""
from pathlib import Path
from urllib.parse import urlparse, quote
import json, subprocess, tempfile
from extract_sources import extract
manifest=json.loads(Path('data/source-manifest.json').read_text())
Path('data/source-pages').mkdir(parents=True,exist_ok=True)
config=[]
for source in manifest:
    url=source['url'];parsed=urlparse(url)
    if parsed.scheme!='https' or parsed.netloc!='en.wikibooks.org' or not parsed.path.startswith('/wiki/Cookbook:'):
        raise ValueError('Only reviewed Wikibooks cookbook URLs may be downloaded')
    name=source['file']
    if not name.removesuffix('.html').isdigit():raise ValueError('Invalid source filename')
    config.extend(['url = '+json.dumps(quote(url,safe=':/()')),'output = '+json.dumps('data/source-pages/'+name)])
with tempfile.NamedTemporaryFile(mode='w',suffix='.curl',delete=True) as task_config:
    task_config.write('\n'.join(config));task_config.flush()
    subprocess.run(['curl','-LfsS','--http1.1','--rate','30/m','--max-time','30','--fail-early','--config',task_config.name],check=True)
extract()
print('Sources refreshed. Review changes before running npm run recipes:build.')
