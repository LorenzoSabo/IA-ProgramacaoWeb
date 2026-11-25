const path = require('path');
const Produto = require('../model/Produto');
const { removeUploadedFile } = require('../helpers/imageUpload');

function validatePreco(preco) {
    if (preco === undefined || preco === null || preco === '') {
        return { valid: false, message: 'O preço é obrigatório!' };
    }
    const numero = Number(preco);
    if (Number.isNaN(numero) || !Number.isFinite(numero)) {
        return { valid: false, message: 'O preço deve ser um número válido!' };
    }
    if (numero < 0) {
        return { valid: false, message: 'O preço não pode ser um número negativo!' };
    }
    return { valid: true, value: Number(numero.toFixed(2)) };
}

function validateImageUrl(imagem) {
    if (!imagem || typeof imagem !== 'string') return true;
    const ext = path.extname(imagem.split('?')[0]).toLowerCase();
    return ['.jpeg', '.jpg', '.png'].includes(ext);
}

module.exports = class ProdutoController {
    static async create(req, res) {
        const { nome, preco } = req.body;

        if (!nome || !String(nome).trim()) {
            if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
            return res.status(422).json({ message: 'O nome é obrigatório!' });
        }

        const precoCheck = validatePreco(preco);
        if (!precoCheck.valid) {
            if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
            return res.status(422).json({ message: precoCheck.message });
        }

        let imagem = null;
        if (req.file) {
            imagem = `/uploads/${req.file.filename}`;
        } else if (req.body.imagem) {
            if (!validateImageUrl(req.body.imagem)) {
                return res.status(422).json({
                    message: 'Formato de imagem inválido! Aceitamos apenas arquivos .jpeg e .png.'
                });
            }
            imagem = req.body.imagem;
        }

        try {
            const produto = await Produto.create({
                nome: String(nome).trim(),
                preco: precoCheck.value,
                imagem
            });
            return res.status(201).json({ message: 'Produto criado com sucesso!', produto });
        } catch (err) {
            if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
            return res.status(500).json({ message: 'Erro ao criar o produto: ' + err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const produtos = await Produto.findAll({
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json(produtos);
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao buscar os produtos: ' + err.message });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(422).json({ message: 'Produto não encontrado!' });
            }
            return res.status(200).json(produto);
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao buscar o produto: ' + err.message });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nome, preco } = req.body;

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
                return res.status(422).json({ message: 'Produto não encontrado!' });
            }

            const updates = {};

            if (nome !== undefined) {
                if (!String(nome).trim()) {
                    if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
                    return res.status(422).json({ message: 'O nome é obrigatório!' });
                }
                updates.nome = String(nome).trim();
            }

            if (preco !== undefined) {
                const precoCheck = validatePreco(preco);
                if (!precoCheck.valid) {
                    if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
                    return res.status(422).json({ message: precoCheck.message });
                }
                updates.preco = precoCheck.value;
            }

            if (req.file) {
                if (produto.imagem) {
                    removeUploadedFile(produto.imagem);
                }
                updates.imagem = `/uploads/${req.file.filename}`;
            } else if (req.body.imagem !== undefined && req.body.imagem !== produto.imagem) {
                if (req.body.imagem && !validateImageUrl(req.body.imagem)) {
                    return res.status(422).json({
                        message: 'Formato de imagem inválido! Aceitamos apenas arquivos .jpeg e .png.'
                    });
                }
                updates.imagem = req.body.imagem || null;
            }

            await produto.update(updates);
            return res.status(200).json({ message: 'Produto atualizado com sucesso!', produto });
        } catch (err) {
            if (req.file) removeUploadedFile(`/uploads/${req.file.filename}`);
            return res.status(500).json({ message: 'Erro ao atualizar o produto: ' + err.message });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;

        try {
            const produto = await Produto.findByPk(id);
            if (!produto) {
                return res.status(422).json({ message: 'Produto não encontrado!' });
            }

            const oldImage = produto.imagem;
            await produto.destroy();
            if (oldImage) {
                removeUploadedFile(oldImage);
            }

            return res.status(200).json({ message: 'Produto deletado com sucesso!' });
        } catch (err) {
            return res.status(500).json({ message: 'Erro ao deletar o produto: ' + err.message });
        }
    }
};
