# EasyFood â€” Acompanhamento das missÃµes
## MissÃ£o 1: cadastro e decisÃ£o
O cadastro usa POST /restaurants com JSON contendo name, category e rating. Express interpreta o corpo, a rota chama o controller e o service grava. Hoje o armazenamento Ã© PostgreSQL; o estÃ¡gio em memÃ³ria estÃ¡ descrito no ADR-001. O novo requisito acrescentou uma operaÃ§Ã£o no conector HTTP; a persistÃªncia acrescentou Prisma e banco ao desenho.
## MissÃ£o 2: limitaÃ§Ã£o da memÃ³ria
Um array pertence ao processo: ao reiniciÃ¡-lo, os cadastros nÃ£o permanecem. O ADR-001 documenta a decisÃ£o inicial e seus critÃ©rios de revisÃ£o. O teste histÃ³rico da versÃ£o em memÃ³ria nÃ£o foi repetido, pois o projeto jÃ¡ evoluiu.
## MissÃ£o 3: persistÃªncia
PostgreSQL guarda dados fora do processo Node.js. Prisma conecta as operaÃ§Ãµes ao modelo e Ã s migrations. Em indisponibilidade do banco, a aplicaÃ§Ã£o nÃ£o consegue listar ou gravar e retorna erro; a interface permite tentar a consulta novamente. As vantagens e custos estÃ£o no ADR-002.
## MissÃ£o 4: organizaÃ§Ã£o
server.js inicia o servidor; app.js configura middlewares, estÃ¡ticos e rotas; routes mapeiam endpoints; controllers recebem req/res e validam; services executam operaÃ§Ãµes; database disponibiliza o cliente. Evitar req/res nos services permite reutilizaÃ§Ã£o fora de HTTP. A separaÃ§Ã£o melhora manutenÃ§Ã£o e acrescenta navegaÃ§Ã£o entre arquivos. Auth e restaurants sÃ£o mÃ³dulos irmÃ£os. O ADR-003 compara as opÃ§Ãµes e explica o JWT.
## Arquitetura atual
```text
Navegador (public/)
        | HTTP / JSON + Bearer token no cadastro
server.js -> src/app.js
                  |
           src/modules/
           auth/ + restaurants/
           Routes -> Controller -> Service
                                      |
                              src/database/prisma.js
                                      |
                                  PostgreSQL
```
## VerificaÃ§Ã£o realizada em 24/09/2026
- PÃ¡gina inicial servida por Express.
- GET consultando restaurantes existentes.
- POST sem token rejeitado com 401.
- Entradas invÃ¡lidas rejeitadas com 400.
- Registro de conta, rejeiÃ§Ã£o de e-mail duplicado e senha incorreta.
- Login, recuperaÃ§Ã£o de sessÃ£o e POST autenticado.
- PersistÃªncia confirmada apÃ³s encerrar e iniciar outro processo servidor.
- Conta e restaurante temporÃ¡rios removidos ao final.
## ConferÃªncia pessoal antes de entregar
- Revisar a justificativa dos ADRs e explicar as decisÃµes na apresentaÃ§Ã£o.
- Abrir `npx prisma studio` e observar Restaurant e User: essa etapa visual ainda deve ser feita por vocÃª.
- Demonstrar o cadastro na interface e o GET no navegador.
- NÃ£o entregar .env nem node_modules. Manter package-lock.json e migrations.
