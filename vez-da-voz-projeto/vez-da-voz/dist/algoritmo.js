import { Karaoke } from './fila.js';

// O roteiro usa as mesmas regras da demonstracao, em uma sessao separada.
// Cada quadro guarda o estado antes e depois de UMA operacao.
export function criarRoteiro() {
  const exemplo = new Karaoke();
  const estado = () => ({
    espera: exemplo.fila.listar().map(pedido => pedido.cantor),
    palco: exemplo.atual?.cantor ?? null
  });
  const passos = [{
    operacao: 'PREPARAÇÃO', titulo: 'O karaokê abre com a fila vazia.',
    contexto: 'O organizador ainda não recebeu pedidos. Não há ninguém esperando nem cantando.',
    raciocinio: 'A fila representa apenas os pedidos que aguardam atendimento. O palco é um estado separado.',
    codigo: 'Fila fila;\ninicializarFila(&fila);',
    antes: estado(), depois: estado(),
    conclusao: 'Quem chegar primeiro ocupará o início da fila.'
  }];
  const registrar = (dados, executar) => {
    const antes = estado();
    executar();
    passos.push({ ...dados, antes, depois: estado() });
  };
  registrar({
    operacao: 'INSERIR / ENQUEUE', titulo: 'Ana faz o primeiro pedido.',
    contexto: 'O organizador registra o nome, a música e o artista escolhidos por Ana.',
    raciocinio: 'Um novo pedido entra no fim. Como a fila estava vazia, Ana é ao mesmo tempo o início e o fim.',
    codigo: 'enfileirar(&fila, ana);',
    conclusao: 'Ana é a primeira a ser atendida. Adicionar o pedido ainda não a coloca no palco.'
  }, () => exemplo.adicionar('Ana', 'Música A', 'Artista A'));
  registrar({
    operacao: 'INSERIR / ENQUEUE', titulo: 'Bruno pede enquanto Ana espera.',
    contexto: 'Chega um segundo pedido. O sistema precisa guardar a ordem, sem deixar Bruno passar à frente.',
    raciocinio: 'Inserir no fim preserva quem já estava esperando. O primeiro pedido continua sendo o de Ana.',
    codigo: 'enfileirar(&fila, bruno);',
    conclusao: 'A chegada definiu a ordem: Ana primeiro, Bruno depois. Não foi necessário ordenar a fila.'
  }, () => exemplo.adicionar('Bruno', 'Música B', 'Artista B'));
  registrar({
    operacao: 'CONSULTAR / PEEK', titulo: 'O organizador anuncia quem é o próximo.',
    contexto: 'Ele precisa avisar Ana para se preparar, mas a apresentação ainda não começou.',
    raciocinio: 'Consultar apenas lê o início. Ninguém sai da espera e a quantidade de pedidos permanece igual.',
    codigo: 'consultarInicio(&fila, &proximo);\n/* proximo recebe o pedido de Ana; a fila nao muda. */',
    conclusao: 'Consultar não é atender: Ana e Bruno continuam na mesma ordem.'
  }, () => exemplo.consultar());
  registrar({
    operacao: 'REMOVER / DEQUEUE', titulo: 'O palco livre recebe Ana.',
    contexto: 'Agora é hora de iniciar a apresentação. O organizador chama o primeiro pedido da espera.',
    raciocinio: 'Retirar pelo início atende Ana antes de Bruno. O pedido de Ana passa para o palco; Bruno vira o primeiro da fila.',
    codigo: '/* O organizador ja verificou que o palco esta livre. */\nif (desenfileirar(&fila, &atual)) {\n    palcoOcupado = 1;\n}',
    conclusao: 'Ana saiu da fila de espera, mas continua no sistema: está cantando.'
  }, () => exemplo.chamarProximo());
  registrar({
    operacao: 'INSERIR / ENQUEUE', titulo: 'Carla pede uma música durante o show.',
    contexto: 'Ana está no palco e Bruno já espera. A chegada de Carla não deve mudar a vez de Bruno.',
    raciocinio: 'O pedido de Carla entra no fim. O palco não muda e o início da fila continua sendo Bruno.',
    codigo: 'enfileirar(&fila, carla);',
    conclusao: 'Depois que Ana terminar, Bruno será chamado antes de Carla. Essa é a regra FIFO funcionando no problema real.'
  }, () => exemplo.adicionar('Carla', 'Música C', 'Artista C'));
  return passos;
}
