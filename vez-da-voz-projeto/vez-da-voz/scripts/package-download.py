"""Cria o ZIP de entrega sem hospedar credenciais ou incluir o próprio ZIP."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
target = root / 'dist' / 'downloads' / 'vez-da-voz-projeto.zip'
target.parent.mkdir(parents=True, exist_ok=True)
files = [root / 'README.md', root / 'package.json']
for directory in ['dist', 'tests', 'docs', 'scripts']:
    files += [path for path in (root / directory).rglob('*')
              if path.is_file() and 'downloads' not in path.parts
              and '__pycache__' not in path.parts]
with ZipFile(target, 'w', compression=ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, Path('vez-da-voz') / path.relative_to(root))
with ZipFile(target) as archive:
    assert archive.testzip() is None
print(f'{target}: {len(files)} arquivos, {target.stat().st_size} bytes')
