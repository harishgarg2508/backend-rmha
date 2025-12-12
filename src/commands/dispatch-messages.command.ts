import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outbox } from '../infrastructure/database/entities/outbox.entity';
import * as amqp from 'amqplib';

@Injectable()
@Command({
  name: 'dispatch:messages',
  description: 'Dispatch unprocessed messages from outbox to RabbitMQ',
})
export class DispatchMessagesCommand extends CommandRunner {
  private connection: amqp.Connection;
  private channel: amqp.ConfirmChannel;

  constructor(
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {
    super();
  }

  async run(): Promise<void> {
    console.log(' Starting outbox message dispatcher...');

    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL as string);
      this.channel = await this.connection.createConfirmChannel();
      console.log(' Connected to RabbitMQ');

      const unprocessedMessages = await this.outboxRepository.find({
        where: { processed: false },
        order: { createdAt: 'ASC' },
      });

      console.log(` Found ${unprocessedMessages.length} unprocessed messages`);

      if (unprocessedMessages.length === 0) {
        console.log(' No messages to dispatch');
        await this.cleanup();
        return;
      }

      for (const message of unprocessedMessages) {
        try {
          await this.publishMessage(message);
          message.processed = true;
          await this.outboxRepository.save(message);
          
          console.log(` Dispatched message ID: ${message.id}`);
        } catch (error) {
          console.error(` Failed to dispatch message ID: ${message.id}`, error);
        }
      }

      console.log(' Dispatch completed!');
      await this.cleanup();
    } catch (error) {
      console.error(' Dispatcher error:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  private async publishMessage(message: Outbox): Promise<void> {
    const queueName = 'user_created_queue';

    await this.channel.assertQueue(queueName, { durable: true });

    const isSent = this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message.payload)),
      { persistent: true }
    );

    if (!isSent) {
      throw new Error('Failed to send message to queue');
    }

    await this.channel.waitForConfirms();
  }

  private async cleanup(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      console.log(' RabbitMQ connection closed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}
