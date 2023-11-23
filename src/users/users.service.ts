import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(id: number): Promise<User> {
    return this.userModel.findOne({ id: id }).exec();
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(user);
    await newUser.save();

    return newUser;
  }

  async deleteUser(id: number) {
    await this.userModel.findOneAndDelete({ id: id });
    return {
      message: `User #${id} successfully deleted!`,
    };
  }
}
