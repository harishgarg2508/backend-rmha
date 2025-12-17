import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Outbox,
  OutboxMessageStatus,
} from '../infrastructure/database/entities/outbox.entity';
import { RabbitmqConnectionService } from '../infrastructure/rabbitmq/rabbitmq-connection.service';
import { RabbitmqConfigurerService } from '../infrastructure/rabbitmq/rabbitmq-configurer.service';
import { ProducerService } from './producer.service';

@Injectable()
@Command({
  name: 'dispatch:messages',
  description:
    'Dispatch messages strictly ordered by Sequence ID to Sticky Lanes (Auto-Setup Topology)',
})
export class DispatchMessagesCommand extends CommandRunner {
  private isRunning = true;

  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
    private readonly connectionService: RabbitmqConnectionService,
    private readonly configurerService: RabbitmqConfigurerService,
    private readonly producerService: ProducerService,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting Ordered Dispatcher...');

    await this.connectionService.connect();
    await this.configurerService.setupTopology();

    while (this.isRunning) {
      const messages = await this.outboxRepository.find({
        where: { status: OutboxMessageStatus.PENDING },
        order: { createdAt: 'ASC' },
        take: 50,
      });

      if (messages.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      for (const message of messages) {
        try {
          const headers = (message.headers as any) || {};
          const routingKey = headers['routingKey'] || 'default';

          const payload = {
            messageId: message.messageId,
            type: message.type,
            body: message.body,
            headers: message.headers,
            createdAt: message.createdAt,
          };

          await this.producerService.publishToLane(routingKey, payload);

          message.status = OutboxMessageStatus.SENT;
          await this.outboxRepository.save(message);

          console.log(`Sent MsgID ${message.messageId} (Key: ${routingKey})`);
        } catch (error) {
          console.error(
            ` Dispatch Failed on MsgID ${message.messageId}`,
            error,
          );
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Backoff
          break;
        }
      }
    }
  }
}
