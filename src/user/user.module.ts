import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { join } from "path";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          secret: configService.get("JWT_SECRET"),
          signOptions: { expiresIn: "60s" },
        };
        return options;
      },
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
      //  service: "gmail",
        auth: {
          user: "najladaoud76@gmail.com",
          pass: "ucnwuxmkyxposouy",
        },
      },
      defaults: {
        from: '"No Reply" <najladaoud76@gmail.com>',
      },
      template: {
        dir: join(__dirname, "/templates/"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
