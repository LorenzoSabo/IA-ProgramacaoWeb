# LojaTech - Projeto AulaReact (API + Frontend E-commerce)

Projeto desenvolvido com base no sistema iniciado em sala de aula, composto por:

- **Api/** — Backend em Node.js, Express, Sequelize, MariaDB e Multer.
- **aula2/** — Frontend em React (`react-router-dom`, `axios`).

## Funcionalidades Implementadas

1. **CRUD Completo de Produtos (`/produtos`)**
   - Cadastro, listagem, busca, edição e exclusão de produtos integrados com a API.
   - Upload de imagem do produto com validação para aceitar **apenas `.jpeg` e `.png`** (validação no frontend e backend com Multer + verificação de assinatura de arquivo).
   - Validação no campo de preço para **não aceitar números negativos** (no frontend, controller e model Sequelize).

2. **Painel de Vendas E-commerce (`/home`)**
   - Vitrine de produtos com imagem, preço e busca.
   - Carrinho de compras persistido no banco de dados via API (adicionar, alterar quantidade, remover item, limpar carrinho).
   - Finalização da venda com seleção de cliente e forma de pagamento, registro transacional da venda e histórico de últimas vendas.

3. **Endpoints da API**
   - **Produtos (`/Produto`)**: `POST /create`, `GET /getAll`, `GET /getById/:id`, `PATCH /update/:id`, `DELETE /delete/:id`
   - **Carrinho (`/Carrinho`)**: `GET /getAtual`, `POST /addItem`, `PATCH /updateItem/:itemId`, `DELETE /removeItem/:itemId`, `DELETE /clear`
   - **Vendas (`/Venda`)**: `POST /finalizar`, `GET /getAll`, `GET /getById/:id`

## Como Executar

### 1. Banco de Dados (MariaDB)
Crie o banco `loja` (usuário `root`, senha `root`, host `localhost`, ou configure via variáveis `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`).

### 2. Backend (`Api`)
```bash
cd Api
npm install
npm start
```
A API iniciará na porta `5000`.

### 3. Frontend (`aula2`)
```bash
cd aula2
npm install
npm start
```
O frontend iniciará em `http://localhost:3000` (rotas `/home` e `/produtos`).
