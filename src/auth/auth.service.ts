import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as md5 from 'apache-md5';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
    private jwtService: JwtService) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const encryptedPassword = user?.PASSWORD;
    const isMatch = md5(pass, encryptedPassword) == encryptedPassword;
    // const isMatch = md5(pass) == encryptedPassword;
    // if (user) {
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    // else if(user){
    //   const { password, ...result } = user;
    //   return result;
    // }
    // throw new UnauthorizedException();
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
