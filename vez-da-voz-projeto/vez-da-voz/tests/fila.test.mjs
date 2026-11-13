import test from 'node:test';
import assert from 'node:assert/strict';
import { Fila, Karaoke } from '../dist/fila.js';

test('fila vazia: remover e consultar retornam null', () => {
  const fila = new Fila();
  assert.equal(fila.desenfileirar(), null);
  assert.equal(fila.consultarInicio(), null);
  assert.equal(fila.tamanho, 0);
  assert.equal(fila.inicio, null);
  assert.equal(fila.fim, null);
});

test('ordem FIFO se mantém ao intercalar chegadas e saídas', () => {
  const fila = new Fila();
  fila.enfileirar('Ana');
  fila.enfileirar('Bruno');
  assert.equal(fila.desenfileirar(), 'Ana');
  fila.enfileirar('Carla');
  assert.deepEqual(fila.listar(), ['Bruno', 'Carla']);
  assert.equal(fila.desenfileirar(), 'Bruno');
  assert.equal(fila.desenfileirar(), 'Carla');
  assert.equal(fila.estaVazia(), true);
});

test('consultar não remove nem altera o tamanho', () => {
  const fila = new Fila();
  fila.enfileirar({ cantor: 'Ana' });
  const antes = fila.inicio;
  assert.equal(fila.consultarInicio().cantor, 'Ana');
  assert.equal(fila.consultarInicio().cantor, 'Ana');
  assert.equal(fila.inicio, antes);
  assert.equal(fila.tamanho, 1);
});

test('última remoção limpa os ponteiros e permite reutilizar a fila', () => {
  const fila = new Fila();
  fila.enfileirar('Ana');
  fila.desenfileirar();
  assert.equal(fila.inicio, null);
  assert.equal(fila.fim, null);
  fila.enfileirar('Bruno');
  assert.equal(fila.inicio, fila.fim);
  assert.equal(fila.desenfileirar(), 'Bruno');
  assert.equal(fila.tamanho, 0);
});

test('palco recebe quem saiu da fila; próxima chamada não interrompe a música', () => {
  const app = new Karaoke();
  const ana = app.adicionar('Ana', 'Música A', 'Artista A');
  const bruno = app.adicionar('Bruno', 'Música B', 'Artista B');
  assert.deepEqual(app.chamarProximo(), { status: 'ok', pedido: ana });
  assert.equal(app.atual, ana);
  assert.equal(app.fila.tamanho, 1);
  assert.equal(app.chamarProximo().status, 'ocupado');
  assert.equal(app.fila.consultarInicio(), bruno);
  assert.equal(app.encerrar(), ana);
  assert.equal(app.atual, null);
  assert.deepEqual(app.concluidas, [ana]);
  assert.equal(app.chamarProximo().pedido, bruno);
});

test('chamar com fila vazia não cria pedido nem altera histórico de apresentações', () => {
  const app = new Karaoke();
  assert.equal(app.chamarProximo().status, 'vazio');
  assert.equal(app.atual, null);
  assert.deepEqual(app.concluidas, []);
  assert.equal(app.operacoes[0].tipo, 'FILA VAZIA');
  assert.equal(app.encerrar(), null);
});

test('pedidos repetidos são distintos e respeitam sua chegada', () => {
  const app = new Karaoke();
  const primeiro = app.adicionar('Ana', 'Música', 'Artista');
  const segundo = app.adicionar('Ana', 'Música', 'Artista');
  assert.notEqual(primeiro.id, segundo.id);
  assert.equal(app.fila.desenfileirar(), primeiro);
  assert.equal(app.fila.desenfileirar(), segundo);
});

test('dados vazios, só espaços e acima do limite não entram na fila', () => {
  const app = new Karaoke();
  for (const dados of [['', 'Música', 'Artista'], ['Ana', '  ', 'Artista'], ['Ana', 'Música', ''], ['a'.repeat(81), 'Música', 'Artista']]) {
    assert.throws(() => app.adicionar(...dados));
  }
  assert.equal(app.fila.tamanho, 0);
  assert.equal(app.proximoId, 1);
  const pedido = app.adicionar('  Ana  ', ' Música ', ' Artista ');
  assert.equal(pedido.cantor, 'Ana');
});

test('roteiro de cinco operações corresponde à previsão manual', () => {
  const app = new Karaoke();
  app.adicionar('Ana', 'A', 'Artista');
  app.adicionar('Bruno', 'B', 'Artista');
  assert.equal(app.consultar().cantor, 'Ana');
  app.chamarProximo();
  app.adicionar('Carla', 'C', 'Artista');
  assert.deepEqual(app.fila.listar().map(pedido => pedido.cantor), ['Bruno', 'Carla']);
  assert.equal(app.atual.cantor, 'Ana');
});

test('volume maior preserva ordem e zera a estrutura ao final', () => {
  const fila = new Fila();
  for (let i = 0; i < 5000; i++) fila.enfileirar(i);
  for (let i = 0; i < 5000; i++) assert.equal(fila.desenfileirar(), i);
  assert.equal(fila.tamanho, 0);
  assert.equal(fila.inicio, null);
  assert.equal(fila.fim, null);
});

test('encerrar no site chama exatamente o proximo pedido FIFO', () => {
  const app = new Karaoke();
  const ana = app.adicionar('Ana', 'A', 'Artista');
  const bruno = app.adicionar('Bruno', 'B', 'Artista');
  const carla = app.adicionar('Carla', 'C', 'Artista');
  app.chamarProximo();
  const resultado = app.encerrarEChamarProximo();
  assert.equal(resultado.encerrado, ana);
  assert.equal(resultado.pedido, bruno);
  assert.equal(resultado.status, 'ok');
  assert.equal(app.atual, bruno);
  assert.deepEqual(app.fila.listar(), [carla]);
  assert.deepEqual(app.concluidas, [ana]);
});

test('encerrar a ultima apresentacao deixa palco livre sem pedidos ficticios', () => {
  const app = new Karaoke();
  const ana = app.adicionar('Ana', 'A', 'Artista');
  app.chamarProximo();
  assert.deepEqual(app.encerrarEChamarProximo(), { status: 'fim', encerrado: ana });
  assert.equal(app.atual, null);
  assert.equal(app.fila.tamanho, 0);
  assert.deepEqual(app.concluidas, [ana]);
  assert.equal(app.operacoes.filter(o => o.tipo === 'DEQUEUE').length, 1);
});

test('encerrar sem apresentacao nao consome o proximo nem registra conclusao', () => {
  const app = new Karaoke();
  const ana = app.adicionar('Ana', 'A', 'Artista');
  assert.equal(app.encerrarEChamarProximo().status, 'sem_apresentacao');
  assert.equal(app.fila.consultarInicio(), ana);
  assert.equal(app.atual, null);
  assert.deepEqual(app.concluidas, []);
});
