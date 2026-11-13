# Prévias de até 15 segundos

Adicionado em 10/11/2026 a pedido do usuário. O botão de prévia na fila é uma consulta. No palco, a prévia também acompanha Chamar próximo e o avanço por Encerrar apresentação, sempre respeitando FIFO.

## Catálogo

Ao abrir uma prévia ou chamar um pedido sem gravação escolhida, são pesquisados apenas título e artista no catálogo brasileiro iTunes. O nome do participante não é enviado.
A integração usa JSONP, documentado pela Apple para buscas entre sites, com prazo de 12 segundos. A consulta ocorre sob ação do usuário, não automaticamente para toda a fila.
Só são exibidas gravações com título-base e artista correspondentes e URLs HTTPS do provedor. Os metadados distinguem versões ao vivo, remasterizadas e outras gravações.
A pessoa escolhe uma gravação e pode visitar a página dela na iTunes Store por meio do badge oficial. A amostra promocional é transmitida diretamente pelo provedor, com atribuição; o projeto não inclui arquivos de músicas comerciais no ZIP nem disponibiliza seu download.
Apenas metadados de buscas bem-sucedidas ficam em cache na memória da sessão; o aplicativo não salva o áudio do catálogo.

## Reprodução

Há um único elemento audio para todas as prévias. O teto é de 15 segundos por reprodução, aplicado por temporizador e pelo avanço da mídia.
Pausar e retomar mantém o tempo já ouvido. Trocar de gravação interrompe a anterior. Fechar a janela ou sair da página para o áudio; ocultar a aba pausa a prévia.
A reprodução começa ao clicar em Chamar próximo, ao encerrar e avançar para outro pedido, ou ao escolher Ouvir na janela de prévias. Adicionar e consultar um pedido não iniciam áudio. Pausar mantém o mesmo pedido no palco; encerrar interrompe o áudio antes da próxima chamada. Navegadores que bloqueiem play após uma busca podem exigir o botão Tocar prévia.
Prévias do catálogo são trechos escolhidos pelo provedor, sem garantia de corresponder ao início da música completa. Arquivos menores que 15 segundos terminam ao chegar ao fim.

## Áudio local

Escolher áudio do dispositivo usa um blob URL temporário, associado ao ID do pedido nesta aba. Não ocorre upload ou compartilhamento com outras pessoas.
As associações se perdem ao recarregar, limpar ou fechar a sessão. As URLs temporárias são revogadas ao substituir um arquivo e ao limpar a demonstração.
Esse caminho permite testar uma música fora do catálogo, sem tornar a fila dependente do serviço externo.

## Fontes técnicas

- Busca, parâmetros e JSONP: https://performance-partners.apple.com/search-api
- Uso das amostras promocionais: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
- Badge oficial e identidade: https://marketing.services.apple/itunes-identity-guidelines
- Asset oficial: https://marketing.services.apple/api/storage/images/64e3de01fe821600071349d4/en-us-large@1x.png

As prévias estão acompanhadas do link da gravação, do badge oficial e da atribuição ao iTunes. A fonte C do EP permanece focada no algoritmo FIFO; a reprodução é uma função da interface web.

## Seleção e buscas pendentes

Uma escolha de gravação feita na janela é reutilizada ao chamar o pedido. Sem seleção, é usada a primeira correspondência validada de título/artista. Há link e atribuição da gravação também no palco.

Trocar, encerrar, limpar ou abrir outra seleção invalida o início pendente do palco. Uma resposta lenta da música anterior não pode voltar a tocar depois que outro participante foi chamado.
