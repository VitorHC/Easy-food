# EasyFood

Projeto acadêmico de restaurantes e cardápios com Node.js, Express, PostgreSQL, Prisma e autenticação JWT. Interface em HTML, CSS e JavaScript.

## Executar

1. Instale Node.js e PostgreSQL e crie o banco: `CREATE DATABASE easyfood;`.
2. Execute `npm ci`.
3. Copie `.env.example` para `.env`, se ainda não existir, e configure `DATABASE_URL` e `JWT_SECRET`.
4. Execute `npm run db:generate` e `npm run db:migrate`.
5. Opcionalmente execute `npm run db:seed` para inserir restaurantes fictícios sem apagar os existentes.
6. Execute `npm start` e abra [http://localhost:3000](http://localhost:3000).

Para gerar JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

O schema e as migrations já existem; não execute prisma init. O projeto usa Prisma 6. Reinicie o servidor após atualizar o cliente Prisma ou o .env. PORT permite mudar a porta.

## Usar

Consulte e filtre restaurantes sem login e abra **Ver cardápio**. Crie uma conta e cadastre seu restaurante para gerenciar pratos: cadastrar, editar, excluir e enviar fotos. **Meu perfil** permite atualizar sua foto. **Sair** encerra a sessão local da aba.

Novos restaurantes pertencem à conta que os criou. Outra conta pode consultar, mas não alterar seus pratos. Restaurantes antigos e exemplos do seed permanecem públicos e sem dono atribuído; cadastre um novo para testar o gerenciamento. Não há associação automática desses dados antigos à primeira conta.

Pratos podem ser cadastrados sem imagem. Depois envie JPEG, PNG ou WebP de até 5 MB. A API corrige orientação, reduz para até 800 pixels de largura e salva WebP. Fotos de perfil pertencem ao usuário do JWT. Falhas de upload preservam o registro e a imagem anterior.

## E-mail

O e-mail é tentado **depois de salvar um restaurante**, não ao criar conta ou prato. Boas-vindas vai ao e-mail de quem cadastrou; a notificação comercial usa EMAIL_COMMERCIAL_TO. O cadastro também registra uma atividade no banco. Falhas secundárias preservam o restaurante.

Usamos a [API Resend](https://resend.com/docs/api-reference/emails/send-email), permitida pela atividade. Configure no .env:

```dotenv
EMAIL_API_KEY="sua-chave-do-resend"
EMAIL_FROM="remetente-verificado@seudominio.com"
EMAIL_FROM_NAME="EasyFood"
EMAIL_COMMERCIAL_TO="email-do-comercial"
```

Sem credenciais o envio falha com registro no terminal e o cadastro continua funcionando. Comercial vazio desativa essa notificação. Nunca envie .env ao GitHub. O professor usa MailerSend; chaves de um provedor não funcionam no outro.

## API

<<<<<<< HEAD
Envie os dados em JSON com `Content-Type: application/json`. Nas rotas protegidas, use `Authorization: Bearer <token>` com o token recebido no login.

| Método | Rota | Função | Acesso |
|---|---|---|---|
| GET | `/restaurants` | Listar restaurantes | Público |
| POST | `/restaurants` | Cadastrar restaurante | JWT |
| POST | `/auth/register` | Criar conta | Público |
| POST | `/auth/login` | Entrar e obter token | Público |
| GET | `/auth/me` | Consultar a conta autenticada | JWT |

Exemplo de corpo para `POST /restaurants`:

```json
{
  "name": "Cantina Roma",
  "category": "Italiana",
  "rating": 4.5
}
```

A avaliação deve ser um número entre 0 e 5. Para criar uma conta, envie `name`, `email` e `password` a `/auth/register`; para entrar, envie `email` e `password` a `/auth/login`.

Respostas principais: `201` para cadastro realizado, `400` para campos inválidos, `401` para acesso não autenticado ou credenciais inválidas e `409` para e-mail já cadastrado.

## Estrutura

```text
public/          HTML, CSS e JavaScript da interface
src/
  app.js         Configuração do Express e das rotas
  database/      Cliente Prisma
  modules/
    auth/        Rotas, controllers e services de autenticação
    restaurants/ Rotas, controllers e services de restaurantes
prisma/          Schema, migrations e seed
scripts/         Verificação de integração
tests/           Testes HTTP
docs/            Missões e decisões arquiteturais
server.js        Inicialização do servidor
```

O fluxo principal é: **rota → controller → service → Prisma → PostgreSQL**.

Veja o [acompanhamento das missões](docs/atividade.md) e as [decisões arquiteturais](docs/adr/). O arquivo `teste.js` é um protótipo anterior; use `server.js` para executar a versão atual.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm start` | Inicia a aplicação |
| `npm run db:generate` | Gera o cliente Prisma |
| `npm run db:migrate` | Aplica as migrations no ambiente de desenvolvimento |
| `npm run db:seed` | Insere restaurantes de exemplo |
| `npx prisma studio` | Abre a interface de inspeção do banco |
| `npm test` | Verifica página, autenticação obrigatória e validação, sem gravar no banco |
| `npm run test:integration` | Verifica cadastro, login e persistência após reiniciar um processo servidor |

O teste de integração exige o banco do `.env`. Ele cria dados temporários e remove apenas os registros que criou.

## Banco de dados e entrega no Git

O repositório inclui os arquivos para recriar o banco: `prisma/schema.prisma`, `prisma/migrations/` e `prisma/seed.js`. Quem baixar o projeto configura seu próprio PostgreSQL e segue os passos de instalação acima.

Pelas orientações disponíveis em `docs/atividade.md`, devem ser mantidos o `package-lock.json` e as migrations. A revisão dos sete materiais da aula também não encontrou exigência de backup com os dados do banco. Caso o enunciado do professor peça um dump ou exportação, essa entrega precisa ser preparada separadamente.

- **Incluir no Git:** código, documentação, `package.json`, `package-lock.json`, `.env.example`, schema, migrations e seed.
- **Não incluir:** `.env` com credenciais, `node_modules/` e dados reais de usuários. O `.gitignore` já ignora `.env` e `node_modules/`.

Antes de entregar, execute os testes, demonstre o cadastro e a consulta de restaurantes, confira as tabelas no Prisma Studio e revise as justificativas das decisões arquiteturais.

## E-mail e cardápio (atividades 6 e 7)

O cadastro de restaurante dispara notificações pelo **MailerSend**, usando o SDK oficial e as variáveis de chave/domínio do professor. O destinatário é escolhido no `.env`, independente do usuário logado:

```dotenv
MAILER_API="sua-chave-do-mailersend"
DOMAIN_MAIL="seu-dominio-autorizado"
MAILER_FROM=""
EMAIL_FROM_NAME="EasyFood"
EMAIL_TO="destinatario-escolhido@exemplo.com"
EMAIL_COMMERCIAL_TO=""
```

`MAILER_FROM` vazio usa `no-reply@DOMAIN_MAIL`, como no professor. Para outro endereço remetente autorizado, preencha `MAILER_FROM` com o endereço completo. `EMAIL_TO` recebe boas-vindas; `EMAIL_COMMERCIAL_TO` recebe o segundo aviso. Deixe um destinatário vazio para desativar somente essa notificação. Não há exigência no código de que o destinatário seja o usuário logado ou a conta do provedor.

Crie a chave no MailerSend e configure um domínio ou identidade de remetente autorizada conforme sua conta. Contas/domínios de teste podem ter limites de destinatários impostos pelo provedor. Escolher um e-mail no projeto não remove essas restrições. Chaves e remetentes do Resend não são usados. Reinicie `npm start` após salvar o `.env`.

Os envios acontecem após salvar um restaurante. Uma falha não desfaz o cadastro. O aceite HTTP 202 significa que o MailerSend recebeu a solicitação; confirme a entrega na caixa de entrada ou no painel do provedor. Nunca versione o `.env`.

Documentação: [MailerSend — envio de e-mail](https://developers.mailersend.com/api/v1/email).
=======
Envie JSON com Content-Type: application/json. Rotas protegidas usam Authorization: Bearer TOKEN.
>>>>>>> 19ed80166fd21a947dd7279905826d12644088b9

| Método | Rota | Acesso |
|---|---|---|
| GET | /restaurants | Público |
| POST | /restaurants | JWT |
| POST | /auth/register | Público |
| POST | /auth/login | Público |
| GET | /auth/me | JWT |
| POST | /auth/me/image | JWT; próprio perfil |
| GET | /restaurants/:restaurantId/dishes | Público |
| POST | /restaurants/:restaurantId/dishes | JWT; proprietário |
| GET | /dishes/:dishId | Público |
| PUT | /dishes/:dishId | JWT; proprietário |
| DELETE | /dishes/:dishId | JWT; proprietário |
| POST | /dishes/:dishId/image | JWT; proprietário |

Restaurante: `{"name":"Cantina Roma","category":"Italiana","rating":4.5}`. Avaliação entre 0 e 5.

Prato (POST/PUT): `{"name":"Pizza","category":"Pizza","description":"Tomate e queijo","price":49.90}`. Preço numérico não negativo, até duas casas decimais.

Uploads recebem multipart/form-data com arquivo no campo image. Deixe o cliente gerar o Content-Type com boundary. As respostas retornam imageUrl, acessível no host da aplicação. Perfil retorna `{ "user": { ... } }`. Login e consulta de perfil também retornam imageUrl, sem senha.

Respostas: 201 criado, 200 consultado/atualizado, 204 excluído, 400 inválido, 401 sem autenticação, 403 sem propriedade, 404 inexistente, 409 e-mail repetido e 413 arquivo grande.

## Organização e testes

- public/: interface.
- src/modules/: auth, restaurants, dishes e shared (imagens, e-mail e atividades).
- src/database/: cliente Prisma.
- prisma/: schema, migrations e seed.
- docs/: acompanhamento e decisões arquiteturais.
- server.js inicia; src/app.js configura o Express. teste.js é um protótipo antigo.

Execute `npm test`, `npm run test:integration`, `npm run test:dishes` e `npm run test:profile`. Os testes de integração exigem o banco do .env e removem os próprios dados temporários. E-mails são simulados/desativados nesses testes. `npx prisma studio` permite observar as tabelas.

Veja a [atividade 8 e roteiro de demonstração](docs/atividade-8.md), [atividades anteriores](docs/validacao-aulas.md) e [ADRs](docs/adr/).

## Entrega

Versione código, documentação, package-lock.json, .env.example, schema, migrations e seed. Os materiais não exigem dump do PostgreSQL. Quem baixar recria as tabelas com migrations. Não versione .env, node_modules ou imagens enviadas. Preserve uploads separadamente se transportar os dados de uma instalação.

Não inclui recuperação de senha, confirmação de e-mail, revogação de JWT ou limitação de tentativas. O armazenamento local de imagens precisa de volume persistente em hospedagem. O processamento dentro da API é uma escolha para o contexto acadêmico, documentada no ADR-004.
