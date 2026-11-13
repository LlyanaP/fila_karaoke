import { Karaoke } from './fila.js';
import { criarRoteiro } from './algoritmo.js';
import { instalarPrevias } from './previas.js';

let karaoke = new Karaoke();
const $ = id => document.getElementById(id);
const previas = instalarPrevias();
const exemplos = [
  ['Luiza', 'Como tudo deve ser', 'Charlie Brown Jr.'],
  ['Rafael', 'Velha infância', 'Tribalistas'],
  ['Bia', 'Tempo perdido', 'Legião Urbana']
];

// Todo conteúdo informado no formulário é inserido com textContent.
// Assim, nomes de usuários nunca são interpretados como HTML.
function elemento(tag, classe, texto) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined) no.textContent = texto;
  return no;
}

let toastTimer;
function avisar(mensagem) {
  clearTimeout(toastTimer);
  $('toast').textContent = mensagem;
  $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; }, 6000);
}

function renderizar() {
  const pedidos = karaoke.fila.listar();
  const quantidade = karaoke.fila.tamanho;
  $('queue-count').textContent = quantidade;
  $('waiting-total').textContent = quantidade;
  $('done-total').textContent = karaoke.concluidas.length;
  $('operation-total').textContent = karaoke.operacoes.length;
  $('queue-list').replaceChildren();

  if (quantidade === 0) {
    const vazio = elemento('li', 'empty-state');
    vazio.append(elemento('strong', '', 'Todo mundo em dia.'), elemento('span', '', 'A fila está vazia. Adicione um pedido para começar.'));
    $('queue-list').append(vazio);
  }
  pedidos.forEach((pedido, indice) => {
    const item = elemento('li', 'queue-item');
    item.append(elemento('span', 'position', String(indice + 1).padStart(2, '0')));
    const arte = elemento('span', 'song-art', '♪');
    arte.setAttribute('aria-hidden', 'true');
    item.append(arte);
    const musica = elemento('div', 'song-meta');
    musica.append(elemento('strong', '', pedido.musica), elemento('small', '', pedido.artista));
    const previa = elemento('button', 'song-preview', '▶ Prévia · 15 s');
    previa.type = 'button';
    previa.setAttribute('aria-label', `Prévia de 15 segundos: ${pedido.musica}, ${pedido.artista}`);
    previa.addEventListener('click', () => previas.abrir(pedido));
    musica.append(previa);
    const pessoa = elemento('div', 'singer-meta');
    pessoa.append(elemento('strong', '', pedido.cantor), elemento('span', indice === 0 ? 'next-tag' : '', indice === 0 ? 'PRÓXIMO A CANTAR' : `PEDIDO #${String(pedido.id).padStart(2, '0')}`));
    item.append(musica, pessoa);
    $('queue-list').append(item);
  });

  const atual = karaoke.atual;
  document.querySelector('.stage').classList.toggle('is-playing', atual !== null);
  const status = $('stage-status');
  status.replaceChildren(elemento('span', 'tiny-dot'), document.createTextNode(atual ? ' NO PALCO AGORA' : ' PALCO LIVRE'));
  $('stage-kicker').textContent = atual ? `${atual.cantor} está cantando` : 'O microfone está esperando';
  if (atual) {
    $('stage-heading').textContent = atual.musica;
    $('stage-detail').textContent = atual.artista;
  } else {
    $('stage-heading').replaceChildren(document.createTextNode('Pode chamar'), document.createElement('br'), document.createTextNode('o próximo.'));
    $('stage-detail').textContent = 'A primeira pessoa da fila é a próxima a cantar.';
  }
  // Pausar nao altera a fila; encerrar combina conclusao e proxima chamada.
  $('call-next').hidden = atual !== null;
  $('finish').hidden = atual === null;
  $('stage-preview').hidden = atual === null;
  $('stage-pause').hidden = atual === null;
  $('stage-audio').hidden = atual === null;
  $('stage-preview').onclick = atual ? () => previas.abrir(atual) : null;
  $('stage-hint').textContent = atual ? 'Encerrar para o áudio e chama o próximo.' : 'Sai do início → entra no palco e toca';

  $('operation-log').replaceChildren();
  for (const operacao of karaoke.operacoes) {
    const item = elemento('li');
    const topo = elemento('div', 'log-top');
    topo.append(elemento('span', `log-type${operacao.tipo === 'DEQUEUE' ? ' remove' : ''}`, operacao.tipo), elemento('time', '', operacao.hora));
    item.append(topo, elemento('p', '', operacao.texto));
    $('operation-log').append(item);
  }
  if (karaoke.operacoes.length === 0) {
    $('operation-log').append(elemento('li', 'empty-state', 'Suas operações vão aparecer aqui.'));
  }
  renderizarPonteiros(pedidos);
}

