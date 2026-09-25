# EasyFood
Projeto acadêmico de catálogo de restaurantes com Express, PostgreSQL, Prisma e autenticação JWT. Interface própria em verde e terracota com busca, categorias e cadastro autenticado.

## Executar
1. Instale Node.js e PostgreSQL e crie o banco easyfood.
2. Execute `npm ci`.
3. Copie `.env.example` para `.env` apenas se ainda não existir e configure DATABASE_URL e JWT_SECRET. Para gerar uma chave: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
4. Execute `npm run db:generate` e `npm run db:migrate`.
5. Opcionalmente execute `npm run db:seed` uma vez para inserir exemplos (repetir pode duplicar dados).
6. Execute `npm start` e abra http://localhost:3000.

Não execute prisma init novamente: o projeto já possui schema e migrations. A versão Prisma 6 está alinhada ao formato atual do schema.

## Usar
Consulte e filtre restaurantes sem login. Clique em Cadastrar restaurante, crie uma conta ou entre e publique o restaurante. A sessão fica na aba; Sair remove o token local. Novas senhas exigem 8 caracteres e no máximo 72 bytes.

## API
| Método | Caminho | Acesso |
|---|---|---|
| GET | /restaurants | Público |
| POST | /restaurants | Bearer JWT |
| POST | /auth/register | Público |
| POST | /auth/login | Público |
| GET | /auth/me | Bearer JWT |

Exemplo do POST: `{"name":"Cantina Roma","category":"Italiana","rating":4.5}`.
Avaliação: número entre 0 e 5. Cadastro retorna 201; campos inválidos 400; acesso não autenticado 401; e-mail repetido 409.

## Estrutura
- public/: HTML, CSS e JavaScript do navegador.
- src/modules/restaurants e src/modules/auth: rotas, controllers e services.
- src/database/prisma.js: cliente de banco.
- prisma/: schema, migrations e seed.
- docs/adr/: decisões arquiteturais.
- docs/atividade.md: respostas, arquitetura e verificação das missões.
- teste.js: protótipo anterior, mantido como referência; use server.js para executar a versão atual.

## Testes
`npm test`: página, autenticação obrigatória e validação, sem gravar no banco.
`npm run test:integration`: requer o banco do .env; cria dados temporários, testa cadastro/login e persistência após reiniciar um processo próprio, e remove apenas os registros criados.
`npx prisma studio`: inspeção manual do banco.

## Limites do exercício
Não inclui recuperação de senha, confirmação de e-mail, revogação de JWT ou limitação de tentativas. Google Fonts é opcional para a aparência; fontes locais de fallback mantêm a página utilizável sem conexão. Nunca versione .env.
