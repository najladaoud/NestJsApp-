"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const config_schema_1 = require("./config/config.schema");
const auth_module_1 = require("./user/auth/auth.module");
const user_module_1 = require("./user/user.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: [`.env.stage.${process.env.STAGE}`],
                validationSchema: config_schema_1.configValidationSchema,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, "..", "statics"),
                renderPath: "./",
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    type: "postgres",
                    autoLoadEntities: true,
                    synchronize: configService.get("SYNCHRONIZE"),
                    host: configService.get("DB_HOST"),
                    port: configService.get("DB_PORT"),
                    username: configService.get("DB_USER"),
                    password: configService.get("DB_PASSWORD"),
                    database: configService.get("DB_DATABASE"),
                    cache: true,
                    logging: false,
                }),
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map