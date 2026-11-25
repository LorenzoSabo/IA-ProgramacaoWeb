const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const conn = require('./db/conn.js');
const cors = require('cors');

require('./model/associations.js');

app.use(express.json());
app.use(cors({ Credentials: true, origin: '*' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const ProdutoRouter = require('./router/ProdutoRouter.js');
const CarrinhoRouter = require('./router/CarrinhoRouter.js');
const VendaRouter = require('./router/VendaRouter.js');

app.use('/Produto', ProdutoRouter);
app.use('/Carrinho', CarrinhoRouter);
app.use('/Venda', VendaRouter);

conn
    .sync({ alter: true })
    .then(() => {
        app.listen(port, () => {
            console.log(`API rodando na porta ${port}`);
        });
    })
    .catch((err) => console.log(err));
