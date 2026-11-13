export const LIMITE_PREVIA = 15;

export function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function filtrarFaixas(resultados, pedido) {
  if (!Array.isArray(resultados)) return [];
  const titulo = normalizar(pedido.musica);
  const artista = normalizar(pedido.artista);
  if (!titulo || !artista) return [];
  const ids = new Set();
  return resultados.filter(faixa => {
    const base = normalizar(String(faixa.trackName ?? '').replace(/\([^)]*\)|\[[^\]]*\]/g, ''));
    const nomeArtista = normalizar(faixa.artistName);
    try {
      const audio = new URL(faixa.previewUrl);
      const loja = new URL(faixa.trackViewUrl);
      const audioPermitido = audio.protocol === 'https:' &&
        (audio.hostname.endsWith('.mzstatic.com') || audio.hostname.endsWith('.itunes.apple.com'));
      const lojaPermitida = loja.protocol === 'https:' &&
        ['music.apple.com', 'itunes.apple.com'].includes(loja.hostname);
      const corresponde = base === titulo && (` ${nomeArtista} `).includes(` ${artista} `);
      if (faixa.kind !== 'song' || !audioPermitido || !lojaPermitida || !corresponde || ids.has(faixa.trackId)) return false;
      ids.add(faixa.trackId);
      return true;
    } catch { return false; }
  }).slice(0, 5);
}

/** Um unico elemento de audio, com limite de 15 s por reproducao. */
export class Player15s {
  constructor(audio, atualizar, relogio = globalThis) {
    this.audio = audio;
    this.atualizar = atualizar;
    this.relogio = relogio;
    this.estado = 'pronto';
    this.token = 0;
    this.timer = null;
    audio.addEventListener('playing', () => {
      if (this.estado === 'carregando' || this.estado === 'tocando') {
        this.estado = 'tocando';
        this.agendarLimite();
        this.emitir();
      }
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= LIMITE_PREVIA) this.parar('concluido');
      else this.emitir();
    });
    audio.addEventListener('ended', () => this.parar('concluido'));
    audio.addEventListener('error', () => {
      if (this.estado === 'tocando' || this.estado === 'carregando') this.parar('erro');
    });
  }
  emitir() {
    this.atualizar({ estado: this.estado,
      segundos: this.estado === 'concluido' ? this.final ?? LIMITE_PREVIA : Math.min(LIMITE_PREVIA, this.audio.currentTime || 0) });
  }
  cancelarTimer() {
    if (this.timer !== null) this.relogio.clearTimeout(this.timer);
    this.timer = null;
  }
  agendarLimite() {
    this.cancelarTimer();
    const restante = Math.max(0, LIMITE_PREVIA - (this.audio.currentTime || 0));
    this.timer = this.relogio.setTimeout(() => this.parar('concluido', LIMITE_PREVIA), restante * 1000);
  }
  selecionar(url) {
    this.parar();
    this.audio.src = url;
  }
  async reproduzir() {
    if (!this.audio.src) return;
    if (this.estado === 'concluido' || this.audio.currentTime >= LIMITE_PREVIA) this.audio.currentTime = 0;
    const token = ++this.token;
    this.estado = 'carregando';
    this.emitir();
    try {
      await this.audio.play();
      if (token !== this.token) return;
      this.estado = 'tocando';
      this.agendarLimite();
      this.emitir();
    } catch {
      if (token === this.token) this.parar('erro');
    }
  }
  pausar() {
    this.token++;
    this.cancelarTimer();
    this.estado = 'pausado';
    this.audio.pause();
    this.emitir();
  }
  parar(estado = 'pronto', segundosFinais = this.audio.currentTime || 0) {
    this.token++;
    this.cancelarTimer();
    this.final = Math.min(LIMITE_PREVIA, segundosFinais);
    this.estado = estado;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.emitir();
  }
}

