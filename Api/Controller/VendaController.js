const db = require('../db/conn');
const Carrinho = require('../model/Carrinho');
const ItemCarrinho = require('../model/ItemCarrinho');
const Produto = require('../model/Produto');
const Venda = require('../model/Venda');
const ItemVenda = require('../model/ItemVenda');

module.exports = class VendaController {
    static async finalizar(req, res) {
        const { clienteNome, formaPagamento } = req.body || {};
        const transaction = await db.transaction();

        try {
            const carrinho = await Carrinho.findOne({
                where: { status: 'aberto' },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: ItemCarrinho,
                        as: 'itens',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ],
                transaction
            });

            if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
                await transaction.rollback();
                return res.status(422).json({ message: 'Não é possível finalizar a venda: o carrinho está vazio!' });
            }

            let valorTotal = 0;
            const itensParaVenda = carrinho.itens.map((item) => {
                const precoUnitario = Number(item.produto ? item.produto.preco : item.precoUnitario);
                const subtotal = Number((precoUnitario * item.quantidade).toFixed(2));
                valorTotal += subtotal;
                return {
                    produtoId: item.produtoId,
                    nomeProduto: item.produto ? item.produto.nome : `Produto #${item.produtoId}`,
                    quantidade: item.quantidade,
                    precoUnitario,
                    subtotal
                };
            });

            valorTotal = Number(valorTotal.toFixed(2));

            const venda = await Venda.create(
                {
                    carrinhoId: carrinho.id,
                    clienteNome: clienteNome && String(clienteNome).trim() ? String(clienteNome).trim() : 'Cliente',
                    formaPagamento: formaPagamento && String(formaPagamento).trim() ? String(formaPagamento).trim() : 'PIX',
                    valorTotal,
                    status: 'concluida'
                },
                { transaction }
            );

            await ItemVenda.bulkCreate(
                itensParaVenda.map((item) => ({ ...item, vendaId: venda.id })),
                { transaction }
            );

            await carrinho.update({ status: 'finalizado', total: valorTotal }, { transaction });

            await transaction.commit();

            const vendaCompleta = await Venda.findByPk(venda.id, {
                include: [
                    {
                        model: ItemVenda,
                        as: 'itens',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ]
            });

            return res.status(201).json({
                message: 'Venda finalizada com sucesso!',
                venda: vendaCompleta
            });
        } catch (err) {
            await transaction.rollback();
            return res.status(500).json({ message: 'Erro ao finalizar a venda: ' + err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const vendas = await Venda.findAll({
                include: [
                    {
                        model: ItemVenda,
                        as: 'itens',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(vendas);
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao buscar as vendas: ' + err.message });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;

        try {
            const venda = await Venda.findByPk(id, {
                include: [
                    {
                        model: ItemVenda,
                        as: 'itens',
                        include: [{ model: Produto, as: 'produto' }]
                    }
                ]
            });

            if (!venda) {
                return res.status(422).json({ message: 'Venda não encontrada!' });
            }

            return res.status(200).json(venda);
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao buscar a venda: ' + err.message });
        }
    }
};
