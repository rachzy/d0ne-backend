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
        console.log('Getting data...');
      },
      POST: () => {
        console.log('Posting data...');
      },
      PUT: () => {
        console.log('Altering data...');
      },
      DELETE: () => {
        console.log('Deleting data...');
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
