#include "fila.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>

static Pedido criarPedido(unsigned long id, const char *cantor) {
    Pedido pedido = {0};
    pedido.id = id;
    snprintf(pedido.cantor, sizeof pedido.cantor, "%s", cantor);
    snprintf(pedido.musica, sizeof pedido.musica, "Musica %lu", id);
    snprintf(pedido.artista, sizeof pedido.artista, "Artista");
    return pedido;
}

int main(void) {
    Fila fila;
    Pedido saida = {0};
    inicializarFila(&fila);
    assert(estaVazia(&fila));
    assert(!desenfileirar(&fila, &saida));
    assert(!consultarInicio(&fila, &saida));
    assert(fila.inicio == NULL && fila.fim == NULL);

    assert(enfileirar(&fila, criarPedido(1, "Ana")));
    assert(enfileirar(&fila, criarPedido(2, "Bruno")));
    No *inicioAntes = fila.inicio;
    assert(consultarInicio(&fila, &saida));
    assert(saida.id == 1 && strcmp(saida.cantor, "Ana") == 0);
    assert(fila.tamanho == 2 && fila.inicio == inicioAntes);
    assert(desenfileirar(&fila, &saida) && saida.id == 1);
    assert(enfileirar(&fila, criarPedido(3, "Carla")));
    assert(desenfileirar(&fila, &saida) && saida.id == 2);
    assert(desenfileirar(&fila, &saida) && saida.id == 3);
    assert(fila.tamanho == 0 && fila.inicio == NULL && fila.fim == NULL);

    /* Reutilizacao e pedidos com o mesmo nome, IDs diferentes. */
    assert(enfileirar(&fila, criarPedido(4, "Ana")));
    assert(fila.inicio == fila.fim);
    assert(enfileirar(&fila, criarPedido(5, "Ana")));
    assert(desenfileirar(&fila, &saida) && saida.id == 4);
    assert(desenfileirar(&fila, &saida) && saida.id == 5);

    for (unsigned long i = 0; i < 5000; i++) {
        assert(enfileirar(&fila, criarPedido(i, "Teste")));
    }
    for (unsigned long i = 0; i < 5000; i++) {
        assert(desenfileirar(&fila, &saida) && saida.id == i);
    }
    assert(estaVazia(&fila));

    assert(enfileirar(&fila, criarPedido(6, "Descartado")));
    liberarFila(&fila);
    assert(fila.inicio == NULL && fila.fim == NULL && fila.tamanho == 0);
    liberarFila(&fila); /* Limpar uma fila vazia tambem e valido. */
    assert(enfileirar(&fila, criarPedido(7, "Reinicio")));
    assert(desenfileirar(&fila, &saida) && saida.id == 7);
    liberarFila(&fila);

    puts("OK: fila C - vazio, FIFO, peek, ultimo no, reutilizacao, duplicatas, volume e liberacao.");
    return 0;
}
