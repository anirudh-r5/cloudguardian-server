import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Request } from 'express';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject('SUPABASE_CLIENT') private supabase: SupabaseClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: Request;
    if (context.getType<GqlContextType>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    console.log(request);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('User not logged in!');
    }
    console.log(token);
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
