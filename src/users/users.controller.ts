import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { FindUserByIdPipe } from './pipes/findUserById.pipe';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { CreateUserDto } from './dtos/create-user.dto';
import { createUserSchema } from './pipes/createUser.pipe';
import { Response, Request } from 'express';
import { User } from './schemas/user.schema';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('getNickname')
  async getUserNickname(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindUserByIdPipe,
    )
    id: number,
  ): Promise<Pick<User, 'id' | 'nickname'>> {
    const user = await this.usersService.findOne(id);
    return {
      id: user.id,
      nickname: user.nickname,
    };
  }

  @Post('create')
  async createUser(
    @Req() request: Request,
    @Res() response: Response,
    @Body(new ZodValidationPipe(createUserSchema)) user: CreateUserDto,
  ) {
    const { STOKEN } = request.cookies;

    if (STOKEN) {
      throw new UnauthorizedException('Already logged in!');
    }

    const finalUser = await this.usersService.create(user);
    const { id, nickname, email, securityToken } = finalUser;
    const { value, expirationDate } = securityToken;

    response.cookie('STOKEN', value, {
      expires: expirationDate,
      httpOnly: true,
      secure: true,
    });

    response.send({
      id: id,
      email: email,
      nickname: nickname,
    });
  }

  @Delete('delete')
  async deleteUser(
    @Query(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
      FindUserByIdPipe,
    )
    id: number,
  ) {
    return this.usersService.deleteUser(id);
  }

  @Get('auth')
  async authenticateUser(
    @Res() response: Response,
    @Query('email') email: string,
    @Query('password') password: string,
  ) {
    const { value, expirationDate } = await this.usersService.authenticate(
      email,
      password,
    );

    response.cookie('STOKEN', value, {
      expires: expirationDate,
      httpOnly: true,
      secure: true,
    });

    response.send({
      message: 'Successfully authenticated.',
    });
  }
}
