const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const Venda = db.define('Venda', {
    clienteNome: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Cliente'
    },
    formaPagamento: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PIX'
    },
    valorTotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O valor total não pode ser negativo!'
            }
        }
    },
    status: {
        type: DataTypes.ENUM('concluida', 'cancelada'),
        allowNull: false,
        defaultValue: 'concluida'
    }
});

module.exports = Venda;
