"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
function corsOrigin() {
    const primary = process.env.FRONTEND_URL?.trim() || 'http://localhost:5173';
    if (process.env.NODE_ENV === 'production') {
        return primary;
    }
    const commonLocal = ['http://localhost:5173', 'http://localhost:5174'];
    const merged = [...new Set([primary, ...commonLocal])];
    return merged.length === 1 ? merged[0] : merged;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(cookieParser());
    app.enableCors({
        origin: corsOrigin(),
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Starlings Hospitality API')
        .setDescription('Complete travel booking platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User profile management')
        .addTag('destinations', 'Travel destinations')
        .addTag('packages', 'Travel packages')
        .addTag('cart', 'Shopping cart')
        .addTag('bookings', 'Booking management')
        .addTag('payments', 'Paystack payment integration')
        .addTag('gallery', 'Media gallery')
        .addTag('contact', 'Contact form')
        .addTag('admin', 'Admin-only endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Starlings API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map