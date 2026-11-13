# Vez da Voz - O algoritmo de fila no karaokê

Demonstração para o EP de Algoritmos / Pilhas e Filas do Senac.
O foco é entender como a fila resolve o atendimento por ordem de chegada. C é usado para expressar o algoritmo.
A aba Por dentro da fila apresenta o problema, a regra FIFO, um exemplo guiado com cinco operações e a relação entre as ações do organizador e as mudanças na estrutura.
O código completo fica em uma seção opcional de consulta. O pacote mantém o programa C para terminal e a demonstração visual para navegador.

## Caminho de estudo

1. Leia a situação do karaokê e identifique o que cada pedido representa.
2. Avance o exemplo Do pedido ao palco e preveja a fila antes de cada clique.
3. Relacione guardar no fim, consultar e chamar pelo início às operações do algoritmo.
4. Leia os recortes em C para ver como cada decisão preserva FIFO.
5. Reproduza no karaokê ao vivo. O exemplo guiado tem sua própria sessão e não altera a fila real da demonstração.
6. Consulte docs/explicacao.md para conceitos e docs/referencia-c.md para detalhes de implementação.

## Compilar e executar o programa em C

Requer um compilador C11, como GCC. Na pasta principal do projeto extraído:

```sh
gcc -std=c11 -Wall -Wextra -pedantic dist/codigo-c/fila.c dist/codigo-c/main.c -o karaoke
./karaoke
```

No Windows com GCC/MinGW, execute o mesmo comando de compilação e depois `.\karaoke.exe`.
Em uma IDE, adicione fila.c e main.c ao mesmo projeto; fila.h deve ficar na mesma pasta desses arquivos.
O programa começa com a fila vazia. Não é necessário Node.js para executar a versão em C.

### Menu do terminal

1. Adicionar pedido: lê cantor, música e artista e chama enfileirar.
2. Chamar próximo: chama desenfileirar e leva o pedido ao palco.
3. Consultar próximo: chama consultarInicio sem remover.
4. Mostrar fila: percorre os nós na ordem FIFO e mostra o palco e a contagem de concluídas.
5. Encerrar palco: libera a apresentação atual para permitir a próxima chamada.
6. Limpar tudo: solicita confirmação e libera os nós restantes.
0. Sair: libera os nós pendentes e encerra.

O palco ocupado bloqueia outra chamada. Pedidos repetidos são permitidos com IDs diferentes.
Campos vazios, somente espaços ou com mais de 80 bytes são rejeitados; uma entrada inválida cancela esse cadastro.
Em UTF-8, uma letra acentuada pode ocupar mais de um byte. O limite em C é a capacidade do vetor char, não uma contagem de letras.
Não há reprodução de áudio, arquivos de dados ou persistência entre execuções.

## Executar a demonstração visual

Sem instalar dependências, rode um servidor na pasta principal:

```sh
python3 -m http.server 8000 --directory dist
```

No Windows, use `py -m http.server 8000 --directory dist` se necessário.
Abra http://localhost:8000. Abrir o HTML diretamente pode bloquear os módulos e o carregamento dos arquivos C.
A demonstração começa com Luiza, Rafael e Bia. O formulário e a consulta mostram as operações FIFO. Chamar próximo retira o início e inicia sua prévia; Pausar/Retomar controla o áudio sem alterar a fila. Encerrar apresentação conclui o atual e já chama e toca o próximo. Se a fila terminou, deixa o palco livre.
"Limpar demonstração" zera a sessão e "Carregar exemplo" recria os três pedidos quando fila e palco estão vazios.
A aba "Por dentro da fila" permite escolher fila.h, fila.c e main.c e baixar cada arquivo.

A interface do navegador roda em JavaScript. Os arquivos C exibidos são uma implementação equivalente, compilável no terminal; não são executados pelo navegador.
As duas versões não compartilham dados. Recarregar o navegador restaura o exemplo; executar o terminal inicia uma fila vazia.
Todos os dados ficam na memória da respectiva sessão. A fila e os exemplos funcionam sem API externa; a busca de prévias requer internet e consulta o catálogo iTunes. O programa C continua sendo uma simulação de pedidos no terminal, sem áudio.

## Ouvir uma prévia de até 15 segundos

