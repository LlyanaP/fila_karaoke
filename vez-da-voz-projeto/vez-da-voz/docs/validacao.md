# Validação da versão 1

Data: 30/10/2026.

## Testes automatizados da lógica

Comando executado: `node --test tests/*.test.mjs`.
Resultado observado: 10 testes executados, 10 aprovados, 0 falhas.

Cobertura: fila vazia; FIFO com operações intercaladas; peek sem remoção; remoção do último nó e reutilização; bloqueio com palco ocupado; chamada vazia; pedidos repetidos; validação de campos; roteiro manual de cinco operações; preservação da ordem com 5.000 inserções e remoções.

## Verificação no navegador

Testada a prévia da aplicação em Chrome, em viewport de computador:

- Página inicial com os três pedidos fictícios na ordem correta.
- Consultar Luiza manteve os três pedidos na fila.
- Chamar próximo moveu Luiza para o palco e removeu seu pedido da espera.
- Adicionar Ana durante a apresentação inseriu Ana atrás de Rafael e Bia.
- Encerrar Luiza e chamar novamente levou Rafael ao palco, preservando a ordem.
- Limpar abriu um diálogo de confirmação; confirmar zerou a sessão.
- Chamar com a fila vazia exibiu o aviso e registrou FILA VAZIA.
- Carregar exemplo recriou Luiza, Rafael e Bia.
- Cancelar o diálogo com Escape preservou a fila.
- A aba Por dentro da fila exibiu os ponteiros e carregou o código real de fila.js.
- A aba Guia da apresentação exibiu roteiro, tabela de previsão e entregáveis.
- Inspeção visual da interface em computador realizada.

## Correções durante a revisão

- Inserido espaço ao lado das quebras de linha ocultadas no título e subtítulo em telas grandes.
- Reinicializado returnValue do diálogo antes de abri-lo, evitando que Escape reutilize uma confirmação anterior.
- Adicionado nome acessível ao diálogo de limpeza.

## Limites

Os testes automatizados cobrem a lógica de dados; as interações de interface acima foram testadas separadamente no navegador.
O CSS contém adaptações para telas menores e redução de movimentos. Não foi feito teste visual em um dispositivo móvel real.
O projeto simula pedidos; não reproduz áudio. Não há persistência de dados após recarregar a página.

## Atualização - implementação em C

Comando: `python3 scripts/test-c.py --sanitize`.
Resultado observado: compilação C11 sem avisos com -Wall -Wextra -Werror -pedantic; todas as verificações abaixo aprovadas:

- Estrutura C: vazio, FIFO, peek, último nó, reutilização, duplicatas, 5.000 inserções/remoções e liberação de nós pendentes.
- Menu: chamadas na ordem Ana, Bruno, Carla, sem furar a fila durante uma apresentação; bloqueio de palco ocupado e encerramento.
- Entradas: opção inválida, campo vazio/só espaços e campo com 81 bytes rejeitados.
- Limpeza confirmada/cancelada.
- EOF durante cadastro, com fila pendente e com palco ocupado.
- AddressSanitizer e UndefinedBehaviorSanitizer ativos, sem erro nessas execuções.

A primeira tentativa com LeakSanitizer falhou por limitação de acesso a /proc/ptrace, não por diagnóstico de vazamento do programa. A suite foi executada com detect_leaks=0, mantendo AddressSanitizer/UBSan. Não houve varredura de vazamentos.
A aba de código agora mostra arquivos C equivalentes, e não o arquivo JavaScript da versão original.

Verificação no Chrome da atualização: os seletores fila.h, fila.c e main.c mostraram os arquivos corretos; o link individual acompanhou a seleção; o código exibido foi conferido e a nova seção foi inspecionada visualmente. Voltando ao karaokê, chamar Luiza manteve dois pedidos na espera.

## Atualização - foco no conceito e no algoritmo

- Suite JavaScript: 13 testes aprovados, 0 falhas. Três novos testes cobrem os cinco passos guiados, os estados antes/depois, consulta sem remoção e independência dos quadros.
- Verificação no Chrome: navegação até o passo 5 manteve Ana no palco e Bruno antes de Carla; consulta mostrou estados idênticos; voltar e recomeçar restauraram os quadros esperados; os botões respeitaram os limites.
- O exemplo guiado não alterou a sessão ao vivo: os três pedidos iniciais e o palco livre permaneceram intactos.
- A implementação C completa ficou recolhida por padrão e abriu corretamente para consulta.
- Inspeção visual do exemplo e dos passos internos com recortes em C realizada.
- Não houve mudança nas fontes C ou nas regras de atendimento; as verificações C da iteração anterior continuam referentes aos mesmos arquivos.

## Prévias de áudio - 10/11/2026

- Suite JavaScript: 22 testes aprovados, 0 falhas. Nove testes novos cobrem limite de 15 s, proteção por temporizador, pausa/retomada, troca de áudio, avanço além do limite, erro de reprodução, promessas atrasadas e seleção segura de gravações.
- Chrome: a busca real encontrou versões de Velha infância dos Tribalistas; uma amostra do provedor com 30 s de duração foi reproduzida e interrompida automaticamente pelo aplicativo. A confirmação inspecionou mídia não pausada durante reprodução e pausada/zerada ao concluir.
- A interface foi inspecionada visualmente com gravação, progresso, atribuição e link do catálogo.
- Uma busca por título/artista fictícios mostrou ausência de prévia. Um WAV original de teste de 2 s foi associado localmente e reproduzido até seu fim, sem upload. O teste não adiciona músicas ou arquivos de teste ao site entregue.
- O botão também apareceu no palco após chamar Luiza. Ouvir a prévia preservou a quantidade e a ordem dos pedidos.
- O mostrador ao final do teto foi ajustado para registrar 15/15; o teste automatizado verifica o valor final.
- Fontes C e algoritmo FIFO não foram alterados nesta iteração. A integração do catálogo depende de disponibilidade externa, com erro, nova tentativa e opção local na interface.

## Controle do palco: chamar, pausar e avançar

- Suite: 25 testes aprovados, 0 falhas. Os três novos testes validam encerrar + dequeue na ordem correta, encerramento do último pedido e tentativa sem apresentação atual.
- Chrome com músicas reais: Chamar próximo colocou Luiza no palco e iniciou Como Tudo Deve Ser sem abrir a janela de seleção.
- Pausar música deixou o áudio pausado em aproximadamente 10,3 s, com o mesmo pedido no palco e duas pessoas na espera. Retomar continuou do mesmo ponto.
- Encerrar apresentação concluiu Luiza, chamou Rafael e iniciou Velha infância, com uma pessoa na espera.
- Encerrar novamente chamou Bia. Encerrá-la durante a busca da prévia deixou a fila vazia, três concluídas, palco livre, áudio pausado e atributo src removido. As respostas atrasadas são invalidadas por um contador de início.
- A interface foi revisada visualmente. Reservado espaço para os metadados do áudio, evitando que os botões mudem de lugar quando a busca termina.
- O player mantém o teto de 15 s. Fim de prévia não encerra a apresentação; o avanço segue o comando do usuário. Falhas ou bloqueios de reprodução mostram uma ação manual.
- Nenhuma alteração no código C da fila. O menu C segue com encerramento e chamada separados; a interface web compõe as duas operações no mesmo botão.
