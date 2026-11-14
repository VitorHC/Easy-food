# ADR-004 — Processar imagens dentro da API

## Status e data
Aceita — 12/11/2026.

## Contexto
Os pratos do cardápio precisam de imagens. Arquivos grandes aumentam o tempo de transferência e o consumo de dados. A aplicação acadêmica tem baixo volume e já possui uma API Node.js.

## Alternativas consideradas
1. Processamento dentro da API existente.
2. Serviço independente dedicado a imagens.
3. Serverless/FaaS com armazenamento externo.

## Decisão e justificativa
Receber imagens com Multer em memória e processar com Sharp no módulo compartilhado da API. Corrigir orientação, limitar largura a 800 pixels sem ampliar e converter para WebP com qualidade 80. Armazenar arquivos em uploads/dishes e apenas o caminho no PostgreSQL. A solução reutiliza infraestrutura e mantém a implementação simples neste contexto.

## Consequências positivas
Menos componentes, configuração e custo operacional inicial. O serviço pode ser reutilizado por outros módulos. O prato permanece salvo se o upload falhar.

## Limitações e trade-offs
O processamento disputa CPU e memória com outras requisições. O upload aceita até 5 MB e o decodificador limita imagens a 40 milhões de pixels. O armazenamento local exige volume persistente e não é compartilhado entre instâncias. As imagens são públicas. O JWT autentica o cadastro e upload, mas ainda não há vínculo de propriedade entre usuário e restaurante.

## Critérios de revisão
Reavaliar armazenamento externo, filas, serviço separado ou FaaS quando houver múltiplas instâncias, disco temporário, aumento de volume ou impacto na latência da API.
