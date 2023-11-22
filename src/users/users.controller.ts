import { Controller, Get, Query } from "@nestjs/common";
import { FindUserByIdPipe } from "./pipes/findUserById.pipe";

@Controller('user')
export class UsersController {
    @Get('get')
    async getUser(@Query('id', FindUserByIdPipe)) {
        
    }
}
