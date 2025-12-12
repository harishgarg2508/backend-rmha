import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './create-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { Outbox } from 'src/infrastructure/database/entities/outbox.entity';
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
      eventType: 'UserCreated',
      payload: {
        id: savedUser.id,
        name: savedUser.name,
        password: savedUser.password,
        createdAt: new Date(),
      },
      processed: false,
    });
    
    await this.outboxRepository.save(outboxEvent);
    return savedUser;
  }
}
