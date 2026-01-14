import re
p='d:/projects/MyLaragon/neutralino/dist/MyLaragon/resources.neu'
data=open(p,'rb').read()
# search for manifest entries like "bootstrap.html":{...
m=re.search(rb'"bootstrap\.html"\s*:\s*\{', data)
print('manifest entry for bootstrap.html:', bool(m), 'at', m.start() if m else None)
# search for filenames in manifest ("files":{...list...})
# search raw occurrences
occ=[(m.start(), data[m.start()-40:m.start()+40]) for m in re.finditer(b'bootstrap.html', data)]
print('occurrences count', len(occ))
for pos,ctx in occ:
    print(pos, ctx.decode('utf-8',errors='replace'))
# Also parse manifest JSON like before to get filenames under root
start = data.find(b'{"files":')
if start!=-1:
    end = start+2000
    snippet = data[start:end].decode('utf-8',errors='replace')
    print('\nmanifest snippet:')
    print(snippet)
else:
    print('\nmanifest not found')
