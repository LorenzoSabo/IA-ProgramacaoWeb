const router = require('express').Router();
const CarrinhoController = require('../Controller/CarrinhoController.js');

router.get('/getAtual', CarrinhoController.getAtual);
router.post('/addItem', CarrinhoController.addItem);
router.patch('/updateItem/:itemId', CarrinhoController.updateItem);
router.delete('/removeItem/:itemId', CarrinhoController.removeItem);
router.delete('/clear', CarrinhoController.clear);

module.exports = router;
