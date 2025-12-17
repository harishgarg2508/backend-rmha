import { Body, Controller, Param, Patch, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';
import { CreateUserService } from './create-user.service';

@Controller('users')
export class CreateUserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.createUserService.createUser(dto);
  }

  @Patch(':id/activate')
  async activateUser(@Param('id') id: string) {
    return this.createUserService.activateUser(id);
  }

  @Patch(':id/process')
  async processUser(@Param('id') id: string) {
    return this.createUserService.processUser(id);
  }

  @Patch(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    return this.createUserService.deactivateUser(id);
  }
}
