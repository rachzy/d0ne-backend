import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Delete,
} from '@nestjs/common';
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

  @Get('getData')
  @UseGuards(AuthGuard)
  async getData(
    @Req() request: Request,
  ): Promise<Pick<User, 'id' | 'nickname'>> {
    const { UID } = request.cookies;
    const user = await this.usersService.findOne(UID);
    return {
      id: user.id,
      nickname: user.nickname,
    };
  }

  @Post('register')
  @UseGuards(UnauthGuard)
  async createUser(
    @Res() response: Response,
    @Body(new ZodValidationPipe(createUserSchema)) user: CreateUserDto,
  ) {
    const finalUser = await this.usersService.create(user);
    const { id, nickname, email, securityTokens: securityToken } = finalUser;
    const { value, expirationDate } = securityToken[0];

    console.log(`[REGISTER] A new user has been registered. ID: #${id}`);

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

    console.log(`[LOGOUT] User #${UID} just logged out (token: ${STOKEN}).`);
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

    console.log(`[LOGIN] User #${id} has just logged in a new device.`);

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

  @Get('validateSession')
  async validateSession(@Req() request: Request) {
    const { UID, STOKEN } = request.cookies;

    if (
      !UID ||
      !STOKEN ||
      !this.usersService.checkSecurityTokenStatus(UID, STOKEN)
    ) {
      return {
        validSession: false,
      };
    }

    return {
      validSession: true,
    };
  }
}
