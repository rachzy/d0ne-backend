import { Test } from '@nestjs/testing';

import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from '../schemas/task.schema';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;
  let dummyTask: Task;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://127.0.0.1:27017', { dbName: 'todo' }),
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
      ],
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    tasksService = moduleRef.get<TasksService>(TasksService);
    tasksController = moduleRef.get<TasksController>(TasksController);

    const newTask: CreateTaskDto = {
      title: 'Test',
      description: 'Lorem ipsum bla bla bla',
      completed: false,
    };

    const createdTaskId = await tasksService.add(newTask);
    dummyTask = {
      id: createdTaskId,
      ...newTask,
    };
  });

  it('should return an array of tasks', async () => {
    const allTasks = await tasksController.getAllTasks();
    const taskExample = await tasksController.getTask(dummyTask.id);

    expect(allTasks).toContainEqual(taskExample);
  });

  it('should return a single task', async () => {
    expect(await tasksController.getTask(dummyTask.id)).toHaveProperty(
      'id',
      dummyTask.id,
    );
  });

  it('should return a completed task', async () => {
    expect(
      await tasksController.setCompleted(dummyTask.id, true),
    ).toHaveProperty('completed', true);
  });

  it('should return a null task', async () => {
    await tasksController.deleteTask(dummyTask.id);

    expect(await tasksController.getTask(dummyTask.id)).toBeNull();
  });
});
