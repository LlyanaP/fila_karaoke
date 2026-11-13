# Como uma fila organiza os pedidos do karaokê

## 1. O problema real

Muitos participantes podem pedir músicas enquanto só uma pessoa canta. O organizador precisa guardar os pedidos e decidir quem vai ao palco sem deixar alguém passar à frente de quem chegou antes.
O critério deste projeto é a ordem de chegada dos pedidos. Cada pedido guarda participante, música, artista e ID.
Um participante pode ter mais de um pedido: não há rodízio por pessoa.

## 2. Por que a estrutura fila é adequada

Uma fila segue FIFO: First In, First Out, ou primeiro a entrar, primeiro a sair.
Pedidos novos entram no fim e o atendimento retira o início. Se Ana e Bruno ainda esperam e Ana pediu antes, Ana será retirada primeiro.
Essa propriedade permanece verdadeira após cada inserção e remoção. Não é preciso ordenar a coleção por nome ou música.
Uma pilha usaria LIFO e atenderia primeiro o pedido mais recente, mudando a regra do problema.

## 3. Estrutura, algoritmo e aplicação

- Estrutura: a fila armazena os pedidos que ainda aguardam.
- Algoritmo: as operações inserem no fim, consultam e removem pelo início.
- Aplicação: o karaokê decide quando chamar essas operações e controla se o palco está livre.

A fila não reproduz áudio. Ela resolve a ordem do atendimento.
O palco ocupado não faz parte da definição de FIFO: é uma regra adicional do karaokê.

## 4. Operações ligadas às ações reais

| Situação | Operação da fila | Consequência |
| --- | --- | --- |
| Chega um pedido válido | Enfileirar no fim | Aumenta a espera sem mudar quem já estava na frente |
| Anunciar quem deve se preparar | Consultar o início (peek) | A ordem e o tamanho permanecem iguais |
| Chamar alguém com o palco livre | Desenfileirar pelo início | O primeiro sai da espera e seu pedido passa ao palco |
| Clicar em Encerrar apresentação no site | Concluir o atual e desenfileirar o próximo, se existir | Para o áudio atual e inicia o próximo pedido; sem espera, libera o palco |

## 5. Simule antes de programar

Estado inicial: fila vazia e palco livre.

| Operação | Antes | Depois | Palco |
| --- | --- | --- | --- |
| Ana pede | Vazia | Ana | Livre |
| Bruno pede | Ana | Ana -> Bruno | Livre |
| Consultar próximo | Ana -> Bruno | Ana -> Bruno | Livre; consulta retorna Ana |
| Chamar próximo | Ana -> Bruno | Bruno | Ana |
| Carla pede | Bruno | Bruno -> Carla | Ana |

Quando Ana terminar, Bruno continua sendo o próximo. Carla não passa à frente de Bruno.
O exemplo guiado do site usa uma sessão independente: avançar nele não altera os pedidos do karaokê ao vivo.

## 6. Como o algoritmo faz isso

Para inserir: preparar um nó com o pedido; se a fila está vazia, torná-lo o início; caso contrário, ligar o fim anterior ao novo; atualizar fim e quantidade.
Para remover: verificar se existe pedido; guardar o valor do início; avançar início para o seguinte; diminuir a quantidade; se esvaziar, zerar fim também; liberar o nó antigo e retornar o pedido.
Para consultar: verificar se existe pedido e copiar o valor inicial, sem mudar os nós nem a quantidade.

Em C, as chamadas que expressam essas operações são:

```c
enfileirar(&fila, ana);
consultarInicio(&fila, &proximo);
desenfileirar(&fila, &atual);
```

Esses trechos supõem fila inicializada e variáveis Pedido já declaradas/preenchidas. O programa completo está em dist/codigo-c.
A linguagem C permite mostrar concretamente o algoritmo, mas FIFO não depende de uma linguagem específica.
As referências sintáticas e de memória ficam em referencia-c.md e na seção opcional de implementação completa do site.

## 7. Situações que exigem decisão

- Fila vazia: consulta e remoção retornam falha; o programa avisa e não inventa um pedido.
- Palco ocupado: o organizador bloqueia uma nova chamada até encerrar a apresentação. Ninguém é removido nessa tentativa.
- Um único pedido: ao chamar, a fila fica vazia; uma nova chegada pode reiniciá-la normalmente.
- Pedidos repetidos: cada um ocupa sua própria posição, com ID diferente.
- Chegada durante uma apresentação: entra no fim da espera e não altera quem está cantando.

## 8. Custos e escolha da implementação

A implementação encadeada guarda as duas extremidades: início e fim. Não é necessário percorrer todos os pedidos para inserir ou remover, por isso essas operações são O(1) para pedidos de tamanho fixo. Consultar o início também é O(1).
Mostrar todos os pedidos custa O(n), pois a exibição percorre os nós. Guardar n pedidos usa O(n) de memória.
Outras implementações também podem obedecer ao FIFO. A forma de armazenamento é uma escolha; a ordem de atendimento é o conceito central.

## 9. Como defender o projeto

1. Qual problema a fila resolve no karaokê?
2. Qual regra permanece verdadeira após cada operação?
3. Por que consultar não significa atender?
4. Onde fica o pedido enquanto a pessoa canta?
5. Por que Carla entra depois de Bruno mesmo com Ana no palco?
6. Qual parte é regra de fila e qual parte é regra do karaokê?
7. Como as funções em C implementam as decisões que a tela demonstra?

O navegador usa JavaScript para a demonstração visual e o exemplo guiado; os arquivos C são compiláveis no terminal. As duas versões ilustram a mesma política FIFO, sem compartilhar dados.

## Controle do palco na interface

Chamar próximo realiza dequeue e inicia a prévia de até 15 segundos. Pausar/Retomar afeta somente a reprodução; o pedido permanece em atual. Encerrar apresentação combina encerrar() com chamarProximo(), preservando FIFO e interrompendo o áudio anterior antes da troca. Aguardar o fim da prévia não consome outro pedido.

Sem prévia, o pedido continua no palco com um aviso e a opção Escolher áudio. Falhas de rede não impedem o encerramento nem alteram a ordem da fila.