function renderizarPonteiros(pedidos) {
  const container = $('pointer-nodes');
  container.replaceChildren();
  if (pedidos.length === 0) {
    container.append(elemento('span', 'pointer-node', 'inicio = fim = NULL'));
    return;
  }
  pedidos.forEach((pedido, indice) => {
    const no = elemento('div', 'pointer-node');
    const rotulo = pedidos.length === 1 ? 'INÍCIO / FIM' : indice === 0 ? 'INÍCIO' : indice === pedidos.length - 1 ? 'FIM' : `NÓ ${indice + 1}`;
    no.append(elemento('small', '', rotulo), document.createTextNode(pedido.cantor));
    container.append(no, elemento('span', 'pointer-arrow', '→'));
  });
  container.append(elemento('code', '', 'NULL'));
}

$('request-form').addEventListener('submit', evento => {
  evento.preventDefault();
  try {
    const pedido = karaoke.adicionar($('singer').value, $('song').value, $('artist').value);
    renderizar();
    avisar(`${pedido.cantor} entrou no final da fila, na posição ${karaoke.fila.tamanho}.`);
    $('request-form').reset();
    $('singer').focus();
  } catch (erro) { avisar(erro.message); }
});

$('call-next').addEventListener('click', () => {
  const resultado = karaoke.chamarProximo();
  renderizar();
  if (resultado.status === 'ok') {
    avisar(`${resultado.pedido.cantor}, o palco é seu! O primeiro pedido saiu da fila.`);
    $('finish').focus();
    previas.iniciarPalco(resultado.pedido);
  } else avisar(resultado.status === 'vazio' ? 'A fila está vazia. Adicione um pedido primeiro.' : 'Encerre a apresentação atual antes de chamar o próximo.');
});

$('finish').addEventListener('click', () => {
  previas.pararPalco();
  const resultado = karaoke.encerrarEChamarProximo();
  renderizar();
  if (resultado.status === 'ok') {
    avisar(`${resultado.encerrado.cantor} encerrou. ${resultado.pedido.cantor}, agora é sua vez!`);
    previas.iniciarPalco(resultado.pedido);
    $('finish').focus();
  } else {
    if (resultado.encerrado) avisar(`${resultado.encerrado.cantor} encerrou. A fila terminou e o palco está livre.`);
    $('call-next').focus();
  }
});
$('stage-pause').addEventListener('click', () => previas.alternarPalco());

$('peek').addEventListener('click', () => {
  const pedido = karaoke.consultar();
  renderizar();
  avisar(pedido ? `Próximo: ${pedido.cantor} — ${pedido.musica}. A consulta não remove o pedido.` : 'A fila está vazia. Não há próximo pedido.');
});

$('examples').addEventListener('click', () => {
  if (!karaoke.fila.estaVazia() || karaoke.atual !== null) {
    avisar('Para carregar o exemplo, limpe a demonstração primeiro.');
    return;
  }
  exemplos.forEach(pedido => karaoke.adicionar(...pedido));
  renderizar();
  avisar('Exemplo carregado: Luiza → Rafael → Bia. Quem será chamado primeiro?');
});

$('reset').addEventListener('click', () => {
  $('reset-dialog').returnValue = '';
  $('reset-dialog').showModal();
});
$('reset-dialog').addEventListener('close', () => {
  if ($('reset-dialog').returnValue !== 'confirm') return;
  previas.limpar();
  karaoke = new Karaoke();
  renderizar();
  avisar('Demonstração limpa. Adicione pedidos ou carregue o exemplo.');
});

