import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchMessagesCommand } from './dispatch-messages.command';
import { Outbox } from '../infrastructure/database/entities/outbox.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Outbox]),
  ],
  providers: [DispatchMessagesCommand],
})
export class CommandsModule {}
