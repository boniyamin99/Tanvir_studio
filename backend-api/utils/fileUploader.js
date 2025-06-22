// Backend-api/utils/fileUploader.js

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.AWS_S3_REGION
});

const s3 = new aws.S3();

// File type filter to allow only specific file formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp3|wav/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: File type not allowed! Only images, PDFs, and audio files are permitted.'));
};

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        acl: 'public-read', // Makes uploaded files publicly readable
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Creates a unique filename
            cb(null, 'uploads/' + Date.now().toString() + path.extname(file.originalname));
        }
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
    fileFilter: fileFilter
});

module.exports = upload;
