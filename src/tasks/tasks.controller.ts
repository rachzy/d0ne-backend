import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseIntPipe,
  ParseBoolPipe,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from './pipes/zodValidation.pipe';
import { createTaskSchema } from './pipes/createTask.pipe';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTaskPipe } from './pipes/findTask.pipe';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('get')
  async getTask(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,
  ): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Get('getAll')
  async getAllTasks(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Post('add')
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  async addTask(@Body() task: CreateTaskDto): Promise<Task> {
    const id = await this.tasksService.add(task);
    return this.tasksService.findOne(id);
  }

  @Delete('delete')
  deleteTask(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,
  ) {
    return this.tasksService.deleteOne(id);
  }

  @Put('edit')
  async editTask(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,

    @Body(new ZodValidationPipe(createTaskSchema)) task: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.updateOne(id, task);
  }

  @Put('setCompleted')
  setCompleted(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,
    @Query(
      'value',
      new ParseBoolPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    value: boolean,
  ): Promise<Task> {
    return this.tasksService.setCompleted(id, value);
  }
}