function abrirAba(nome) {
  document.querySelectorAll('.tab-panel').forEach(painel => { painel.hidden = painel.id !== `panel-${nome}`; });
  document.querySelectorAll('.tab').forEach(botao => {
    const selecionada = botao.dataset.tab === nome;
    botao.classList.toggle('active', selecionada);
    if (selecionada) botao.setAttribute('aria-current', 'page');
    else botao.removeAttribute('aria-current');
  });
  if (nome === 'code') carregarCodigo();
}
document.querySelectorAll('[data-tab]').forEach(botao => botao.addEventListener('click', () => abrirAba(botao.dataset.tab)));
document.querySelectorAll('[data-open]').forEach(botao => botao.addEventListener('click', () => {
  abrirAba(botao.dataset.open);
  document.querySelector(`[data-tab="${botao.dataset.open}"]`).focus();
}));

let arquivoCodigo = 'fila.c';
const fontesC = new Map();
document.querySelectorAll('[data-source]').forEach(botao => {
  botao.addEventListener('click', () => carregarCodigo(botao.dataset.source));
});
async function carregarCodigo(arquivo = arquivoCodigo) {
  if (!['fila.h', 'fila.c', 'main.c'].includes(arquivo)) return;
  arquivoCodigo = arquivo;
  $('source-filename').textContent = `codigo-c/${arquivo}`;
  $('source-download').href = `codigo-c/${arquivo}`;
  document.querySelectorAll('[data-source]').forEach(botao => {
    const selecionado = botao.dataset.source === arquivo;
    botao.classList.toggle('active', selecionado);
    botao.setAttribute('aria-pressed', String(selecionado));
  });
  $('source-code').textContent = fontesC.get(arquivo) ?? 'Carregando código em C…';
  if (fontesC.has(arquivo)) return;
  try {
    const resposta = await fetch(`./codigo-c/${arquivo}`);
    if (!resposta.ok) throw new Error('Arquivo indisponível');
    const fonte = await resposta.text();
    fontesC.set(arquivo, fonte);
    if (arquivoCodigo === arquivo) $('source-code').textContent = fonte;
  } catch {
    if (arquivoCodigo === arquivo) $('source-code').textContent = `Abra dist/codigo-c/${arquivo} no projeto baixado. Para ver o código aqui, execute o site por um servidor HTTP, conforme o README.`;
  }
}

const passos = criarRoteiro();
let passoAtual = 0;
function desenharEstado(container, estado) {
  container.replaceChildren();
  const fila = elemento('div', 'snapshot-queue');
  if (estado.espera.length === 0) fila.append(elemento('span', 'snapshot-empty', 'Fila vazia'));
  estado.espera.forEach((nome, indice) => {
    const pedido = elemento('div', 'snapshot-person');
    const posicao = estado.espera.length === 1 ? 'INÍCIO / FIM' : indice === 0 ? 'INÍCIO' : indice === estado.espera.length - 1 ? 'FIM' : 'ESPERA';
    pedido.append(elemento('small', '', posicao), elemento('strong', '', nome));
    fila.append(pedido);
    if (indice < estado.espera.length - 1) fila.append(elemento('span', 'pointer-arrow', '→'));
  });
  container.append(fila, elemento('p', 'snapshot-stage', estado.palco ? `No palco: ${estado.palco}` : 'Palco livre'));
}
function mostrarPasso() {
  const passo = passos[passoAtual];
  $('walk-counter').textContent = passoAtual === 0 ? 'Preparação · 5 operações para acompanhar' : `Operação ${passoAtual} de 5`;
  $('walk-operation').textContent = passo.operacao;
  $('walk-title').textContent = passo.titulo;
  $('walk-context').textContent = passo.contexto;
  $('walk-reasoning').textContent = passo.raciocinio;
  $('walk-code').textContent = passo.codigo;
  $('walk-conclusion').textContent = passo.conclusao;
  desenharEstado($('walk-before'), passo.antes);
  desenharEstado($('walk-after'), passo.depois);
  $('walk-prev').disabled = passoAtual === 0;
  $('walk-next').disabled = passoAtual === passos.length - 1;
  $('walk-reset').disabled = passoAtual === 0;
}
$('walk-next').addEventListener('click', () => {
  passoAtual = Math.min(passoAtual + 1, passos.length - 1);
  mostrarPasso();
});
$('walk-prev').addEventListener('click', () => {
  passoAtual = Math.max(passoAtual - 1, 0);
  mostrarPasso();
});
$('walk-reset').addEventListener('click', () => { passoAtual = 0; mostrarPasso(); });
mostrarPasso();

exemplos.forEach(pedido => karaoke.adicionar(...pedido));
renderizar();
