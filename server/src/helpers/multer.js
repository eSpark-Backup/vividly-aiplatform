import multer from 'multer'
const storage = multer.memoryStorage()

const uploadImage = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only .png, .jpg and .jpeg formats are allowed'), false);
        }
        cb(null, true);
    }
})

const uploadAny = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

const handleFileUpload = (req, res) => {
    return new Promise((resolve, reject) => {
        uploadAny(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                reject({ status: 400, message: `Upload error: ${err.message}` });
            } else if (err) {
                reject({ status: 400, message: err.message });
            } else {
                resolve();
            }
        });
    });
};

export {uploadImage, uploadAny, handleFileUpload}