import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse() as Response;
    const request = ctx.getRequest() as Request;

    const { UID, STOKEN } = request.cookies;

    function errorCallback(message: string) {
      response.clearCookie('UID', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      response.clearCookie('STOKEN', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      throw new UnauthorizedException(message);
    }

    if (!UID || !STOKEN) {
      errorCallback('User is not authenticated!');
      return false;
    }

    const securityTokenStatus =
      await this.usersService.checkSecurityTokenStatus(UID, STOKEN);

    if (!securityTokenStatus) {
      errorCallback('Invalid security token!');
      return false;
    }

    return true;
  }
}
