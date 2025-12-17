import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserController } from './create-user.controller';
import { User } from '../../infrastructure/database/entities/user.entity';
import { CreateUserService } from './create-user.service';
import { Outbox } from 'src/infrastructure/database/entities/outbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Outbox])],
  controllers: [CreateUserController],
  providers: [CreateUserService],
})
export class CreateUserModule {}
