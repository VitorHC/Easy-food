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

Envie JSON com Content-Type: application/json. Rotas protegidas usam Authorization: Bearer TOKEN.

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