- Na fila, clique em Prévia · 15 s para escolher uma gravação ou associar áudio local. No palco, Escolher áudio permite trocar essa seleção.
- A busca usa música e artista. Ao chamar um pedido, a gravação escolhida anteriormente é usada; sem escolha, a primeira correspondência do catálogo é selecionada e a prévia começa automaticamente. Se o navegador bloquear a reprodução automática, clique em Tocar prévia no palco.
- O player para aos 15 segundos, permite pausar/retomar e toca um áudio por vez. Fechar a janela de escolha interrompe a amostra; no palco, use Tocar prévia para iniciar novamente. O fim dos 15 segundos não encerra sozinho a apresentação: o botão Encerrar controla o avanço.
- Ouvir uma amostra pelo botão da fila não altera o atendimento. Chamar próximo inicia a apresentação e seu áudio; pausar não consome pedidos; encerrar conclui a apresentação e remove somente o próximo pedido FIFO para iniciar a seguinte.
- O trecho é uma amostra disponibilizada pelo catálogo e pode começar em qualquer parte da gravação; não são necessariamente os primeiros 15 segundos da música completa.
- Quando não houver uma correspondência, o site avisa. É possível escolher um áudio do dispositivo; ele fica associado ao pedido apenas nesta aba, sem upload.
- O arquivo local é limitado aos primeiros 15 segundos disponíveis. Arquivos mais curtos terminam antes.
- Recarregar ou limpar a demonstração descarta associações de arquivos locais.
- A disponibilidade do catálogo pode mudar e a rede pode falhar; a interface oferece nova tentativa e áudio local.

## Arquivos principais

- `dist/codigo-c/fila.h`: tipos Pedido, No e Fila e declarações das funções.
- `dist/codigo-c/fila.c`: fila encadeada FIFO em C com malloc/free.
- `dist/codigo-c/main.c`: menu completo do karaokê em C.
- `tests/fila_c_test.c`: testes da estrutura em C.
- `scripts/test-c.py`: compila e executa testes de fila, menu e validação de entradas.
- `dist/index.html`, `dist/styles.css`, `dist/app.js`: apresentação visual e visualizador dos arquivos C.
- `dist/fila.js`: estrutura equivalente usada pela interface visual.
- `dist/previas.js`: busca de gravações, áudio local e controle único de até 15 segundos.
- `dist/previas.css`: apresentação das prévias.
- `tests/previas.test.mjs`: limite de reprodução, pausa, troca, erros e validação de resultados.
- `docs/previas.md`: instruções, limites e fontes da integração.
- `tests/fila.test.mjs`: testes da lógica da versão visual.
- `dist/algoritmo.js`: sequência guiada de cinco operações, usando as regras do karaokê.
- `dist/conceitos.css`: apresentação do exemplo antes/depois.
- `tests/algoritmo.test.mjs`: valida as transições e a independência dos exemplos.
- `docs/explicacao.md`: problema real, FIFO, algoritmo, operações, casos extremos e custos.
- `docs/referencia-c.md`: referência opcional de structs, ponteiros, retornos e memória em C.
- `docs/roteiro.md`: roteiro de 15 minutos e previsão manual.
- `docs/processo-ia.md`, `docs/interacoes-disponiveis.md`: diário e registros parciais da conversa.
- `docs/validacao.md`: verificações efetivamente realizadas e limites.

## Testes

Com Python 3 e GCC:

```sh
python3 scripts/test-c.py
python3 scripts/test-c.py --sanitize
```

A segunda opção usa AddressSanitizer e UndefinedBehaviorSanitizer. LeakSanitizer fica desativado por incompatibilidade do ambiente com seu acesso a /proc/ptrace; não há afirmação de varredura de vazamentos.
Para a lógica JavaScript, com Node.js 20 ou superior, rode `npm test`. Não é necessário npm install.

## Onde está o uso real da fila em C

No main.c, adicionar chama `enfileirar(&fila, novo)`.
Chamar próximo usa `desenfileirar(&fila, &atual)` apenas com o palco livre.
Consultar usa `consultarInicio(&fila, &proximo)` sem consumir o pedido.
Mostrar a fila percorre os nós, sem alterar sua ordem. O palco é um Pedido separado e palcoOcupado indica se ele está em uso.

## Entrega

Data indicada no enunciado: 13/11/2026, 15 minutos, grupos de 2 a 4.
Todos precisam entender e defender a implementação. Preencham os nomes do grupo e anexem a exportação integral desta conversa e das próximas iterações.
O diário incluído não substitui essa exportação.
Para recriar o ZIP após mudanças: `python3 scripts/package-download.py`. O ZIP não inclui sua própria cópia nem a identidade da hospedagem.

A interface web combina encerrar e chamar em um clique. No programa C de referência, essas duas operações continuam separadas no menu (5 para encerrar, 2 para chamar), ilustrando as mesmas operações da fila.
