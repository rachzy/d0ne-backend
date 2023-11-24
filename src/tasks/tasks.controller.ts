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
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ZodValidationPipe } from '../pipes/zodValidation.pipe';
import { createTaskSchema } from './pipes/createTask.pipe';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindTaskPipe } from './pipes/findTask.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request } from 'express';
import { TaskOwner } from './guards/taskOwner.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('get')
  async getTasks(@Req() request: Request): Promise<Task[]> {
    const { UID } = request.cookies;
    return this.tasksService.findAllFromUser(UID);
  }

  @Post('add')
  @UsePipes(new ZodValidationPipe(createTaskSchema))
  async addTask(
    @Req() request: Request,
    @Body() task: CreateTaskDto,
  ): Promise<Task> {
    const { UID } = request.cookies;
    const id = await this.tasksService.add(UID, task);
    return this.tasksService.findOne(id);
  }

  @Delete('delete')
  @UseGuards(TaskOwner)
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
  @UseGuards(TaskOwner)
  async editTask(
    @Req() request: Request,
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindTaskPipe,
    )
    id: number,
    @Body(new ZodValidationPipe(createTaskSchema)) task: CreateTaskDto,
  ): Promise<Task> {
    const { UID } = request.cookies;
    return await this.tasksService.updateOne(UID, id, task);
  }

  @Put('setCompleted')
  @UseGuards(TaskOwner)
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