/** JSONP e o mecanismo de busca entre sites documentado pela Apple. */
export function buscarCatalogo(pedido, documento = document, janela = window) {
  return new Promise((resolve, reject) => {
    const callback = `vezDaVozCatalogo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = documento.createElement('script');
    const url = new URL('https://itunes.apple.com/search');
    url.search = new URLSearchParams({ term: `${pedido.musica} ${pedido.artista}`,
      country: 'BR', media: 'music', entity: 'song', limit: '25', callback }).toString();
    let timer;
    const limpar = () => {
      janela.clearTimeout(timer);
      script.remove();
      // Ignora uma eventual resposta atrasada apos fechar/expirar a busca.
      janela[callback] = () => {};
      janela.setTimeout(() => { delete janela[callback]; }, 30000);
    };
    janela[callback] = dados => { limpar(); resolve(filtrarFaixas(dados.results ?? [], pedido)); };
    script.onerror = () => { limpar(); reject(new Error('Não foi possível consultar o catálogo agora. Tente novamente ou escolha um áudio do dispositivo.')); };
    timer = janela.setTimeout(() => { limpar(); reject(new Error('A busca demorou mais que o esperado. Tente novamente ou escolha um áudio do dispositivo.')); }, 12000);
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = url.href;
    documento.head.append(script);
  });
}

export function instalarPrevias() {
  const $ = id => document.getElementById(id);
  const dialogo = $('preview-dialog');
  const catalogo = new Map(); // Apenas metadados; nenhum audio e baixado ou armazenado.
  const locais = new Map();
  const escolhidas = new Map();
  let pedidoNoPalco = null;
  let audioPedido = null;
  let inicioPalco = 0;
  let pedidoAtual = null;
  let selecao = null;
  let busca = 0;
  const no = (tag, classe, texto) => {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  };
  function mostrarPalco({ estado = 'pronto', segundos = 0, mensagem } = {}) {
    const faixa = pedidoNoPalco ? escolhidas.get(pedidoNoPalco.id) : null;
    const aguardando = estado === 'buscando' || estado === 'carregando';
    $('stage-pause').textContent = estado === 'tocando' ? 'Pausar música' : estado === 'pausado' ? 'Retomar música' : estado === 'concluido' ? 'Ouvir novamente' : aguardando ? 'Carregando áudio…' : 'Tocar prévia';
    $('stage-pause').disabled = !faixa || aguardando;
    $('stage-audio-progress').value = segundos;
    $('stage-audio-clock').textContent = `${String(Math.floor(segundos)).padStart(2, '0')} / 15 s`;
    $('stage-audio-status').textContent = mensagem ?? (estado === 'tocando' ? 'Tocando a prévia da música.' : estado === 'pausado' ? 'Música pausada. A fila continua igual.' : estado === 'concluido' ? 'A prévia terminou. Encerre a apresentação para chamar o próximo.' : estado === 'erro' ? 'Não foi possível iniciar o áudio. Clique em Tocar prévia ou escolha outro áudio.' : estado === 'carregando' ? 'Preparando a reprodução…' : faixa ? 'Prévia pronta para tocar.' : 'Escolha um áudio para este pedido.');
    $('stage-audio-title').textContent = faixa ? `${faixa.titulo} · ${faixa.artista}` : '';
    $('stage-store').hidden = !faixa?.loja || dialogo.open;
    if (faixa?.loja) $('stage-store').href = faixa.loja;
    else $('stage-store').removeAttribute('href');
    $('stage-audio-credit').textContent = faixa?.loja ? 'Prévia fornecida por cortesia do iTunes (provided courtesy of iTunes).' : faixa ? 'Áudio do dispositivo · sem envio ao site.' : '';
  }
  const player = new Player15s($('preview-audio'), ({ estado, segundos }) => {
    $('preview-progress').value = segundos;
    $('preview-clock').textContent = `${Math.floor(segundos).toString().padStart(2, '0')} / 15 s`;
    $('preview-toggle').textContent = estado === 'tocando' ? 'Ⅱ Pausar' : estado === 'carregando' ? 'Carregando…' : estado === 'concluido' ? '↻ Ouvir novamente' : '▶ Ouvir 15 s';
    $('preview-toggle').disabled = estado === 'carregando';
    $('preview-play-status').textContent = estado === 'erro' ? 'Não foi possível tocar este áudio. Tente outra versão ou escolha um arquivo.' : estado === 'concluido' ? 'Prévia encerrada.' : estado === 'tocando' ? 'Ouvindo a prévia. Ela para automaticamente.' : estado === 'pausado' ? 'Prévia pausada.' : '';
    if (pedidoNoPalco && audioPedido === pedidoNoPalco.id) mostrarPalco({ estado, segundos });
  });
  function selecionar(faixa, tocar = false, pedido = pedidoAtual) {
    selecao = faixa;
    escolhidas.set(pedido.id, faixa);
    audioPedido = pedido.id;
    player.selecionar(faixa.url);
    $('preview-selected').hidden = false;
    $('preview-selected-title').textContent = faixa.titulo;
    $('preview-selected-artist').textContent = faixa.artista;
    $('preview-store').hidden = !faixa.loja;
    if (faixa.loja) $('preview-store').href = faixa.loja;
    else $('preview-store').removeAttribute('href');
    $('preview-credit').textContent = faixa.loja ? 'Prévia fornecida por cortesia do iTunes (provided courtesy of iTunes). Conheça esta gravação na iTunes Store.' : 'Áudio do seu dispositivo, reproduzido apenas nesta aba.';
    if (tocar) player.reproduzir();
  }
  async function pesquisar() {
    const tentativa = ++busca;
    const pedido = pedidoAtual;
    $('preview-results').replaceChildren();
    $('preview-search-status').textContent = 'Buscando versões desta música no catálogo…';
    $('preview-retry').hidden = true;
    const chave = `${normalizar(pedido.musica)}|${normalizar(pedido.artista)}`;
    try {
      const faixas = catalogo.get(chave) ?? await buscarCatalogo(pedido);
      if (tentativa !== busca || !dialogo.open) return;
      if (faixas.length) catalogo.set(chave, faixas);
      $('preview-search-status').textContent = faixas.length ? 'Escolha uma gravação para conhecer. A prévia toca por até 15 segundos.' : 'Não encontramos uma prévia com esse título e artista. Confira os nomes ou escolha um áudio do dispositivo.';
      for (const faixa of faixas) {
        const item = no('li', 'preview-result');
        const info = no('div');
        info.append(no('strong', '', faixa.trackName), no('small', '', `${faixa.artistName} · ${faixa.collectionName ?? 'Catálogo'}`));
        const botao = no('button', 'preview-track-button', '▶ Ouvir 15 s');
        botao.type = 'button';
        botao.setAttribute('aria-label', `Ouvir 15 segundos de ${faixa.trackName}, ${faixa.artistName}`);
        botao.addEventListener('click', () => selecionar({ url: faixa.previewUrl, titulo: faixa.trackName, artista: faixa.artistName, loja: faixa.trackViewUrl }, true));
        item.append(info, botao);
        $('preview-results').append(item);
      }
      $('preview-retry').hidden = faixas.length > 0;
    } catch (erro) {
      if (tentativa !== busca || !dialogo.open) return;
      $('preview-search-status').textContent = erro.message;
      $('preview-retry').hidden = false;
    }
  }
  $('preview-toggle').addEventListener('click', () => {
    if (player.estado === 'tocando') player.pausar();
    else if (selecao) player.reproduzir();
  });
  $('preview-stop').addEventListener('click', () => player.parar());
  $('preview-close').addEventListener('click', () => dialogo.close());
  $('preview-retry').addEventListener('click', pesquisar);
  dialogo.addEventListener('close', () => {
    busca++;
    player.parar();
    $('preview-audio').removeAttribute('src');
    $('preview-audio').load();
    mostrarPalco();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (player.estado === 'tocando' || player.estado === 'carregando')) player.pausar();
  });
  window.addEventListener('pagehide', () => player.parar());
  $('preview-file').addEventListener('change', evento => {
    const arquivo = evento.target.files?.[0];
    if (!arquivo || !pedidoAtual) return;
    if (arquivo.type && !arquivo.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac|opus)$/i.test(arquivo.name)) {
      $('preview-search-status').textContent = 'Escolha um arquivo de áudio, como MP3, WAV ou M4A.';
      evento.target.value = '';
      return;
    }
    busca++;
    player.parar();
    const antigo = locais.get(pedidoAtual.id);
    if (antigo) URL.revokeObjectURL(antigo.url);
    const faixa = { url: URL.createObjectURL(arquivo), titulo: pedidoAtual.musica, artista: `${pedidoAtual.artista} · ${arquivo.name}` };
    locais.set(pedidoAtual.id, faixa);
    $('preview-search-status').textContent = 'Áudio associado a este pedido. Ele fica apenas no seu dispositivo e nesta aba.';
    selecionar(faixa);
    evento.target.value = '';
  });
  return {
    async iniciarPalco(pedido) {
      const tentativa = ++inicioPalco;
      pedidoNoPalco = pedido;
      audioPedido = null;
      player.parar();
      mostrarPalco({ estado: 'buscando', mensagem: 'Buscando a prévia para iniciar a música…' });
      try {
        let faixa = escolhidas.get(pedido.id) ?? locais.get(pedido.id);
        if (!faixa) {
          const chave = `${normalizar(pedido.musica)}|${normalizar(pedido.artista)}`;
          const faixas = catalogo.get(chave) ?? await buscarCatalogo(pedido);
          if (faixas.length) catalogo.set(chave, faixas);
          if (faixas[0]) faixa = { url: faixas[0].previewUrl, titulo: faixas[0].trackName, artista: faixas[0].artistName, loja: faixas[0].trackViewUrl };
        }
        // Encerrar ou trocar de pedido invalida respostas de buscas anteriores.
        if (tentativa !== inicioPalco || pedidoNoPalco?.id !== pedido.id) return;
        if (!faixa) {
          mostrarPalco({ mensagem: 'Sem prévia no catálogo. Use Escolher áudio para associar um arquivo a este pedido.' });
          return;
        }
        selecionar(faixa, false, pedido);
        await player.reproduzir();
      } catch (erro) {
        if (tentativa === inicioPalco) mostrarPalco({ mensagem: erro.message });
      }
    },
    alternarPalco() {
      if (!pedidoNoPalco) return;
      if (audioPedido === pedidoNoPalco.id && player.estado === 'tocando') {
        player.pausar();
        return;
      }
      const faixa = escolhidas.get(pedidoNoPalco.id);
      if (!faixa) return;
      if (audioPedido !== pedidoNoPalco.id || !$('preview-audio').getAttribute('src')) selecionar(faixa, false, pedidoNoPalco);
      player.reproduzir();
    },
    pararPalco() {
      inicioPalco++;
      pedidoNoPalco = null;
      audioPedido = null;
      player.parar();
      $('preview-audio').removeAttribute('src');
      $('preview-audio').load();
      mostrarPalco();
    },
    abrir(pedido) {
      inicioPalco++;
      busca++;
      pedidoAtual = pedido;
      selecao = null;
      player.parar();
      audioPedido = null;
      $('preview-title').textContent = pedido.musica;
      $('preview-request-artist').textContent = pedido.artista;
      $('preview-selected').hidden = true;
      $('preview-results').replaceChildren();
      $('preview-retry').hidden = true;
      dialogo.showModal();
      mostrarPalco();
      if (escolhidas.has(pedido.id) || locais.has(pedido.id)) {
        $('preview-search-status').textContent = 'Este pedido já tem uma gravação selecionada. Você pode ouvir ou escolher um áudio do dispositivo.';
        selecionar(escolhidas.get(pedido.id) ?? locais.get(pedido.id));
        if (!locais.has(pedido.id)) $('preview-retry').hidden = false;
      } else pesquisar();
    },
    limpar() {
      inicioPalco++;
      busca++;
      pedidoNoPalco = null;
      audioPedido = null;
      player.parar();
      for (const faixa of locais.values()) URL.revokeObjectURL(faixa.url);
      locais.clear();
      escolhidas.clear();
      mostrarPalco();
      pedidoAtual = null;
      if (dialogo.open) dialogo.close();
    }
  };
}
