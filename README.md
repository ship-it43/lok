# ONE BASIQ® Full Stack

Projeto completo com loja, conta de clientes, painel administrativo, PostgreSQL e integração de pagamentos via Mercado Pago.

## Estrutura

- `frontend/index.html`: loja
- `frontend/admin.html`: painel administrativo
- `frontend/assets/one-basiq-logo.png`: logo enviada e preparada para uso no site
- `frontend/assets/store.css`: identidade visual da loja
- `frontend/assets/admin.css`: identidade visual do painel
- `frontend/app.js`: carrinho, clientes e checkout
- `frontend/admin.js`: operações administrativas
- `backend/server.js`: API, autenticação, pedidos, estoque e Mercado Pago
- `backend/schema.sql`: banco PostgreSQL
- `docker-compose.yml`: PostgreSQL local
- `.env.example`: variáveis de ambiente

## Instalação

1. Instale Node.js 20 ou superior.
2. Instale Docker Desktop se quiser subir o PostgreSQL automaticamente.
3. Execute `docker compose up -d`.
4. Copie `.env.example` para `.env`.
5. Ajuste `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `DATABASE_URL`.
6. Adicione `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` quando for conectar o Mercado Pago.
7. Execute `npm install`.
8. Execute `npm start`.
9. Acesse `http://localhost:3000`.
10. O painel fica em `http://localhost:3000/admin`.

## Mercado Pago

O backend cria uma preferência por pedido em `POST /api/payments/mercado-pago/preference` e redireciona o cliente para o checkout seguro. A integração está preparada para receber pagamentos por PIX, cartão e boleto conforme a disponibilidade do Mercado Pago.

Configure no painel do Mercado Pago o webhook `https://SEU-DOMINIO/api/payments/mercado-pago/webhook` e o evento de pagamentos. O servidor valida `x-signature` quando `MP_WEBHOOK_SECRET` estiver configurado.

Nunca coloque `MP_ACCESS_TOKEN` no frontend.

## Produção

Use HTTPS, banco PostgreSQL gerenciado, segredo JWT forte, credenciais de produção do Mercado Pago, domínio público e webhook HTTPS. Faça backup do PostgreSQL e restrinja o acesso ao painel administrativo.

## Conta administrativa

A conta inicial é criada automaticamente usando `ADMIN_EMAIL` e `ADMIN_PASSWORD` do `.env`.

## Observação

O projeto entrega a base funcional completa. Antes da publicação comercial, faça testes de pagamento em ambiente de testes do Mercado Pago, valide regras fiscais, frete, emissão fiscal, políticas da loja e segurança operacional.
