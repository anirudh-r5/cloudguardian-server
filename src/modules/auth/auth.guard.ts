import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log(request);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('User not logged in!');
    }
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);
    if (error || !user)
      throw new UnauthorizedException('User unauthorized', { cause: error });
    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    try {
      const [type, token] = request.headers?.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : '';
    } catch (error) {
      throw new UnauthorizedException('No auth headers found!', {
        cause: error,
      });
    }
  }
}
