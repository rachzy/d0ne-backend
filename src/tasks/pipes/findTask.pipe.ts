import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TasksService } from '../tasks.service';

@Injectable()
export class FindTaskPipe implements PipeTransform {
  constructor(private tasksService: TasksService) {}
  async transform(value: number) {
    const task = await this.tasksService.findOne(value);
    if (!task) {
      throw new BadRequestException('Invalid task id');
    }

    return value;
  }
}
