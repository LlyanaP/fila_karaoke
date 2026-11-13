# Diário do processo com IA

Data: 30/10/2026 (America/Sao_Paulo).
Tema do usuário: "Fila do fluxo de música do karaokê".
Fonte dos requisitos: EP_Pilhas_e_Filas_Senac_13-11-2026.pdf, anexado nesta conversa.

## Limites deste registro

Este documento é um diário das decisões observáveis desta sessão, não uma exportação integral da plataforma.
O arquivo interacoes-disponiveis.md preserva as mensagens anteriores disponíveis e identifica o registro parcial da implementação.
O grupo ainda precisa anexar a exportação completa desta conversa, incluindo as chamadas técnicas, a resposta final e futuras interações.
Não foram atribuídas ao grupo escolhas ou previsões que ele não fez. Não foram consultadas outras conversas do usuário para criar este projeto.

## Iteração 1 - Entender e delimitar

- Solicitação: o usuário anexou o enunciado e indicou a fila do karaokê como tema.
- Leitura: a IA extraiu o texto do PDF local, incluindo requisitos, entregáveis e duração da apresentação.
- Proposta: armazenar pedidos com participante, música e artista; enfileirar ao chegar; desenfileirar para o palco; consultar sem remover.
- Justificativa: FIFO preserva a ordem de chegada; pilha inverteria o atendimento.
- Resultado: explicação inicial e simulação de cinco operações apresentadas na conversa.

## Iteração 2 - Demonstração funcional

- Solicitação: o usuário repetiu o mesmo tema com o PDF anexado. Não acrescentou preferência de linguagem ou interface.
- Decisão da IA: avançar para uma demonstração web estática em HTML, CSS e JavaScript. O grupo não escolheu entre alternativas técnicas.
- Alternativas consideradas: array com shift (mais curto, remoção O(n)) e fila encadeada (ponteiros explícitos e remoção O(1)).
- Escolha da IA: fila encadeada com inicio, fim, tamanho e nós contendo valor/proximo.
- Regras: palco separado da fila; uma apresentação por vez; encerrar antes de chamar outra pessoa; pedidos repetidos permitidos.
- Interface: fila, palco, formulário, registro de operações, visualização de ponteiros e código real da estrutura.
- Limite: simulação de pedidos, sem áudio, sem sincronização e sem persistência após recarregar.
- Resultado: implementação em dist/fila.js e dist/app.js, com interface responsiva.

## Iteração 3 - Verificação

- Objetivo: verificar FIFO, consultas sem remoção, fila vazia, último nó, reutilização, duplicatas, validação e palco ocupado.
- Testes: suite nativa do Node em tests/fila.test.mjs. A sequência manual prevista também é exercitada por teste automatizado.
- Verificação visual/funcional: consultar docs/validacao.md para o resultado efetivamente observado, sem presumir sucesso.
- Previsões dos alunos: não coletadas nesta sessão. O roteiro orienta o grupo a fazê-las antes da demonstração.
- Correções e resultados: registrados em docs/validacao.md.

## Iteração 4 - Entrega

- Código, instruções, explicação e este diário reunidos em um ZIP disponível na própria demonstração.
- A hospedagem mantém acesso privado por padrão; a cópia baixada pode ser executada pelo grupo em servidor local.
- A confirmação de publicação e o link final ficam na conversa da plataforma. Anexar essa conversa à entrega acadêmica.

## Próximas iterações do grupo

Para cada mudança, registrar: data, prompt literal, resposta integral, alternativas, decisão de quem participou, arquivos alterados, previsão, teste executado, resultado e correções.
Anexar exportações completas e commits, quando disponíveis. Nunca registrar senhas ou credenciais.

## Iteração 5 - Código apresentado em C

