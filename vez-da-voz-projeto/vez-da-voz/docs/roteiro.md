# Roteiro de apresentação - foco no algoritmo

## 0 a 3 minutos: problema e escolha da fila

Expliquem quem usa o programa e a dificuldade real: pedidos chegam enquanto uma pessoa canta.
Definam o critério de atendimento por chegada. Apresentem FIFO e justifiquem por que guardar no fim e retirar no início preserva esse critério.
Esclareçam que cada item é um pedido, não uma pessoa única.

## 3 a 8 minutos: previsão, execução e código

1. Abram Por dentro da fila e acompanhem o exemplo Do pedido ao palco.
2. Antes de cada avanço, prevejam como ficam a espera e o palco.
3. Mostrem que Ana entra primeiro, Bruno entra depois e consultar não muda a fila.
4. Chamem Ana: o pedido deixa a espera e fica no palco.
5. Adicionem Carla durante a apresentação: Bruno mantém a vez.
6. Leiam os passos de inserção e remoção em A regra virando algoritmo. Relacionem as linhas em C às mudanças observadas.
7. Voltem ao karaokê ao vivo e reproduzam as operações com seus próprios pedidos.

A tabela de previsão completa está em explicacao.md. No exemplo guiado, voltar ou recomeçar não altera o karaokê ao vivo.

## 8 a 15 minutos: justificar as decisões

Preparem-se para responder: por que FIFO? O que mudaria com uma pilha? Por que consultar não remove? Onde fica o pedido em execução? Como o algoritmo trata fila vazia, palco ocupado e pedidos repetidos?
Expliquem que inserir/remover nas extremidades custa O(1) nesta implementação e exibir todos os pedidos custa O(n).

## Papel de C na explicação

Usem C para mostrar como a regra é implementada. Comecem pelo raciocínio e pelas mudanças na estrutura; expliquem detalhes de sintaxe apenas quando necessários para entender a operação.
O código completo e as instruções de compilação continuam na seção de consulta. Se quiserem executar no terminal, compilem antes da aula e cadastrem os pedidos: a versão C começa vazia.
A versão visual roda em JavaScript e não executa o C exibido.

## Organização do grupo

Dividam problema, demonstração, algoritmo e testes entre os integrantes, mas todos precisam entender a solução inteira.
As previsões apresentadas foram propostas pela IA; registrem as previsões e observações reais do grupo no diário.
Anexem a exportação integral desta conversa e das próximas iterações à entrega.

## Fluxo atualizado do palco

Na demonstração, Chamar próximo inicia o áudio; Pausar/Retomar não altera a fila. Encerrar apresentação para o áudio e chama o próximo pedido. Mostrem as duas operações consecutivas no registro: CONCLUIR e DEQUEUE. Ao encerrar o último, o palco fica livre. Os exemplos de C mantêm essas ações separadas para evidenciar a composição do algoritmo.
