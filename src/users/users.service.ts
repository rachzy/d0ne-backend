import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private usersSchema: Model<User>) {}

  async findOne(id: string): Promise<User> {
    return this.usersSchema.findById(id);
  }

  async create(
    nickname: string,
    email: string,
    password: string,
  ): Promise<User> {
    const newUser = new this.usersSchema({
      nickname: nickname,
      email: email,
      password: password,
    });
    await newUser.save();
    return this.findOne(newUser._id);
  }
}
