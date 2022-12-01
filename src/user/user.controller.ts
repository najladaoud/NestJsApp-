import { Controller, Get, Post, UseGuards, Body, Req } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { JwtService } from "@nestjs/jwt";

import { code } from "types/mailCodeDTO";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  @Post("/signup")
  async Signup(@Body() user: User) {
    return await this.userService.signup(user, this.jwtService);
  }

  @Post("/signin")
  async Signin(@Body() user: User) {
    return await this.userService.signin(user, this.jwtService);
  }

  @Post("/verifyMail")
  async Verify(@Body() body: code) {
    return await this.userService.verifyAccount(body.code);
  }
}
