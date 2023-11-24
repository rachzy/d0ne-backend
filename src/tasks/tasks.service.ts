import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task } from './schemas/task.schema';
import { Model } from 'mongoose';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async add(userId: number, task: CreateTaskDto): Promise<number> {
    const newTask: Task = {
      taskOwner: userId,
      id: Date.now(),
      ...task,
    };
    const createdTask = new this.taskModel(newTask);
    createdTask.save();

    return newTask.id;
  }

  async findOne(id: number): Promise<Task> {
    return this.taskModel.findOne({ id: id }).exec();
  }

  async findAll(): Promise<Task[]> {
    return this.taskModel.find({}).exec();
  }

  async findAllFromUser(userId: number): Promise<Task[]> {
    return this.taskModel.find({ taskOwner: userId }).exec();
  }

  async deleteOne(id: number) {
    const result = await this.taskModel.findOneAndDelete({ id: id });

    if (result.errors) {
      throw new InternalServerErrorException('Could not delete the task');
    }

    return {
      message: `Task #${id} successfully deleted.`,
    };
  }

  async updateOne(
    userId: number,
    id: number,
    updatedTask: CreateTaskDto,
  ): Promise<Task> {
    const newTask: Task = {
      taskOwner: userId,
      id: id,
      ...updatedTask,
    };

    await this.taskModel.updateOne({ id: id }, { $set: newTask });
    const changedTask = await this.findOne(id);
    return changedTask;
  }

  async setCompleted(id: number, value: boolean): Promise<Task> {
    await this.taskModel.findOneAndUpdate({ id: id }, { completed: value });
    return this.findOne(id);
  }
}
