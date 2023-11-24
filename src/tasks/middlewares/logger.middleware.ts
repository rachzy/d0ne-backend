import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: (error?: any) => void) {
    const { UID } = req.cookies;
    const { id } = req.query;
    const userId = UID || 'Unknown';
    const taskId = id ? `Task #${id}` : '';

    const action = {
      GET: () => {
        console.log(
          `[GET] User #${userId} is attempting to pull data from: ${
            taskId || 'All their tasks'
          }`,
        );
      },
      POST: () => {
        console.log(
          `[POST] User #${userId} is attempting to create a new task.`,
        );
      },
      PUT: () => {
        console.log(
          `[PUT] User #${userId} is attempting to update: ${
            taskId || 'Unknown task'
          }`,
        );
      },
      DELETE: () => {
        console.log(
          `[DELETE] User #${userId} is attempting to delete: ${
            taskId || 'Unknown task'
          } `,
        );
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
