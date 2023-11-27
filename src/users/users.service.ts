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
  ): Promise<Pick<User, 'id' | 'securityTokens'>> {
    const getUserByEmail = await this.userModel
      .findOne({ email: email })
      .exec();

    if (!getUserByEmail) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { password } = getUserByEmail;

    const comparePasswords = await compare(userPassword, password);

    if (!comparePasswords) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const newSecurityToken = randomBytes(64).toString('hex');

    const securityToken: SecurityToken = {
      value: newSecurityToken,
      expirationDate: add(Date.now(), { days: 7 }),
      valid: true,
    };

    await this.userModel.findOneAndUpdate(
      { id: getUserByEmail.id },
      {
        $push: {
          securityTokens: securityToken,
        },
      },
    );

    return { id: getUserByEmail.id, securityTokens: [securityToken] };
  }

  async checkSecurityTokenStatus(id: number, value: string): Promise<boolean> {
    const user = await this.findOne(id);
    if (!user) return false;

    const securityToken = user.securityTokens.find(
      (sToken) =>
        sToken.value === value &&
        sToken.expirationDate.getTime() > Date.now() &&
        sToken.valid,
    );

    return !!securityToken;
  }

  async invalidateSecurityToken(user: User, STOKEN: string) {
    const { id } = user;
    const newSecurityTokens = user.securityTokens.map((securityToken) => {
      if (securityToken.value !== STOKEN) return securityToken;
      return {
        ...securityToken,
        valid: false,
      };
    });

    await this.userModel.findOneAndUpdate(
      { id: id },
      { $set: { securityTokens: newSecurityTokens } },
    );
  }

  async logout(id: number, STOKEN: string) {
    const user = await this.findOne(id);
    this.invalidateSecurityToken(user, STOKEN);
  }

  async deleteUser(id: number) {
    await this.userModel.findOneAndDelete({ id: id });
    return {
      message: `User #${id} successfully deleted!`,
    };
  }
}
