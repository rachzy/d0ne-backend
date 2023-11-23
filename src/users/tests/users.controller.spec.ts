import { Test } from '@nestjs/testing';
import { User, UserSchema } from '../schemas/user.schema';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateUserDto } from '../dtos/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let dummyUser: User;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://127.0.0.1:27017', { dbName: 'todo' }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);

    const newUser: CreateUserDto = {
      nickname: 'test',
      email: 'test@example.com',
      password: 'test',
    };

    dummyUser = await usersService.create(newUser);
  });

  it('should return the dummy user nickname', async () => {
    expect(await usersController.getUserNickname(dummyUser.id)).toHaveProperty(
      'nickname',
      dummyUser.nickname,
    );
  });
});
