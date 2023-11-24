import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: any) => void) {
    const { method } = req;
    const { UID } = req.cookies;

    const actions = {
      GET: () => {
        if (UID) {
          console.log(
            `[GET] User #${UID} is attempting to get data from an user (Probably getting their own nickname).`,
          );
        } else {
          console.log(`[GET] A new authentication process has been requested.`);
        }
      },
      POST: () => {
        console.log('[POST] A new user is trying to sign up.');
      },
      DELETE: () => {
        if (UID) {
          console.log(`[DELETE] User #${UID} is attempting to log out.`);
        }
      },
      UNKNOWN: () => {
        throw new ForbiddenException('Forbidden method!');
      },
    };

    if (actions[method]) {
      actions[method]();
      next();
      return;
    }
    actions['UNKNOWN']();
  }
}
