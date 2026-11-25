const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const ItemCarrinho = db.define('ItemCarrinho', {
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: [1],
                msg: 'A quantidade deve ser pelo menos 1!'
            }
        }
    },
    precoUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0],
                msg: 'O preço unitário não pode ser negativo!'
            }
        }
    }
});

module.exports = ItemCarrinho;
