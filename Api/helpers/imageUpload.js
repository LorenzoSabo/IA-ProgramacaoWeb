const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedExtensions = ['.jpeg', '.jpg', '.png'];
const allowedMimeTypes = ['image/jpeg', 'image/png'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `produto-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isExtValid = allowedExtensions.includes(ext);
    const isMimeValid = allowedMimeTypes.includes(file.mimetype);

    if (!isExtValid || !isMimeValid) {
        const err = new Error('Formato de imagem inválido! Aceitamos apenas arquivos .jpeg e .png.');
        err.statusCode = 422;
        return cb(err, false);
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

function hasValidMagicBytes(filePath, ext) {
    try {
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(8);
        const bytesRead = fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);

        if (bytesRead < 4) return false;

        if (ext === '.png') {
            return (
                buffer[0] === 0x89 &&
                buffer[1] === 0x50 &&
                buffer[2] === 0x4e &&
                buffer[3] === 0x47
            );
        }

        // .jpeg / .jpg
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    } catch {
        return false;
    }
}

const uploadProdutoImagem = (req, res, next) => {
    upload.single('imagem')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(422).json({
                    message: 'A imagem deve ter no máximo 5MB.'
                });
            }
            return res.status(err.statusCode || 422).json({
                message: err.message || 'Apenas imagens .jpeg e .png são permitidas!'
            });
        }

        if (req.file) {
            const ext = path.extname(req.file.originalname).toLowerCase();
            if (!hasValidMagicBytes(req.file.path, ext)) {
                fs.unlink(req.file.path, () => {});
                return res.status(422).json({
                    message: 'Arquivo corrompido ou inválido! Envie uma imagem .jpeg ou .png válida.'
                });
            }
        }

        next();
    });
};

const removeUploadedFile = (imagePath) => {
    if (!imagePath || !imagePath.startsWith('/uploads/')) return;
    const filename = path.basename(imagePath);
    const fullPath = path.join(uploadsDir, filename);
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, () => {});
    }
};

module.exports = {
    uploadProdutoImagem,
    removeUploadedFile,
    uploadsDir
};
