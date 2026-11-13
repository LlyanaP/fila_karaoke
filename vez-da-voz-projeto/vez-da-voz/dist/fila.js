/**
 * Fila FIFO encadeada: primeiro a entrar, primeiro a sair.
 * A interface usa esta classe de verdade para organizar os pedidos.
 */
export class Fila {
  constructor() {
    this.inicio = null;
    this.fim = null;
    this.tamanho = 0;
  }

  // ENQUEUE: insere no fim em O(1).
  enfileirar(valor) {
    const novo = { valor, proximo: null };
    if (this.estaVazia()) {
      this.inicio = novo;
    } else {
      this.fim.proximo = novo;
    }
    this.fim = novo;
    this.tamanho++;
  }

  // DEQUEUE: remove do início em O(1).
  desenfileirar() {
    if (this.estaVazia()) return null;
    const valor = this.inicio.valor;
    this.inicio = this.inicio.proximo;
    this.tamanho--;
    // Ao remover o último nó, os dois ponteiros ficam vazios.
    if (this.estaVazia()) this.fim = null;
    return valor;
  }

  // PEEK: consulta o início sem remover, em O(1).
  consultarInicio() {
    return this.inicio ? this.inicio.valor : null;
  }

  estaVazia() {
    return this.tamanho === 0;
  }

  // Percurso O(n), usado apenas para desenhar a fila na tela.
  listar() {
    const valores = [];
    let no = this.inicio;
    while (no !== null) {
      valores.push(no.valor);
      no = no.proximo;
    }
    return valores;
  }
}

export class Karaoke {
  constructor() {
    this.fila = new Fila();
    this.atual = null;
    this.concluidas = [];
    this.operacoes = [];
    this.proximoId = 1;
  }

  registrar(tipo, texto) {
    this.operacoes.unshift({ tipo, texto, hora: new Date().toLocaleTimeString('pt-BR') });
  }

  adicionar(cantor, musica, artista) {
    const campos = [cantor, musica, artista].map(valor => String(valor ?? '').trim());
    if (campos.some(valor => valor.length === 0 || valor.length > 80)) {
      throw new Error('Preencha os três campos com até 80 caracteres cada.');
    }
    const pedido = { id: this.proximoId++, cantor: campos[0], musica: campos[1], artista: campos[2] };
    this.fila.enfileirar(pedido);
    this.registrar('ENQUEUE', `${pedido.cantor} entrou no fim da fila: ${pedido.musica}.`);
    return pedido;
  }

  chamarProximo() {
    if (this.atual !== null) {
      this.registrar('BLOQUEIO', 'O palco está ocupado. Encerre a apresentação atual primeiro.');
      return { status: 'ocupado' };
    }
    const pedido = this.fila.desenfileirar();
    if (pedido === null) {
      this.registrar('FILA VAZIA', 'Não há pedidos para chamar. Nenhum item foi removido.');
      return { status: 'vazio' };
    }
    this.atual = pedido;
    this.registrar('DEQUEUE', `${pedido.cantor} saiu do início da fila e foi para o palco.`);
    return { status: 'ok', pedido };
  }

  encerrar() {
    if (this.atual === null) return null;
    const pedido = this.atual;
    this.concluidas.push(pedido);
    this.atual = null;
    this.registrar('CONCLUIR', `${pedido.cantor} terminou. O palco está livre.`);
    return pedido;
  }

  // O botao do site combina duas acoes: concluir o atual e chamar o inicio.
  encerrarEChamarProximo() {
    const encerrado = this.encerrar();
    if (encerrado === null) return { status: 'sem_apresentacao', encerrado: null };
    if (this.fila.estaVazia()) return { status: 'fim', encerrado };
    return { ...this.chamarProximo(), encerrado };
  }

  consultar() {
    const pedido = this.fila.consultarInicio();
    this.registrar('PEEK', pedido ? `${pedido.cantor} é o próximo. A fila não foi alterada.` : 'Fila vazia: não há próximo pedido.');
    return pedido;
  }
}
