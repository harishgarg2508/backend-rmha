import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import * as amqp from 'amqplib';
import { Outbox } from 'src/infrastructure/database/entities/outbox.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class CreateUserService {
  private connection: amqp.Connection;
  private channel: amqp.ConfirmChannel;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {
    this.initRabbitMQ();
  }

  private async initRabbitMQ() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL as string);
      this.channel = await this.connection.createConfirmChannel();

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed, reconnecting...');
        setTimeout(() => this.initRabbitMQ(), 5000);
      });

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
      });

      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect RabbitMQ', error);
      setTimeout(() => this.initRabbitMQ(), 5000);
    }
  }
  @Transactional()
  async createUser(userData: CreateUserDto): Promise<User> {
    const { name, password } = userData;

    const user = this.userRepository.create({ name, password });
    const savedUser = await this.userRepository.save(user);

    const outboxEvent = this.outboxRepository.create({
      eventType: 'UserCreated',
      payload: {
        id: savedUser.id,
        name: savedUser.name,
        createdAt: new Date(),
      },
      processed: false,
    });
    await this.outboxRepository.save(outboxEvent);

    await this.publishToQueue({
      id: savedUser.id,
      name: savedUser.name,
      createdAt: new Date(),
    });

    return savedUser;
  }
  private async publishToQueue(data: any) {
    const queueName = 'user_created_queue';

    await this.channel.assertQueue(queueName, { durable: true });

    const isSent = this.channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );

    if (isSent) {
      await this.channel.waitForConfirms();
      console.log('Message  safe RabbitMQ');
    } else {
      throw new InternalServerErrorException(
        'Message error RabbitMQ flow control',
      );
    }
  }
}
