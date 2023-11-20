import { Injectable } from '@nestjs/common';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  add(task: CreateTaskDto): number {
    const newTask: Task = {
      id: Date.now(),
      ...task,
    };
    this.tasks.push(newTask);
    return newTask.id;
  }

  findOne(id: number): Task {
    return this.tasks.find((task) => task.id === id);
  }

  findAll(): Task[] {
    return this.tasks;
  }

  deleteOne(id: number) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return {
      message: `Task #${id} successfully deleted.`,
    };
  }

  updateOne(id: number, updatedTask: CreateTaskDto): Task {
    this.tasks = this.tasks.filter((task) => task.id !== id);

    const newTask: Task = {
      id: id,
      ...updatedTask,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  setCompleted(id: number, value: boolean): Task {
    this.tasks = this.tasks.map((task) => {
      if (task.id !== id) return task;
      return {
        ...task,
        completed: value,
      };
    });

    return this.findOne(id);
  }
}
