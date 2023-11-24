import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from '../tasks.service';
import { Request } from 'express';

@Injectable()
export class TaskOwner implements CanActivate {
  constructor(private readonly tasksService: TasksService) {}

  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const ctx = executionContext.switchToHttp();
    const request = ctx.getRequest() as Request;

    const { UID } = request.cookies;
    const { id } = request.query;
    let taskId: number;

    try {
      taskId = parseInt(id.toString());
    } catch (error) {
      throw new BadRequestException('Invalid Task ID');
    }

    const userTasks = await this.tasksService.findAllFromUser(UID);
    const task = userTasks.find((t) => t.id === taskId);

    if (!task) {
      throw new UnauthorizedException(
        `Either the task does not exist or the user is not its owner`,
      );
    }

    return true;
  }
}
