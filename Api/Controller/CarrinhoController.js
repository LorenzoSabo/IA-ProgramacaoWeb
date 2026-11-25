const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');

async function loadCartWithItems(carrinhoId) {
    return Carrinho.findByPk(carrinhoId, {
        include: [
            {
                model: ItemCarrinho,
                as: 'itens',
                include: [{ model: Produto, as: 'produto' }]
            }
        ],
        order: [[{ model: ItemCarrinho, as: 'itens' }, 'createdAt', 'ASC']]
    });
}

async function getOrCreateOpenCart() {
    let carrinho = await Carrinho.findOne({
        where: { status: 'aberto' },
        order: [['createdAt', 'DESC']]
    });

    if (!carrinho) {
        carrinho = await Carrinho.create({ status: 'aberto', total: 0 });
    }

    return loadCartWithItems(carrinho.id);
}

async function recalculateCartTotal(carrinhoId) {
    const itens = await ItemCarrinho.findAll({
        where: { carrinhoId },
        include: [{ model: Produto, as: 'produto' }]
    });

    const total = itens.reduce((sum, item) => {
        const unitPrice = item.produto ? Number(item.produto.preco) : Number(item.precoUnitario);
        return sum + unitPrice * item.quantidade;
    }, 0);

    await Carrinho.update(
        { total: Number(total.toFixed(2)) },
        { where: { id: carrinhoId } }
    );

    return loadCartWithItems(carrinhoId);
}

module.exports = class CarrinhoController {
    static async getAtual(req, res) {
        try {
            const carrinho = await getOrCreateOpenCart();
            const updated = await recalculateCartTotal(carrinho.id);
            return res.status(200).json(updated);
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao buscar o carrinho: ' + err.message });
        }
    }

    static async addItem(req, res) {
        const { produtoId, quantidade = 1 } = req.body;

        if (!produtoId) {
            return res.status(422).json({ message: 'O produtoId é obrigatório!' });
        }

        const qtd = Number(quantidade);
        if (!Number.isInteger(qtd) || qtd < 1) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro maior ou igual a 1!' });
        }

        try {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) {
                return res.status(422).json({ message: 'Produto não encontrado!' });
            }

            const carrinho = await getOrCreateOpenCart();
            const existingItem = await ItemCarrinho.findOne({
                where: { carrinhoId: carrinho.id, produtoId: produto.id }
            });

            if (existingItem) {
                await existingItem.update({
                    quantidade: existingItem.quantidade + qtd,
                    precoUnitario: produto.preco
                });
            } else {
                await ItemCarrinho.create({
                    carrinhoId: carrinho.id,
                    produtoId: produto.id,
                    quantidade: qtd,
                    precoUnitario: produto.preco
                });
            }

            const updatedCart = await recalculateCartTotal(carrinho.id);
            return res.status(200).json({
                message: 'Produto adicionado ao carrinho!',
                carrinho: updatedCart
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao adicionar item ao carrinho: ' + err.message });
        }
    }

    static async updateItem(req, res) {
        const { itemId } = req.params;
        const { quantidade } = req.body;

        const qtd = Number(quantidade);
        if (Number.isNaN(qtd) || !Number.isInteger(qtd)) {
            return res.status(422).json({ message: 'A quantidade deve ser um número inteiro válido!' });
        }

        try {
            const item = await ItemCarrinho.findByPk(itemId, {
                include: [{ model: Carrinho, as: 'carrinho' }]
            });

            if (!item || !item.carrinho || item.carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'Item do carrinho não encontrado!' });
            }

            const carrinhoId = item.carrinhoId;

            if (qtd <= 0) {
                await item.destroy();
            } else {
                const produto = await Produto.findByPk(item.produtoId);
                await item.update({
                    quantidade: qtd,
                    precoUnitario: produto ? produto.preco : item.precoUnitario
                });
            }

            const updatedCart = await recalculateCartTotal(carrinhoId);
            return res.status(200).json({
                message: 'Carrinho atualizado com sucesso!',
                carrinho: updatedCart
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao atualizar item do carrinho: ' + err.message });
        }
    }

    static async removeItem(req, res) {
        const { itemId } = req.params;

        try {
            const item = await ItemCarrinho.findByPk(itemId, {
                include: [{ model: Carrinho, as: 'carrinho' }]
            });

            if (!item || !item.carrinho || item.carrinho.status !== 'aberto') {
                return res.status(422).json({ message: 'Item do carrinho não encontrado!' });
            }

            const carrinhoId = item.carrinhoId;
            await item.destroy();

            const updatedCart = await recalculateCartTotal(carrinhoId);
            return res.status(200).json({
                message: 'Item removido do carrinho!',
                carrinho: updatedCart
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao remover item do carrinho: ' + err.message });
        }
    }

    static async clear(req, res) {
        try {
            const carrinho = await getOrCreateOpenCart();
            await ItemCarrinho.destroy({ where: { carrinhoId: carrinho.id } });
            const updatedCart = await recalculateCartTotal(carrinho.id);
            return res.status(200).json({
                message: 'Carrinho limpo com sucesso!',
                carrinho: updatedCart
            });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao limpar o carrinho: ' + err.message });
        }
    }
};
