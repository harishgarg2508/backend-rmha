import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { UserStatus } from 'src/domain/user-status.enum';
import {
  Outbox,
  OutboxMessageStatus,
} from 'src/infrastructure/database/entities/outbox.entity';
import * as crypto from 'crypto';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  @Transactional()
  async createUser(userData: CreateUserDto): Promise<User> {
    const { name, password } = userData;

    const user = this.userRepository.create({ name, password });
    const savedUser = await this.userRepository.save(user);

    const outboxEvent = this.outboxRepository.create({
      messageId: crypto.randomUUID(),
      type: 'UserCreated',
      body: {
        id: savedUser.id,
        name: savedUser.name,
        password: savedUser.password,
        createdAt: new Date(),
      },
      headers: { routingKey: 'user.created' },
      status: OutboxMessageStatus.PENDING,
    });

    await this.outboxRepository.save(outboxEvent);
    return savedUser;
  }

  @Transactional()
  async activateUser(id: string): Promise<User> {
    return this.updateUserStatus(
      id,
      UserStatus.ACTIVATE,
      'UserActivated',
      'user.activated',
    );
  }

  @Transactional()
  async processUser(id: string): Promise<User> {
    return this.updateUserStatus(
      id,
      UserStatus.PROCESS,
      'UserProcessed',
      'user.processed',
    );
  }

  @Transactional()
  async deactivateUser(id: string): Promise<User> {
    return this.updateUserStatus(
      id,
      UserStatus.DEACTIVATE,
      'UserDeactivated',
      'user.deactivated',
    );
  }

  private async updateUserStatus(
    id: string,
    status: UserStatus,
    eventType: string,
    routingKey: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    user.status = status;
    const savedUser = await this.userRepository.save(user);

    const outboxEvent = this.outboxRepository.create({
      messageId: crypto.randomUUID(),
      type: eventType,
      body: {
        id: savedUser.id,
        status: savedUser.status,
        updatedAt: new Date(),
      },
      headers: { routingKey },
      status: OutboxMessageStatus.PENDING,
    });

    await this.outboxRepository.save(outboxEvent);
    return savedUser;
  }
}
