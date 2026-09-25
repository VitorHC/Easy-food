# ADR-003 — Camadas e autenticação com JWT
## Status
Implementada. Justificativa proposta para a entrega em 24/09/2026; revisar e explicar com suas próprias palavras.
## Contexto
A API precisa separar HTTP, operações de domínio e acesso ao banco. A missão 4 pede organização, comparação de autenticação e justificativa; a implementação do login é opcional.
## Alternativas consideradas
- JWT local: permite exercitar senha com hash, login, assinatura e validação; exige gerenciar a chave e a expiração.
- Sessão no servidor: facilita revogação imediata, mas exige armazenamento e configuração de cookies.
- AWS Cognito: transfere parte da gestão de identidade a um serviço; adiciona configuração, dependência externa e custos a avaliar.
- Login com Google: dispensa senha própria nesse fluxo; exige configurar OAuth, consentimento e callbacks, além de vincular identidades.
Esta comparação é conceitual; não representa implantação nem avaliação de preços dos serviços externos.
## Decisão
Manter o monólito organizado em app, routes, controllers, services e database. Usar JWT no exercício, senhas com bcrypt e expiração de um dia. GET de restaurantes permanece público; POST requer Bearer token.
## Justificativa
Permite praticar autenticação dentro do ambiente já existente sem configurar provedor externo. Services não dependem de req/res; controllers traduzem entradas e saídas HTTP; routes direcionam requisições; database disponibiliza o Prisma.
## Consequências positivas
Responsabilidades explícitas, reaproveitamento das operações e proteção do cadastro. A interface oferece registro, login e envio do token.
## Consequências negativas e trade-offs
Mais arquivos e indireção. É preciso cuidar de senhas, chave e tokens. O token fica em sessionStorage e pode ser acessado por JavaScript da página; valores do banco são inseridos com textContent. Logout remove o token local, mas não revoga cópias emitidas. Não há recuperação de senha, confirmação de e-mail ou limitação de tentativas; esses pontos ficam para evolução antes de uso público.
## Compatibilidade com a aula
A separação em camadas preserva GET e POST. Exigir autenticação no POST é uma evolução adicional, não apenas refatoração: clientes antigos precisam fazer login. A interface foi atualizada para esse contrato.
## Critérios de revisão
Uso público, recuperação de contas, revogação imediata, múltiplos serviços ou exigência de provedor institucional.
