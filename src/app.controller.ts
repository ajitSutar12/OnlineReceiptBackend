import { Controller, Get, Request, Post, UseGuards, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { User } from './auth/user.decorator';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,private authService: AuthService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() user:any) {
    console.log('this is working')  
    console.log(user.user)
    // return req.user;
  }

  @Post('getwayResponse')
  getwayResponse(@Query() data:any){
    let htmlData =  `<h1>${data.reMsg}</h1><br><button onclick="window.close();">Close</button>`;
    return htmlData;
  }
}
