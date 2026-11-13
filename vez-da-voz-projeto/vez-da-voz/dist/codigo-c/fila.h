#ifndef FILA_H
#define FILA_H

#include <stddef.h>

/* Em C, cada campo comporta ate 80 bytes de texto e o terminador '\0'. */
#define TEXTO_MAX 80

typedef struct {
    unsigned long id;
    char cantor[TEXTO_MAX + 1];
    char musica[TEXTO_MAX + 1];
    char artista[TEXTO_MAX + 1];
} Pedido;

typedef struct No {
    Pedido valor;
    struct No *proximo;
} No;

typedef struct {
    No *inicio;
    No *fim;
    size_t tamanho;
} Fila;

/* Inicialize antes de usar. Passe ponteiros validos a todas as funcoes. */
void inicializarFila(Fila *fila);
int estaVazia(const Fila *fila);

/* Retorna 1 no sucesso; 0 se malloc falhar. A fila nao muda na falha. */
int enfileirar(Fila *fila, Pedido pedido);

/* Retornam 1 no sucesso; 0 se vazia. Copiam o valor para *pedido. */
int desenfileirar(Fila *fila, Pedido *pedido);
int consultarInicio(const Fila *fila, Pedido *pedido);

/* Libera os nos ainda na espera. Ao final, a fila pode ser reutilizada. */
void liberarFila(Fila *fila);

#endif
