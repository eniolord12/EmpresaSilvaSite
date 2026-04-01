from pathlib import Path
import json

path = Path('img/Produtos/produtos.json')
with path.open('r', encoding='utf-8') as f:
    items = json.load(f)

changed = False
for item in items:
    if 'marca' not in item:
        title = item.get('titulo', item.get('nome', ''))
        if 'Ingco' in title:
            item['marca'] = 'Ingco'
        elif 'Einhell' in title:
            item['marca'] = 'Einhell'
        elif 'AEME' in title or 'Aeme' in title or 'Disco' in title:
            item['marca'] = 'AEME'
        elif 'Bateria' in title or 'Bolsa' in title:
            item['marca'] = 'Ingco'
        else:
            item['marca'] = 'Genérico'
        changed = True

if changed:
    with path.open('w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=4)
    print(f'Updated {len(items)} items with marca field')
else:
    print('No changes needed')
