const { DataTypes } = require("sequelize");
const db = require('../db/conn.js');

const Carrinho = db.define('Carrinho', {
    status: {
        type: DataTypes.ENUM('aberto', 'finalizado'),
        allowNull: false,
        defaultValue: 'aberto'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = Carrinho;
