import json

with open('billetes_g.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

MAX = 9999999999999
count = 0
for b in data.get('banknotes', []):
    if b.get('country') != 'Germany':
        continue
    den = b.get('denomination')
    if den is None:
        continue
    if isinstance(den, (int, float)) and den > MAX:
        print(f"{b.get('pick','?'):10s}  den={den:>25,.0f}  {b.get('title','')[:70]}")
        count += 1

print(f"\nTotal billetes con denominacion > {MAX}: {count}")
