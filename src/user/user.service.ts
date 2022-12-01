import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
@Injectable()
export class UserService {
  private code;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mailerService: MailerService,private jwtService: JwtService
  ) {
    this.code = Math.floor(10000 + Math.random() * 90000);
  }

  async sendConfirmedEmail(user: User) {
    const { email, fullname } = user;
    await this.mailerService.sendMail({
      to: email,
      subject: "Welcome to ADN-EXPERTISE! Email Confirmed",
      template: "confirmed",
      context: {
        fullname,
        email,
       
      },
    });
  }

  async sendConfirmationEmail(user: any) {
    const { email, fullname ,tokenValidation } = await user;

    await this.mailerService.sendMail({
      to: email,
      subject: "Welcome to  ADN-EXPERTISE! Confirm Email",
      template: "confirm",
      context: {
        fullname,
        code: this.code,
        tokenValidation
        
      },
    });
  }

  async signup(user: User, jwt: JwtService): Promise<any> {
    try {
      const payload = { email: user.email };
      const tokenValidation= jwt.sign(payload);
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);
      const reqBody = {
        fullname: user.fullname,
        email: user.email,
        password: hash,
        authConfirmToken: this.code,
        tokenValidation:tokenValidation
      };
      const newUser = await this.userRepository.insert(reqBody);
      await this.sendConfirmationEmail(reqBody);
      return true;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async signin(user: User, jwt: JwtService): Promise<any> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: {
          email: user.email,
        },
      });
      if (foundUser) {
        if (foundUser.isVerified) {
          if (bcrypt.compare(user.password, foundUser.password)) {
            const payload = { email: user.email };
            return {
              token: jwt.sign(payload),
            };
          }
        } else {
          return new HttpException(
            "Please verify your account",
            HttpStatus.UNAUTHORIZED
          );
        }
        return new HttpException(
          "Incorrect username or password",
          HttpStatus.UNAUTHORIZED
        );
      }
      return new HttpException(
        "Incorrect username or password",
        HttpStatus.UNAUTHORIZED
      );
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async verifyAccount(code: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          authConfirmToken: code,
        },
      });
      if (!user) {
        return new HttpException(
          "Verification code has expired or not found",
          HttpStatus.UNAUTHORIZED
        );
      }
      await this.userRepository.update(
        { authConfirmToken: user.authConfirmToken },
        { isVerified: true, authConfirmToken: undefined }
      );

      await this.userRepository.update(user.id, { isVerified: true });
      await this.userRepository.update(user.id, { authConfirmToken: "" });

      await this.sendConfirmedEmail(user);

      return true;
    } catch (e) {
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
