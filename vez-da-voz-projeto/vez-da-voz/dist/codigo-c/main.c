#include "fila.h"
#include <ctype.h>
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 1 = texto valido; 0 = fim da entrada; -1 = vazio ou longo demais. */
static int lerTexto(const char *rotulo, char *destino, size_t capacidade) {
    printf("%s", rotulo);
    fflush(stdout);
    if (fgets(destino, (int)capacidade, stdin) == NULL) return 0;

    size_t tamanho = strlen(destino);
    if (tamanho > 0 && destino[tamanho - 1] == '\n') {
        destino[--tamanho] = '\0';
    } else {
        int caractere = getchar();
        if (caractere != '\n' && caractere != EOF) {
            while ((caractere = getchar()) != '\n' && caractere != EOF) {}
            return -1;
        }
    }

    while (tamanho > 0 && isspace((unsigned char)destino[tamanho - 1])) {
        destino[--tamanho] = '\0';
    }
    size_t inicio = 0;
    while (isspace((unsigned char)destino[inicio])) inicio++;
    memmove(destino, destino + inicio, tamanho - inicio + 1);
    return destino[0] != '\0' ? 1 : -1;
}

static int lerPedido(Pedido *pedido) {
    const char *rotulos[] = { "Quem vai cantar? ", "Musica: ", "Artista: " };
    char *campos[] = { pedido->cantor, pedido->musica, pedido->artista };
    for (size_t i = 0; i < 3; i++) {
        int resultado = lerTexto(rotulos[i], campos[i], TEXTO_MAX + 1);
        if (resultado == 0) return 0;
        if (resultado == -1) {
            puts("Pedido rejeitado: preencha o campo com ate 80 bytes.");
            return -1;
        }
    }
    return 1;
}

static void mostrarPedido(const Pedido *pedido) {
    printf("#%lu | %s | %s | %s\n", pedido->id, pedido->cantor,
           pedido->musica, pedido->artista);
}

/* Apenas exibe a fila. Nao altera os ponteiros ou a ordem. Custo O(n). */
static void mostrarFila(const Fila *fila) {
    printf("Na espera: %zu\n", fila->tamanho);
    for (const No *no = fila->inicio; no != NULL; no = no->proximo) {
        mostrarPedido(&no->valor);
    }
    if (estaVazia(fila)) puts("Fila vazia.");
}

int main(void) {
    Fila fila;
    inicializarFila(&fila);
    Pedido atual = {0};
    int palcoOcupado = 0;
    size_t concluidas = 0;
    unsigned long proximoId = 1;
    int executando = 1;

    puts("VEZ DA VOZ - Fila FIFO em C");
    puts("Simulacao de pedidos; sem reproducao de audio.");

    while (executando) {
        puts("\n1 Adicionar pedido | 2 Chamar proximo | 3 Consultar proximo");
        puts("4 Mostrar fila    | 5 Encerrar palco | 6 Limpar tudo | 0 Sair");
        char entrada[32];
        int leitura = lerTexto("Opcao: ", entrada, sizeof entrada);
        if (leitura == 0) break;
        if (leitura == -1) { puts("Opcao invalida."); continue; }

        char *fim;
        errno = 0;
        long opcao = strtol(entrada, &fim, 10);
        if (errno != 0 || *fim != '\0' || opcao < 0 || opcao > 6) {
            puts("Opcao invalida.");
            continue;
        }

        switch (opcao) {
            case 1: {
                Pedido novo = {0};
                int resultado = lerPedido(&novo);
                if (resultado == 0) { executando = 0; break; }
                if (resultado == -1) break;
                novo.id = proximoId;
                if (!enfileirar(&fila, novo)) {
                    puts("Sem memoria: pedido nao inserido.");
                    break;
                }
                proximoId++;
                printf("ENQUEUE: %s entrou no fim. Na espera: %zu\n",
                       novo.cantor, fila.tamanho);
                break;
            }
            case 2:
                if (palcoOcupado) {
                    puts("Palco ocupado. Encerre a apresentacao atual primeiro.");
                } else if (!desenfileirar(&fila, &atual)) {
                    puts("Fila vazia. Adicione um pedido primeiro.");
                } else {
                    palcoOcupado = 1;
                    printf("DEQUEUE - No palco: ");
                    mostrarPedido(&atual);
                }
                break;
            case 3: {
                Pedido proximo;
                if (consultarInicio(&fila, &proximo)) {
                    printf("PEEK - Proximo: ");
                    mostrarPedido(&proximo);
                    printf("A fila nao mudou. Na espera: %zu\n", fila.tamanho);
                } else puts("Fila vazia. Nao ha proximo pedido.");
                break;
            }
            case 4:
                mostrarFila(&fila);
                if (palcoOcupado) { printf("No palco: "); mostrarPedido(&atual); }
                else puts("Palco livre.");
                printf("Concluidas: %zu\n", concluidas);
                break;
            case 5:
                if (!palcoOcupado) puts("O palco ja esta livre.");
                else {
                    printf("CONCLUIR: %s terminou. Palco livre.\n", atual.cantor);
                    palcoOcupado = 0;
                    concluidas++;
                }
                break;
            case 6: {
                char resposta[8];
                int confirmacao = lerTexto("Limpar tudo? Digite s para confirmar: ",
                                          resposta, sizeof resposta);
                if (confirmacao == 0) { executando = 0; break; }
                if (confirmacao == 1 && strcmp(resposta, "s") == 0) {
                    liberarFila(&fila);
                    palcoOcupado = 0;
                    concluidas = 0;
                    proximoId = 1;
                    puts("Demonstracao limpa.");
                } else puts("Limpeza cancelada.");
                break;
            }
            case 0:
                executando = 0;
                break;
        }
    }

    liberarFila(&fila);
    puts("Sessao encerrada. Memoria da fila liberada.");
    return 0;
}
