import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { FindUserByIdPipe } from './pipes/findUserById.pipe';
import { UsersService } from './users.service';
import { ZodValidationPipe } from 'src/pipes/zodValidation.pipe';
import { CreateUserDto } from './dtos/create-user.dto';
import { createUserSchema } from './pipes/createUser.pipe';
import { Response, Request } from 'express';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../guards/auth.guard';
import { UnauthGuard } from './guards/unauth.guard';

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
  @UseGuards(UnauthGuard)
  async createUser(
    @Res() response: Response,
    @Body(new ZodValidationPipe(createUserSchema)) user: CreateUserDto,
  ) {
    const finalUser = await this.usersService.create(user);
    const { id, nickname, email, securityTokens: securityToken } = finalUser;
    const { value, expirationDate } = securityToken[0];

    response.cookie('UID', id, {
      expires: expirationDate,
      httpOnly: true,
      secure: true,
    });

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

  @Delete('logout')
  @UseGuards(AuthGuard)
  async logout(@Res() res: Response, @Req() req: Request) {
    const { UID, STOKEN } = req.cookies;

    await this.usersService.logout(UID, STOKEN);

    res.clearCookie('UID');
    res.clearCookie('STOKEN');

    res.send({
      message: 'Successfully logged out!',
    });
  }

  @Get('auth')
  @UseGuards(UnauthGuard)
  async authenticateUser(
    @Res() response: Response,
    @Query('email') email: string,
    @Query('password') password: string,
  ) {
    const { id, securityTokens } = await this.usersService.authenticate(
      email,
      password,
    );

    const { value, expirationDate } = securityTokens[0];

    response.cookie('UID', id, {
      expires: expirationDate,
      httpOnly: true,
      secure: true,
    });

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
