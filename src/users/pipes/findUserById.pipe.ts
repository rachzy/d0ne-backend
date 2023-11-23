import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class FindUserByIdPipe implements PipeTransform {
  constructor(private usersService: UsersService) {}
  transform(value: number) {
    const user = this.usersService.findOne(value);
    if (!user) {
      throw new BadRequestException('Invalid user id!');
    }

    return value;
  }
}
