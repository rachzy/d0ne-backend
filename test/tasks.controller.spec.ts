import { Test } from '@nestjs/testing';

import { TasksController } from '../src/tasks/tasks.controller';
import { TasksService } from '../src/tasks/tasks.service';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto';
import { Task } from '../src/tasks/interfaces/task.interface';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;
  let dummyTask: Task;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    tasksService = moduleRef.get<TasksService>(TasksService);
    tasksController = moduleRef.get<TasksController>(TasksController);

    const newTask: CreateTaskDto = {
      title: 'Test',
      description: 'Lorem ipsum bla bla bla',
      completed: true,
    };

    const createdTaskId = tasksService.add(newTask);
    dummyTask = {
      id: createdTaskId,
      ...newTask,
    };
  });

  it('should return an array of tasks', () => {
    expect(tasksController.getAllTasks()).toStrictEqual([dummyTask]);
  });

  it('should return a single task', () => {
    expect(tasksController.getTask(dummyTask.id)).toStrictEqual(dummyTask);
  });

  it('should return a completed task', () => {
    expect(tasksController.setCompleted(dummyTask.id, true)).toHaveProperty(
      'completed',
      true,
    );
  });

  it('should return an undefined task', () => {
    tasksController.deleteTask(dummyTask.id);

    expect(tasksController.getTask(dummyTask.id)).toBeUndefined();
  });
});
