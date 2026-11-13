import test from 'node:test';
import assert from 'node:assert/strict';
import { filtrarFaixas, Player15s } from '../dist/previas.js';

class AudioFalso {
  constructor() { this.currentTime = 0; this.paused = true; this.src = ''; this.handlers = new Map(); }
  addEventListener(nome, fn) { this.handlers.set(nome, [...(this.handlers.get(nome) ?? []), fn]); }
  emitir(nome) { for (const fn of this.handlers.get(nome) ?? []) fn(); }
  play() { this.paused = false; this.emitir('playing'); return Promise.resolve(); }
  pause() { this.paused = true; }
}
class Relogio {
  constructor() { this.agora = 0; this.timerId = 0; this.tarefas = new Map(); }
  setTimeout(fn, ms) { const id = ++this.timerId; this.tarefas.set(id, { fn, quando: this.agora + ms }); return id; }
  clearTimeout(id) { this.tarefas.delete(id); }
  avancar(ms) {
    this.agora += ms;
    for (const [id, tarefa] of this.tarefas) {
      if (tarefa.quando <= this.agora) { this.tarefas.delete(id); tarefa.fn(); }
    }
  }
}
function preparar() {
  const audio = new AudioFalso(); const relogio = new Relogio(); const estados = [];
  const player = new Player15s(audio, estado => estados.push(estado), relogio);
  player.selecionar('blob:audio-do-teste');
  return { audio, relogio, estados, player };
}
test('previa para automaticamente aos 15 segundos', async () => {
  const { audio, relogio, estados, player } = preparar();
  await player.reproduzir();
  relogio.avancar(14999); assert.equal(audio.paused, false);
  audio.currentTime = 15; relogio.avancar(1);
  assert.equal(audio.paused, true); assert.equal(player.estado, 'concluido');
  assert.equal(audio.currentTime, 0); assert.equal(estados.at(-1).segundos, 15);
});
test('limite de tempo tambem funciona se timeupdate nao chegar', async () => {
  const { audio, relogio, player, estados } = preparar();
  await player.reproduzir();
  relogio.avancar(15000);
  assert.equal(player.estado, 'concluido'); assert.equal(audio.paused, true);
  assert.equal(estados.at(-1).segundos, 15);
});
test('pausa e retomada usam apenas o tempo restante', async () => {
  const { audio, relogio, player } = preparar();
  await player.reproduzir(); audio.currentTime = 6; relogio.avancar(6000);
  player.pausar(); relogio.avancar(30000);
  assert.equal(player.estado, 'pausado'); assert.equal(audio.currentTime, 6);
  await player.reproduzir(); relogio.avancar(8999);
  assert.equal(audio.paused, false);
  audio.currentTime = 15; relogio.avancar(1); assert.equal(audio.paused, true);
});
test('trocar de audio interrompe e zera a previa anterior', async () => {
  const { audio, relogio, player } = preparar();
  await player.reproduzir(); audio.currentTime = 7;
  player.selecionar('blob:outra-musica');
  assert.equal(audio.paused, true); assert.equal(audio.currentTime, 0);
  assert.equal(relogio.tarefas.size, 0); assert.equal(audio.src, 'blob:outra-musica');
});
test('timeupdate protege contra avancar alem do limite', async () => {
  const { audio, player } = preparar();
  await player.reproduzir(); audio.currentTime = 16; audio.emitir('timeupdate');
  assert.equal(audio.paused, true); assert.equal(player.estado, 'concluido');
});
test('falha na reproducao gera estado de erro e permite nova tentativa', async () => {
  const { audio, player } = preparar();
  audio.play = () => Promise.reject(new Error('indisponivel'));
  await player.reproduzir(); assert.equal(player.estado, 'erro'); assert.equal(audio.paused, true);
  audio.play = AudioFalso.prototype.play;
  await player.reproduzir(); assert.equal(player.estado, 'tocando');
});
test('parar durante carregamento ignora a conclusao atrasada do play', async () => {
  const { audio, player } = preparar();
  let resolver; audio.play = () => new Promise(resolve => { resolver = resolve; });
  const carregando = player.reproduzir(); player.parar(); resolver(); await carregando;
  assert.equal(player.estado, 'pronto'); assert.equal(audio.paused, true);
});
const faixa = (dados = {}) => ({kind:'song',trackId:1,trackName:'Velha Infância (2004 Digital Remaster)',artistName:'Tribalistas',previewUrl:'https://audio-ssl.itunes.apple.com/exemplo.m4a',trackViewUrl:'https://music.apple.com/br/album/exemplo/123',...dados});
test('catalogo compara titulo e artista, respeitando acentos e versoes', () => {
  const dados = [faixa(), faixa({trackId:2,artistName:'Outro artista'}), faixa({trackId:3,trackName:'Outra música'}), faixa()];
  assert.deepEqual(filtrarFaixas(dados,{musica:'velha infancia',artista:'Tribalistas'}).map(f => f.trackId),[1]);
});
test('catalogo recusa links inseguros e nao aceita qualquer audio retornado', () => {
  const dados = [faixa({previewUrl:'http://audio-ssl.itunes.apple.com/exemplo'}),faixa({previewUrl:'https://site-aleatorio.example/audio'}),faixa({trackViewUrl:'javascript:alert(1)'}),faixa({kind:'music-video'})];
  assert.deepEqual(filtrarFaixas(dados,{musica:'Velha infância',artista:'Tribalistas'}),[]);
  assert.deepEqual(filtrarFaixas(null,{musica:'',artista:''}),[]);
});
