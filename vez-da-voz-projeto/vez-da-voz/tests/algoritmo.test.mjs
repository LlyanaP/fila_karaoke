import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRoteiro } from '../dist/algoritmo.js';

test('roteiro acompanha cinco operacoes sem inverter a chegada', () => {
  const passos = criarRoteiro();
  assert.equal(passos.length, 6);
  assert.deepEqual(passos.map(p => p.depois.espera), [
    [], ['Ana'], ['Ana', 'Bruno'], ['Ana', 'Bruno'], ['Bruno'], ['Bruno', 'Carla']
  ]);
  assert.deepEqual(passos.map(p => p.depois.palco), [null, null, null, null, 'Ana', 'Ana']);
  for (let i = 1; i < passos.length; i++) {
    assert.deepEqual(passos[i].antes, passos[i - 1].depois);
  }
});

test('consulta preserva a espera e chamada transfere so o primeiro ao palco', () => {
  const passos = criarRoteiro();
  assert.deepEqual(passos[3].antes, passos[3].depois);
  assert.deepEqual(passos[4].depois, { espera: ['Bruno'], palco: 'Ana' });
  assert.deepEqual(passos[5].depois, { espera: ['Bruno', 'Carla'], palco: 'Ana' });
});

test('quadros e execucoes do exemplo sao independentes', () => {
  const primeira = criarRoteiro();
  const segunda = criarRoteiro();
  primeira[1].depois.espera.push('Pedido fora do exemplo');
  assert.deepEqual(primeira[2].antes.espera, ['Ana']);
  assert.deepEqual(segunda[1].depois.espera, ['Ana']);
});
