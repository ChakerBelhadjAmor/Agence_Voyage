import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  id: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
