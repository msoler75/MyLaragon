import zipfile
import os
import sys

# Try to locate resources.neu anywhere under the repo
OUT_DIR = os.path.abspath(os.path.join('.tmp','inspected_resources'))
repo_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

candidates = []
for root, dirs, files in os.walk(repo_root):
    for f in files:
        if f.lower() == 'resources.neu':
            candidates.append(os.path.join(root, f))

if not candidates:
    print(f'ERROR: No resources.neu found under repo root: {repo_root}', file=sys.stderr)
    sys.exit(2)

# Choose the largest candidate (likely correct build)
NEU_PATH = max(candidates, key=lambda p: os.path.getsize(p))
print(f'Using resources.neu: {NEU_PATH}\n')

# resources.neu is NOT a zip, inspect header and search for index.html as raw bytes
stat = os.stat(NEU_PATH)
print(f'File size: {stat.st_size} bytes')
with open(NEU_PATH, 'rb') as fh:
    head = fh.read(65536)
    # print hex dump of first 256 bytes
    print('\nHeader (first 256 bytes hex):')
    print(' '.join(f'{b:02x}' for b in head[:256]))
    print('\nHeader (ascii zichtbaar):')
    safe = ''.join((chr(b) if 32 <= b < 127 else '.') for b in head[:1024])
    print(safe[:2000])

    # Search entire file for occurrences
    fh.seek(0)
    data = fh.read()
    # Try to parse file manifest in start of file and extract offsets and sizes
    head_text = head.decode('utf-8', errors='replace')
    import re
    # find index.html entry
    m = re.search(r'"index\.html"\s*:\s*\{[^}]*"size"\s*:\s*(\d+)[^}]*"offset"\s*:\s*"?(\d+)"?', head_text)
    if m:
        size = int(m.group(1))
        offset = int(m.group(2))
        print(f"\nFound index.html -> offset={offset}, size={size}")
        # read bytes
        with open(NEU_PATH, 'rb') as f:
            f.seek(offset)
            content = f.read(size)
        outpath = os.path.join(OUT_DIR, 'extracted_index.html')
        os.makedirs(OUT_DIR, exist_ok=True)
        with open(outpath, 'wb') as of:
            of.write(content)
        print(f'Extracted index.html to: {outpath}')
        try:
            text = content.decode('utf-8', errors='replace')
            print('\n---- index.html preview (first 80 lines) ----')
            lines = text.splitlines()
            for i, line in enumerate(lines):
                if i >= 80:
                    break
                print(f'{i+1:03d}: {line}')
            # Check for injected markers
            markers = ['Neutralino.init', 'writeFile', 'Wrote app-log.txt', 'Neutralino global not present']
            print('\nMarker search:')
            for m in markers:
                found = any(m in l for l in lines)
                print(f'  {m}: {found}')
        except Exception as e:
            print('Could not decode index.html text:', e)
    else:
        print('\nindex.html entry not found in manifest')

    # Extract neutralino.config.json and print contents
    cfg = None
    mcfg = re.search(r'"neutralino\.config\.json"\s*:\s*\{[^}]*"size"\s*:\s*(\d+)[^}]*"offset"\s*:\s*"?(\d+)"?', head_text)
    if mcfg:
        sizec = int(mcfg.group(1))
        offc = int(mcfg.group(2))
        print(f'\nFound neutralino.config.json -> offset={offc}, size={sizec}')
        with open(NEU_PATH,'rb') as f:
            f.seek(offc)
            raw = f.read(sizec)
        try:
            text = raw.decode('utf-8', errors='replace')
            # Find JSON object in text
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1 and end > start:
                jtext = text[start:end+1]
                print('\n---- neutralino.config.json (extracted JSON preview) ----')
                print('\n'.join(jtext.splitlines()[:80]))
                import json
                try:
                    cfg = json.loads(jtext)
                    print('\nParsed neutralino.config.json keys:', list(cfg.keys()))
                    # Print some relevant fields
                    print('  url:', cfg.get('url'))
                    print('  documentRoot:', cfg.get('documentRoot'))
                    print('  enableServer:', cfg.get('enableServer'))
                except Exception as e:
                    print('Could not parse JSON:', e)
            else:
                print('\nCould not find JSON braces in extracted neutralino.config.json segment')
        except Exception as e:
            print('Could not decode neutralino.config.json:', e)

    # neutralino.js
    m2 = re.search(r'"neutralino\.js"\s*:\s*\{[^}]*"size"\s*:\s*(\d+)[^}]*"offset"\s*:\s*"?(\d+)"?', head_text)
    if m2:
        size2 = int(m2.group(1))
        off2 = int(m2.group(2))
        print(f'\nFound neutralino.js -> offset={off2}, size={size2}')
    else:
        print('\nneutralino.js entry not found in manifest')

    # Search for URL occurrences in the whole file
    occur = []
    for match in re.finditer(rb'"url"\s*:\s*"([^"]+)"', data):
        span = match.span()
        val = match.group(1).decode('utf-8', errors='replace')
        occur.append((span[0], val))
    print('\nurl occurrences found in resources.neu:')
    if not occur:
        print('  None')
    else:
        for pos, val in occur:
            print(f'  offset={pos}, url="{val}"')

print('\nDone')
