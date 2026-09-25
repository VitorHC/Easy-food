# ADR-001 — Armazenar restaurantes em memória
## Status
Decisão histórica do exercício, substituída pelo ADR-002. Registro retrospectivo preparado em 24/09/2026 a partir da sequência das aulas; não comprova a execução histórica dos testes.
## Contexto
A primeira versão precisava validar consulta e cadastro com GET e POST /restaurants sem infraestrutura adicional.
## Alternativas consideradas
Array em memória, arquivo JSON, SQLite, PostgreSQL, MongoDB e Firebase.
## Decisão
Utilizar um array na primeira etapa didática.
## Justificativa
Permite aprender o fluxo HTTP e validar o protótipo com pouca configuração.
## Consequências positivas
Implementação rápida, ausência de servidor de banco e facilidade para experimentar.
## Consequências negativas e trade-offs
Os registros se perdem ao encerrar o processo. Instâncias distintas não compartilham os dados. Não há transações, relacionamentos nem integridade oferecidos por um banco.
## Critérios de revisão
Necessidade de sobreviver a reinicializações, compartilhar dados ou modelar relacionamentos. A necessidade de persistência motivou o ADR-002.
