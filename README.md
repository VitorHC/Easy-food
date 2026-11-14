# EasyFood

## Atividade 8 — Foto de perfil

Envie `POST /auth/me/image` com `Authorization: Bearer <token>` e arquivo multipart no campo `image`. O usuário é identificado pelo JWT. Aceita JPEG, PNG e WebP até 5 MB e retorna `{ "user": { "id": 1, "name": "...", "email": "...", "imageUrl": "/uploads/profiles/arquivo.webp" } }`.

Consulte a foto em `GET /auth/me` ou na resposta do login e abra a URL no host da aplicação. Perfis e pratos reutilizam Sharp; uma falha preserva a imagem anterior. Aplique as migrations com `npm run db:migrate` e valide com `npm run test:profile`.

Veja o [roteiro e a validação da atividade 8](docs/atividade-8.md), incluindo a limitação da comparação com o repositório informado.

Projeto acadêmico de catálogo de restaurantes com busca, filtros por categoria e cadastro de restaurantes para usuários autenticados. Os dados ficam salvos no PostgreSQL e permanecem após reiniciar o servidor.

## Tecnologias

- **Interface:** HTML, CSS e JavaScript.
- **Servidor:** Node.js e Express.
- **Banco de dados:** PostgreSQL e Prisma ORM.
- **Autenticação:** JWT e bcryptjs para proteger as senhas.

## Como executar

Você precisa de Node.js com npm, PostgreSQL instalado e em execução e Git para clonar o projeto.

### 1. Baixar e instalar

```bash
git clone https://github.com/VitorHC/Easy-food.git
cd Easy-food
npm ci
```

### 2. Configurar o ambiente

No pgAdmin ou no terminal SQL do PostgreSQL, crie o banco:

```sql
CREATE DATABASE easyfood;
```

Copie `.env.example` para `.env`, caso esse arquivo ainda não exista. Configure suas credenciais locais:

```dotenv
DATABASE_URL="postgresql://postgres:SENHA@localhost:5432/easyfood"
JWT_SECRET="substitua-por-uma-chave-aleatoria-longa"
```

Substitua `postgres` e `SENHA` pelo usuário e senha do seu PostgreSQL. Para gerar uma chave para `JWT_SECRET`, execute:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Preparar as tabelas e iniciar

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm start
```

O seed é opcional: insere restaurantes fictícios, preserva os registros existentes e ignora exemplos com o mesmo nome e categoria. Ele não cria contas de usuário.

Abra [http://localhost:3000](http://localhost:3000). Para usar outra porta, defina `PORT` no `.env`.

O projeto já possui schema e migrations: não execute `prisma init` novamente. As dependências usam Prisma 6.

## Como usar

1. Consulte o catálogo, busque restaurantes e filtre por categoria sem precisar entrar.
2. Clique em **Cadastrar restaurante** e crie uma conta ou faça login.
3. Preencha os dados e envie o cadastro.
4. Use **Sair** para remover o token da sessão local da aba.

As senhas exigem pelo menos 8 caracteres e no máximo 72 bytes.

## API

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

O cadastro de restaurante pode enviar boas-vindas e uma notificação comercial pela API Resend. Configure no `.env` as variáveis `EMAIL_API_KEY`, `EMAIL_FROM` (remetente verificado), `EMAIL_FROM_NAME`, `EMAIL_TEST_TO` e `EMAIL_COMMERCIAL_TO`, disponíveis no `.env.example`. Destinatários vazios desativam notificações; falhas de envio preservam o cadastro. O envio real exige uma conta e credenciais próprias do provedor.

| Método | Rota | Acesso |
|---|---|---|
| GET | `/restaurants/:restaurantId/dishes` | Público |
| POST | `/restaurants/:restaurantId/dishes` | Bearer JWT |
| POST | `/dishes/:dishId/image` | Bearer JWT |

Para cadastrar um prato, envie JSON como `{"name":"Pizza Margherita","description":"Tomate e queijo","price":49.90}`. O restaurante deve existir; o preço deve ser positivo e ter até duas casas decimais.

Para enviar uma imagem, use `multipart/form-data` com o arquivo no campo `image`, deixando o cliente gerar o `Content-Type` com o boundary. São aceitos JPEG, PNG e WebP de até 5 MB. A API corrige orientação, reduz a largura para até 800 pixels e salva em WebP. O caminho retornado em `imageUrl` pode ser aberto pelo navegador. Falhas no upload preservam o prato e permitem tentar novamente.

Execute `npm run test:dishes` para testar pratos, imagens e falhas de notificação com dados temporários no banco do `.env`. Esse teste simula o envio de e-mails. A interface atual cobre restaurantes e autenticação; os endpoints de cardápio da aula podem ser usados pelo Postman ou outro cliente HTTP.

Veja a [validação das sete atividades](docs/validacao-aulas.md) e o [ADR de processamento de imagens](docs/adr/ADR-004-processamento-de-imagens.md). Imagens em `uploads/dishes/` não são versionadas; preserve essa pasta separadamente ao transportar dados de uma instalação.

## Limites do exercício

Não inclui recuperação de senha, confirmação de e-mail, revogação de JWT ou limitação de tentativas. Google Fonts é opcional para a aparência; fontes alternativas mantêm a página utilizável sem conexão.
