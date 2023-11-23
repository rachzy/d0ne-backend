import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    const action = {
      GET: () => {
        console.log('Getting task...');
      },
      POST: () => {
        console.log('Posting task...');
      },
      PUT: () => {
        console.log('Altering task...');
      },
      DELETE: () => {
        console.log('Deleting task...');
      },
      UNKNOWN: () => {
        throw new BadRequestException('Forbidden request method!');
      },
    };

    const { method } = req;

    if (action[method]) {
      action[method]();
      next();
      return;
    }

    action['UNKNOWN']();
  }
}
