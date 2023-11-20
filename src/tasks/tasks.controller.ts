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
  getTask(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,
  ): Task {
    return this.tasksService.findOne(id);
  }

  @Get('getAll')
  getAllTasks(): Task[] {
    return this.tasksService.findAll();
  }

  @Post('add')
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  addTask(@Body() task: CreateTaskDto) {
    const id = this.tasksService.add(task);
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
  editTask(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,

    @Body(new ZodValidationPipe(createTaskSchema)) task: CreateTaskDto,
  ): Task {
    return this.tasksService.updateOne(id, task);
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
  ): Task {
    return this.tasksService.setCompleted(id, value);
  }
}
