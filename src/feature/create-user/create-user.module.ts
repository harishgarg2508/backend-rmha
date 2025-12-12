import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateUserController } from './create-user.controller';
import { User } from '../../infrastructure/database/entities/user.entity';
import { CreateUserService } from './create-user.service';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMQConfig } from 'src/infrastructure/rabbitmq/config';
import { Outbox } from 'src/infrastructure/database/entities/outbox.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Outbox]),
    ClientsModule.register(rabbitMQConfig),
  ],
  controllers: [CreateUserController],
  providers: [CreateUserService],
})
export class CreateUserModule {}