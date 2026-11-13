#include "fila.h"
#include <stdlib.h>

void inicializarFila(Fila *fila) {
    fila->inicio = NULL;
    fila->fim = NULL;
    fila->tamanho = 0;
}

int estaVazia(const Fila *fila) {
    return fila->tamanho == 0;
}

/* ENQUEUE: insere no fim em O(1). */
int enfileirar(Fila *fila, Pedido pedido) {
    No *novo = malloc(sizeof *novo);
    if (novo == NULL) return 0;

    novo->valor = pedido;
    novo->proximo = NULL;

    if (estaVazia(fila)) {
        fila->inicio = novo;
    } else {
        fila->fim->proximo = novo;
    }

    fila->fim = novo;
    fila->tamanho++;
    return 1;
}

/* DEQUEUE: remove do inicio em O(1), preservando a ordem FIFO. */
int desenfileirar(Fila *fila, Pedido *pedido) {
    if (estaVazia(fila)) return 0;

    No *removido = fila->inicio;
    *pedido = removido->valor;
    fila->inicio = removido->proximo;
    fila->tamanho--;

    if (estaVazia(fila)) fila->fim = NULL;

    /* O pedido foi copiado; o no antigo ja pode ser liberado. */
    free(removido);
    return 1;
}

/* PEEK: copia o primeiro pedido sem remover, em O(1). */
int consultarInicio(const Fila *fila, Pedido *pedido) {
    if (estaVazia(fila)) return 0;
    *pedido = fila->inicio->valor;
    return 1;
}

/* Percurso O(n). Libera toda a memoria da fila antes de sair ou limpar. */
void liberarFila(Fila *fila) {
    No *atual = fila->inicio;
    while (atual != NULL) {
        No *proximo = atual->proximo;
        free(atual);
        atual = proximo;
    }
    inicializarFila(fila);
}
