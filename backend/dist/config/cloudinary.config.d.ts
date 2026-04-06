import { ConfigService } from '@nestjs/config';
import * as cloudinary from 'cloudinary';
export declare const initCloudinary: (configService: ConfigService) => typeof cloudinary.v2;
export declare const CLOUDINARY = "CLOUDINARY";
