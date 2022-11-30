import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './config/config.schema';
import { AuthModule } from './user/auth/auth.module';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "statics"),
      renderPath: "./",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
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
    AuthModule,
    UserModule,],
})
export class AppModule {}
