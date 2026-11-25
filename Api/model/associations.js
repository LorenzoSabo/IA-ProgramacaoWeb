const Produto = require('./Produto');
const Carrinho = require('./Carrinho');
const ItemCarrinho = require('./ItemCarrinho');
const Venda = require('./Venda');
const ItemVenda = require('./ItemVenda');

Carrinho.hasMany(ItemCarrinho, { foreignKey: 'carrinhoId', as: 'itens', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Carrinho, { foreignKey: 'carrinhoId', as: 'carrinho' });

Produto.hasMany(ItemCarrinho, { foreignKey: 'produtoId', as: 'itensCarrinho', onDelete: 'CASCADE' });
ItemCarrinho.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

Carrinho.hasOne(Venda, { foreignKey: 'carrinhoId', as: 'venda', onDelete: 'SET NULL' });
Venda.belongsTo(Carrinho, { foreignKey: 'carrinhoId', as: 'carrinho' });

Venda.hasMany(ItemVenda, { foreignKey: 'vendaId', as: 'itens', onDelete: 'CASCADE' });
ItemVenda.belongsTo(Venda, { foreignKey: 'vendaId', as: 'venda' });

Produto.hasMany(ItemVenda, { foreignKey: 'produtoId', as: 'itensVenda', onDelete: 'SET NULL' });
ItemVenda.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });

module.exports = {
    Produto,
    Carrinho,
    ItemCarrinho,
    Venda,
    ItemVenda,
};
