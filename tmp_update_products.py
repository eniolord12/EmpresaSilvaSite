from pathlib import Path
import json
import re

path = Path('img/Produtos/produtos.json')
with path.open('r', encoding='utf-8') as f:
    items = json.load(f)

new_items = []
for idx, item in enumerate(items, start=1):
    nome = item.get('nome', '')
    categoria = item.get('categoria', '')
    img = item.get('img', '')

    code_match = re.search(r'"([^"]+)"\s*$', nome)
    code = code_match.group(1).strip() if code_match else str(1000 + idx)
    title = re.sub(r'\s*"[^"]+"\s*$', '', nome).strip() or nome

    model = None
    if code_match:
        title_before_code = re.sub(r'\s*"[^"]+"\s*$', '', nome).strip()
        tokens = title_before_code.split()
        if tokens:
            candidate = tokens[-1]
            if re.match(r'^[A-Za-z0-9\-\.\/]+$', candidate):
                model = candidate
                title = ' '.join(tokens[:-1]).strip() or title_before_code

    if not model:
        model = f'MDL-{idx:03d}'

    descricao = f'{title} é um produto da categoria {categoria}. Ideal para uso em manutenção e reposição, com qualidade e resistência comprovadas.'

    new_items.append({
        'titulo': title,
        'modelo': model,
        'categoria': categoria,
        'img': img,
        'codigo': code,
        'descricao': descricao
    })

with path.open('w', encoding='utf-8') as f:
    json.dump(new_items, f, ensure_ascii=False, indent=4)

print(f'Wrote {len(new_items)} products to {path}')
