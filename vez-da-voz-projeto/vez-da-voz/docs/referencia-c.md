# Entendendo a fila do karaokê em C

## Problema

Um organizador registra pedidos de música. FIFO (First In, First Out) preserva a chegada: o primeiro pedido a entrar é o primeiro a sair para o palco.
Cada item representa um pedido. Uma pessoa pode solicitar duas músicas e terá duas posições distintas; não há rodízio por participante.

## Tipos e ponteiros (fila.h)

- Pedido: ID e vetores char de cantor, música e artista. Cada campo aceita até 80 bytes mais o terminador nulo.
- No: armazena um Pedido por valor e um ponteiro `struct No *proximo`.
- Fila: guarda `No *inicio`, `No *fim` e `size_t tamanho`.
- Fila vazia: inicio e fim são NULL e tamanho é zero.

As funções recebem um ponteiro para uma fila já inicializada. `&fila` obtém o endereço; `fila->inicio` acessa o membro através do ponteiro.
`Pedido *pedido` é um parâmetro de saída: `*pedido = removido->valor` copia os dados para uma variável do chamador.
Todos os ponteiros passados à API devem ser válidos. A versão didática não tenta corrigir chamadas com ponteiro de fila nulo ou estrutura não inicializada.

## Operações (fila.c)

| Chamada no main | Resultado | Custo |
| --- | --- | --- |
| inicializarFila(&fila) | Zera ponteiros e tamanho antes de usar | O(1) |
| enfileirar(&fila, pedido) | 1 no sucesso; 0 se malloc falhar | O(1) |
| desenfileirar(&fila, &pedido) | 1 e copia o primeiro; 0 se vazia | O(1) |
| consultarInicio(&fila, &pedido) | 1 e copia sem remover; 0 se vazia | O(1) |
| estaVazia(&fila) | Verdadeiro quando tamanho é zero | O(1) |
| liberarFila(&fila) | Libera os nós pendentes e reinicializa | O(n) |

Mostrar a fila no terminal percorre todos os nós e custa O(n). Os custos O(1) descrevem as operações na estrutura com Pedido de tamanho fixo.
A memória ocupada pela fila é O(n). O programa não mantém um histórico crescente em C: guarda o pedido atual e uma contagem de concluídas.
A interface JavaScript possui um registro visual de operações e uma lista de concluídas para a demonstração.

## Inserção e memória

`malloc(sizeof *novo)` reserva memória para um nó. Se falhar, a função retorna 0 antes de alterar a fila.
O novo nó recebe o pedido e proximo = NULL. Se a fila estava vazia, inicio aponta ao novo nó; caso contrário, o antigo fim é ligado a ele.
Depois, fim aponta ao novo nó e tamanho é incrementado.

## Remoção passo a passo

1. Se a fila estiver vazia, retornar 0 sem alterar o parâmetro de saída.
2. Guardar o ponteiro do nó inicial em removido.
3. Copiar removido->valor para *pedido.
4. Mover inicio para removido->proximo e diminuir tamanho.
5. Se ficou vazia, definir fim = NULL também.
6. Chamar free(removido), pois os dados já foram copiados.
7. Retornar 1.

Não se deve acessar removido depois do free. O pedido copiado continua válido porque seus campos são vetores dentro da própria struct, não ponteiros para o nó liberado.
`liberarFila` chama free para os nós ainda na espera ao limpar ou sair. Nunca chamamos inicializarFila para descartar uma fila não vazia sem antes liberar seus nós.

## Regras do main.c

O menu usa enfileirar, desenfileirar e consultarInicio para atender os pedidos.
Um Pedido atual separado guarda o palco. O inteiro palcoOcupado impede chamadas durante a apresentação.
Concluir libera o palco e aumenta a contagem de concluídas. Não remove outro pedido da espera.
A entrada usa fgets, verifica tamanho, remove espaços nas extremidades e descarta o restante de linhas longas. A opção numérica usa strtol com validação.

## Casos extremos

- Vazia: retorno 0 em remoção e consulta; mensagem ao usuário.
- Um nó: inicio e fim apontam ao mesmo nó; remover zera ambos.
- Reinserção após esvaziar: os dois ponteiros apontam ao novo nó.
- Palco ocupado: pedido nenhum é consumido da fila.
- Duplicatas: nomes e músicas podem se repetir; cada pedido tem seu ID de chegada.
- Falha de alocação: a inserção retorna 0 e não altera a fila nem consome um ID no menu.
- Fim da entrada: o programa encerra liberando os nós pendentes, inclusive durante um cadastro incompleto.
- Texto: em C o limite é 80 bytes; na interface web é 80 caracteres do campo. A fila e o palco usam a mesma regra FIFO nas duas versões.

## Perguntas para defender

1. Por que `proximo` precisa ser ponteiro para No?
2. O que são &fila, fila->inicio e *pedido?
3. Por que copiamos o Pedido antes de chamar free?
4. O que acontece com inicio e fim quando removemos o último nó?
5. Por que uma pilha inverteria a ordem do karaokê?
6. Por que listar é O(n), embora inserir e remover sejam O(1)?

## Versão visual

O navegador simula a mesma lógica em JavaScript. A aba de código lê os arquivos C completos incluídos no download.
O C roda no terminal após compilação e não é executado nem sincronizado pela página. Essa separação permite demonstrar visualmente e apresentar a implementação solicitada em C.
