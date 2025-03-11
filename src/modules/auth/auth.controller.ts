import {
  Controller,
  Get,
  Redirect,
  HttpRedirectResponse,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @Redirect('login')
  async signIn(): Promise<HttpRedirectResponse> {
    const signInUrl = await this.authService.logIn();
    if (signInUrl) {
      return {
        url: signInUrl,
        statusCode: 302,
      };
    } else {
      return {
        url: 'login',
        statusCode: 401,
      };
    }
  }

  @Get('success')
  async granted(@Query('code') code: string): Promise<string> {
    const data = await this.authService.processRedirect(code);
    console.log(JSON.stringify(data));
    return 'LOGGED IN';
  }
}
