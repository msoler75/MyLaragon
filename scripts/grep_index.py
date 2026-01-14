import os
p = r'd:\projects\MyLaragon\neutralino\.tmp\inspected_resources\extracted_index.html'
if not os.path.exists(p):
    print('No file',p)
    raise SystemExit(1)
with open(p,'r',encoding='utf-8',errors='replace') as f:
    txt=f.read()
print('len',len(txt))
for key in ['Neutralino.init','Wrote app-log.txt','writeFile','Neutralino global not present','Neutralino']:
    print(key, key in txt)
idx=txt.find('Neutralino')
print('first idx',idx)
if idx!=-1:
    print(txt[max(0,idx-120):idx+120])
