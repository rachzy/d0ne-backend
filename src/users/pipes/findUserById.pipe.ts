import { BadRequestException, PipeTransform } from '@nestjs/common';
import { UsersService } from '../users.service';

export class FindUserByIdPipe implements PipeTransform {
  constructor(private usersService: UsersService) {}
  transform(value: string) {
    const user = this.usersService.findOne(value);
    if (!user) {
      throw new BadRequestException('Invalid user id!');
    }

    return value;
  }
}
