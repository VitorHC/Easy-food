# Validação dos materiais de aula

Materiais consultados: [pasta compartilhada](https://drive.google.com/drive/folders/1VsdKE1bAQT59D20Fj50N_r3IRXEO_mmR). Comparação realizada em 12/11/2026, lendo o documento de cada uma das sete pastas.

| Atividade | Requisitos | Resultado |
|---|---|---|
| 1 | Consulta e cadastro de restaurantes; reflexão sobre a arquitetura | Já implementados; respostas em atividade.md |
| 2 | Limitação da memória, ADR inicial e proposta de persistência | ADR-001 e acompanhamento histórico existentes; o código atual usa PostgreSQL |
| 3 | PostgreSQL, Prisma, seed, migrations, persistência e ADR | Já implementados; teste de persistência após reiniciar passou |
| 4 | Database, Service, Controller, Routes e decisão de autenticação | Já implementados; ADR-003 registra JWT e alternativas |
| 5 | Registro, hash de senha, login, JWT, /auth/me e POST protegido | Já implementados; testes de autenticação passaram |
| 6 | Serviço genérico de e-mail, dois conteúdos e falha secundária isolada | Implementado com API MailerSend; integração HTTP testada com simulação, credenciais e entrega real pendentes |
| 7 | Dish, relação 1:N, cadastro/consulta, upload, otimização e ADR | Implementados; migration aplicada e integração com PostgreSQL/Sharp validada |

## Atividade 6

O serviço shared/email.service.js expõe sendEmail com destinatário, nome, assunto, header, body e footer. O HTML escapa textos para que nomes de restaurantes não sejam interpretados como marcação. O cadastro grava primeiro e depois tenta as notificações de boas-vindas e comercial, separadamente. Uma falha não impede o retorno 201 nem desfaz a gravação.

Configurar no .env: MAILER_API, DOMAIN_MAIL (domínio autorizado no MailerSend), MAILER_FROM (opcional), EMAIL_FROM_NAME, EMAIL_TO e EMAIL_COMMERCIAL_TO. Destinatário vazio desativa a respectiva notificação. Não foram criadas contas externas nem enviadas mensagens reais durante esta validação. Para concluir a etapa externa da aula, fornecer credenciais válidas e confirmar o recebimento em um endereço de teste autorizado.

Documentação técnica: [envio pela API MailerSend](https://developers.mailersend.com/api/v1/email).

## Atividade 7

- POST /restaurants/:restaurantId/dishes exige JWT e recebe name, description e price.
- GET /restaurants/:restaurantId/dishes é público.
- POST /dishes/:dishId/image exige JWT antes de receber o arquivo multipart no campo image.
- IDs e campos são validados. Restaurante/prato inexistente retorna 404.
- JPEG, PNG e WebP são aceitos até 5 MB; Sharp também valida a decodificação.
- Arquivo ausente, formato inválido ou imagem corrompida retorna 400; excesso de tamanho retorna 413.
- A imagem otimizada é publicada em /uploads/dishes e seu caminho é salvo em imageUrl.
- Substituir a imagem remove o arquivo anterior; falha de gravação no banco remove a nova imagem.
- Falha no upload mantém o prato existente. ADR-004 registra contexto, alternativas e consequências.

Comparação reproduzível feita por npm run test:dishes:

| Imagem | Formato | Tamanho | Dimensões |
|---|---|---|---|
| Original sintética | PNG | 23.545 bytes | 1600 × 1000 |
| Otimizada | WebP | 814 bytes | 800 × 500 |

Neste exemplo houve redução de tamanho e dimensões, o que reduz transferência e consumo de dados. Isso não garante que todo arquivo ficará menor: o resultado depende da imagem e compressão originais. O teste verifica a imagem por HTTP e remove seus próprios registros e arquivos ao terminar.

## Verificações executadas

npm test, npm run test:integration e npm run test:dishes passaram. A migration add_dishes foi aplicada ao PostgreSQL local. Os testes cobrem JWT, validação, persistência de restaurantes após reinício, pratos associados, duas falhas de notificação sem perda de cadastro, upload válido, acesso público à imagem, substituição de arquivo e falhas de upload.

## Entrega e banco

Os sete materiais pedem schema, migrations, implementação, testes e registros de decisões. Não foi encontrada exigência de enviar dump ou diretório de dados do PostgreSQL no Git. Versionar schema, migrations e seed permite recriar o banco. Credenciais e imagens enviadas ficam fora do Git. Os arquivos em uploads precisam de armazenamento/backup próprio caso seja necessário preservar as imagens em outra instalação.

As observações manuais do Prisma Studio e a apresentação pessoal das decisões continuam sendo atividades do aluno; testes automatizados não substituem essa demonstração.

## Migração para MailerSend
O serviço passou a usar o SDK oficial MailerSend, como no professor. EMAIL_TO escolhe o destinatário de boas-vindas independentemente do login; EMAIL_COMMERCIAL_TO escolhe o segundo destinatário. Configurações antigas do Resend foram removidas do exemplo. Os testes interceptam a chamada HTTP do SDK, verificam o destinatário, remetente, aceite 202, falhas de validação, indisponibilidade e ocultação de credenciais. Nenhum e-mail real é enviado pelos testes. A validação real depende de chave, remetente autorizado e condições da conta no MailerSend.
