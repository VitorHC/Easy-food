# Atividade 8 — Evoluindo a EasyFood

## Comparação com o repositório informado

O endereço enviado foi normalizado para https://github.com/VitorHC/Easy-food.git. Em 13/11/2026, o HEAD remoto era 477a8b1ac4264868be00317e7c7a5cc06a53a842, igual ao HEAD local antes das implementações. Essa revisão não contém o módulo dishes. A identificação dos arquivos e da causa do bug específico do professor depende do endereço ou commit que contém sua correção.

O cadastro local foi validado: a rota chama o controller, que valida restaurantId, nome, descrição e preço. O service verifica o restaurante e grava restaurantId como chave estrangeira. O teste confirma 201, persistência no PostgreSQL e vínculo com o restaurante solicitado. Isso comprova o comportamento local, sem substituir a comparação histórica pedida.

## Implementação

- User.imageUrl opcional, com migration aditiva.
- POST /auth/me/image exige JWT antes do Multer e recebe arquivo no campo image.
- O usuário vem exclusivamente de req.user.id, obtido do token; um ID enviado pelo cliente não escolhe o proprietário.
- Cadastro, login e GET /auth/me retornam imageUrl sem expor senha.
- Auth e dishes reutilizam image.service.js e upload.middleware.js.
- Imagens ficam em uploads/profiles ou uploads/dishes, publicadas por /uploads e ignoradas pelo Git.
- JPEG, PNG e WebP são aceitos até 5 MB. Sharp valida o conteúdo, corrige orientação, limita largura a 800 pixels e converte para WebP com qualidade 80.
- A foto anterior é removida após salvar o novo caminho. Falha no processamento preserva a foto anterior; falha no banco limpa o arquivo novo.

## Demonstração

1. Configure o .env e execute npm ci, npm run db:generate, npm run db:migrate e npm start.
2. Cadastre uma conta em POST /auth/register e obtenha o token em POST /auth/login.
3. Use Authorization: Bearer TOKEN nas operações protegidas.
4. Cadastre um prato em POST /restaurants/ID_EXISTENTE/dishes com JSON: {"name":"Pizza","description":"Tomate e queijo","price":49.90}.
5. Envie multipart/form-data para POST /auth/me/image com arquivo no campo image. Deixe o cliente gerar o Content-Type com boundary.
6. Consulte GET /auth/me com o token e abra user.imageUrl no host da aplicação.
7. Envie arquivo para POST /dishes/ID_DO_PRATO/image. Consulte GET /restaurants/ID_EXISTENTE/dishes e abra imageUrl.

A interface visual atual cobre catálogo e autenticação. Os endpoints desta atividade podem ser demonstrados pelo Postman ou outro cliente HTTP.

## Verificação

npm test, npm run test:profile, npm run test:dishes e npm run test:integration passaram. As migrations foram aplicadas no PostgreSQL local. Os testes removem seus próprios registros e imagens.

O teste de perfil verifica vínculo com o usuário do JWT mesmo com userId de outra conta na query, isolamento entre contas, ausência de senha, caminho no perfil/login, URL pública, WebP otimizado e substituição. Também verifica 401 sem token ou com conta inexistente, 400 sem arquivo ou com conteúdo inválido e 413 acima de 5 MB. Uma falha preserva a foto anterior.

O teste de pratos confirma cadastro com 201, vínculo com o restaurante, consulta, upload protegido, imagem acessível e 404 para prato inexistente. Os testes anteriores confirmam autenticação e persistência após reiniciar. Não houve envio real de e-mails nestes testes.

## Reflexões arquiteturais

O serviço compartilhado evita duplicar processamento e armazenamento. O Controller recebe HTTP, valida entradas e devolve respostas; o Service coordena as entidades, o processamento e a persistência. As rotas apenas combinam endpoints e middlewares.

O JWT autentica antes do upload; usar o ID do token impede escolher livremente outro perfil. A autorização de propriedade dos restaurantes e pratos permanece uma evolução adicional.

Falhas de processamento retornam erro e preservam os registros e a imagem anterior. A organização modular permite adicionar funcionalidades com mudanças localizadas.

## Entrega

Versionar código, documentação, schema e migrations. Credenciais, node_modules e imagens enviadas ficam fora do Git. A análise histórica da correção do professor permanece pendente do endereço correto.