- Solicitação literal: “eu quero o código apresentado em C”. O usuário indicou o Site Vez da Voz existente.
- Decisão: trocar o conteúdo didático e o visualizador para C, mantendo o karaokê visual e fornecendo um programa C completo e compilável.
- Alterações: fila.h com structs e protótipos; fila.c com fila encadeada e malloc/free; main.c com menu funcional; seletor de arquivos C e instruções de compilação na página.
- Coerência: as explicações usam NULL, ponteiros, retornos 0/1 e liberação de nós. A página deixa explícito que o navegador usa JavaScript e o C é executado no terminal.
- Testes: compilação C11 com -Wall -Wextra -Werror -pedantic; testes da estrutura, menu, FIFO, palco ocupado, campos inválidos, limpeza e fim da entrada; AddressSanitizer e UndefinedBehaviorSanitizer. Resultados detalhados em validacao.md.
- Limite encontrado: LeakSanitizer não conseguiu acessar /proc/ptrace neste ambiente. Foi desativado apenas esse detector; os testes de endereços e comportamento indefinido continuaram ativos.
- Empacotamento: ZIP atualizado com fontes C, testes, instruções e documentação, sem binários específicos de sistema operacional.

## Iteração 6 - Conceito de fila e uso no problema real

- Correção do usuário: o foco deve ser a explicação do conceito de fila e do algoritmo aplicado ao karaokê, usando C para representá-lo.
- Alteração: reorganizada a aba Por dentro da fila em problema real, regra FIFO, operações, exemplo antes/depois com Ana/Bruno/Carla, passos do algoritmo com recortes em C e situações do karaokê.
- A implementação completa em C passou para uma seção opcional de consulta. Não foram alteradas as regras da fila nem o programa C.
- Exemplo guiado: cinco operações geradas pelas mesmas regras da demonstração, em sessão independente, com navegação para avançar, voltar e recomeçar.
- Documentação: explicação principal e roteiro agora priorizam o raciocínio; os detalhes anteriores de C foram preservados em referencia-c.md.
- Testes: três testes adicionados para validar as transições, a consulta sem remoção e a independência dos quadros. Suite JavaScript: 13 aprovados, 0 falhas.
- O registro continua parcial; anexar a exportação completa da conversa.

## Iteração 7 - Prévias de músicas (10/11/2026)

- Solicitação literal: “olá meu querido tem como adicionar seila uma previa de 15 segundos de cada musica?”
- Solução: botão de prévia em cada pedido e no palco, busca por título/artista no catálogo iTunes e alternativa com áudio local associado ao pedido.
- Decisões: amostras acionadas por clique, teto de 15 segundos, um único player, pausa/retomada, parada ao fechar e nenhuma alteração na fila ao ouvir. Seleção da gravação evita tocar automaticamente uma versão diferente.
- Integração: JSONP com timeout, validação de correspondência e de URLs, mensagens para ausência/rede, metadados apenas em memória. Áudio do catálogo é transmitido diretamente com link da gravação e atribuição.
- Privacidade: somente título/artista vão à busca; arquivos locais não são enviados ao site.
- Verificação: testes automatizados do player e da seleção e teste real de reprodução no Chrome. Detalhes em validacao.md.
- Correção observada na revisão: o mostrador podia terminar em 14/15 devido ao arredondamento do tempo da mídia; o temporizador agora registra o término pelo limite como 15/15.

## Iteração 8 - Chamar, pausar e avançar (10/11/2026)

- Solicitação literal: “Olha, qnd clicar em chamar o proximo inicia a musica, ai adiciona a opção de pausar, deixando o encerrar apresentação e skipando pro proximo”.
- Interpretação aplicada: Chamar inicia a prévia do pedido; Pausar/Retomar controla o áudio; Encerrar apresentação interrompe o atual e avança ao próximo da fila, mantendo o limite anterior de 15 segundos. O fim da amostra não avança sem o botão.
- Implementação: controles e progresso no palco, reutilização de gravação escolhida, busca automática quando necessário, mensagens de ausência/bloqueio e invalidação de buscas atrasadas ao trocar de pedido.
- Algoritmo: encerrarEChamarProximo combina as duas operações já existentes, sem inverter FIFO nem criar um novo pedido ao terminar a fila.
- Testes: três testes de negócio adicionados para avanço FIFO, última apresentação e tentativa sem apresentação atual.
