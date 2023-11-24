import {
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SecurityToken, User } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes } from 'crypto';
import { add } from 'date-fns';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(id: number): Promise<User> {
    return this.userModel.findOne({ id: id }).exec();
  }

  async create(user: CreateUserDto): Promise<User> {
    const usersWithEmail = (await this.userModel.find({ email: user.email }))
      .length;

    if (usersWithEmail) {
      throw new NotAcceptableException('Email already in use!');
    }

    const hashedPassword = await hash(user.password, 8);

    const finalUser: CreateUserDto = {
      ...user,
      password: hashedPassword,
    };

    const newUser = new this.userModel(finalUser);
    await newUser.save();

    return newUser;
  }

  async authenticate(
    email: string,
    userPassword: string,
  ): Promise<SecurityToken> {
    const getUserByEmail = await this.userModel
      .findOne({ email: email })
      .exec();

    if (!getUserByEmail) {
      throw new UnauthorizedException('Invalid email');
    }

    const { password } = getUserByEmail;

    const comparePasswords = await compare(userPassword, password);

    if (!comparePasswords) {
      throw new UnauthorizedException('Invalid password');
    }

    const newSecurityToken = randomBytes(64).toString('hex');

    const securityToken: SecurityToken = {
      value: newSecurityToken,
      expirationDate: add(Date.now(), { days: 7 }),
    };

    await this.userModel.findOneAndUpdate(
      { id: getUserByEmail.id },
      {
        $set: {
          securityToken: [{ securityToken, ...getUserByEmail.securityToken }],
        },
      },
    );
    return securityToken;
  }

  async deleteUser(id: number) {
    await this.userModel.findOneAndDelete({ id: id });
    return {
      message: `User #${id} successfully deleted!`,
    };
  }
}
