import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { CreateUserService } from './create-user.service';

@Controller('users')
export class CreateUserController {
    constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.createUserService.createUser(dto);
  }
}