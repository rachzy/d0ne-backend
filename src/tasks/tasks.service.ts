import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async add(task: CreateTaskDto): Promise<number> {
    const newTask: Task = {
      id: Date.now(),
      ...task,
    };
    const createdTask = new this.taskModel(newTask);
    createdTask.save();

    return newTask.id;
  }

  async findOne(id: number): Promise<Task> {
    return await this.taskModel.findOne((task: Task) => task.id === id).exec();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }

  async deleteOne(id: number) {
    const result = await this.taskModel
      .deleteOne((task: Task) => task.id === id)
      .exec();

    if (!result.acknowledged) {
      throw new InternalServerErrorException('Could not delete the task');
    }

    return {
      message: `Task #${id} successfully deleted.`,
    };
  }

  async updateOne(id: number, updatedTask: CreateTaskDto): Promise<Task> {
    const newTask: Task = {
      id: id,
      ...updatedTask,
    };

    await this.taskModel.updateOne((task: Task) => task.id === id, newTask);
    const changedTask = await this.findOne(id);
    return changedTask;
  }

  async setCompleted(id: number, value: boolean): Promise<Task> {
    const task = await this.findOne(id);
    const newTask: Task = {
      ...task,
      completed: value,
    };
    return await this.updateOne(id, newTask);
  }
}
