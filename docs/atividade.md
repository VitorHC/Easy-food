# EasyFood — Acompanhamento das missões
## Missão 1: cadastro e decisão
O cadastro usa POST /restaurants com JSON contendo name, category e rating. Express interpreta o corpo, a rota chama o controller e o service grava. Hoje o armazenamento é PostgreSQL; o estágio em memória está descrito no ADR-001. O novo requisito acrescentou uma operação no conector HTTP; a persistência acrescentou Prisma e banco ao desenho.
## Missão 2: limitação da memória
Um array pertence ao processo: ao reiniciá-lo, os cadastros não permanecem. O ADR-001 documenta a decisão inicial e seus critérios de revisão. O teste histórico da versão em memória não foi repetido, pois o projeto já evoluiu.
## Missão 3: persistência
PostgreSQL guarda dados fora do processo Node.js. Prisma conecta as operações ao modelo e às migrations. Em indisponibilidade do banco, a aplicação não consegue listar ou gravar e retorna erro; a interface permite tentar a consulta novamente. As vantagens e custos estão no ADR-002.
## Missão 4: organização
server.js inicia o servidor; app.js configura middlewares, estáticos e rotas; routes mapeiam endpoints; controllers recebem req/res e validam; services executam operações; database disponibiliza o cliente. Evitar req/res nos services permite reutilização fora de HTTP. A separação melhora manutenção e acrescenta navegação entre arquivos. Auth e restaurants são módulos irmãos. O ADR-003 compara as opções e explica o JWT.
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
## Verificação realizada em 24/09/2026
- Página inicial servida por Express.
- GET consultando restaurantes existentes.
- POST sem token rejeitado com 401.
- Entradas inválidas rejeitadas com 400.
- Registro de conta, rejeição de e-mail duplicado e senha incorreta.
- Login, recuperação de sessão e POST autenticado.
- Persistência confirmada após encerrar e iniciar outro processo servidor.
- Conta e restaurante temporários removidos ao final.
## Conferência pessoal antes de entregar
- Revisar a justificativa dos ADRs e explicar as decisões na apresentação.
- Abrir `npx prisma studio` e observar Restaurant e User: essa etapa visual ainda deve ser feita por você.
- Demonstrar o cadastro na interface e o GET no navegador.
- Não entregar .env nem node_modules. Manter package-lock.json e migrations.

## Evolução até a atividade 7
Consulte [a validação dos materiais](validacao-aulas.md) para os módulos de e-mail e cardápio, os testes executados e as etapas externas pendentes.
