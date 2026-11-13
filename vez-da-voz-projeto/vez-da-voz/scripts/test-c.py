"""Compila e testa o projeto C com GCC; --sanitize verifica memoria/UB."""
from pathlib import Path
import argparse
import os
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--sanitize', action='store_true')
args = parser.parse_args()
sources = root / 'dist' / 'codigo-c'
flags = ['-std=c11', '-Wall', '-Wextra', '-Werror', '-pedantic', '-g']
if args.sanitize:
    flags += ['-fsanitize=address,undefined', '-fno-omit-frame-pointer']

def execute(binary, text=''):
    environment = os.environ.copy()
    if args.sanitize:
        # LeakSanitizer depende de /proc/ptrace, indisponivel neste ambiente.
        # AddressSanitizer e UBSan continuam ativos para acessos invalidos/UB.
        environment['ASAN_OPTIONS'] = 'detect_leaks=0'
    result = subprocess.run([str(binary)], input=text, text=True,
                            encoding='utf-8', capture_output=True, timeout=10,
                            env=environment)
    if result.returncode != 0:
        raise RuntimeError(result.stdout + result.stderr)
    assert 'ERROR: AddressSanitizer' not in result.stderr
    assert 'runtime error:' not in result.stderr
    return result.stdout

with tempfile.TemporaryDirectory(prefix='vez-da-voz-c-') as directory:
    unit = Path(directory) / 'teste-fila'
    terminal = Path(directory) / 'karaoke'
    for output, source in [(unit, root / 'tests' / 'fila_c_test.c'),
                           (terminal, sources / 'main.c')]:
        subprocess.run(['gcc', *flags, '-I', str(sources),
                        str(sources / 'fila.c'), str(source), '-o', str(output)],
                       check=True)
    print(execute(unit).strip())

    flow = execute(terminal, '2\n1\nAna\nA\nArtista A\n1\nBruno\nB\nArtista B\n3\n2\n2\n1\nCarla\nC\nArtista C\n5\n2\n5\n2\n5\n2\n0\n')
    assert 'Fila vazia. Adicione um pedido primeiro.' in flow
    assert 'PEEK - Proximo: #1 | Ana' in flow
    assert 'A fila nao mudou. Na espera: 2' in flow
    assert 'Palco ocupado.' in flow
    calls = [line.split('DEQUEUE - No palco: ')[1]
             for line in flow.splitlines() if 'DEQUEUE - No palco: ' in line]
    assert calls == ['#1 | Ana | A | Artista A', '#2 | Bruno | B | Artista B',
                     '#3 | Carla | C | Artista C'], calls
    assert flow.count('CONCLUIR:') == 3
    print('OK: menu - FIFO, peek, palco ocupado, chegada durante a musica e conclusao.')

    invalid = execute(terminal, 'abc\n1\n   \n1\n' + 'x' * 81 + '\n0\n')
    assert 'Opcao invalida.' in invalid
    assert invalid.count('Pedido rejeitado:') == 2
    assert 'ENQUEUE:' not in invalid
    print('OK: entradas invalidas e campos vazios/longos rejeitados.')

    clear = execute(terminal, '1\nAna\nA\nArtista\n6\nn\n4\n6\ns\n4\n0\n')
    assert 'Limpeza cancelada.' in clear and 'Na espera: 1' in clear
    assert 'Demonstracao limpa.' in clear and 'Na espera: 0' in clear
    print('OK: limpar/cancelar e liberar nos pendentes.')

    for text in ['1\nAna\n', '1\nAna\nA\nArtista\n', '1\nAna\nA\nArtista\n2\n']:
        assert 'Memoria da fila liberada.' in execute(terminal, text)
    print('OK: fim da entrada durante cadastro, com fila pendente e com palco ocupado.')

print('Verificacao C concluida' + (' com AddressSanitizer e UndefinedBehaviorSanitizer (sem LeakSanitizer).' if args.sanitize else '.'))
