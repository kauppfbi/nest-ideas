import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.authorization) {
      return false;
    }

    request.user = await this.validateToken(request.headers.authorization);

    return true;
  }

  async validateToken(auth: string) {
    const splittedAuthHeader = auth.split(' ');
    if (splittedAuthHeader[0] !== 'Bearer') {
      throw new HttpException('Invalid token!', HttpStatus.FORBIDDEN);
    }

    const token = splittedAuthHeader[1];

    try {
      const decoded = await jwt.verify(token, process.env.SECRET);
      return decoded;
    } catch (err) {
      const message = 'Token Error: ' + (err.message || err.name);
      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
