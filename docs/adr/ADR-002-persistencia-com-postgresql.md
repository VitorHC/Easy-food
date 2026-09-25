# ADR-002 — Persistência com PostgreSQL e Prisma
## Status
Implementada no projeto. Registro retrospectivo: 24/09/2026.
## Contexto
Restaurantes precisam permanecer disponíveis quando o processo Node.js reinicia. O modelo possui identificador, nome, categoria e avaliação.
## Alternativas consideradas
- Array: simples, porém volátil.
- Arquivo JSON: persiste, mas exige lidar manualmente com concorrência e integridade.
- SQLite: configuração menor e adequado a protótipos locais.
- PostgreSQL: banco relacional com transações e suporte a múltiplas conexões.
- MongoDB/Firebase: alternativas viáveis, mas mudariam a modelagem e/ou acrescentariam dependência de serviços.
## Decisão
Armazenar Restaurant e User em PostgreSQL. Usar Prisma para acessar os dados e registrar alterações de estrutura com migrations.
## Justificativa
Atende à persistência solicitada e combina com entidades estruturadas e futuras relações. O Prisma centraliza o modelo e reduz SQL repetitivo, mantendo o aprendizado sobre migrations.
## Consequências positivas
Dados sobrevivem ao processo, e-mail único garantido pelo banco e histórico versionado de estrutura.
## Consequências negativas e trade-offs
Exige instalar e operar PostgreSQL, proteger credenciais, gerenciar migrations e manter compatibilidade do cliente gerado. A API depende da disponibilidade do banco; falhas nas operações retornam erro HTTP.
## Critérios de revisão
Reavaliar diante de requisitos de distribuição, custo operacional, desempenho medido ou mudança relevante do modelo de dados.
## Evidência
O teste scripts/check-integration.js cadastrou via API, encerrou o processo servidor, iniciou outro e confirmou o mesmo registro no GET. Registros temporários foram removidos.
