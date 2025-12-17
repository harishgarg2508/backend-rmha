import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchMessagesCommand } from './dispatch-messages.command';
import { Outbox } from '../infrastructure/database/entities/outbox.entity';
import { RabbitmqModule } from '../infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Outbox]), RabbitmqModule],
  providers: [DispatchMessagesCommand],
})
export class CommandsModule {}
