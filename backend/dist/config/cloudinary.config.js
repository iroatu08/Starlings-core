"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY = exports.initCloudinary = void 0;
const cloudinary = require("cloudinary");
const initCloudinary = (configService) => {
    cloudinary.v2.config({
        cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get('CLOUDINARY_API_KEY'),
        api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
    return cloudinary.v2;
};
exports.initCloudinary = initCloudinary;
exports.CLOUDINARY = 'CLOUDINARY';
//# sourceMappingURL=cloudinary.config.js.map