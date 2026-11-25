const router = require('express').Router();
const ProdutoController = require('../Controller/ProdutoController.js');
const { uploadProdutoImagem } = require('../helpers/imageUpload.js');

router.post('/create', uploadProdutoImagem, ProdutoController.create);
router.get('/getAll', ProdutoController.getAll);
router.get('/getById/:id', ProdutoController.getById);
router.patch('/update/:id', uploadProdutoImagem, ProdutoController.update);
router.delete('/delete/:id', ProdutoController.delete);

module.exports = router;
