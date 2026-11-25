const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const ItemVenda = db.define('ItemVenda', {
    nomeProduto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'A quantidade deve ser pelo menos 1!'
            }
        }
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

module.exports = ItemVenda;
