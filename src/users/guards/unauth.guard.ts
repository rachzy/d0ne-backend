import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../users.service';

@Injectable()
export class UnauthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest() as Request;

    const { UID, STOKEN } = request.cookies;

    let UIDnumber: number;

    if (UID) {
      try {
        UIDnumber = parseInt(UID);
      } catch (error) {
        UIDnumber = 0;
      }
    }

    if (!UIDnumber || !STOKEN) return true;

    const securityTokenStatus =
      await this.usersService.checkSecurityTokenStatus(UIDnumber, STOKEN);

    if (!securityTokenStatus) return true;

    throw new UnauthorizedException('User already logged in!');
  }
}
